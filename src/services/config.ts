import { UNO_SYSTEM_PROMPT } from './systemPrompts';

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  defaultModel: 'x-ai/grok-4-fast', // Default model
  systemPrompt: UNO_SYSTEM_PROMPT,
};

// Validate API key is present
export function validateApiConfig(): boolean {
  if (!API_CONFIG.apiKey) {
    console.error('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in .env file');
    return false;
  }
  return true;
}
