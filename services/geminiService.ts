import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { KeywordData } from "../types";

// Helper function for base64 decoding (as per API guidance for audio, can be adapted if needed for other blobs)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const getGeminiInstance = () => {
  // CRITICAL: Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateKeywordsAndMetrics = async (
  seedKeyword: string,
  numKeywords: number,
): Promise<KeywordData[]> => {
  try {
    const ai = getGeminiInstance();
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert SEO analyst and keyword research tool. Your task is to generate relevant long-tail keywords, their hypothetical SEO metrics, content ideas, and potential SERP features. Ensure the difficulty, search volume, competition level, and estimated CPC estimates are plausible for the given keyword.`;

    const userPrompt = `Generate ${numKeywords} related long-tail keywords for the topic "${seedKeyword}". For each keyword, provide:
1.  A "keyword" string.
2.  A "difficulty" rating (one of: 'Low', 'Medium', 'High', 'Very High').
3.  A "searchVolume" range (one of: '0-10', '10-100', '100-1K', '1K-10K', '10K-100K', '100K+').
4.  A "competitionLevel" rating (one of: 'Low', 'Medium', 'High', 'Very High').
5.  An "estimatedCpc" range (e.g., '$0.50 - $1.50', '$1.00 - $3.00', 'N/A' if not applicable).
6.  An array of 2-3 "contentIdeas" strings relevant to the keyword.
7.  An array of 1-2 "serpFeatures" strings (e.g., 'Featured Snippet', 'People Also Ask', 'Videos', 'Images', 'Shopping', 'Local Pack', 'Knowledge Panel').

Format the output strictly as a JSON array of objects, adhering to the provided schema.`;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING, description: 'The generated keyword phrase.' },
          difficulty: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High', 'Very High'],
            description: 'Hypothetical SEO difficulty for ranking.'
          },
          searchVolume: {
            type: Type.STRING,
            enum: ['0-10', '10-100', '100-1K', '1K-10K', '10K-100K', '100K+'],
            description: 'Hypothetical monthly search volume range.'
          },
          competitionLevel: { // Added competition level to schema
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High', 'Very High'],
            description: 'Hypothetical competition level for this keyword in paid search.'
          },
          estimatedCpc: { // Added estimated CPC to schema
            type: Type.STRING,
            description: 'Hypothetical estimated Cost Per Click (CPC) range for paid ads, or "N/A".'
          },
          contentIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Content topics or blog post ideas related to the keyword.'
          },
          serpFeatures: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Common Google SERP features that might appear for this keyword.'
          },
        },
        required: [
          'keyword',
          'difficulty',
          'searchVolume',
          'competitionLevel', // Added to required
          'estimatedCpc', // Added to required
          'contentIdeas',
          'serpFeatures'
        ],
      },
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Adjust for more creative or stricter responses
        topP: 0.95,
        topK: 64,
      },
    });

    const jsonStr = response.text.trim();
    const parsedKeywords = JSON.parse(jsonStr) as Omit<KeywordData, 'id'>[];

    // Assign a unique ID to each keyword
    return parsedKeywords.map(kw => ({
      ...kw,
      id: crypto.randomUUID(),
    }));
  } catch (error) {
    console.error('Error generating keywords:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      // Handle API key specific error for Veo model. In this generic case, just re-throw or handle generally.
      throw new Error("API Key issue or model not found. Please ensure a valid API key is selected.");
    }
    throw new Error('Failed to fetch keyword data. Please try again.');
  }
};