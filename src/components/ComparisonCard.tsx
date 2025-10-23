import React, { useState } from 'react';
import type { ModelOutput } from '../types';
import { ParagraphStatus } from '../types';
import { AnimatedText } from './AnimatedText';
import { copyToClipboard } from '../utils/clipboardUtils';
import './ComparisonCard.css';

interface ComparisonCardProps {
  output: ModelOutput;
}

export function ComparisonCard({ output }: ComparisonCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(output.text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const getStatusColor = () => {
    switch (output.status) {
      case ParagraphStatus.QUEUED:
        return 'blue';
      case ParagraphStatus.STREAMING:
        return 'yellow';
      case ParagraphStatus.COMPLETED:
        return 'green';
      case ParagraphStatus.ERROR:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = () => {
    switch (output.status) {
      case ParagraphStatus.QUEUED:
        return '🔵';
      case ParagraphStatus.STREAMING:
        return '🟡';
      case ParagraphStatus.COMPLETED:
        return '🟢';
      case ParagraphStatus.ERROR:
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getModelDisplayName = () => {
    // Extract a shorter name from the full model identifier
    const parts = output.modelName.split('/');
    return parts[parts.length - 1] || output.modelName;
  };

  return (
    <div className={`comparison-card status-${getStatusColor()}`}>
      <div className="comparison-card-header">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="model-name" title={output.modelName}>
          {getModelDisplayName()}
        </span>
        {output.status === ParagraphStatus.COMPLETED && output.text && (
          <button
            className="copy-button"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            aria-label="Copy to clipboard"
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>

      <div className="comparison-card-content">
        {output.status === ParagraphStatus.ERROR ? (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{output.error || 'An error occurred'}</p>
          </div>
        ) : output.status === ParagraphStatus.STREAMING && output.text ? (
          <AnimatedText text={output.text} isStreaming={true} />
        ) : output.status === ParagraphStatus.COMPLETED && output.text ? (
          <div className="completed-text">{output.text}</div>
        ) : output.status === ParagraphStatus.QUEUED ? (
          <div className="queued-message">Waiting to process...</div>
        ) : null}
      </div>
    </div>
  );
}
