import React, { useRef, useEffect } from 'react';
import './TextEditor.css';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParagraphComplete: () => void;
  disabled?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onParagraphComplete,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousValueRef = useRef<string>('');

  useEffect(() => {
    // Check for double line break (paragraph completion)
    const currentValue = value;
    const previousValue = previousValueRef.current;

    // Detect if user just added a double newline
    if (currentValue.endsWith('\n\n') && !previousValue.endsWith('\n\n')) {
      onParagraphComplete();
    }

    previousValueRef.current = currentValue;
  }, [value, onParagraphComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="text-editor">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Start typing... Press Enter twice to complete a paragraph and send it for correction."
        className="text-editor-textarea"
      />
    </div>
  );
};
