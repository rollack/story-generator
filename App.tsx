import React, { useState } from 'react';
import CharacterPanel from './components/CharacterPanel';
import ResultsGallery from './components/ResultsGallery';
import ApiKeySelector from './components/ApiKeySelector';
import { Character, GeneratedImage, PromptItem, AspectRatio, Quality } from './types';
import { generateImagesBatch } from './services/geminiService';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for Character Panel
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'c1', name: 'Character 1', imageData: null, mimeType: '', isSelected: true },
    { id: 'c2', name: 'Character 2', imageData: null, mimeType: '', isSelected: true },
    { id: 'c3', name: 'Character 3', imageData: null, mimeType: '', isSelected: false },
    { id: 'c4', name: 'Character 4', imageData: null, mimeType: '', isSelected: false },
  ]);
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<Quality>("4K");
  
  const [prompts, setPrompts] = useState<PromptItem[]>([
    { id: 'p1', text: '' },
    { id: 'p2', text: '' },
    { id: 'p3', text: '' },
  ]);

  // State for Results
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Handlers
  const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleImageGenerated = (newImage: GeneratedImage) => {
    setGeneratedImages(prev => [...prev, newImage]);
  };

  const handleGenerate = async () => {
    const validPrompts = prompts.filter(p => p.text.trim() !== '');
    if (validPrompts.length === 0) {
      alert("Please enter at least one prompt.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]); 

    try {
      await generateImagesBatch(
        characters,
        validPrompts,
        aspectRatio,
        quality,
        handleImageGenerated
      );
    } catch (error) {
      console.error("Batch generation failed", error);
      alert("An error occurred during generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Logic to determine if we should block the UI for API key
  // We only block if quality is 4K AND we haven't selected a key yet
  const shouldShowApiKeySelector = quality === '4K' && !apiKeyReady;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {shouldShowApiKeySelector && (
        <ApiKeySelector 
            onReady={() => setApiKeyReady(true)} 
            onSwitchToStandard={() => setQuality("Standard")}
        />
      )}
      
      {/* 
        We use conditional opacity/pointer-events instead of not rendering to prevent re-mounts 
        when switching quality, maintaining state.
      */}
      <div className={`flex w-full h-full transition-opacity duration-300 ${shouldShowApiKeySelector ? 'opacity-10 pointer-events-none filter blur-sm' : 'opacity-100'}`}>
        
        {/* Left Column: Control Panel (30% width, min 350px) */}
        <div className="w-[400px] flex-shrink-0 h-full border-r border-slate-800 z-10 shadow-2xl">
          <CharacterPanel 
            characters={characters}
            onUpdateCharacter={handleUpdateCharacter}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            quality={quality}
            setQuality={setQuality}
            prompts={prompts}
            setPrompts={setPrompts}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right Column: Results (Flexible) */}
        <div className="flex-grow h-full relative">
          <ResultsGallery images={generatedImages} />
        </div>
      </div>
    </div>
  );
};

export default App;
