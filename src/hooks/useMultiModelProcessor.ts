import { useState, useCallback, useRef } from 'react';
import type { ComparisonResult, ModelOutput } from '../types';
import { ParagraphStatus } from '../types';
import { openRouterService } from '../services/openRouterService';
import { scrollToBottom } from '../utils/scrollUtils';

interface MultiModelProcessorParams {
  model1: string;
  model2: string;
  model3: string;
  model4: string;
}

export function useMultiModelProcessor(params: MultiModelProcessorParams) {
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [currentText, setCurrentText] = useState('');
  const paramsRef = useRef(params);

  // Keep params ref in sync
  paramsRef.current = params;

  const generateId = () => `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Update a specific model output within a comparison
   */
  const updateModelOutput = useCallback(
    (comparisonId: string, modelKey: 'model1' | 'model2' | 'model3' | 'model4', updates: Partial<ModelOutput>) => {
      setComparisons((prev) =>
        prev.map((comp) =>
          comp.id === comparisonId
            ? {
                ...comp,
                outputs: {
                  ...comp.outputs,
                  [modelKey]: {
                    ...comp.outputs[modelKey],
                    ...updates,
                  },
                },
              }
            : comp
        )
      );
    },
    []
  );

  /**
   * Process text with a specific model
   */
  const processWithModel = useCallback(
    async (
      comparisonId: string,
      text: string,
      modelKey: 'model1' | 'model2' | 'model3' | 'model4',
      modelName: string
    ) => {
      // Update status to streaming
      updateModelOutput(comparisonId, modelKey, {
        status: ParagraphStatus.STREAMING,
        streamProgress: 0,
      });

      let accumulatedText = '';

      try {
        // Use streaming to process text
        await openRouterService.processTextStream(
          text,
          (chunk: string) => {
            accumulatedText += chunk;

            // Update with streamed content
            updateModelOutput(comparisonId, modelKey, {
              text: accumulatedText,
              status: ParagraphStatus.STREAMING,
            });
          },
          modelName
        );

        // Mark as completed
        updateModelOutput(comparisonId, modelKey, {
          status: ParagraphStatus.COMPLETED,
          text: accumulatedText || text, // Fallback to original if empty
          streamProgress: 100,
        });
      } catch (error) {
        console.error(`Error processing with ${modelName}:`, error);

        updateModelOutput(comparisonId, modelKey, {
          status: ParagraphStatus.ERROR,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    },
    [updateModelOutput]
  );

  /**
   * Process comparison with all 4 models
   */
  const processComparison = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();

      // Don't process empty text
      if (!trimmedText) return;

      const { model1, model2, model3, model4 } = paramsRef.current;

      // Create new comparison result
      const newComparison: ComparisonResult = {
        id: generateId(),
        originalText: trimmedText,
        timestamp: Date.now(),
        outputs: {
          model1: {
            modelName: model1,
            text: '',
            status: ParagraphStatus.QUEUED,
            streamProgress: 0,
          },
          model2: {
            modelName: model2,
            text: '',
            status: ParagraphStatus.QUEUED,
            streamProgress: 0,
          },
          model3: {
            modelName: model3,
            text: '',
            status: ParagraphStatus.QUEUED,
            streamProgress: 0,
          },
          model4: {
            modelName: model4,
            text: '',
            status: ParagraphStatus.QUEUED,
            streamProgress: 0,
          },
        },
      };

      // Add to comparisons list
      setComparisons((prev) => [...prev, newComparison]);

      // Auto-scroll to show new comparison
      setTimeout(() => scrollToBottom(), 100);

      // Process with all 4 models in parallel
      const comparisonId = newComparison.id;
      Promise.all([
        processWithModel(comparisonId, trimmedText, 'model1', model1),
        processWithModel(comparisonId, trimmedText, 'model2', model2),
        processWithModel(comparisonId, trimmedText, 'model3', model3),
        processWithModel(comparisonId, trimmedText, 'model4', model4),
      ]);
    },
    [processWithModel]
  );

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
      completedParagraphs.forEach((para) => {
        if (para.trim()) {
          processComparison(para);
        }
      });

      // Keep only the remaining text after the double newline
      setCurrentText(parts[parts.length - 1]);
    }
  }, [currentText, processComparison]);

  return {
    comparisons,
    currentText,
    handleTextChange,
    handleParagraphComplete,
  };
}
