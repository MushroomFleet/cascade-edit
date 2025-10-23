import React from 'react';
import type { ComparisonResult } from '../types';
import { ComparisonRow } from './ComparisonRow';
import { EmptyState } from './EmptyState';
import './ComparisonGrid.css';

interface ComparisonGridProps {
  comparisons: ComparisonResult[];
}

export function ComparisonGrid({ comparisons }: ComparisonGridProps) {
  if (comparisons.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="comparison-grid">
      <h2>Model Comparisons</h2>
      <div className="comparison-list">
        {comparisons.map((comparison) => (
          <ComparisonRow key={comparison.id} comparison={comparison} />
        ))}
      </div>
    </div>
  );
}
