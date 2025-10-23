import React from 'react';
import './CompareSettings.css';

interface CompareSettingsProps {
  models: {
    model1: string;
    model2: string;
    model3: string;
    model4: string;
  };
  onChange: (modelKey: 'model1' | 'model2' | 'model3' | 'model4', value: string) => void;
}

export function CompareSettings({ models, onChange }: CompareSettingsProps) {
  return (
    <div className="compare-settings">
      <div className="compare-settings-grid">
        <div className="model-field">
          <label htmlFor="model1-input" className="model-label">
            Model 1:
          </label>
          <input
            id="model1-input"
            type="text"
            className="model-input-compare"
            value={models.model1}
            onChange={(e) => onChange('model1', e.target.value)}
            placeholder="e.g., x-ai/grok-4-fast"
          />
        </div>

        <div className="model-field">
          <label htmlFor="model2-input" className="model-label">
            Model 2:
          </label>
          <input
            id="model2-input"
            type="text"
            className="model-input-compare"
            value={models.model2}
            onChange={(e) => onChange('model2', e.target.value)}
            placeholder="e.g., nvidia/llama-3.3"
          />
        </div>

        <div className="model-field">
          <label htmlFor="model3-input" className="model-label">
            Model 3:
          </label>
          <input
            id="model3-input"
            type="text"
            className="model-input-compare"
            value={models.model3}
            onChange={(e) => onChange('model3', e.target.value)}
            placeholder="e.g., ibm-granite/granite"
          />
        </div>

        <div className="model-field">
          <label htmlFor="model4-input" className="model-label">
            Model 4:
          </label>
          <input
            id="model4-input"
            type="text"
            className="model-input-compare"
            value={models.model4}
            onChange={(e) => onChange('model4', e.target.value)}
            placeholder="e.g., deepseek-v3.2-exp"
          />
        </div>
      </div>
      <p className="compare-hint">
        Configure 4 models to compare their outputs side-by-side
      </p>
    </div>
  );
}
