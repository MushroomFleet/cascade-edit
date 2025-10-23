import React from 'react';
import './QueueStatus.css';

interface QueueStatusProps {
  queueLength: number;
  processingCount: number;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  queueLength,
  processingCount,
}) => {
  // Only show if there's activity
  if (queueLength === 0 && processingCount === 0) {
    return null;
  }

  return (
    <div className="queue-status">
      <div className="queue-status-content">
        {processingCount > 0 && (
          <div className="queue-stat">
            <div className="queue-stat-icon processing">⚡</div>
            <span className="queue-stat-label">Processing:</span>
            <span className="queue-stat-value">{processingCount}</span>
          </div>
        )}
        
        {queueLength > 0 && (
          <div className="queue-stat">
            <div className="queue-stat-icon queued">⏳</div>
            <span className="queue-stat-label">In Queue:</span>
            <span className="queue-stat-value">{queueLength}</span>
          </div>
        )}
      </div>
    </div>
  );
};
