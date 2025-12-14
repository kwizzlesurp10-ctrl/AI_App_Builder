import React, { useState, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PreviewPane } from './components/PreviewPane';
import { getAIResponse } from './services/geminiService';
import type { Message, AppSpecification, GeminiResponse } from './types';
import { INITIAL_APP_SPEC, INITIAL_MESSAGES } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [appSpecification, setAppSpecification] = useState<AppSpecification>(INITIAL_APP_SPEC);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const isApiConfigured = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const geminiResponse: GeminiResponse = await getAIResponse(newHistory);
      const { artifact, intentEcho, nextQuestion } = geminiResponse;

      setAppSpecification(prevSpec => {
        const newSpec = { ...prevSpec };
        if (!artifact) return newSpec;

        switch (artifact.type) {
          case 'ui_mockup':
            if (artifact.elements) newSpec.uiMockup = artifact.elements;
            break;
          case 'schema':
            if (artifact.schema) newSpec.schema = artifact.schema;
            break;
          case 'frontend_code':
          case 'backend_code':
            if (artifact.code) {
              if (artifact.type === 'frontend_code') newSpec.frontendCode = artifact.code;
              else newSpec.backendCode = artifact.code;
            }
            break;
          case 'theme':
            if (artifact.theme) newSpec.theme = artifact.theme;
            break;
          default:
            // For 'text' or other types, no spec update is needed.
            break;
        }
        return newSpec;
      });

      const modelResponse: Message = {
        role: 'model',
        content: `${intentEcho}\n\n**Next:** ${nextQuestion}`,
        artifact,
      };
      setMessages(prev => [...prev, modelResponse]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: "Sorry, I encountered an error. The AI's response might not be in the correct format. Please check the console for details or try rephrasing your request.",
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <div className="w-1/3 max-w-2xl min-w-[400px] border-r border-gray-800">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isApiConfigured={isApiConfigured}
        />
      </div>
      <div className="flex-1">
        <PreviewPane appSpecification={appSpecification} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;
