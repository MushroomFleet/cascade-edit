import React, { useEffect, useState } from 'react';
import type { AppMode } from './types';
import { TextEditor } from './components/TextEditor';
import { ParagraphDisplay } from './components/ParagraphDisplay';
import { QueueStatus } from './components/QueueStatus';
import { EmptyState } from './components/EmptyState';
import { ModeToggle } from './components/ModeToggle';
import { CompareSettings } from './components/CompareSettings';
import { ComparisonGrid } from './components/ComparisonGrid';
import { useTextProcessor } from './hooks/useTextProcessor';
import { useMultiModelProcessor } from './hooks/useMultiModelProcessor';
import { validateApiConfig, API_CONFIG } from './services/config';
import { exportParagraphsToMarkdown, exportComparisonsToMarkdown, downloadMarkdown } from './utils/exportUtils';
import './App.css';

const MODEL_STORAGE_KEY = 'cascade-edit-model';
const MODE_STORAGE_KEY = 'cascade-edit-mode';
const COMPARE_MODELS_STORAGE_KEY = 'cascade-edit-compare-models';

const DEFAULT_COMPARE_MODELS = {
  model1: 'x-ai/grok-4-fast',
  model2: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
  model3: 'ibm-granite/granite-4.0-h-micro',
  model4: 'deepseek/deepseek-v3.2-exp',
};

function App() {
  // Load mode from localStorage
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return (saved === 'compare' ? 'compare' : 'single') as AppMode;
  });

  // Load model from localStorage or use default (for single mode)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE_KEY) || API_CONFIG.defaultModel;
  });

  // Load compare models from localStorage or use defaults
  const [compareModels, setCompareModels] = useState(() => {
    const saved = localStorage.getItem(COMPARE_MODELS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COMPARE_MODELS;
      }
    }
    return DEFAULT_COMPARE_MODELS;
  });

  // Single mode processor
  const singleProcessor = useTextProcessor(selectedModel);

  // Compare mode processor
  const compareProcessor = useMultiModelProcessor(compareModels);

  useEffect(() => {
    // Validate API configuration on mount
    if (!validateApiConfig()) {
      alert('OpenRouter API key is missing. Please check your .env file.');
    }
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  // Save model to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  // Save compare models to localStorage when they change
  useEffect(() => {
    localStorage.setItem(COMPARE_MODELS_STORAGE_KEY, JSON.stringify(compareModels));
  }, [compareModels]);

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleCompareModelChange = (
    modelKey: 'model1' | 'model2' | 'model3' | 'model4',
    value: string
  ) => {
    setCompareModels((prev: typeof compareModels) => ({
      ...prev,
      [modelKey]: value,
    }));
  };

  const handleExport = () => {
    if (mode === 'single') {
      const markdown = exportParagraphsToMarkdown(singleProcessor.paragraphs);
      downloadMarkdown(markdown);
    } else {
      const markdown = exportComparisonsToMarkdown(compareProcessor.comparisons);
      downloadMarkdown(markdown);
    }
  };

  const hasCompletedContent = mode === 'single'
    ? singleProcessor.paragraphs.some(p => p.status === 'completed')
    : compareProcessor.comparisons.some(c =>
        c.outputs.model1.status === 'completed' &&
        c.outputs.model2.status === 'completed' &&
        c.outputs.model3.status === 'completed' &&
        c.outputs.model4.status === 'completed'
      );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Cascade-Edit</h1>
            <p className="app-subtitle">Real-time text enhancement with streaming</p>
          </div>
          {hasCompletedContent && (
            <button
              className="export-button"
              onClick={handleExport}
              title="Export to Markdown"
              aria-label="Export to Markdown"
            >
              💾 Export
            </button>
          )}
        </div>
      </header>

      <div className="mode-settings-container">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {mode === 'single' ? (
        <div className="settings-bar">
          <label htmlFor="model-input" className="settings-label">
            Model:
          </label>
          <input
            id="model-input"
            type="text"
            className="model-input"
            value={selectedModel}
            onChange={handleModelChange}
            placeholder="e.g., anthropic/claude-haiku-4.5"
          />
          <span className="settings-hint">
            Enter an OpenRouter model identifier
          </span>
        </div>
      ) : (
        <CompareSettings models={compareModels} onChange={handleCompareModelChange} />
      )}

      <main className="app-main">
        <div className="editor-section">
          <h2>Write Your Text</h2>

          {mode === 'single' && (
            <QueueStatus
              queueLength={singleProcessor.queueLength}
              processingCount={singleProcessor.processingCount}
            />
          )}

          <TextEditor
            value={mode === 'single' ? singleProcessor.currentText : compareProcessor.currentText}
            onChange={mode === 'single' ? singleProcessor.handleTextChange : compareProcessor.handleTextChange}
            onParagraphComplete={
              mode === 'single' ? singleProcessor.handleParagraphComplete : compareProcessor.handleParagraphComplete
            }
          />
          <div className="editor-hint">
            Press <kbd>Enter</kbd> twice to complete a paragraph.
            {mode === 'single' && ' Up to 3 paragraphs can be processed simultaneously.'}
          </div>
        </div>

        {mode === 'single' ? (
          singleProcessor.paragraphs.length > 0 ? (
            <div className="paragraphs-section">
              <h2>Processed Paragraphs</h2>
              <div className="paragraphs-list">
                {singleProcessor.paragraphs.map((paragraph) => (
                  <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <ComparisonGrid comparisons={compareProcessor.comparisons} />
        )}
      </main>
    </div>
  );
}

export default App;
