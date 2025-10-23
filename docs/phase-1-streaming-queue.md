# Phase 1: Streaming & Queue System

## Overview

This phase enhances the MVP by implementing real-time streaming from OpenRouter API and a queue system for parallel paragraph processing. Users will see text corrections appear character-by-character as they stream in, and multiple paragraphs can be processed simultaneously without blocking.

**Estimated Time**: 3-4 hours  
**Prerequisites**: Completed Phase 0

---

## What's New in Phase 1

- Real-time character streaming from OpenRouter API
- Queue system for managing multiple paragraphs
- Parallel processing (multiple paragraphs can process at once)
- Enhanced state management with better tracking
- Improved visual feedback during streaming

---

## Step 1: Update Type Definitions

### 1.1 Enhance Types for Queue Management

Update `src/types/index.ts` to add queue-related types:

```typescript
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
```

---

## Step 2: Create Queue Manager

### 2.1 Build Queue Service

Create `src/services/queueManager.ts`:

```typescript
import { QueueItem, QueueState } from '../types';

export class QueueManager {
  private queue: QueueState;
  private processingCallback: (item: QueueItem) => Promise<void>;

  constructor(maxConcurrent: number = 3) {
    this.queue = {
      items: [],
      processing: new Set(),
      maxConcurrent,
    };
    this.processingCallback = async () => {};
  }

  /**
   * Set the callback function that processes queue items
   */
  setProcessingCallback(callback: (item: QueueItem) => Promise<void>) {
    this.processingCallback = callback;
  }

  /**
   * Add item to queue and process if possible
   */
  async enqueue(item: QueueItem): Promise<void> {
    this.queue.items.push(item);
    await this.processNext();
  }

  /**
   * Process next item in queue if capacity allows
   */
  private async processNext(): Promise<void> {
    // Check if we can process more items
    if (this.queue.processing.size >= this.queue.maxConcurrent) {
      return;
    }

    // Get next item from queue
    const item = this.queue.items.shift();
    if (!item) {
      return;
    }

    // Mark as processing
    this.queue.processing.add(item.paragraphId);

    try {
      // Process the item
      await this.processingCallback(item);
    } catch (error) {
      console.error('Error processing queue item:', error);
    } finally {
      // Remove from processing set
      this.queue.processing.delete(item.paragraphId);
      
      // Try to process next item
      await this.processNext();
    }
  }

  /**
   * Get current queue state
   */
  getState(): QueueState {
    return {
      ...this.queue,
      processing: new Set(this.queue.processing),
    };
  }

  /**
   * Get number of items in queue
   */
  getQueueLength(): number {
    return this.queue.items.length;
  }

  /**
   * Get number of items being processed
   */
  getProcessingCount(): number {
    return this.queue.processing.size;
  }

  /**
   * Check if a specific item is being processed
   */
  isProcessing(paragraphId: string): boolean {
    return this.queue.processing.has(paragraphId);
  }

  /**
   * Clear all items from queue
   */
  clear(): void {
    this.queue.items = [];
  }
}

// Export singleton instance
export const queueManager = new QueueManager(3); // Max 3 concurrent
```

---

## Step 3: Update OpenRouter Service for Streaming

### 3.1 Enhance Streaming Implementation

The streaming code is already in `src/services/openRouterService.ts` from Phase 0, but we need to ensure it's being used. The `processTextStream` method is already implemented and ready to use.

---

## Step 4: Update Text Processing Hook

### 4.1 Rewrite useTextProcessor with Queue Support

Replace `src/hooks/useTextProcessor.ts`:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { Paragraph, ParagraphStatus, QueueItem } from '../types';
import { openRouterService } from '../services/openRouterService';
import { queueManager } from '../services/queueManager';

