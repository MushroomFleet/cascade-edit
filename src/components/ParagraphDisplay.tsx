import React, { useState, useEffect } from 'react';
import type { Paragraph } from '../types';
import { ParagraphStatus } from '../types';
import { AnimatedText } from './AnimatedText';
import { copyToClipboard } from '../utils/clipboardUtils';
import './ParagraphDisplay.css';

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ paragraph }) => {
  const [showOriginal, setShowOriginal] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(paragraph.correctedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Start transition when streaming begins
    if (paragraph.status === ParagraphStatus.STREAMING && showOriginal) {
      setIsTransitioning(true);
      // Fade out original text
      setTimeout(() => {
        setShowOriginal(false);
        setIsTransitioning(false);
      }, 300);
    }
  }, [paragraph.status, showOriginal]);

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
        return '✓ Completed';
      case ParagraphStatus.ERROR:
        return '✗ Error';
      default:
        return '';
    }
  };

  const shouldAnimate = paragraph.status === ParagraphStatus.STREAMING;
  const displayText = showOriginal ? paragraph.originalText : paragraph.correctedText;

  return (
    <div className={`paragraph ${getStatusClass()}`} data-paragraph-id={paragraph.id}>
      {paragraph.status === ParagraphStatus.COMPLETED && paragraph.correctedText && (
        <button
          className="copy-button-paragraph"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
          aria-label="Copy to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
      <div className={`paragraph-content ${isTransitioning ? 'fading-out' : ''}`}>
        {!showOriginal && shouldAnimate ? (
          <AnimatedText 
            text={displayText} 
            isStreaming={true}
            animationDelay={20}
          />
        ) : (
          displayText
        )}
      </div>
      
      {paragraph.status !== ParagraphStatus.COMPLETED && 
       paragraph.status !== ParagraphStatus.ERROR && (
        <div className="paragraph-status-badge">
          {getStatusLabel()}
        </div>
      )}
      
      {paragraph.status === ParagraphStatus.COMPLETED && (
        <div className="paragraph-status-badge completed-badge">
          {getStatusLabel()}
        </div>
      )}
      
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="paragraph-error">
          <strong>Error:</strong> {paragraph.error}
        </div>
      )}
    </div>
  );
};
