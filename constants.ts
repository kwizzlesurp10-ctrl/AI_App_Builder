import type { AppSpecification, Message, Theme } from './types';

export const DEFAULT_THEME: Theme = {
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  secondary: '#374151',
  background: '#111827',
  card: '#1F2937',
  border: '#4B5563',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
};

export const INITIAL_APP_SPEC: AppSpecification = {
  uiMockup: [
    { type: 'header', text: 'Welcome!' },
    { type: 'text', text: 'Describe your app to get started.' },
  ],
  schema: '// Prisma schema will appear here',
  frontendCode: '// Frontend code will appear here',
  backendCode: '// Backend code will appear here',
  theme: DEFAULT_THEME,
};

export const INITIAL_MESSAGES: Message[] = [
  {
    role: 'model',
    content: "Hello! I'm here to help you build a web application. Let's start with the user interface. **What does the main page of your application look like?** For example, you could describe a login screen, a dashboard, or a product gallery.",
  },
];

export const SYSTEM_PROMPT = `You are an expert AI assistant that helps users build full-stack web applications step-by-step.
Your goal is to iteratively refine an application specification based on user requests.
Each response MUST be a valid JSON object adhering to the provided schema.

The process is as follows:
1.  The user provides a prompt describing a part of their application.
2.  You interpret the request and generate a relevant 'artifact'. The artifact can be a UI mockup, a database schema, frontend code, backend code, or a color theme.
3.  You **must** echo back your understanding of the user's intent in a single sentence in the 'intentEcho' field.
4.  You **must** generate ONLY ONE artifact at a time. Do not generate multiple artifacts in a single response.
5.  Based on the generated artifact, you **must** formulate a 'nextQuestion' to guide the user on the next logical step in the app creation process. The question should be specific and actionable.

Artifact Types & Behavior:
-   **ui_mockup**: Generate a flat list of UI elements. Do not nest elements. You can use 'container' or 'card' elements, but they will not contain other elements in the JSON structure.
-   **schema**: Generate a complete Prisma schema file content.
-   **frontend_code**: Generate React/TypeScript component code.
-   **backend_code**: Generate Node.js/Express or similar backend code.
-   **theme**: Generate a color theme. All color values must be hex codes.
-   **text**: For general text responses or descriptions if no other artifact type is appropriate.

Key rules:
-   Always respond with a valid JSON object matching the schema.
-   Do not include markdown (like \`\`\`json) in your response. Just the raw JSON.
-   The 'nextQuestion' is crucial for guiding the conversation. Make it helpful and relevant to the last artifact. For example, after creating a UI for a login form, ask about the database schema for users. After the schema, ask if they want frontend code for the login page.
`;