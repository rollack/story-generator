import { GoogleGenAI, Part } from "@google/genai";
import { Character, GeneratedImage, PromptItem, QualityMode, StandardQuality } from "../types";

// Helper to get formatted date DDMonYYYY
export const getFormattedDate = (): string => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

export const generateImagesBatch = async (
  characters: Character[],
  prompts: PromptItem[],
  aspectRatio: string,
  qualityMode: QualityMode,
  standardQuality: StandardQuality,
  onImageGenerated: (img: GeneratedImage) => void
): Promise<void> => {
  
  // Create a new instance with the key from process.env (which is injected by the selection dialog)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Filter active characters
  const activeCharacters = characters.filter(c => c.isSelected && c.imageData);

  // Determine model and config based on quality
  const isPro = qualityMode === '4K';
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  // We process prompts sequentially to avoid hitting rate limits too hard, 
  // although parallel is possible, sequential provides better UX feedback for "progress".
  for (let i = 0; i < prompts.length; i++) {
    const promptItem = prompts[i];
    const promptText = promptItem.text.trim();
    
    if (!promptText) continue;

    try {
      // Construct parts: Interleave character definitions with the final prompt
      const parts: Part[] = [];

      if (activeCharacters.length > 0) {
        parts.push({ text: "Use the following images as consistent character references for the story generation:" });
        
        for (const char of activeCharacters) {
          parts.push({ text: `Reference for character named "${char.name}":` });
          parts.push({
            inlineData: {
              data: char.imageData!,
              mimeType: char.mimeType
            }
          });
        }
      }

      parts.push({ text: `Generate a high-quality, detailed image based on this scene description: ${promptText}` });

      const imageConfig: any = {
        aspectRatio: aspectRatio === "Custom" ? "16:9" : aspectRatio,
      };

      // Only add imageSize for the Pro model
      if (isPro) {
        imageConfig.imageSize = "4K";
      }
      
      // Note: standardQuality (High/Balanced/Fast) is currently mapped to the same model (gemini-2.5-flash-image)
      // as per current API capabilities for general image generation. 
      // In a more complex setup, this could adjust safety settings or use different model variants if available.

      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: {
            imageConfig: imageConfig
        }
      });

      // Extract image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            const imageUrl = `data:${mimeType};base64,${base64Data}`;
            
            // 001_10Nov2025.png
            const seq = String(i + 1).padStart(3, '0');
            const dateStr = getFormattedDate();
            const fileName = `${seq}_${dateStr}.png`;

            const generatedImage: GeneratedImage = {
                id: crypto.randomUUID(),
                promptIndex: i,
                promptText: promptText,
                imageUrl: imageUrl,
                timestamp: new Date(),
                fileName: fileName
            };
            
            onImageGenerated(generatedImage);
        }
      }

    } catch (error) {
      console.error(`Error generating image for prompt ${i + 1}:`, error);
      // We continue to the next prompt even if one fails
    }
  }
};