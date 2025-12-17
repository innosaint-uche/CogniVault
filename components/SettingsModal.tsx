import React from 'react';
import { BookConfig } from '../types';
import { X, Save, Book, CloudLightning, Cpu } from 'lucide-react';

interface SettingsModalProps {
  config: BookConfig;
  onSave: (config: BookConfig) => void;
  onClose: () => void;
  isOpen: boolean;
}

const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "google/gemini-2.0-pro-exp-02-05:free",
  "mistralai/mistral-7b-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "meta-llama/llama-3-8b-instruct:free",
  "qwen/qwen-2-7b-instruct:free"
];

const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose, isOpen }) => {
  const [localConfig, setLocalConfig] = React.useState<BookConfig>(config);

  if (!isOpen) return null;

  const handleChange = (field: keyof BookConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-100">Project Configuration</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">

          {/* AI Provider Section */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <CloudLightning className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-300">Neural Link Provider</h3>
             </div>

             <div className="flex gap-4">
                <button
                    onClick={() => handleChange('aiProvider', 'google')}
                    className={`flex-1 p-3 rounded-md border text-sm font-medium transition-all flex items-center justify-center gap-2 ${localConfig.aiProvider !== 'openrouter' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                    <Cpu className="w-4 h-4" />
                    Google Gemini
                </button>
                <button
                    onClick={() => handleChange('aiProvider', 'openrouter')}
                    className={`flex-1 p-3 rounded-md border text-sm font-medium transition-all flex items-center justify-center gap-2 ${localConfig.aiProvider === 'openrouter' ? 'bg-purple-950/30 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                    <CloudLightning className="w-4 h-4" />
                    OpenRouter (Free Tier)
                </button>
             </div>

             {localConfig.aiProvider === 'openrouter' && (
                 <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                     <label className="block text-xs font-mono text-purple-400 mb-1">OpenRouter Model</label>
                     <select
                        value={localConfig.openRouterModel || FREE_MODELS[0]}
                        onChange={(e) => handleChange('openRouterModel', e.target.value)}
                        className="w-full bg-slate-900 border border-purple-500/30 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500"
                     >
                         {FREE_MODELS.map(m => (
                             <option key={m} value={m}>{m}</option>
                         ))}
                     </select>
                     <p className="text-[10px] text-slate-500 mt-1">
                        Requires <code>OPENROUTER_API_KEY</code> in <code>.env.local</code>.
                     </p>
                 </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Book Title</label>
              <input
                type="text"
                value={localConfig.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Genre</label>
              <input
                type="text"
                value={localConfig.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Tone & Atmosphere</label>
              <input
                type="text"
                placeholder="e.g. Dark, Gritty, Hopeful"
                value={localConfig.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Perspective / POV</label>
              <input
                type="text"
                placeholder="e.g. First Person (John)"
                value={localConfig.perspective}
                onChange={(e) => handleChange('perspective', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target Audience</label>
            <input
              type="text"
              value={localConfig.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Background / World Building / Context</label>
            <textarea
              value={localConfig.background}
              onChange={(e) => handleChange('background', e.target.value)}
              rows={6}
              placeholder="Describe the world, characters, key plot points, and any critical information the AI needs to know to write this book."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={() => onSave(localConfig)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;