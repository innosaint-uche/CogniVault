import React, { useEffect, useState } from 'react';
import { listProjectsLocal, deleteProjectLocal } from '../services/storageService';
import { BookConfig, Chapter, Document } from '../types';
import { Plus, FolderOpen, Trash2, BrainCircuit, AlertTriangle } from 'lucide-react';

interface ProjectSummary {
  id: string;
  lastModified: number;
  bookConfig: BookConfig;
  chapters: Chapter[];
  documents: Document[];
}

interface DashboardProps {
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectProject, onCreateProject }) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const list = await listProjectsLocal();
        setProjects(list.sort((a, b) => b.lastModified - a.lastModified));
    } catch (e: any) {
        console.error("Failed to load projects", e);
        setError(e.message || "Unknown error loading projects");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      await deleteProjectLocal(id);
      loadProjects();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a] text-emerald-500">
        <BrainCircuit className="w-10 h-10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              CogniVault
            </h1>
            <p className="text-slate-500 mt-1">Studio v1.1</p>
          </div>
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </header>

        {error && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p>Error: {error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="group relative bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <FolderOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <button
                  onClick={(e) => handleDelete(e, p.id)}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-slate-200 mb-2 truncate">
                {p.bookConfig.title || "Untitled Project"}
              </h3>

              <div className="space-y-2 text-sm text-slate-500">
                <p>{p.bookConfig.projectType === 'book' ? 'Book / Long-form' : 'Blog / Article'}</p>
                <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-800/50 mt-4">
                  <span>{p.chapters.length} Chapters</span>
                  <span>{p.documents.length} Sources</span>
                </div>
                <p className="text-[10px] pt-1">
                  Last edited: {new Date(p.lastModified).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {projects.length === 0 && !error && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500 mb-4">No projects found in this vault.</p>
              <button
                onClick={onCreateProject}
                className="text-emerald-500 hover:text-emerald-400 font-medium"
              >
                Create your first project &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
