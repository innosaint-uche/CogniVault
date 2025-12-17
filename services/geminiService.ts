import { GoogleGenAI } from "@google/genai";
import { SearchResult, BookConfig, Chapter } from "../types";
import { AIServiceProvider, SYSTEM_PROMPT } from "./aiService";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export class GeminiProvider implements AIServiceProvider {
  name = "Google Gemini";

  async generateOutline(
    bookConfig: BookConfig,
    sourceContext: string,
    chapterCount: number
  ): Promise<Array<{ title: string; summary: string }>> {
    const prompt = `
      You are an expert book architect.

      BOOK DETAILS:
      Title: ${bookConfig.title}
      Genre: ${bookConfig.genre}
      Tone: ${bookConfig.tone}
      Perspective: ${bookConfig.perspective}
      Background Info: ${bookConfig.background}

      SOURCE MATERIAL SUMMARY:
      ${sourceContext.substring(0, 10000)}

      TASK:
      Create a detailed chapter outline with exactly ${chapterCount} chapters.
      Return ONLY a JSON array of objects. Each object must have:
      - "title": string (Creative chapter title)
      - "summary": string (Instruction for what happens in this chapter, referencing the source material where relevant)

      Do not wrap in markdown code blocks. Just the raw JSON string.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (error) {
      console.error("Outline Generation Error:", error);
      throw new Error("Failed to generate outline.");
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
      You are an expert ghostwriter and editor.

      GLOBAL BOOK CONFIGURATION:
      Title: ${bookConfig.title}
      Genre: ${bookConfig.genre}
      Tone/Atmosphere: ${bookConfig.tone}
      Perspective: ${bookConfig.perspective}
      Background Context: ${bookConfig.background}

      PREVIOUS CHAPTER CONTEXT (The story so far):
      ${previousChapterContext}

      SOURCE MATERIAL TO INCORPORATE (Strictly adhere to these facts):
      ${sourceText}

      CURRENT CHAPTER INSTRUCTIONS:
      Title: ${chapter.title}
      Plot/Requirements: ${chapter.summary}

      TASK:
      ${generateMode === 'outline'
        ? `Create a detailed beat-sheet or scene outline for this chapter.
           - Break down the chapter into 3-5 distinct scenes.
           - Highlight key emotional beats, character decisions, and plot progressions.
           - Explicitly note where specific SOURCE MATERIAL facts should be integrated.
           - Suggest specific dialogue lines or sensory details to include later.
           - Do not write the full prose yet. Format as a structured list.`
        : `Write the FULL PROSE content for this chapter.
           - Target Word Count: Approximately 1000 words (do not exceed 1200).
           - Focus deeply on the emotions and perspective defined in the config.
           - Seamlessly weave in the provided Source Material facts.
           - Adopt the requested tone (${bookConfig.tone}).
           - Do not output the title, just the story text.`}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
          temperature: generateMode === 'outline' ? 0.7 : 0.85,
          systemInstruction: SYSTEM_PROMPT
        }
      });

      return response.text || "";
    } catch (error) {
      console.error("Chapter Generation Error:", error);
      throw new Error("Failed to write chapter.");
    }
  }
}