export function useTextProcessor() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [queueLength, setQueueLength] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  
  const paragraphsRef = useRef<Paragraph[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    paragraphsRef.current = paragraphs;
  }, [paragraphs]);

  const generateId = () => `para-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Update a specific paragraph's state
   */
  const updateParagraph = useCallback((id: string, updates: Partial<Paragraph>) => {
    setParagraphs(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  /**
   * Process a queue item with streaming
   */
  const processQueueItem = useCallback(async (item: QueueItem) => {
    const paragraphId = item.paragraphId;
    
    // Update status to streaming
    updateParagraph(paragraphId, {
      status: ParagraphStatus.STREAMING,
      streamProgress: 0,
    });

    let accumulatedText = '';

    try {
      // Use streaming to process text
      await openRouterService.processTextStream(
        item.text,
        (chunk: string) => {
          accumulatedText += chunk;
          
          // Update paragraph with streamed content
          updateParagraph(paragraphId, {
            correctedText: accumulatedText,
            status: ParagraphStatus.STREAMING,
          });
        }
      );

      // Mark as completed
      updateParagraph(paragraphId, {
        status: ParagraphStatus.COMPLETED,
        correctedText: accumulatedText || item.text, // Fallback to original if empty
        streamProgress: 100,
      });

    } catch (error) {
      console.error('Error processing paragraph:', error);
      
      updateParagraph(paragraphId, {
        status: ParagraphStatus.ERROR,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      // Update queue stats
      setProcessingCount(queueManager.getProcessingCount());
      setQueueLength(queueManager.getQueueLength());
    }
  }, [updateParagraph]);

  // Set up queue processing callback
  useEffect(() => {
    queueManager.setProcessingCallback(processQueueItem);
  }, [processQueueItem]);

  /**
   * Add paragraph to processing queue
   */
  const processParagraph = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    
    // Don't process empty paragraphs
    if (!trimmedText) return;

    // Create new paragraph
    const newParagraph: Paragraph = {
      id: generateId(),
      originalText: trimmedText,
      correctedText: '',
      status: ParagraphStatus.QUEUED,
      timestamp: Date.now(),
      streamProgress: 0,
    };

    // Add to paragraphs list
    setParagraphs(prev => [...prev, newParagraph]);

    // Create queue item
    const queueItem: QueueItem = {
      paragraphId: newParagraph.id,
      text: trimmedText,
      addedAt: Date.now(),
    };

    // Add to queue for processing
    await queueManager.enqueue(queueItem);
    
    // Update queue stats
    setQueueLength(queueManager.getQueueLength());
    setProcessingCount(queueManager.getProcessingCount());
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
  }, []);

  const handleParagraphComplete = useCallback(() => {
    // Extract completed paragraph (everything before the double newline)
    const parts = currentText.split('\n\n');
    
    if (parts.length > 1) {
      // Get the completed paragraph(s)
      const completedParagraphs = parts.slice(0, -1);
      
      // Process each completed paragraph
      completedParagraphs.forEach(para => {
        if (para.trim()) {
          processParagraph(para);
        }
      });

      // Keep only the remaining text after the double newline
      setCurrentText(parts[parts.length - 1]);
    }
  }, [currentText, processParagraph]);

  return {
    paragraphs,
    currentText,
    queueLength,
    processingCount,
    handleTextChange,
    handleParagraphComplete,
  };
}
```

---

## Step 5: Update Paragraph Display Component

### 5.1 Add Streaming Visual Feedback

Update `src/components/ParagraphDisplay.tsx`:

```typescript
import React from 'react';
import { Paragraph, ParagraphStatus } from '../types';
import './ParagraphDisplay.css';

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ paragraph }) => {
  const getStatusClass = () => {
    switch (paragraph.status) {
      case ParagraphStatus.WRITING:
        return 'status-writing';
      case ParagraphStatus.QUEUED:
        return 'status-queued';
      case ParagraphStatus.PROCESSING:
        return 'status-processing';
      case ParagraphStatus.STREAMING:
        return 'status-streaming';
      case ParagraphStatus.COMPLETED:
        return 'status-completed';
      case ParagraphStatus.ERROR:
        return 'status-error';
      default:
        return '';
    }
  };

  const getStatusLabel = () => {
    switch (paragraph.status) {
      case ParagraphStatus.QUEUED:
        return 'Queued...';
      case ParagraphStatus.PROCESSING:
        return 'Processing...';
      case ParagraphStatus.STREAMING:
        return 'Streaming...';
      case ParagraphStatus.COMPLETED:
        return 'Completed';
      case ParagraphStatus.ERROR:
        return 'Error';
      default:
        return '';
    }
  };

  // Show corrected text when streaming or completed, original otherwise
  const displayText = 
    paragraph.status === ParagraphStatus.STREAMING || 
    paragraph.status === ParagraphStatus.COMPLETED
      ? paragraph.correctedText || paragraph.originalText
      : paragraph.originalText;

  return (
    <div className={`paragraph ${getStatusClass()}`} data-paragraph-id={paragraph.id}>
      <div className="paragraph-content">
        {displayText}
      </div>
      
      {paragraph.status !== ParagraphStatus.COMPLETED && 
       paragraph.status !== ParagraphStatus.ERROR && (
        <div className="paragraph-status-badge">
          {getStatusLabel()}
        </div>
      )}
      
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="paragraph-error">{paragraph.error}</div>
      )}
    </div>
  );
};
```

