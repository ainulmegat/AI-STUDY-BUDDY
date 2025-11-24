import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm flex items-center space-x-2">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};
