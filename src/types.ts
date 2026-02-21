import { GoogleGenAI, Type } from "@google/genai";

export interface TranslationHistory {
  id: string;
  indonesian: string;
  english: string;
  mode: 'casual' | 'formal';
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface MatchingPair {
  indonesian: string;
  english: string;
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const TRANSLATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    translation: { type: Type.STRING },
    explanation: { type: Type.STRING, description: "Grammar explanation for the translation" }
  },
  required: ["translation", "explanation"]
};

export const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  }
};

export const MATCHING_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      indonesian: { type: Type.STRING },
      english: { type: Type.STRING }
    },
    required: ["indonesian", "english"]
  }
};
