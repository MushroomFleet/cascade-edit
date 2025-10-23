// Paragraph status enum
export const ParagraphStatus = {
  WRITING: 'writing',
  QUEUED: 'queued',      // NEW: Added to queue
  PROCESSING: 'processing',
  STREAMING: 'streaming', // NEW: Actively receiving stream
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

export type ParagraphStatus = typeof ParagraphStatus[keyof typeof ParagraphStatus];

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

// Mode types
export type AppMode = 'single' | 'compare';

// Multi-model comparison types
export interface ModelOutput {
  modelName: string;
  text: string;
  status: ParagraphStatus;
  error?: string;
  streamProgress?: number;
}

export interface ComparisonResult {
  id: string;
  originalText: string;
  timestamp: number;
  outputs: {
    model1: ModelOutput;
    model2: ModelOutput;
    model3: ModelOutput;
    model4: ModelOutput;
  };
}
