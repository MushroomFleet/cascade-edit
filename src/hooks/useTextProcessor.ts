import { useState, useCallback, useEffect, useRef } from 'react';
import { Paragraph, ParagraphStatus, QueueItem } from '../types';
import { openRouterService } from '../services/openRouterService';
import { queueManager } from '../services/queueManager';
import { scrollToBottom } from '../utils/scrollUtils';

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

    // Auto-scroll to show new paragraph
    setTimeout(() => scrollToBottom(), 100);

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
