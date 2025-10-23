export type MessageRole = 'user' | 'model';

export interface Theme {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
}

export type ArtifactType = 'ui_mockup' | 'schema' | 'frontend_code' | 'backend_code' | 'text' | 'theme';

export interface Artifact {
  type: ArtifactType;
  elements?: UIMockupElement[];
  schema?: string;
  code?: string;
  description?: string;
  theme?: Theme;
}

export interface Message {
  role: MessageRole;
  content: string;
  artifact?: Artifact;
  isError?: boolean;
}

export interface UIMockupElement {
  type: 'header' | 'text' | 'input' | 'textarea' | 'button' | 'container' | 'card';
  text?: string;
  placeholder?: string;
  children?: UIMockupElement[];
}

export interface AppSpecification {
  uiMockup: UIMockupElement[];
  schema: string;
  frontendCode: string;
  backendCode: string;
  theme: Theme;
}

export interface GeminiResponse {
  intentEcho: string;
  artifact: Artifact;
  nextQuestion: string;
}