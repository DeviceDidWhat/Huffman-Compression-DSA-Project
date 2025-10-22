import React from 'react';

const StatusCard = ({ status, progress, onRetry }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return null;
      case 'selected':
        return (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">File selected and ready for processing</span>
          </div>
        );
      case 'compressing':
        return (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Processing...</span>
              <span className="font-medium">{progress}%</span>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Processing completed successfully!</span>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error occurred during processing</span>
            </div>
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {getStatusDisplay()}
    </div>
  );
};

export default StatusCard;