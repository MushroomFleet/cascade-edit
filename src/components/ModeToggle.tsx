import React from 'react';
import type { AppMode } from '../types';
import './ModeToggle.css';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-button ${mode === 'single' ? 'active' : ''}`}
        onClick={() => onChange('single')}
      >
        Single Mode
      </button>
      <button
        className={`mode-button ${mode === 'compare' ? 'active' : ''}`}
        onClick={() => onChange('compare')}
      >
        Compare Mode
      </button>
    </div>
  );
}
