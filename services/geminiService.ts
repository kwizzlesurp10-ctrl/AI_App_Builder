import { GoogleGenAI, Type } from "@google/genai";
import type { Message, GeminiResponse } from '../types';
import { SYSTEM_PROMPT } from '../constants';

let client: GoogleGenAI | null = null;

const getApiKey = () => {
    if (typeof import.meta !== 'undefined') {
        return import.meta.env?.VITE_GEMINI_API_KEY;
    }

    if (typeof process !== 'undefined') {
        return process.env?.VITE_GEMINI_API_KEY;
    }

    return undefined;
};

export const isGeminiConfigured = () => Boolean(getApiKey());

const getClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('Missing VITE_GEMINI_API_KEY environment variable. Please set it in your .env file.');
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey });
    }
    return client;
};

const themeSchema = {
    type: Type.OBJECT,
    description: "For 'theme' type. A JSON object representing the color theme.",
    properties: {
        primary: { type: Type.STRING, description: "Primary action color (buttons, links)." },
        primaryHover: { type: Type.STRING, description: "Hover state for primary color." },
        secondary: { type: Type.STRING, description: "Secondary element color (e.g. input backgrounds)." },
        background: { type: Type.STRING, description: "App background color." },
        card: { type: Type.STRING, description: "Card/container background color." },
        border: { type: Type.STRING, description: "Border color." },
        textPrimary: { type: Type.STRING, description: "Primary text color." },
        textSecondary: { type: Type.STRING, description: "Secondary text color (placeholders, subtitles)." },
    }
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        intentEcho: {
            type: Type.STRING,
            description: "A one-sentence confirmation of the user's last request."
        },
        artifact: {
            type: Type.OBJECT,
            properties: {
                type: { 
                    type: Type.STRING, 
                    description: "The type of artifact: 'ui_mockup', 'schema', 'frontend_code', 'backend_code', or 'theme'." 
                },
                elements: {
                    type: Type.ARRAY,
                    description: "For 'ui_mockup' type. An array of UI elements.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "e.g., 'header', 'input', 'button', 'text', 'container', 'card'" },
                            text: { type: Type.STRING, description: "Text content for the element." },
                            placeholder: { type: Type.STRING, description: "Placeholder for input fields." },
                        }
                    }
                },
                schema: { 
                    type: Type.STRING, 
                    description: "For 'schema' type. A string containing the full Prisma schema." 
                },
                code: { 
                    type: Type.STRING, 
                    description: "For code types. A string containing the code."
                },
                description: {
                    type: Type.STRING,
                    description: "A brief description of the artifact."
                },
                theme: themeSchema,
            },
        },
        nextQuestion: {
            type: Type.STRING,
            description: "The next focused question or suggestion for the user."
        }
    },
    required: ["intentEcho", "nextQuestion"]
};


export const getAIResponse = async (history: Message[]): Promise<GeminiResponse> => {
    // We only need the text content for the API call
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const response = await getClient().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7
        },
    });

    try {
        const text = response.text.trim();
        const parsedResponse = JSON.parse(text);
        return parsedResponse as GeminiResponse;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", response.text, e);
        throw new Error("Invalid JSON response from AI.");
    }
};