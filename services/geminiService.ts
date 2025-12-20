import { GoogleGenAI } from "@google/genai";
import { SearchResult, BookConfig, Chapter } from "../types";
import { AIServiceProvider, constructSystemPrompt } from "./aiService";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    // Check localStorage first for user override
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;

    return (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  } catch (e) {
    return '';
  }
};

export class GeminiProvider implements AIServiceProvider {
  name = "Google Gemini";
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: getApiKey() });
  }

  // Update instance if key changes (though usually requires reload or re-instantiation)
  updateKey() {
    this.ai = new GoogleGenAI({ apiKey: getApiKey() });
  }

  async generateOutline(
    bookConfig: BookConfig,
    sourceContext: string,
    chapterCount: number
  ): Promise<Array<{ title: string; summary: string }>> {
    const prompt = `
      You are an expert ${bookConfig.projectType} architect specializing in ${bookConfig.projectSubtype}.

      PROJECT DETAILS:
      Title: ${bookConfig.title}
      Type: ${bookConfig.projectType} - ${bookConfig.projectSubtype}
      Genre: ${bookConfig.genre}
      Tone: ${bookConfig.tone}
      Perspective: ${bookConfig.perspective}
      Background Info: ${bookConfig.background}

      SOURCE MATERIAL SUMMARY:
      ${sourceContext.substring(0, 10000)}

      TASK:
      Create a detailed outline with exactly ${chapterCount} sections/chapters.
      Return ONLY a JSON array of objects. Each object must have:
      - "title": string (Creative title)
      - "summary": string (Instruction for what happens in this section, referencing the source material where relevant)

      Do not wrap in markdown code blocks. Just the raw JSON string.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: constructSystemPrompt(bookConfig)
        }
      });

      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (error) {
      console.error("Outline Generation Error:", error);
      throw error;
    }
  }

  async writeChapter(
    chapter: Chapter,
    bookConfig: BookConfig,
    relevantSources: SearchResult[],
    previousChapterContext: string,
    generateMode: 'full' | 'outline' = 'full'
  ): Promise<string> {
    const sourceText = relevantSources
      .map((r, i) => `[Fact ${i + 1} from ${r.docTitle}]: ${r.chunk.content}`)
      .join("\n\n");

    const prompt = `
      You are an expert ${bookConfig.projectType} writer specializing in ${bookConfig.projectSubtype}.

      GLOBAL CONFIGURATION:
      Title: ${bookConfig.title}
      Type: ${bookConfig.projectType} - ${bookConfig.projectSubtype}
      Genre: ${bookConfig.genre}
      Tone/Atmosphere: ${bookConfig.tone}
      Perspective: ${bookConfig.perspective}
      Background Context: ${bookConfig.background}

      PREVIOUS CONTEXT (The content so far):
      ${previousChapterContext}

      SOURCE MATERIAL TO INCORPORATE (Strictly adhere to these facts):
      ${sourceText}

      CURRENT SECTION INSTRUCTIONS:
      Title: ${chapter.title}
      Requirements: ${chapter.summary}

      TASK:
      ${generateMode === 'outline'
        ? `Create a detailed beat-sheet or scene outline for this section.
           - Break down into 3-5 distinct parts.
           - Highlight key points and flow.
           - Explicitly note where specific SOURCE MATERIAL facts should be integrated.
           - Do not write the full prose yet. Format as a structured list.`
        : `Write the FULL CONTENT for this section.
           - Target Word Count: Approximately 1000 words (do not exceed 1200).
           - Focus deeply on the voice and perspective defined in the config.
           - Seamlessly weave in the provided Source Material facts.
           - Adopt the requested tone (${bookConfig.tone}).
           - Do not output the title, just the text body.`}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
          temperature: generateMode === 'outline' ? 0.7 : 0.85,
          systemInstruction: constructSystemPrompt(bookConfig)
        }
      });

      return response.text || "";
    } catch (error) {
      console.error("Chapter Generation Error:", error);
      throw error;
    }
  }
}