### 5.2 Update Paragraph Display Styles

Update `src/components/ParagraphDisplay.css`:

```css
.paragraph {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  line-height: 1.6;
}

.paragraph-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.status-writing {
  background-color: #f8f9fa;
  border-left: 3px solid #6c757d;
}

.status-queued {
  background-color: #e7f3ff;
  border-left: 3px solid #0066cc;
}

.status-processing {
  background-color: #fff8e1;
  border-left: 3px solid #ff9800;
  animation: pulse 2s ease-in-out infinite;
}

.status-streaming {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-completed {
  background-color: #d4edda;
  border-left: 3px solid #28a745;
}

.status-error {
  background-color: #f8d7da;
  border-left: 3px solid #dc3545;
}

.paragraph-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  font-style: italic;
}

.status-queued .paragraph-status-badge {
  background-color: #cce5ff;
  color: #004085;
}

.status-processing .paragraph-status-badge {
  background-color: #fff3cd;
  color: #856404;
}

.status-streaming .paragraph-status-badge {
  background-color: #fff3cd;
  color: #856404;
}

.paragraph-error {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
  color: #721c24;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

---

## Step 6: Add Queue Status Display

### 6.1 Create Queue Status Component

Create `src/components/QueueStatus.tsx`:

```typescript
import React from 'react';
import './QueueStatus.css';

