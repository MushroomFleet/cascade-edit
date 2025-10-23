import React from 'react';
import './EmptyState.css';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">✍️</div>
      <h3 className="empty-state-title">Ready to enhance your text</h3>
      <p className="empty-state-description">
        Start typing above and press <kbd>Enter</kbd> twice to complete a paragraph.
        We'll automatically improve grammar, capitalization, and punctuation.
      </p>
      <div className="empty-state-features">
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <span>Real-time streaming</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔄</span>
          <span>Parallel processing</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎨</span>
          <span>Wave animations</span>
        </div>
      </div>
    </div>
  );
};
