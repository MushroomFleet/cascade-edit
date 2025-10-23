import React, { useEffect } from 'react';
import { TextEditor } from './components/TextEditor';
import { ParagraphDisplay } from './components/ParagraphDisplay';
import { QueueStatus } from './components/QueueStatus';
import { EmptyState } from './components/EmptyState';
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

        {paragraphs.length > 0 ? (
          <div className="paragraphs-section">
            <h2>Processed Paragraphs</h2>
            <div className="paragraphs-list">
              {paragraphs.map(paragraph => (
                <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export default App;
