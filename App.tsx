import React, { useState, useCallback, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PreviewPane } from './components/PreviewPane';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SwarmDashboard } from './components/swarm/SwarmDashboard';
import { getSwarmAIResponse, isGeminiConfigured } from './services/swarmGeminiService';
import { saveSession, loadSession, clearSession, getDefaultSession } from './services/persistenceService';
import { sanitizeInput } from './services/sanitize';
import type { Message, AppSpecification, GeminiResponse } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appSpecification, setAppSpecification] = useState<AppSpecification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [swarmExpanded, setSwarmExpanded] = useState<boolean>(false);

  const isApiConfigured = isGeminiConfigured();

  // Load persisted session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setMessages(saved.messages);
      setAppSpecification(saved.appSpec);
    } else {
      const defaults = getDefaultSession();
      setMessages(defaults.messages);
      setAppSpecification(defaults.appSpec);
    }
  }, []);

  // Persist session on changes
  useEffect(() => {
    if (messages.length > 0 && appSpecification) {
      saveSession(messages, appSpecification);
    }
  }, [messages, appSpecification]);

  const handleNewSession = useCallback(() => {
    clearSession();
    const defaults = getDefaultSession();
    setMessages(defaults.messages);
    setAppSpecification(defaults.appSpec);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const sanitized = sanitizeInput(content);
    if (!sanitized) return;

    const userMessage: Message = { role: 'user', content: sanitized };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const geminiResponse: GeminiResponse = await getSwarmAIResponse(newHistory);
      const { artifact, intentEcho, nextQuestion } = geminiResponse;

      setAppSpecification(prevSpec => {
        const baseSpec = prevSpec ?? getDefaultSession().appSpec;
        const newSpec = { ...baseSpec };
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
      const errorContent = error instanceof Error && error.message.includes('Rate limit')
        ? 'You\'re sending requests too quickly. Please wait a moment and try again.'
        : 'Sorry, I encountered an error processing your request. Please check the console for details or try rephrasing.';
      const errorMessage: Message = {
        role: 'model',
        content: errorContent,
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Don't render until state is initialized
  if (!appSpecification) return null;

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-900 text-white font-sans">
        <div className="w-1/3 max-w-2xl min-w-[400px] border-r border-gray-800 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isApiConfigured={isApiConfigured}
              onNewSession={handleNewSession}
            />
          </div>
          <SwarmDashboard
            isExpanded={swarmExpanded}
            onToggle={() => setSwarmExpanded(prev => !prev)}
          />
        </div>
        <div className="flex-1">
          <PreviewPane appSpecification={appSpecification} isLoading={isLoading} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
