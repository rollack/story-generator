import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Eye, X, CheckCircle2 } from './Icons';

interface ResultsGalleryProps {
  images: GeneratedImage[];
}

const ResultsGallery: React.FC<ResultsGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    // Sequential download with delay to try and bypass browser blocks on multiple downloads
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        downloadImage(img.imageUrl, img.fileName);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    setDownloading(false);
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
                 <span className="animate-pulse">Downloading...</span>
               ) : (
                 <>
                   <Download size={18} />
                   Download All ({images.length})
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
            <div key={img.id} className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl transition-all hover:border-slate-600 hover:shadow-2xl">
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
                     onClick={() => setSelectedImage(img)}
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
              <div className="p-4 border-t border-slate-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                   <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                     Prompt {(img.promptIndex + 1).toString().padStart(2, '0')}
                   </span>
                   <span className="text-[10px] text-slate-500">{img.fileName}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2" title={img.promptText}>
                  {img.promptText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="max-w-7xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.promptText} 
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-slate-800"
            />
            <div className="mt-6 flex flex-col items-center gap-3">
               <p className="text-slate-300 text-center max-w-2xl text-sm">{selectedImage.promptText}</p>
               <button 
                 onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName)}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
               >
                 <Download size={18} /> Download 4K
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsGallery;