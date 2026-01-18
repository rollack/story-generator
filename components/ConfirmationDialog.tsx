import React from 'react';
import { Wand2 } from './Icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  promptCount: number;
  characterCount: number;
  quality: string;
  aspectRatio: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  promptCount,
  characterCount,
  quality,
  aspectRatio
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform scale-100 transition-all">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
             <Wand2 className="text-blue-500" size={20} />
          </div>
          Confirm Generation
        </h3>
        
        <div className="space-y-3 mb-6 text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex justify-between py-1 border-b border-slate-700/50 pb-2">
            <span>Images to Generate</span>
            <span className="font-bold text-white">{promptCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/50 pb-2 pt-2">
             <span>Active Characters</span>
             <span className="font-bold text-white">{characterCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/50 pb-2 pt-2">
             <span>Quality</span>
             <span className={`font-bold ${quality === '4K' ? 'text-blue-400' : 'text-emerald-400'}`}>{quality}</span>
          </div>
          <div className="flex justify-between py-1 pt-2">
             <span>Aspect Ratio</span>
             <span className="font-bold text-white">{aspectRatio}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 text-center">
            Ready to generate your story images?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all font-bold shadow-lg shadow-red-900/20 text-sm"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;