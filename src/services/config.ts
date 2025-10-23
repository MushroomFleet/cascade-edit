export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  model: 'openai/gpt-3.5-turbo', // Default model
  systemPrompt: `You are a helpful text editing assistant. Your job is to improve the grammar, capitalization, and punctuation of the provided text while maintaining the original meaning and tone. Return only the corrected text without any additional commentary or explanations.`,
};

// Validate API key is present
export function validateApiConfig(): boolean {
  if (!API_CONFIG.apiKey) {
    console.error('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in .env file');
    return false;
  }
  return true;
}
