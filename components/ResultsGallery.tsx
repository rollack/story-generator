import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Eye, X, CheckCircle2, Pencil } from './Icons';
import JSZip from 'jszip';
import { getFormattedDate } from '../services/geminiService';

interface ResultsGalleryProps {
  images: GeneratedImage[];
  onUpdateImage: (id: string, updates: Partial<GeneratedImage>) => void;
}

const ResultsGallery: React.FC<ResultsGalleryProps> = ({ images, onUpdateImage }) => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const selectedImage = images.find(img => img.id === selectedImageId) || null;

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    setDownloading(true);
    
    try {
      const zip = new JSZip();
      
      // Add all images to the zip file
      for (const img of images) {
        // Fetch the blob from the data URL
        const response = await fetch(img.imageUrl);
        const blob = await response.blob();
        zip.file(img.fileName, blob);
      }
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      
      // Create a download link for the zip
      const dateStr = getFormattedDate();
      const zipFileName = `RobertTechTool_Batch_${dateStr}.zip`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("Failed to generate zip file for download.");
    } finally {
      setDownloading(false);
    }
  };

  const startEditing = (id: string, currentText: string) => {
    setEditingId(id);
    setEditValue(currentText);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim() !== "") {
        onUpdateImage(id, { promptText: editValue });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="h-full bg-slate-950 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-xl font-bold text-white">Generated Gallery</h2>
             <p className="text-slate-400 text-sm">Output Resolution: 4K</p>
           </div>
           
           {images.length > 0 && (
             <button
               onClick={handleDownloadAll}
               disabled={downloading}
               className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-900/20"
             >
               {downloading ? (
                 <span className="animate-pulse">Compressing...</span>
               ) : (
                 <>
                   <Download size={18} />
                   Download All as ZIP ({images.length})
                 </>
               )}
             </button>
           )}
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <Eye size={40} className="text-slate-600" />
            </div>
            <p className="text-lg font-medium">No images generated yet</p>
            <p className="text-sm">Set up your characters and prompts on the left to start.</p>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl transition-all hover:border-slate-600 hover:shadow-2xl flex flex-col">
              {/* Image Aspect Ratio Container */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-950 relative">
                <img 
                  src={img.imageUrl} 
                  alt={img.promptText} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button 
                     onClick={() => setSelectedImageId(img.id)}
                     className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                     title="Preview Full Size"
                   >
                     <Eye size={20} />
                   </button>
                   <button 
                     onClick={() => downloadImage(img.imageUrl, img.fileName)}
                     className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                     title="Download"
                   >
                     <Download size={20} />
                   </button>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-4 border-t border-slate-800 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-2 mb-2">
                   <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                     Prompt {(img.promptIndex + 1).toString().padStart(2, '0')}
                   </span>
                   <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={img.fileName}>{img.fileName}</span>
                </div>

                {/* Editable Prompt Area */}
                {editingId === img.id ? (
                  <div className="mb-3 flex-grow">
                    <textarea 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-20 bg-slate-800 border border-blue-500 rounded p-2 text-xs text-white resize-none focus:outline-none custom-scrollbar"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={() => saveEdit(img.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1 rounded flex items-center justify-center gap-1"
                        >
                            <CheckCircle2 size={12} /> Save
                        </button>
                        <button 
                            onClick={cancelEdit}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-1 rounded flex items-center justify-center gap-1"
                        >
                            <X size={12} /> Cancel
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/text mb-3 flex-grow">
                     <p className="text-xs text-slate-400 line-clamp-3 pr-4" title={img.promptText}>
                       {img.promptText}
                     </p>
                     <button 
                       onClick={() => startEditing(img.id, img.promptText)}
                       className="absolute top-0 right-0 text-slate-600 hover:text-blue-400 opacity-0 group-hover/text:opacity-100 transition-opacity p-0.5"
                       title="Edit Prompt"
                     >
                       <Pencil size={12} />
                     </button>
                  </div>
                )}

                {/* Explicit Action Buttons */}
                <div className="flex items-center gap-2 mt-auto">
                  <button 
                    onClick={() => setSelectedImageId(img.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                  <button 
                    onClick={() => downloadImage(img.imageUrl, img.fileName)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => { setSelectedImageId(null); setEditingId(null); }}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-50 bg-black/50 rounded-full p-2"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-7xl w-full max-h-[95vh] flex flex-col items-center">
            <div className="relative w-full flex justify-center overflow-hidden">
                <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.promptText} 
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-slate-800 object-contain"
                />
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-4xl">
               {/* Modal Edit Area */}
               {editingId === selectedImage.id ? (
                    <div className="w-full">
                        <textarea 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full h-24 bg-slate-800 border border-blue-500 rounded-lg p-3 text-sm text-white resize-y focus:outline-none custom-scrollbar"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2 justify-center">
                            <button 
                                onClick={() => saveEdit(selectedImage.id)}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md flex items-center gap-2"
                            >
                                <CheckCircle2 size={16} /> Save Changes
                            </button>
                            <button 
                                onClick={cancelEdit}
                                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-md flex items-center gap-2"
                            >
                                <X size={16} /> Cancel
                            </button>
                        </div>
                    </div>
               ) : (
                   <div className="w-full group/modal-text text-center relative">
                       <p className="text-slate-300 text-sm px-8 inline-block">
                         {selectedImage.promptText}
                         <button 
                           onClick={() => startEditing(selectedImage.id, selectedImage.promptText)}
                           className="inline-flex ml-2 text-slate-500 hover:text-blue-400 align-middle transition-colors opacity-0 group-hover/modal-text:opacity-100"
                           title="Edit Text"
                         >
                           <Pencil size={14} />
                         </button>
                       </p>
                   </div>
               )}
               
               {!editingId && (
                   <div className="flex items-center gap-4 mt-2">
                        <button 
                            onClick={() => window.open(selectedImage.imageUrl, '_blank')}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-medium flex items-center gap-2 transition-colors border border-slate-600"
                        >
                            <Eye size={18} /> Open Full Size
                        </button>
                        <button 
                            onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <Download size={18} /> Download
                        </button>
                   </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsGallery;