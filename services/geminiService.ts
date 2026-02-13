
import { GoogleGenAI, Type } from "@google/genai";
import { HomeworkAnalysis } from "../types";

// Always create a new client instance right before use to ensure we use the current API key from process.env
export const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeHomework(imageData: string, mimeType: string): Promise<HomeworkAnalysis> {
  const ai = getGeminiClient();
  // Using gemini-3-pro-preview for complex reasoning and STEM homework analysis tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType } },
        { text: "Analyze this homework problem. Provide a clear explanation for a student, break it down into key points, and suggest a specific visual prompt (for an image generator) and a video prompt (for a video generator) that would help illustrate the core concept. Return as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          topic: { type: Type.STRING },
          explanation: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualPrompt: { type: Type.STRING, description: "Prompt for an image generator" },
          videoPrompt: { type: Type.STRING, description: "Prompt for a video generator" }
        },
        required: ["subject", "topic", "explanation", "keyPoints", "visualPrompt", "videoPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis generated");
  return JSON.parse(text.trim());
}

export async function generateExplanatoryImage(prompt: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Educational illustration for a student: ${prompt}. Clean, helpful, labeled diagram style.` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) throw new Error("No content generated");

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function generateExplanatoryVideo(prompt: string): Promise<string> {
  const ai = getGeminiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Educational short explainer video for students: ${prompt}. Clear, smooth animation, informative.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  // Must append an API key when fetching from the download link
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("Failed to download generated video");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
