import React, { useRef, useState } from 'react';
import { Document, Chapter } from '../types';
import { FileText, Upload, Trash2, Plus, Database, Code, List, BookOpen, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface SidebarProps {
  documents: Document[];
  chapters: Chapter[];
  activeChapterId: string | null;
  onUpload: (file: File) => void;
  onDeleteDoc: (id: string) => void;
  onSelectChapter: (id: string) => void;
  onAddChapter: () => void;
  onGenerateOutline: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  chapters,
  activeChapterId,
  onUpload, 
  onDeleteDoc,
  onSelectChapter,
  onAddChapter,
  onGenerateOutline,
  isGenerating
}) => {
  const [tab, setTab] = useState<'sources' | 'outline'>('outline');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="w-4 h-4 text-pink-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="h-full w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            CogniVault
            </h1>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest pl-8">Studio v1.1</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
            onClick={() => setTab('outline')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${tab === 'outline' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
            Outline
        </button>
        <button 
            onClick={() => setTab('sources')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${tab === 'sources' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
            Sources
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'sources' ? (
             <div className="p-2 space-y-1">
                 <div className="p-2">
                    <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-md transition-colors text-sm font-medium border border-slate-700"
                    >
                    <Upload className="w-4 h-4" />
                    Ingest Document
                    </button>
                    <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.md,.js,.ts,.tsx,.json"
                    onChange={handleFileChange}
                    />
                </div>
                
                <div className="px-2 mt-4 mb-2 flex items-center gap-2">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Knowledge Base</span>
                </div>

                {documents.map((doc) => (
                    <div
                    key={doc.id}
                    className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {getIcon(doc.type)}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm text-slate-300 truncate font-medium">{doc.title}</span>
                            <span className="text-[10px] text-slate-600 truncate">{doc.chunks.length} chunks</span>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                    </div>
                ))}
             </div>
        ) : (
            <div className="p-2 space-y-2">
                <div className="p-2 grid grid-cols-2 gap-2">
                    <button
                        onClick={onAddChapter}
                        className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-md transition-colors text-xs font-medium border border-slate-700"
                    >
                        <Plus className="w-3 h-3" /> Add Chapter
                    </button>
                    <button
                        onClick={onGenerateOutline}
                        disabled={isGenerating}
                        className={`flex items-center justify-center gap-1 py-2 rounded-md transition-colors text-xs font-medium border ${isGenerating ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50'}`}
                    >
                        <Sparkles className="w-3 h-3" /> {isGenerating ? '...' : 'Auto Outline'}
                    </button>
                </div>

                <div className="space-y-1">
                    {chapters.map((chapter, idx) => (
                        <div
                            key={chapter.id}
                            onClick={() => onSelectChapter(chapter.id)}
                            className={`group flex flex-col p-3 rounded-md transition-all cursor-pointer border ${
                                activeChapterId === chapter.id 
                                ? 'bg-slate-800 border-emerald-500/50' 
                                : 'bg-transparent border-transparent hover:bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-500 w-5">{(idx + 1).toString().padStart(2, '0')}</span>
                                <span className={`text-sm font-medium truncate flex-1 ${activeChapterId === chapter.id ? 'text-white' : 'text-slate-300'}`}>
                                    {chapter.title || "Untitled Chapter"}
                                </span>
                                {chapter.status === 'complete' ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                    <Circle className="w-3 h-3 text-slate-700" />
                                )}
                            </div>
                            {activeChapterId === chapter.id && (
                                <div className="ml-7 mt-1 text-[10px] text-slate-500 line-clamp-2">
                                    {chapter.summary || "No instructions provided."}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {chapters.length === 0 && (
                        <div className="text-center p-8 opacity-50">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs text-slate-500">Project is empty.<br/>Create an outline manually or generate one.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-cyan-500 animate-ping' : 'bg-emerald-500'}`}></div>
            {isGenerating ? "Neural Link Processing..." : "System Ready"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;