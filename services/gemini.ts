import { GoogleGenAI, Chat } from "@google/genai";
import { StudyMode } from '../types';

// Initialize the client
// process.env.API_KEY is guaranteed to be available in this environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `You are an AI Study Buddy, a helpful, friendly, and clear educational assistant. 
Your goal is to help students learn effectively.
Tone: Encouraging, simple, and academic but accessible.

You have three specific modes of operation based on the user's request context:
1. EXPLAIN: Explain topics in simple terms using analogies and real-world examples. Break down complex jargon.
2. SUMMARIZE: Summarize the content significantly.
   - Strict Constraint: Maximum 5 bullet points or 5 lines of text.
   - Remove unnecessary details.
   - Keep only key points.
   - Do NOT rewrite the text in long form.
3. QUIZ: Generate a quiz on the provided topic with exactly 10 questions.
   - Structure:
     - 6 Multiple Choice Questions (A, B, C, D)
     - 4 True/False Questions
     - Provide the Answer Key explicitly at the very bottom of the response, hidden under a "### Answer Key" header.

Cultural Context:
- If the user mentions "kemerdekaan", "independence", or "merdeka", you must always interpret it as Malaysia’s Hari Kemerdekaan (31 Ogos 1957) unless stated otherwise.
- Use Malaysian context, Malaysian figures, Malaysian events, and Malaysian history where appropriate or requested.

Always format your response using Markdown for better readability (bolding key terms, using lists, etc.).`;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const generateStudyResponse = async (
  input: string,
  mode: StudyMode,
  onChunk: (text: string) => void
): Promise<string> => {
  const chat = getChatSession();
  
  let promptPrefix = "";
  switch (mode) {
    case StudyMode.EXPLAIN:
      promptPrefix = "Explain this topic simply with examples: ";
      break;
    case StudyMode.SUMMARIZE:
      promptPrefix = "Summarize the following strictly in max 5 bullet points: ";
      break;
    case StudyMode.QUIZ:
      promptPrefix = "Generate a quiz (6 MCQ, 4 T/F) with an answer key for: ";
      break;
  }

  const fullMessage = `${promptPrefix}${input}`;
  let accumulatedText = "";

  try {
    const result = await chat.sendMessageStream({ message: fullMessage });

    for await (const chunk of result) {
      const text = chunk.text; // Access text property directly
      if (text) {
        accumulatedText += text;
        onChunk(accumulatedText);
      }
    }
    return accumulatedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const resetSession = () => {
  chatSession = null;
};