import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ReferenceDeck from './components/ReferenceDeck';
import Editor from './components/Editor';
import SettingsModal from './components/SettingsModal';
import { Document, AppMode, SearchResult, MOCK_DOCS, Chapter, BookConfig } from './types';
import { chunkText, performSearch } from './services/logicCore';
import { getAIProvider } from './services/providerFactory';
import { saveProjectDebounced, subscribeToProject, ProjectState } from './services/syncService';
import { Shield, Zap, Settings, Cloud, CloudOff, CheckCircle2, RotateCw } from 'lucide-react';
import { db } from './firebaseConfig';

const DEFAULT_BOOK_CONFIG: BookConfig = {
  title: "New Project",
  genre: "Sci-Fi",
  targetAudience: "Adult",
  tone: "Serious, Analytical",
  background: "",
  perspective: "Third Person Limited",
  aiProvider: 'google',
  projectType: 'book',
  projectSubtype: 'Fiction (Novel)'
};

function App() {
  // Project & Sync State
  const [projectId, setProjectId] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<'saved' | 'syncing' | 'error' | 'offline'>('offline');
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  // App State
  const [mode, setMode] = useState<AppMode>('logic');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [bookConfig, setBookConfig] = useState<BookConfig>(DEFAULT_BOOK_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  // Initialize Project ID and Sync
  useEffect(() => {
    // Check URL for project ID
    const params = new URLSearchParams(window.location.search);
    let id = params.get('project');

    if (!id) {
      id = crypto.randomUUID();
      const newUrl = `${window.location.pathname}?project=${id}`;
      try {
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.warn("Could not update URL history (likely running in sandbox):", e);
      }
    }
    setProjectId(id);

    // If Firebase is configured, subscribe to updates
    if (db) {
        setSyncStatus('syncing');
        const unsubscribe = subscribeToProject(id, (data) => {
            // Only update state if the timestamp is newer or we are just loading
            // Note: A robust implementation would use operational transforms or conflict resolution
            // Here we assume "server wins" on initial load, and we try not to overwrite user input actively typing
            setBookConfig(data.bookConfig || DEFAULT_BOOK_CONFIG);
            if (data.chapters) setChapters(data.chapters);
            if (data.documents) setDocuments(data.documents);
            
            setIsProjectLoading(false);
            setSyncStatus('saved');
        });

        // If no data exists yet (new project), stop loading and set defaults
        // A slight timeout to allow the snapshot to return empty
        setTimeout(() => {
            setIsProjectLoading((loading) => {
                if (loading) {
                    setDocuments(MOCK_DOCS); // Load mock docs only for new, empty projects
                }
                return false;
            });
        }, 1500);

        return () => unsubscribe();
    } else {
        setSyncStatus('offline');
        setDocuments(MOCK_DOCS);
        setIsProjectLoading(false);
    }
  }, []);

  // Sync Data Effect
  useEffect(() => {
    if (!projectId || isProjectLoading || !db) return;

    saveProjectDebounced(projectId, {
        bookConfig,
        chapters,
        documents
    }, setSyncStatus);

  }, [bookConfig, chapters, documents, projectId, isProjectLoading]);


  // Debounced search for context
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!activeChapter || !activeChapter.summary) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const query = `${activeChapter.title} ${activeChapter.summary} ${activeChapter.content.slice(-200)}`;
      
      const results = performSearch(query, documents);
      setSearchResults(results);
      setIsSearching(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [activeChapter?.summary, activeChapter?.content, activeChapter?.title, documents]);

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const newDocId = crypto.randomUUID();
      const newChunks = chunkText(text, newDocId);
      
      const newDoc: Document = {
        id: newDocId,
        title: file.name,
        type: file.name.endsWith('.js') || file.name.endsWith('.ts') ? 'code' : 'text',
        content: text,
        chunks: newChunks,
        uploadedAt: Date.now()
      };

      setDocuments(prev => [...prev, newDoc]);
    };
    reader.readAsText(file);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateChapterContent = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, content: text, wordCount: text.split(/\s+/).length } : c
    ));
  };

  const handleUpdateChapterSummary = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, summary: text } : c
    ));
  };

  const handleUpdateChapterTitle = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c =>
      c.id === activeChapterId ? { ...c, title: text } : c
    ));
  };

  const handleAddChapter = () => {
    // Find the highest "Chapter N" to increment efficiently
    // This allows users to have "Intro" and "Preface" and then "Chapter 1"

    let maxChapterNum = 0;
    const chapterRegex = /^Chapter\s+(\d+)$/i;

    chapters.forEach(c => {
        const match = c.title.match(chapterRegex);
        if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxChapterNum) {
                maxChapterNum = num;
            }
        }
    });

    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${maxChapterNum + 1}`,
      summary: "",
      content: "",
      wordCount: 0,
      status: 'empty'
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const handleGenerateOutline = async () => {
    if (mode !== 'neural') {
        alert("Switch to Neural Link mode to generate outline.");
        return;
    }
    
    const sourceContext = documents.map(d => `Document: ${d.title}\nExcerpt: ${d.chunks[0]?.content || ''}`).join("\n\n");
    
    setIsGenerating(true);
    try {
        const provider = getAIProvider(bookConfig);
        const outline = await provider.generateOutline(bookConfig, sourceContext, 20);
        const newChapters: Chapter[] = outline.map((o, idx) => ({
            id: crypto.randomUUID(),
            title: o.title,
            summary: o.summary,
            content: "",
            wordCount: 0,
            status: 'empty'
        }));
        setChapters(newChapters);
        if (newChapters.length > 0) setActiveChapterId(newChapters[0].id);
    } catch (e: any) {
        alert(`Failed to generate outline: ${e.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleWriteChapter = async (writeMode: 'full' | 'outline') => {
    if (!activeChapter || mode !== 'neural') return;
    
    setIsGenerating(true);
    try {
        const currentIdx = chapters.findIndex(c => c.id === activeChapterId);
        const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
        const prevContext = prevChapter 
            ? `Previous Chapter (${prevChapter.title}): ...${prevChapter.content.slice(-2000)}` 
            : "This is the first chapter.";

        const specificContext = performSearch(`${activeChapter.title} ${activeChapter.summary}`, documents);

        const provider = getAIProvider(bookConfig);
        const text = await provider.writeChapter(activeChapter, bookConfig, specificContext, prevContext, writeMode);
        
        if (activeChapter.content.trim() && writeMode === 'outline') {
            const separator = "\n\n--- SUGGESTED OUTLINE ---\n";
            handleUpdateChapterContent(activeChapter.content + separator + text);
        } else {
            handleUpdateChapterContent(text);
        }
        
        if (writeMode === 'full') {
            setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, status: 'complete' } : c));
        }
    } catch (e: any) {
        alert(`Failed to write chapter: ${e.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const insertChunk = (text: string) => {
    if (activeChapter) {
        handleUpdateChapterContent(activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + text);
    }
  };

  const copyProjectId = () => {
    navigator.clipboard.writeText(projectId);
    alert("Project ID copied to clipboard!");
  };

  if (isProjectLoading) {
      return (
          <div
            className="flex h-screen w-screen bg-[#0f172a] items-center justify-center flex-col gap-4"
            role="status"
            aria-live="polite"
            aria-label="Loading application"
          >
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" aria-hidden="true"></div>
              <p className="text-emerald-500 font-mono text-sm animate-pulse">Establishing Secure Uplink...</p>
          </div>
      )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f172a] text-slate-200">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={bookConfig}
        onSave={(cfg) => {
            setBookConfig(cfg);
            setIsSettingsOpen(false);
        }}
      />

      <Sidebar 
        documents={documents} 
        chapters={chapters}
        activeChapterId={activeChapterId}
        onUpload={handleUpload}
        onDeleteDoc={handleDeleteDoc}
        onSelectChapter={setActiveChapterId}
        onAddChapter={handleAddChapter}
        onGenerateOutline={handleGenerateOutline}
        isGenerating={isGenerating}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-slate-400 truncate max-w-[200px]">
                {bookConfig.title} 
                <span className="opacity-50 mx-2">/</span> 
                {activeChapter?.title || "No Chapter Selected"}
               </span>
               
               {/* Sync Indicator */}
               <div
                   className="flex items-center gap-2 px-2 py-1 bg-slate-900 rounded border border-slate-800"
                   title={`Project ID: ${projectId}`}
                   role="status"
                   aria-label={`Sync Status: ${syncStatus}`}
                >
                   {syncStatus === 'saved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />}
                   {syncStatus === 'syncing' && <RotateCw className="w-3 h-3 text-blue-500 animate-spin" aria-hidden="true" />}
                   {syncStatus === 'error' && <CloudOff className="w-3 h-3 text-red-500" aria-hidden="true" />}
                   {syncStatus === 'offline' && <CloudOff className="w-3 h-3 text-slate-500" aria-hidden="true" />}
                   <span className="text-[10px] text-slate-500 font-mono hidden md:block">
                        {syncStatus === 'offline' ? 'OFFLINE MODE' : (syncStatus === 'syncing' ? 'SYNCING...' : 'SAVED')}
                   </span>
               </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={copyProjectId}
                    className="hidden md:flex text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white border border-slate-700"
                    title="Click to copy Project ID to share or resume later"
                    aria-label={`Copy Project ID: ${projectId}`}
                >
                    ID: {projectId.slice(0, 8)}...
                </button>

                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                    title="Project Settings"
                    aria-label="Project Settings"
                >
                    <Settings className="w-5 h-5" aria-hidden="true" />
                </button>

                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800" role="group" aria-label="Application Mode">
                    <button
                        onClick={() => setMode('logic')}
                        aria-pressed={mode === 'logic'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            mode === 'logic' 
                            ? 'bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-900/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Shield className="w-3 h-3" aria-hidden="true" />
                        LOGIC CORE
                    </button>
                    <button
                        onClick={() => setMode('neural')}
                        aria-pressed={mode === 'neural'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            mode === 'neural' 
                            ? 'bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-900/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Zap className="w-3 h-3" aria-hidden="true" />
                        NEURAL LINK
                    </button>
                </div>
            </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
            <Editor 
                chapter={activeChapter} 
                onChange={handleUpdateChapterContent} 
                onUpdateSummary={handleUpdateChapterSummary}
                onUpdateTitle={handleUpdateChapterTitle}
                mode={mode}
                onWriteChapter={handleWriteChapter}
                isGenerating={isGenerating}
            />
            
            <ReferenceDeck 
                results={searchResults} 
                mode={mode}
                onCopy={insertChunk}
                isSearching={isSearching}
            />
        </main>
      </div>
    </div>
  );
}

export default App;