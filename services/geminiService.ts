import { GoogleGenAI } from "@google/genai";
import { CFProblem } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid errors in environments without it (though UI will block it)
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getProblemHint = async (problem: CFProblem): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please check your environment configuration.";
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert competitive programming coach. A student is asking for a hint for the following Codeforces problem.
    
    Problem Name: ${problem.name}
    Tags: ${problem.tags.join(', ')}
    Rating: ${problem.rating || 'Unrated'}
    Index: ${problem.index}

    Provide a concise, helpful hint that points them in the right direction (e.g., algorithm to use, edge case to consider, or observation). 
    DO NOT provide the full solution code. 
    DO NOT give away the entire logic immediately. 
    Keep it under 3 sentences if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Could not generate a hint at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while contacting the AI coach. Please try again later.";
  }
};
