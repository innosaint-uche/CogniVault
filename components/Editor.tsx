import React, { useRef, useEffect } from 'react';
import { AppMode, Chapter, ProjectType } from '../types';
import { Wand2, Loader2, Bot, ListTree, Undo, Redo } from 'lucide-react';

interface EditorProps {
  chapter: Chapter | undefined;
  onChange: (text: string) => void;
  onUpdateSummary: (text: string) => void;
  onUpdateTitle: (text: string) => void;
  mode: AppMode;
  onWriteChapter: (mode: 'full' | 'outline') => void;
  isGenerating: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  projectType: ProjectType;
}

const getUnitLabel = (type: ProjectType) => {
    switch(type) {
        case 'blog': return 'Section';
        case 'other': return 'Part';
        default: return 'Chapter';
    }
}

const Editor: React.FC<EditorProps> = ({ 
  chapter,
  onChange, 
  onUpdateSummary,
  onUpdateTitle,
  mode, 
  onWriteChapter,
  isGenerating,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  projectType
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [chapter?.content]);

  if (!chapter) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] text-slate-500">
              <Bot className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a {getUnitLabel(projectType).toLowerCase()} from the outline to begin writing.</p>
          </div>
      )
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#0f172a]">
        {/* Floating Action Bar */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 p-3 flex items-center justify-between">
            <div className="flex flex-col">
                <input 
                    type="text" 
                    value={chapter.title}
                    onChange={(e) => onUpdateTitle(e.target.value)}
                    className="bg-transparent text-slate-200 font-bold text-sm outline-none placeholder:text-slate-600 focus:text-white transition-colors"
                    placeholder={`${getUnitLabel(projectType)} Title`}
                />
                <span className="text-[10px] text-slate-500 font-mono">
                    {chapter.content.split(/\s+/).filter(w => w.length > 0).length} words / ~1000 target
                </span>
            </div>

            <div className="flex items-center gap-2">
                 {/* Undo/Redo Group */}
                 <div className="flex items-center gap-1 mr-4 border-r border-slate-800 pr-4">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${!canUndo ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${!canRedo ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                 </div>

                {mode === 'neural' ? (
                    <>
                        <button 
                            onClick={() => onWriteChapter('outline')}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-slate-700 hover:border-cyan-800"
                            title="Generate beats & suggestions"
                        >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <ListTree className="w-3 h-3" />}
                            Suggest Outline
                        </button>
                        <button 
                            onClick={() => onWriteChapter('full')}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-cyan-900/30 text-cyan-300 hover:bg-cyan-900/50 border border-cyan-800"
                            title="Write full content"
                        >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                            Write Prose
                        </button>
                    </>
                ) : (
                    <button 
                        disabled={true}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    >
                        <Wand2 className="w-3 h-3" />
                        Enable Neural Mode
                    </button>
                )}
            </div>
        </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto min-h-[500px] space-y-6">
            {/* Chapter Instructions Block */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 block">{getUnitLabel(projectType)} Instructions / Summary</label>
                <textarea 
                    value={chapter.summary}
                    onChange={(e) => onUpdateSummary(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-400 outline-none resize-none h-20 placeholder:text-slate-700"
                    placeholder={`Describe what happens in this ${getUnitLabel(projectType).toLowerCase()}...`}
                />
            </div>

            <textarea
                ref={textareaRef}
                value={chapter.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none text-slate-200 text-lg leading-relaxed placeholder:text-slate-700 font-light font-serif"
                spellCheck={false}
            />
        </div>
      </div>
      
       <div className={`p-2 text-center text-[10px] font-mono border-t ${mode === 'logic' ? 'bg-emerald-950/30 border-emerald-900/30 text-emerald-600' : 'bg-cyan-950/30 border-cyan-900/30 text-cyan-600'}`}>
            {mode === 'logic' 
                ? "LOGIC CORE ACTIVE // LOCAL EXECUTION // PRIVACY SECURED" 
                : "NEURAL LINK ACTIVE // BOOK ARCHITECT READY"
            }
       </div>
    </div>
  );
};

export default Editor;