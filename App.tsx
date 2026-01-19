import React, { useState } from 'react';
import CharacterPanel from './components/CharacterPanel';
import ResultsGallery from './components/ResultsGallery';
import ApiKeySelector from './components/ApiKeySelector';
import ConfirmationDialog from './components/ConfirmationDialog';
import { Character, GeneratedImage, PromptItem, AspectRatio, QualityMode, StandardQuality } from './types';
import { generateImagesBatch } from './services/geminiService';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // State for Character Panel
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'c1', name: 'Character 1', imageData: null, mimeType: '', isSelected: true },
    { id: 'c2', name: 'Character 2', imageData: null, mimeType: '', isSelected: true },
    { id: 'c3', name: 'Character 3', imageData: null, mimeType: '', isSelected: false },
    { id: 'c4', name: 'Character 4', imageData: null, mimeType: '', isSelected: false },
  ]);
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [qualityMode, setQualityMode] = useState<QualityMode>("4K");
  const [standardQuality, setStandardQuality] = useState<StandardQuality>("High");
  
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

  const handleToggleAllCharacters = (isSelected: boolean) => {
    setCharacters(prev => prev.map(c => ({ ...c, isSelected })));
  };

  const handleAddCharacter = () => {
    if (characters.length >= 10) return;
    setCharacters(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Character ${prev.length + 1}`,
        imageData: null,
        mimeType: '',
        isSelected: true
      }
    ]);
  };

  const handleDeleteCharacter = (id: string) => {
    if (characters.length <= 1) {
        alert("You must have at least one character slot.");
        return;
    }
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateImage = (id: string, updates: Partial<GeneratedImage>) => {
    setGeneratedImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const handleSaveCharacters = () => {
    try {
      localStorage.setItem('rtt_characters', JSON.stringify(characters));
      // Optional: Visual feedback could be handled in the UI, using a simple alert for now
      alert('Character configurations saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save characters. The images might be too large for your browser storage.');
    }
  };

  const handleLoadCharacters = () => {
    try {
      const saved = localStorage.getItem('rtt_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCharacters(parsed);
          alert('Character configurations loaded!');
        }
      } else {
        alert('No saved character configurations found.');
      }
    } catch (error) {
      console.error('Load failed:', error);
      alert('Failed to load character configurations.');
    }
  };

  const handleImageGenerated = (newImage: GeneratedImage) => {
    setGeneratedImages(prev => [...prev, newImage]);
  };

  const handleRequestGenerate = () => {
    const validPrompts = prompts.filter(p => p.text.trim() !== '');
    if (validPrompts.length === 0) {
      alert("Please enter at least one prompt.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleGeneratePreview = async (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char || !char.imageData) return;
    
    setIsGenerating(true);
    try {
        // Create a temporary character object that is forced to be selected
        // This ensures the service uses it even if the user unchecked the box
        const tempChar = { ...char, isSelected: true };
        
        const previewPrompt: PromptItem = {
            id: `preview-${Date.now()}`,
            text: `A detailed portrait of this character, front facing, neutral background, 8k resolution, cinematic lighting.`
        };

        await generateImagesBatch(
            [tempChar], // Only pass this character
            [previewPrompt],
            "1:1", // Square for portraits
            qualityMode,
            standardQuality,
            handleImageGenerated
        );
    } catch (error) {
        console.error("Preview generation failed", error);
        alert("Failed to generate preview.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleConfirmGenerate = async () => {
    setShowConfirmation(false);
    setIsGenerating(true);
    setGeneratedImages([]); 

    const validPrompts = prompts.filter(p => p.text.trim() !== '');

    try {
      await generateImagesBatch(
        characters,
        validPrompts,
        aspectRatio,
        qualityMode,
        standardQuality,
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
  const shouldShowApiKeySelector = qualityMode === '4K' && !apiKeyReady;
  
  // Calculate stats for confirmation
  const activeCharacterCount = characters.filter(c => c.isSelected && c.imageData).length;
  const validPromptCount = prompts.filter(p => p.text.trim() !== '').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {shouldShowApiKeySelector && (
        <ApiKeySelector 
            onReady={() => setApiKeyReady(true)} 
            onSwitchToStandard={() => setQualityMode("Standard")}
        />
      )}

      <ConfirmationDialog 
        isOpen={showConfirmation}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowConfirmation(false)}
        promptCount={validPromptCount}
        characterCount={activeCharacterCount}
        qualityMode={qualityMode}
        standardQuality={standardQuality}
        aspectRatio={aspectRatio}
      />
      
      {/* 
        We use conditional opacity/pointer-events to blur background when dialogs are open
      */}
      <div className={`flex w-full h-full transition-opacity duration-300 ${shouldShowApiKeySelector ? 'opacity-10 pointer-events-none filter blur-sm' : 'opacity-100'}`}>
        
        {/* Left Column: Control Panel (30% width, min 350px) */}
        <div className="w-[400px] flex-shrink-0 h-full border-r border-slate-800 z-10 shadow-2xl">
          <CharacterPanel 
            characters={characters}
            onUpdateCharacter={handleUpdateCharacter}
            onToggleAllCharacters={handleToggleAllCharacters}
            onAddCharacter={handleAddCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            qualityMode={qualityMode}
            setQualityMode={setQualityMode}
            standardQuality={standardQuality}
            setStandardQuality={setStandardQuality}
            prompts={prompts}
            setPrompts={setPrompts}
            onGenerate={handleRequestGenerate}
            onGeneratePreview={handleGeneratePreview}
            isGenerating={isGenerating}
            onSaveCharacters={handleSaveCharacters}
            onLoadCharacters={handleLoadCharacters}
          />
        </div>

        {/* Right Column: Results (Flexible) */}
        <div className="flex-grow h-full relative">
          <ResultsGallery 
            images={generatedImages} 
            onUpdateImage={handleUpdateImage}
          />
        </div>
      </div>
    </div>
  );
};

export default App;