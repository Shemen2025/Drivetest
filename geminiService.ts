
import { GoogleGenAI } from "@google/genai";

export const getAIExplanation = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
  // Create a new instance right before making an API call for the most up-to-date key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a UK Driving Theory expert. 
      Question: "${question}"
      User selected: "${userAnswer}"
      The correct answer is: "${correctAnswer}"
      
      Please explain in a friendly, encouraging way why "${correctAnswer}" is correct and briefly why "${userAnswer}" is incorrect if it differs. Reference the UK Highway Code where possible. Keep the explanation under 100 words.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text || "I couldn't generate a detailed explanation right now. Please refer to the Highway Code.";
  } catch (error) {
    console.error("AI Error:", error);
    return "The AI expert is currently unavailable. Please check your internet connection or try again later.";
  }
};

export const getStudyTip = async (category: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give me a unique, short, and actionable study tip for the UK Driving Theory category: ${category}.`,
    });
    return response.text || "Always check your mirrors before signaling!";
  } catch (error) {
    return "Practice makes perfect! Keep going through the question bank.";
  }
};
