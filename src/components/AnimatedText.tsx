import React, { useMemo } from 'react';
import './AnimatedText.css';

interface AnimatedTextProps {
  text: string;
  isStreaming: boolean;
  animationDelay?: number; // Delay between characters in ms
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  isStreaming,
  animationDelay = 20,
}) => {
  // Split text into characters while preserving spaces
  const characters = useMemo(() => {
    return text.split('');
  }, [text]);

  return (
    <span className="animated-text">
      {characters.map((char, index) => (
        <span
          key={`${index}-${char}`}
          className={`animated-char ${isStreaming ? 'wave-in' : ''}`}
          style={{
            animationDelay: isStreaming ? `${index * animationDelay}ms` : '0ms',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};
