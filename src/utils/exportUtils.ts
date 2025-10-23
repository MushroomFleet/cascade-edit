import type { Paragraph, ComparisonResult } from '../types';
import { ParagraphStatus } from '../types';

/**
 * Format date for export
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Export paragraphs from Single Mode to markdown
 */
export function exportParagraphsToMarkdown(paragraphs: Paragraph[]): string {
  // Filter only completed paragraphs
  const completed = paragraphs.filter(p => p.status === ParagraphStatus.COMPLETED);

  if (completed.length === 0) {
    return '# Cascade-Edit Session Export\n\nNo completed paragraphs to export.';
  }

  let markdown = '# Cascade-Edit Session Export\n';
  markdown += `Generated: ${formatDate(Date.now())}\n\n`;
  markdown += '---\n\n';

  completed.forEach((paragraph, index) => {
    markdown += `## Paragraph ${index + 1}\n\n`;
    markdown += `**Original:**\n${paragraph.originalText}\n\n`;
    markdown += `**Enhanced:**\n${paragraph.correctedText}\n\n`;
    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Export comparisons from Compare Mode to markdown
 */
export function exportComparisonsToMarkdown(comparisons: ComparisonResult[]): string {
  // Filter only comparisons where all models are completed
  const completed = comparisons.filter(comp =>
    comp.outputs.model1.status === ParagraphStatus.COMPLETED &&
    comp.outputs.model2.status === ParagraphStatus.COMPLETED &&
    comp.outputs.model3.status === ParagraphStatus.COMPLETED &&
    comp.outputs.model4.status === ParagraphStatus.COMPLETED
  );

  if (completed.length === 0) {
    return '# Cascade-Edit Session Export\n\nNo completed comparisons to export.';
  }

  let markdown = '# Cascade-Edit Session Export\n';
  markdown += `Generated: ${formatDate(Date.now())}\n\n`;
  markdown += '---\n\n';

  completed.forEach((comparison, index) => {
    markdown += `## Input ${index + 1}\n\n`;
    markdown += `**User:**\n${comparison.originalText}\n\n`;
    
    markdown += `**${comparison.outputs.model1.modelName}:**\n${comparison.outputs.model1.text}\n\n`;
    markdown += `**${comparison.outputs.model2.modelName}:**\n${comparison.outputs.model2.text}\n\n`;
    markdown += `**${comparison.outputs.model3.modelName}:**\n${comparison.outputs.model3.text}\n\n`;
    markdown += `**${comparison.outputs.model4.modelName}:**\n${comparison.outputs.model4.text}\n\n`;
    
    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Download markdown content as a file
 */
export function downloadMarkdown(content: string, filename?: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `cascade-edit-export-${timestamp}.md`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
