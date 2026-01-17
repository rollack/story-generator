export interface Character {
  id: string;
  name: string;
  imageData: string | null; // Base64 string
  mimeType: string;
  isSelected: boolean;
}

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "Custom";

export type Quality = "Standard" | "4K";

export interface GeneratedImage {
  id: string;
  promptIndex: number;
  promptText: string;
  imageUrl: string;
  timestamp: Date;
  fileName: string;
}

export interface PromptItem {
  id: string;
  text: string;
}

export interface GenerateOptions {
  aspectRatio: string;
  characters: Character[];
  prompts: PromptItem[];
  quality: Quality;
}
