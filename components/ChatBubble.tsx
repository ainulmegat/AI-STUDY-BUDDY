import React from 'react';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div
        className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        ) : (
          <MarkdownRenderer content={message.text} />
        )}
        <div
          className={`text-xs mt-2 opacity-70 text-right ${
            isUser ? 'text-indigo-200' : 'text-slate-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
