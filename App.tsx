import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ReferenceDeck from './components/ReferenceDeck';
import Editor from './components/Editor';
import SettingsModal from './components/SettingsModal';
import Dashboard from './components/Dashboard';
import { Document, AppMode, SearchResult, MOCK_DOCS, Chapter, BookConfig } from './types';
import { chunkText, performSearch } from './services/logicCore';
import { getAIProvider } from './services/providerFactory';
import { saveProjectLocal, loadProjectLocal } from './services/storageService';
import { parseFile } from './services/documentParser';
import { Shield, Zap, Settings, CheckCircle2, RotateCw, Save, ArrowLeft } from 'lucide-react';
import { useHistory } from './hooks/useHistory';

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
  // Project State
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

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

  // Undo/Redo hook
  const {
    state: historyChapters,
    set: setHistoryChapters,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory
  } = useHistory<Chapter[]>([]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  // Load Project Logic
  useEffect(() => {
    const initProject = async () => {
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('project');

        if (urlId) {
            setProjectId(urlId);
            await loadProjectData(urlId);
        }
    };
    initProject();
  }, []);

  const loadProjectData = async (id: string) => {
      setIsProjectLoading(true);
      try {
          const data = await loadProjectLocal(id);
          if (data) {
              setBookConfig(data.bookConfig);
              setChapters(data.chapters);
              setDocuments(data.documents);
              resetHistory(data.chapters);
          } else {
              // Project ID in URL but not in DB? Treat as new or error?
              // For now, treat as new empty project to avoid blocking
              console.warn("Project not found in local DB, starting fresh.");
              setDocuments(MOCK_DOCS); // Optional: keep mock docs for demo
          }
      } catch (e) {
          console.error("Failed to load project", e);
      } finally {
          setIsProjectLoading(false);
      }
  };

  const handleCreateProject = () => {
      const newId = crypto.randomUUID();
      setProjectId(newId);
      setBookConfig(DEFAULT_BOOK_CONFIG);
      setChapters([]);
      setDocuments([]); // Start empty
      resetHistory([]);

      // Update URL
      const newUrl = `${window.location.pathname}?project=${newId}`;
      window.history.pushState({}, '', newUrl);
  };

  const handleOpenProject = (id: string) => {
      setProjectId(id);
      const newUrl = `${window.location.pathname}?project=${id}`;
      window.history.pushState({}, '', newUrl);
      loadProjectData(id);
  };

  const handleBackToDashboard = () => {
      setProjectId(null);
      // clear URL param
      window.history.pushState({}, '', window.location.pathname);
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!projectId || isProjectLoading) return;

    const timer = setTimeout(() => {
        setSaveStatus('saving');
        saveProjectLocal(projectId, {
            bookConfig,
            chapters,
            documents
        }).then(() => {
            setSaveStatus('saved');
        }).catch(err => {
            console.error("Save failed", err);
            setSaveStatus('unsaved');
        });
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [bookConfig, chapters, documents, projectId, isProjectLoading]);

  // Debounced search
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

  // History Debouncer
  useEffect(() => {
      const timer = setTimeout(() => {
          if (chapters.length > 0) {
            setHistoryChapters(chapters);
          }
      }, 1000);
      return () => clearTimeout(timer);
  }, [chapters, setHistoryChapters]);


  const handleUpload = async (file: File) => {
    try {
        const { content, metadata } = await parseFile(file);
        const newDocId = crypto.randomUUID();
        const newChunks = chunkText(content, newDocId);

        const newDoc: Document = {
            id: newDocId,
            title: file.name,
            type: 'text', // Simplified type
            content: content,
            chunks: newChunks,
            uploadedAt: Date.now()
        };

        setDocuments(prev => [...prev, newDoc]);
    } catch (e) {
        alert(`Error parsing file: ${e}`);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateChapterContent = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, content: text, wordCount: text.split(/\s+/).length } : c
    ));
    setSaveStatus('unsaved');
  };

  const handleUpdateChapterSummary = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, summary: text } : c
    ));
    setSaveStatus('unsaved');
  };

  const handleUpdateChapterTitle = (text: string) => {
    if (!activeChapterId) return;
    setChapters(prev => prev.map(c =>
      c.id === activeChapterId ? { ...c, title: text } : c
    ));
    setSaveStatus('unsaved');
  };

  const handleAddChapter = () => {
    const chapterRegex = /^Chapter\s+(\d+)/i;
    let maxChapterNum = 0;

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

  // Manual Save Handler
  const handleManualSave = useCallback(() => {
      if (!projectId) return;
      setSaveStatus('saving');
      saveProjectLocal(projectId, {
        bookConfig,
        chapters,
        documents
      }).then(() => {
          setSaveStatus('saved');
      });
  }, [projectId, bookConfig, chapters, documents]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleManualSave();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

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

  // Determine View
  if (!projectId) {
      return (
          <Dashboard
            onSelectProject={handleOpenProject}
            onCreateProject={handleCreateProject}
          />
      );
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
               {/* Back Button */}
               <button
                onClick={handleBackToDashboard}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
                title="Back to Dashboard"
               >
                   <div className="flex items-center gap-2">
                       <div className="w-6 h-6 flex items-center justify-center bg-emerald-500/20 rounded">
                           <ArrowLeft className="w-4 h-4 text-emerald-500" />
                       </div>
                       <span className="font-bold text-emerald-500">CogniVault</span>
                   </div>
               </button>

               <div className="h-6 w-px bg-slate-800 mx-2"></div>

               <span className="text-sm font-medium text-slate-400 truncate max-w-[200px]">
                {bookConfig.title} 
                <span className="opacity-50 mx-2">/</span> 
                {activeChapter?.title || "No Chapter Selected"}
               </span>
               
               {/* Sync Indicator */}
               <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 rounded border border-slate-800" title={`Project ID: ${projectId}`}>
                   {saveStatus === 'saved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                   {saveStatus === 'saving' && <RotateCw className="w-3 h-3 text-blue-500 animate-spin" />}
                   {saveStatus === 'unsaved' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                   <span className="text-[10px] text-slate-500 font-mono hidden md:block uppercase">
                        {saveStatus}
                   </span>
               </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleManualSave}
                    className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
                    title="Save Project (Ctrl+S)"
                >
                    <Save className="w-5 h-5" />
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
                onChange={(text) => {
                    handleUpdateChapterContent(text);
                    setHistoryChapters(chapters);
                }}
                onUpdateSummary={handleUpdateChapterSummary}
                onUpdateTitle={handleUpdateChapterTitle}
                mode={mode}
                onWriteChapter={handleWriteChapter}
                isGenerating={isGenerating}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => {
                   undo();
                   // Wait for useEffect
                }}
                onRedo={redo}
                projectType={bookConfig.projectType}
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