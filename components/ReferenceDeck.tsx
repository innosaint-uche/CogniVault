import React from 'react';
import { SearchResult } from '../types';
import { Copy, BookOpen, BrainCircuit, ShieldCheck } from 'lucide-react';

interface ReferenceDeckProps {
  results: SearchResult[];
  mode: 'logic' | 'neural';
  onCopy: (text: string) => void;
  isSearching: boolean;
}

const ReferenceDeck: React.FC<ReferenceDeckProps> = ({ results, mode, onCopy, isSearching }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-80 shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {mode === 'logic' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          ) : (
            <BrainCircuit className="w-4 h-4 text-cyan-500" />
          )}
          Reference Deck
        </h2>
        <span className="text-xs text-slate-600 font-mono">
          {results.length} hits
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.length === 0 ? (
            <div className="text-center mt-10 opacity-50">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-500">
                    {isSearching ? "Scanning Logic Core..." : "Type in the editor to retrieve relevant facts."}
                </p>
            </div>
        ) : (
            results.map((result) => (
            <div 
                key={result.chunk.id} 
                className={`group relative p-4 rounded-lg border transition-all duration-300 ${
                    mode === 'neural' 
                    ? 'bg-slate-800/50 border-cyan-900/30 hover:border-cyan-500/50' 
                    : 'bg-slate-800/50 border-emerald-900/30 hover:border-emerald-500/50'
                }`}
            >
                <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                    {result.docTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">
                    {Math.round(result.score * 100)}% Match
                </span>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                {result.chunk.content}
                </p>

                <button
                onClick={() => onCopy(result.chunk.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-all"
                title="Copy to clipboard"
                >
                <Copy className="w-3 h-3" />
                </button>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ReferenceDeck;