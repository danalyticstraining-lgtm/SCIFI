import { GoogleGenAI, Type } from "@google/genai";
import { CalculationResult } from "../types";

// Initialize the Gemini client
// Note: In a real production app, this should be proxied through a backend to protect the API key.
// For this frontend-only demo, we use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateWithGemini = async (input: string): Promise<CalculationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Calculate or solve the following math problem: "${input}". 
      If it is a simple calculation, provide the number. 
      If it is a word problem, solve it.
      Provide a brief, one-sentence explanation for the result.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: {
              type: Type.STRING,
              description: "The numerical result or final answer."
            },
            explanation: {
              type: Type.STRING,
              description: "A very brief explanation of how the result was derived."
            }
          },
          required: ["result", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as CalculationResult;
  } catch (error) {
    console.error("Gemini Calculation Error:", error);
    throw new Error("Failed to calculate with AI");
  }
};