import React from 'react';

const StatusCard = ({ status, progress, error, onRetry }) => {
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return <div className="status-message" style={{ color: '#f7f0f0ff', fontWeight: 'bold' }}>Select a file to begin</div>;
      case 'selected':
        return (
          <div className="status-message" style={{ color: '#f7f0f0ff', fontWeight: 'bold' }}>
            Ready to process
          </div>
        );
      case 'compressing':
        return (
          <>
            <div className="status-message" style={{ color: '#f7f0f0ff', fontWeight: 'bold' }}>
              Processing...
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        );
      case 'success':
        return (
          <div className="status-message success" style={{ color: '#22c55e', fontWeight: 'bold' }}>
            Completed successfully!
          </div>
        );
      case 'error':
        return (
          <>
            <div className="status-message error" style={{ color: '#ef4444', fontWeight: 'bold' }}>
              Error occurred
            </div>
            <div className="error-message" style={{ color: '#333' }}>{error}</div>
            <button className="retry-btn" onClick={onRetry} style={{ backgroundColor: '#4a6cf7', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
              Try Again
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {renderContent()}
    </div>
  );
};

export default StatusCard;