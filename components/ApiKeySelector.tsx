import React, { useEffect, useState } from 'react';
import { AlertCircle } from './Icons';

interface ApiKeySelectorProps {
  onReady: () => void;
  onSwitchToStandard: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onReady, onSwitchToStandard }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    try {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const selected = await win.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onReady();
        }
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Assume success after closing dialog, or re-check
      await checkKey();
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
             <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          To generate high-quality 4K images with <strong>Gemini 3 Pro</strong>, you must select a paid API key from a Google Cloud Project.
        </p>
        
        <button
          onClick={handleSelectKey}
          className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group mb-4"
        >
          Select API Key
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        
        <button 
            onClick={onSwitchToStandard}
            className="text-slate-400 hover:text-white text-sm hover:underline transition-colors"
        >
            Switch to Standard Quality (No Key Required)
        </button>
        
        <p className="mt-6 text-xs text-slate-500">
            See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Billing Documentation</a> for more details.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
