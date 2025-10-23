import { QueueItem, QueueState } from '../types';

export class QueueManager {
  private queue: QueueState;
  private processingCallback: (item: QueueItem) => Promise<void>;

  constructor(maxConcurrent: number = 3) {
    this.queue = {
      items: [],
      processing: new Set(),
      maxConcurrent,
    };
    this.processingCallback = async () => {};
  }

  /**
   * Set the callback function that processes queue items
   */
  setProcessingCallback(callback: (item: QueueItem) => Promise<void>) {
    this.processingCallback = callback;
  }

  /**
   * Add item to queue and process if possible
   */
  async enqueue(item: QueueItem): Promise<void> {
    this.queue.items.push(item);
    await this.processNext();
  }

  /**
   * Process next item in queue if capacity allows
   */
  private async processNext(): Promise<void> {
    // Check if we can process more items
    if (this.queue.processing.size >= this.queue.maxConcurrent) {
      return;
    }

    // Get next item from queue
    const item = this.queue.items.shift();
    if (!item) {
      return;
    }

    // Mark as processing
    this.queue.processing.add(item.paragraphId);

    try {
      // Process the item
      await this.processingCallback(item);
    } catch (error) {
      console.error('Error processing queue item:', error);
    } finally {
      // Remove from processing set
      this.queue.processing.delete(item.paragraphId);
      
      // Try to process next item
      await this.processNext();
    }
  }

  /**
   * Get current queue state
   */
  getState(): QueueState {
    return {
      ...this.queue,
      processing: new Set(this.queue.processing),
    };
  }

  /**
   * Get number of items in queue
   */
  getQueueLength(): number {
    return this.queue.items.length;
  }

  /**
   * Get number of items being processed
   */
  getProcessingCount(): number {
    return this.queue.processing.size;
  }

  /**
   * Check if a specific item is being processed
   */
  isProcessing(paragraphId: string): boolean {
    return this.queue.processing.has(paragraphId);
  }

  /**
   * Clear all items from queue
   */
  clear(): void {
    this.queue.items = [];
  }
}

// Export singleton instance
export const queueManager = new QueueManager(3); // Max 3 concurrent
