import { API_CONFIG } from './config';
import type { OpenRouterRequest, OpenRouterStreamChunk } from '../types';

class OpenRouterService {
  private async makeRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'HTTP-Referer': 'https://cascade-edit.app',
        'X-Title': 'Cascade-Edit',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    return response;
  }

  /**
   * Process text with streaming response
   * @param text - The text to process
   * @param onChunk - Callback for each text chunk received
   * @param model - The model to use (optional, defaults to config default)
   * @returns Promise that resolves when streaming is complete
   */
  async processTextStream(
    text: string,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<void> {
    const requestBody: OpenRouterRequest = {
      model: model || API_CONFIG.defaultModel,
      stream: true,
      messages: [
        {
          role: 'system',
          content: API_CONFIG.systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;

          // Parse SSE data
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            
            // Check for stream end
            if (data === '[DONE]') continue;

            try {
              const chunk: OpenRouterStreamChunk = JSON.parse(data);
              const content = chunk.choices[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.warn('Failed to parse chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process text without streaming (fallback)
   * @param text - The text to process
   * @param model - The model to use (optional, defaults to config default)
   * @returns The corrected text
   */
  async processText(text: string, model?: string): Promise<string> {
    const requestBody: OpenRouterRequest = {
      model: model || API_CONFIG.defaultModel,
      stream: false,
      messages: [
        {
          role: 'system',
          content: API_CONFIG.systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || text;
  }
}

export const openRouterService = new OpenRouterService();
