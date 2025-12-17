import { GeminiProvider } from './geminiService';
import { OpenRouterProvider } from './openRouterService';
import { AIServiceProvider } from './aiService';
import { BookConfig } from '../types';

export const getAIProvider = (config: BookConfig): AIServiceProvider => {
  if (config.aiProvider === 'openrouter') {
    const provider = new OpenRouterProvider();
    if (config.openRouterModel) {
        provider.setModel(config.openRouterModel);
    }
    return provider;
  }
  // Default to Gemini
  return new GeminiProvider();
};
