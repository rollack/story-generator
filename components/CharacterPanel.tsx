import React, { useState } from 'react';
import { Character, AspectRatio, PromptItem, QualityMode, StandardQuality } from '../types';
import { Upload, X, Trash2, Plus, Wand2, CheckCircle2, Save, FolderOpen, GripVertical, Sparkles } from './Icons';

interface CharacterPanelProps {
  characters: Character[];
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  onToggleAllCharacters: (isSelected: boolean) => void;
  onAddCharacter: () => void;
  onDeleteCharacter: (id: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  qualityMode: QualityMode;
  setQualityMode: (q: QualityMode) => void;
  standardQuality: StandardQuality;
  setStandardQuality: (sq: StandardQuality) => void;
  prompts: PromptItem[];
  setPrompts: React.Dispatch<React.SetStateAction<PromptItem[]>>;
  onGenerate: () => void;
  onGeneratePreview: (id: string) => void;
  isGenerating: boolean;
  onSaveCharacters: () => void;
  onLoadCharacters: () => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({
  characters,
  onUpdateCharacter,
  onToggleAllCharacters,
  onAddCharacter,
  onDeleteCharacter,
  aspectRatio,
  setAspectRatio,
  qualityMode,
  setQualityMode,
  standardQuality,
  setStandardQuality,
  prompts,
  setPrompts,
  onGenerate,
  onGeneratePreview,
  isGenerating,
  onSaveCharacters,
  onLoadCharacters
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get raw base64 if needed
        const base64Clean = result.split(',')[1];
        onUpdateCharacter(id, { 
            imageData: base64Clean, 
            mimeType: file.type 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addPrompt = () => {
    setPrompts(prev => [...prev, { id: crypto.randomUUID(), text: '' }]);
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, text } : p));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Prevent drag if interacting with the textarea or buttons to allow text selection/editing
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button')) {
        e.preventDefault();
        return;
    }

    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox to allow dragging
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder the list immediately (optimistic UI)
    const newPrompts = [...prompts];
    const draggedItem = newPrompts[draggedIndex];
    
    // Remove from old position
    newPrompts.splice(draggedIndex, 1);
    // Insert at new position
    newPrompts.splice(index, 0, draggedItem);

    setPrompts(newPrompts);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm">R</span>
            Robert’s Tech Tool
          </h1>
          <p className="text-slate-400 text-sm mt-1">Consistent Character Generator</p>
        </div>

        {/* 1. Character Reference Images */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">1. Character References</h2>
            <div className="flex gap-2">
              <button
                onClick={onSaveCharacters}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Save Characters to Browser Storage"
              >
                <Save size={16} />
              </button>
              <button
                onClick={onLoadCharacters}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Load Characters from Browser Storage"
              >
                <FolderOpen size={16} />
              </button>
            </div>
          </div>
          
          {/* Select All Checkbox */}
          <div className="flex justify-end px-1">
             <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">Select All</span>
                <input
                  type="checkbox"
                  checked={characters.length > 0 && characters.every(c => c.isSelected)}
                  onChange={(e) => onToggleAllCharacters(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-offset-slate-900 focus:ring-blue-500 bg-slate-700 cursor-pointer"
                />
             </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {characters.map((char) => (
              <div 
                key={char.id} 
                className={`relative group rounded-xl border-2 transition-all duration-200 overflow-hidden ${char.isSelected ? 'border-blue-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => onUpdateCharacter(char.id, { name: e.target.value })}
                      className="bg-transparent text-xs font-medium text-white placeholder-slate-500 focus:outline-none w-20"
                      placeholder="Name..."
                    />
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onDeleteCharacter(char.id)}
                            className="text-slate-600 hover:text-red-500 transition-colors p-0.5"
                            title="Remove Character Slot"
                        >
                            <Trash2 size={12} />
                        </button>
                        <input
                        type="checkbox"
                        checked={char.isSelected}
                        onChange={(e) => onUpdateCharacter(char.id, { isSelected: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-offset-slate-900 focus:ring-blue-500 bg-slate-700"
                        />
                    </div>
                  </div>
                  
                  <div className="aspect-square rounded-lg bg-slate-900/50 border border-slate-700 border-dashed flex items-center justify-center relative overflow-hidden group-hover:border-slate-500 transition-colors">
                    {char.imageData ? (
                      <>
                        <img 
                          src={`data:${char.mimeType};base64,${char.imageData}`} 
                          alt={char.name} 
                          className="w-full h-full object-cover" 
                        />
                        {/* Clear Button */}
                        <button 
                          onClick={() => onUpdateCharacter(char.id, { imageData: null })}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Image"
                        >
                          <X size={12} />
                        </button>
                        
                        {/* Preview Button */}
                        <button
                          onClick={() => onGeneratePreview(char.id)}
                          disabled={isGenerating}
                          className="absolute bottom-1 right-1 p-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Generate Preview Portrait"
                        >
                           <Sparkles size={12} />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                        <Upload size={20} className="mb-1" />
                        <span className="text-[10px]">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(char.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
             onClick={onAddCharacter}
             disabled={characters.length >= 10}
             className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Plus size={14} /> 
             {characters.length >= 10 ? 'Max Characters Reached' : `Add Character (${characters.length}/10)`}
          </button>
        </section>

        {/* 2. Settings (Ratio & Quality) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">2. Settings</h2>
          
          <div className="space-y-3">
             {/* Aspect Ratio */}
             <div className="relative">
                 <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Classic)</option>
                  <option value="Custom">Custom</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>

              {/* Quality Toggle Switch */}
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium">Image Quality</span>
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setQualityMode(qualityMode === 'Standard' ? '4K' : 'Standard')}
                    >
                        <span className={`text-xs ${qualityMode === 'Standard' ? 'text-white font-bold' : 'text-slate-500'}`}>Std</span>
                        
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${qualityMode === '4K' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${qualityMode === '4K' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        
                        <span className={`text-xs ${qualityMode === '4K' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>4K</span>
                    </div>
                 </div>

                 {/* Standard Quality Dropdown */}
                 {qualityMode === 'Standard' && (
                     <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                        <select
                           value={standardQuality}
                           onChange={(e) => setStandardQuality(e.target.value as StandardQuality)}
                           className="w-full appearance-none bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                           <option value="High">High (Default)</option>
                           <option value="Balanced">Balanced</option>
                           <option value="Fast">Fast</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                           <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                     </div>
                 )}
                 
                 {qualityMode === '4K' && (
                     <div className="bg-blue-900/20 border border-blue-500/20 rounded p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-[10px] text-blue-400 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Requires paid API Key
                        </p>
                     </div>
                 )}
              </div>
          </div>
        </section>

        {/* 3. Prompt List Input */}
        <section className="space-y-4 flex-grow">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">3. Story Prompts</h2>
             <span className="text-xs text-slate-500">{prompts.length} Prompts</span>
          </div>
          
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div 
                key={prompt.id} 
                className={`flex gap-2 items-start group transition-all duration-200 ${draggedIndex === index ? 'opacity-40' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle */}
                <div className="mt-4 text-slate-600 cursor-grab hover:text-slate-400 active:cursor-grabbing">
                  <GripVertical size={16} />
                </div>

                <span className="text-xs font-mono text-slate-500 mt-3 w-6 text-right select-none">{(index + 1).toString().padStart(2, '0')}</span>
                
                <textarea
                  value={prompt.text}
                  onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                  placeholder={`Scene description ${index + 1}...`}
                  className="flex-grow bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px] resize-y custom-scrollbar"
                />
                
                <button 
                  onClick={() => removePrompt(prompt.id)}
                  className="mt-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={prompts.length <= 1}
                  title="Remove Prompt"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addPrompt}
            className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Another Prompt
          </button>
        </section>

        {/* 4. Action Button */}
        <section className="sticky bottom-0 pt-4 pb-0 bg-slate-900 z-10">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
              ${isGenerating 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/20'
              }`}
          >
             {isGenerating ? (
               <>
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                 Generating {qualityMode === '4K' ? '4K' : ''} Images...
               </>
             ) : (
               <>
                 <Wand2 size={20} />
                 Generate {qualityMode === '4K' ? '4K' : ''} Images
               </>
             )}
          </button>
        </section>

      </div>
    </div>
  );
};

export default CharacterPanel;