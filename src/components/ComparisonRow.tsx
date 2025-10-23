import React from 'react';
import type { ComparisonResult } from '../types';
import { ComparisonCard } from './ComparisonCard';
import './ComparisonRow.css';

interface ComparisonRowProps {
  comparison: ComparisonResult;
}

export function ComparisonRow({ comparison }: ComparisonRowProps) {
  return (
    <div className="comparison-row">
      <div className="comparison-row-grid">
        <ComparisonCard output={comparison.outputs.model1} />
        <ComparisonCard output={comparison.outputs.model2} />
        <ComparisonCard output={comparison.outputs.model3} />
        <ComparisonCard output={comparison.outputs.model4} />
      </div>
    </div>
  );
}
