import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { sanitizeForDisplay } from '../services/sanitize';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isApiConfigured: boolean;
  onNewSession?: () => void;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    </div>
);

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isModel = message.role === 'model';
    const sanitizedContent = sanitizeForDisplay(message.content);

    return (
        <div className={`flex items-start gap-4 p-4 ${isModel ? 'bg-gray-900/50' : ''}`} role="article" aria-label={`${isModel ? 'AI' : 'User'} message`}>
            {isModel ? <ModelIcon /> : <UserIcon />}
            <div className="flex-1 pt-1">
                <p 
                    className={`text-gray-300 leading-relaxed ${message.isError ? 'text-red-400' : ''}`}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </div>
        </div>
    );
};


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isApiConfigured, onNewSession }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-200">AI App Builder</h1>
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
              aria-label="Start new session"
            >
              New Session
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto" role="log" aria-label="Chat messages" aria-live="polite">
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
                 <div className="flex items-start gap-4 p-4 bg-gray-900/50" aria-label="AI is thinking">
                    <ModelIcon />
                    <div className="flex-1 pt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-800 bg-gray-900">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder={isApiConfigured ? "Describe the next step..." : "API Key not configured..."}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-gray-200 transition-all"
                    rows={1}
                    disabled={isLoading || !isApiConfigured}
                    aria-label="Message input"
                />
                <button type="submit" disabled={isLoading || !input.trim() || !isApiConfigured} className="bg-indigo-600 text-white rounded-lg p-3 h-12 w-12 flex items-center justify-center hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
  );
};