interface QueueStatusProps {
  queueLength: number;
  processingCount: number;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  queueLength,
  processingCount,
}) => {
  // Only show if there's activity
  if (queueLength === 0 && processingCount === 0) {
    return null;
  }

  return (
    <div className="queue-status">
      <div className="queue-status-content">
        {processingCount > 0 && (
          <div className="queue-stat">
            <div className="queue-stat-icon processing">⚡</div>
            <span className="queue-stat-label">Processing:</span>
            <span className="queue-stat-value">{processingCount}</span>
          </div>
        )}
        
        {queueLength > 0 && (
          <div className="queue-stat">
            <div className="queue-stat-icon queued">⏳</div>
            <span className="queue-stat-label">In Queue:</span>
            <span className="queue-stat-value">{queueLength}</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

Create `src/components/QueueStatus.css`:

```css
.queue-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.queue-status-content {
  display: flex;
  gap: 24px;
  align-items: center;
  color: white;
}

.queue-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-stat-icon {
  font-size: 20px;
  animation: bounce 2s ease-in-out infinite;
}

.queue-stat-icon.processing {
  animation: spin 1s linear infinite;
}

.queue-stat-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.queue-stat-value {
  font-size: 18px;
  font-weight: 700;
  padding: 2px 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## Step 7: Update Main App Component

### 7.1 Integrate Queue Status Display

Update `src/App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { TextEditor } from './components/TextEditor';
import { ParagraphDisplay } from './components/ParagraphDisplay';
import { QueueStatus } from './components/QueueStatus';
import { useTextProcessor } from './hooks/useTextProcessor';
import { validateApiConfig } from './services/config';
import './App.css';

function App() {
  const {
    paragraphs,
    currentText,
    queueLength,
    processingCount,
    handleTextChange,
    handleParagraphComplete,
  } = useTextProcessor();

  useEffect(() => {
    // Validate API configuration on mount
    if (!validateApiConfig()) {
      alert('OpenRouter API key is missing. Please check your .env file.');
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cascade-Edit</h1>
        <p className="app-subtitle">Real-time text enhancement with streaming</p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <h2>Write Your Text</h2>
          
          <QueueStatus
            queueLength={queueLength}
            processingCount={processingCount}
          />
          
          <TextEditor
            value={currentText}
            onChange={handleTextChange}
            onParagraphComplete={handleParagraphComplete}
          />
          <div className="editor-hint">
            Press <kbd>Enter</kbd> twice to complete a paragraph. 
            Up to 3 paragraphs can be processed simultaneously.
          </div>
        </div>

        {paragraphs.length > 0 && (
          <div className="paragraphs-section">
            <h2>Processed Paragraphs</h2>
            <div className="paragraphs-list">
              {paragraphs.map(paragraph => (
                <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

---

## Step 8: Testing Streaming and Queue

### 8.1 Test Streaming Functionality

1. **Start the dev server:**
```powershell
npm run tauri dev
```

2. **Test single paragraph streaming:**
   - Type a paragraph with intentional errors
   - Press Enter twice
   - Watch as the corrected text appears character-by-character
   - Verify the yellow "Streaming..." status

3. **Test parallel processing:**
   - Quickly type 4-5 paragraphs, pressing Enter twice after each
   - Observe that up to 3 process simultaneously (shown in queue status)
   - Extra paragraphs wait in queue until capacity is available

### 8.2 Test Cases

**Test Case 1: Streaming Speed**
```
Input: "this is a longer paragraph with multiple sentences that need correction. it should demonstrate the streaming effect clearly."
Expected: Text should stream in character-by-character, visible to the eye
```

**Test Case 2: Queue Management**
```
Input: Type 5 paragraphs rapidly (each followed by double Enter)
Expected: 
- Queue status shows "Processing: 3" and "In Queue: 2"
- As paragraphs complete, queued items start processing
- All eventually complete
```

**Test Case 3: Error During Streaming**
```
Test: Disconnect internet after starting a stream
Expected: Paragraph shows error status after timeout
```

### 8.3 Performance Monitoring

Open browser DevTools (F12 in Tauri window) and:
- Check Console for any errors
- Monitor Network tab to see streaming requests
- Verify multiple simultaneous requests (max 3)

---

## Step 9: Optimization Tips

### 9.1 Adjust Concurrent Processing

To change max concurrent processing, modify `src/services/queueManager.ts`:

```typescript
// Change from 3 to desired number
export const queueManager = new QueueManager(5); // Max 5 concurrent
```

### 9.2 Model Selection

For faster/slower streaming, update model in `src/services/config.ts`:

```typescript
// Faster models
model: 'openai/gpt-3.5-turbo',  // Fast, cost-effective

// More capable models
model: 'openai/gpt-4-turbo',    // Higher quality
model: 'anthropic/claude-3-haiku', // Good balance
```

---

## Step 10: Troubleshooting

### Common Issues

**Issue: Streaming appears instant (not visible)**
- Cause: Short paragraphs or very fast model responses
- Solution: Test with longer paragraphs (50+ words)

**Issue: Queue doesn't process items**
- Cause: Error in queue callback setup
- Solution: Check browser console for errors
- Verify `queueManager.setProcessingCallback` is called

**Issue: Multiple paragraphs process too slowly**
- Cause: API rate limits or slow network
- Solution: Reduce maxConcurrent from 3 to 2 or 1

**Issue: Streaming stops mid-paragraph**
- Cause: Network interruption or API timeout
- Solution: Check internet connection
- Verify API key has sufficient credits

---

## Step 11: Code Verification Checklist

Before moving to Phase 2, verify:

- [ ] Text streams in character-by-character (visible effect)
- [ ] Queue status displays correctly during processing
- [ ] Up to 3 paragraphs process simultaneously
- [ ] Additional paragraphs wait in queue
- [ ] Queue empties as paragraphs complete
- [ ] Streaming status shows yellow background
- [ ] Completed paragraphs show green background
- [ ] Browser console shows no errors
- [ ] DevTools shows multiple concurrent network requests

---

## Phase 1 Complete!

You now have:
- ✅ Real-time character streaming from OpenRouter
- ✅ Queue system managing multiple paragraphs
- ✅ Parallel processing (up to 3 concurrent)
- ✅ Visual feedback for queue and streaming status
- ✅ Smooth performance with multiple requests

**Next Steps**: Proceed to Phase 2 to add the character wave animation effect and final UI polish.

---

## Additional Notes

### Queue Benefits
- **Non-blocking**: User can keep writing while paragraphs process
- **Efficient**: Multiple API calls happen in parallel
- **Scalable**: Easy to adjust concurrent limit

### Streaming Benefits
- **Immediate feedback**: User sees results as they arrive
- **Better UX**: Feels more responsive than waiting
- **Network efficient**: Processes data as it arrives

---

## Performance Benchmarks

With typical paragraph length (30-50 words):
- **Time to first character**: ~500-1000ms
- **Full paragraph completion**: ~2-4 seconds
- **Queue processing**: 3 paragraphs in ~3-5 seconds (parallel)

These times vary based on:
- Model selected
- Network speed
- API server load
- Paragraph length
