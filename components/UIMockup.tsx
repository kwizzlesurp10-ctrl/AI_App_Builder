import React from 'react';
import type { UIMockupElement, Theme } from '../types';

const themeToStyleObject = (theme: Theme): React.CSSProperties => ({
  '--primary-color': theme.primary,
  '--primary-hover-color': theme.primaryHover,
  '--secondary-color': theme.secondary,
  '--background-color': theme.background,
  '--card-color': theme.card,
  '--border-color': theme.border,
  '--text-primary-color': theme.textPrimary,
  '--text-secondary-color': theme.textSecondary,
} as React.CSSProperties);

const ElementRenderer: React.FC<{ element: UIMockupElement }> = ({ element }) => {
  switch (element.type) {
    case 'header':
      return <h2 className="text-2xl font-bold text-[var(--text-primary-color)] mb-4">{element.text}</h2>;
    case 'text':
      return <p className="text-[var(--text-secondary-color)] mb-4">{element.text}</p>;
    case 'input':
      return (
        <input
          type="text"
          placeholder={element.placeholder}
          className="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-md px-3 py-2 mb-4 text-[var(--text-primary-color)] placeholder-[var(--text-secondary-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
        />
      );
    case 'textarea':
      return (
        <textarea
          placeholder={element.placeholder}
          className="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-md px-3 py-2 mb-4 text-[var(--text-primary-color)] placeholder-[var(--text-secondary-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
          rows={4}
        />
      );
    case 'button':
      return (
        <button className="w-full bg-[var(--primary-color)] text-white font-semibold rounded-md px-4 py-2 hover:bg-[var(--primary-hover-color)] transition-colors mb-4">
          {element.text}
        </button>
      );
    case 'container':
      return (
        <div className="p-6 border border-[var(--border-color)] rounded-lg bg-[var(--card-color)] mb-4">
          {element.children?.map((child, index) => <ElementRenderer key={index} element={child} />)}
        </div>
      );
    case 'card':
        return (
          <div className="p-4 border border-[var(--border-color)] rounded-md bg-[var(--secondary-color)] mb-4">
            {element.children?.map((child, index) => <ElementRenderer key={index} element={child} />)}
          </div>
        );
    default:
      return null;
  }
};

interface UIMockupProps {
  elements: UIMockupElement[];
  theme: Theme;
}

export const UIMockup: React.FC<UIMockupProps> = ({ elements, theme }) => {
  const styleObject = themeToStyleObject(theme);

  return (
    <div className="p-8 bg-[var(--background-color)] h-full" style={styleObject}>
      <div className="max-w-md mx-auto">
        {elements.map((element, index) => (
          <ElementRenderer key={index} element={element} />
        ))}
      </div>
    </div>
  );
};