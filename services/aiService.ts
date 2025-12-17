import { SearchResult, BookConfig, Chapter } from '../types';

export interface AIServiceProvider {
  name: string;
  generateOutline(
    bookConfig: BookConfig,
    sourceContext: string,
    chapterCount: number
  ): Promise<Array<{ title: string; summary: string }>>;

  writeChapter(
    chapter: Chapter,
    bookConfig: BookConfig,
    relevantSources: SearchResult[],
    previousChapterContext: string,
    generateMode: 'full' | 'outline'
  ): Promise<string>;
}

export const SYSTEM_PROMPT = `You are the Neural Link for CogniVault Studio.
Your goal is to assist the user in writing by strictly using the provided context.
- If context is provided, prioritize it over your internal knowledge.
- Maintain the user's tone and style.
- Be concise and professional.
`;

export const constructSystemPrompt = (config: BookConfig) => {
  let role = "writing assistant";

  if (config.projectType === 'blog') {
    role = `expert ${config.projectSubtype} blogger`;
  } else if (config.projectType === 'book') {
    role = `professional ${config.projectSubtype} author`;
  } else {
    role = "creative writer";
  }

  return `You are the Neural Link for CogniVault Studio, acting as an ${role}.
Your goal is to assist the user in writing by strictly using the provided context.
- If context is provided, prioritize it over your internal knowledge.
- Maintain the user's tone (${config.tone}) and style.
- Be concise and professional.
`;
};
