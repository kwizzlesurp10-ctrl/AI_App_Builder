import React, { useState } from 'react';
import type { AppSpecification } from '../types';
import { UIMockup } from './UIMockup';
import { CodeBlock } from './CodeBlock';

interface PreviewPaneProps {
  appSpecification: AppSpecification;
  isLoading: boolean;
}

type Tab = 'UI' | 'Schema' | 'Frontend' | 'Backend';

export const PreviewPane: React.FC<PreviewPaneProps> = ({ appSpecification, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('UI');

  const renderContent = () => {
    switch (activeTab) {
      case 'UI':
        return <UIMockup elements={appSpecification.uiMockup} theme={appSpecification.theme} />;
      case 'Schema':
        return <CodeBlock language="prisma" code={appSpecification.schema} />;
      case 'Frontend':
        return <CodeBlock language="typescript" code={appSpecification.frontendCode} />;
      case 'Backend':
        return <CodeBlock language="typescript" code={appSpecification.backendCode} />;
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{ name: Tab }> = ({ name }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === name
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {name}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-950 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-opacity duration-300">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Generating artifact...</p>
        </div>
      )}
      <header className="p-2 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <nav className="flex items-center space-x-2">
            <TabButton name="UI" />
            <TabButton name="Schema" />
            <TabButton name="Frontend" />
            <TabButton name="Backend" />
        </nav>
      </header>
      <main className="flex-1 overflow-auto bg-gray-950">
        {renderContent()}
      </main>
    </div>
  );
};