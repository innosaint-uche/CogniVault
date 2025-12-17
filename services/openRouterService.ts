import { SearchResult, BookConfig, Chapter } from "../types";
import { AIServiceProvider, SYSTEM_PROMPT } from "./aiService";

const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) || '';
  } catch (e) {
    return '';
  }
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// List of free or very cheap models to cycle through or use as default
const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "google/gemini-2.0-pro-exp-02-05:free",
  "mistralai/mistral-7b-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "meta-llama/llama-3-8b-instruct:free",
  "qwen/qwen-2-7b-instruct:free"
];

export class OpenRouterProvider implements AIServiceProvider {
  name = "OpenRouter";
  private apiKey: string;
  private selectedModel: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || getApiKey();
    this.selectedModel = model || FREE_MODELS[0];
  }

  // Update key if changed in settings
  setApiKey(key: string) {
    this.apiKey = key;
  }

  setModel(model: string) {
    this.selectedModel = model;
  }

  private async callOpenRouter(messages: any[], jsonMode: boolean = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API Key is missing.");
    }

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin, // Required by OpenRouter
          "X-Title": "CogniVault Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: messages,
          response_format: jsonMode ? { type: "json_object" } : undefined,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenRouter Request Failed:", error);
      throw error;
    }
  }

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
      Return ONLY a JSON array of objects under the key "chapters". Each object must have:
      - "title": string (Creative chapter title)
      - "summary": string (Instruction for what happens in this chapter, referencing the source material where relevant)

      Example JSON format:
      {
        "chapters": [
          { "title": "Chapter 1", "summary": "..." },
          { "title": "Chapter 2", "summary": "..." }
        ]
      }
    `;

    try {
      const result = await this.callOpenRouter([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ], true);

      // Robust parsing
      try {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : (parsed.chapters || []);
      } catch (e) {
        // Fallback: try to extract JSON from text
        const match = result.match(/\[.*\]/s);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw e;
      }
    } catch (error) {
      console.error("Outline Generation Error:", error);
      throw new Error("Failed to generate outline via OpenRouter.");
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
      return await this.callOpenRouter([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]);
    } catch (error) {
      console.error("Chapter Generation Error:", error);
      throw new Error("Failed to write chapter via OpenRouter.");
    }
  }
}
