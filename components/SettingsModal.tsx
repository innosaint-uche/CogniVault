import React, { useState, useEffect } from 'react';
import { BookConfig, PROJECT_TYPES, ProjectType } from '../types';
import { X, Save, Book, CloudLightning, Cpu, Key } from 'lucide-react';

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
  const [localConfig, setLocalConfig] = useState<BookConfig>(config);

  // Local state for API keys (separate from BookConfig to avoid syncing)
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');

  useEffect(() => {
    if (isOpen) {
        setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
        setOpenRouterKey(localStorage.getItem('OPENROUTER_API_KEY') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof BookConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
      // Save keys to localStorage
      if (geminiKey) localStorage.setItem('GEMINI_API_KEY', geminiKey);
      if (openRouterKey) localStorage.setItem('OPENROUTER_API_KEY', openRouterKey);

      onSave(localConfig);
  };

  const currentType = PROJECT_TYPES[localConfig.projectType] || PROJECT_TYPES.book;

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

        <div className="overflow-y-auto p-6 space-y-6">

          {/* Project Type Selection */}
          <div className="space-y-3">
             <label className="block text-xs font-mono text-slate-400">Project Classification</label>
             <div className="grid grid-cols-3 gap-2">
                 {(Object.keys(PROJECT_TYPES) as ProjectType[]).map((type) => (
                     <button
                        key={type}
                        onClick={() => {
                            handleChange('projectType', type);
                            handleChange('projectSubtype', PROJECT_TYPES[type].subtypes[0]);
                        }}
                        className={`py-2 px-3 rounded text-xs font-bold uppercase tracking-wider border transition-all ${
                            localConfig.projectType === type
                            ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                     >
                         {PROJECT_TYPES[type].label}
                     </button>
                 ))}
             </div>

             <div className="mt-2">
                 <label className="block text-xs font-mono text-slate-500 mb-1">Sub-Category</label>
                 <select
                    value={localConfig.projectSubtype}
                    onChange={(e) => handleChange('projectSubtype', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                 >
                     {currentType.subtypes.map(sub => (
                         <option key={sub} value={sub}>{sub}</option>
                     ))}
                 </select>
             </div>
          </div>

          {/* AI Provider Section */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
             <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
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
                    OpenRouter
                </button>
             </div>

             {localConfig.aiProvider === 'openrouter' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
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
                 </div>
             )}

             {/* API Keys Section */}
             <div className="pt-2 border-t border-slate-800/50">
                 <div className="flex items-center gap-2 mb-2">
                     <Key className="w-3 h-3 text-slate-500" />
                     <span className="text-xs font-bold text-slate-500">API Keys (Local Only)</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label className="block text-[10px] uppercase text-slate-600 mb-1">Gemini API Key</label>
                         <input
                            type="password"
                            placeholder="Overwrite .env key..."
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-cyan-500"
                         />
                     </div>
                     <div>
                         <label className="block text-[10px] uppercase text-slate-600 mb-1">OpenRouter API Key</label>
                         <input
                            type="password"
                            placeholder="Overwrite .env key..."
                            value={openRouterKey}
                            onChange={(e) => setOpenRouterKey(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-purple-500"
                         />
                     </div>
                 </div>
                 <p className="text-[10px] text-slate-600 mt-2 italic">Keys are saved to your browser's Local Storage and are not synced to the cloud.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Project Title</label>
              <input
                type="text"
                value={localConfig.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Genre / Category</label>
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
                placeholder="e.g. First Person"
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
            <label className="block text-xs font-mono text-slate-400 mb-1">Background / Context</label>
            <textarea
              value={localConfig.background}
              onChange={(e) => handleChange('background', e.target.value)}
              rows={4}
              placeholder="Describe the world, characters, key plot points, and any critical information the AI needs to know."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={handleSave}
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