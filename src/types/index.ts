// Paragraph status enum
export enum ParagraphStatus {
  WRITING = 'writing',
  QUEUED = 'queued',      // NEW: Added to queue
  PROCESSING = 'processing',
  STREAMING = 'streaming', // NEW: Actively receiving stream
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Paragraph data structure
export interface Paragraph {
  id: string;
  originalText: string;
  correctedText: string;
  status: ParagraphStatus;
  timestamp: number;
  error?: string;
  streamProgress?: number; // NEW: Track streaming progress (0-100)
}

// OpenRouter API types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterStreamChunk {
  id: string;
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string | null;
  }>;
}

// Queue types
export interface QueueItem {
  paragraphId: string;
  text: string;
  addedAt: number;
}

export interface QueueState {
  items: QueueItem[];
  processing: Set<string>;
  maxConcurrent: number;
}

// App state
export interface AppState {
  paragraphs: Paragraph[];
  currentText: string;
  queue: QueueState;
}
