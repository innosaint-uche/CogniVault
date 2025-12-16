export type AppMode = 'logic' | 'neural';

export interface Chunk {
  id: string;
  docId: string;
  content: string;
  index: number;
}

export interface Document {
  id: string;
  title: string;
  type: 'text' | 'code' | 'markdown';
  content: string;
  chunks: Chunk[];
  uploadedAt: number;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  docTitle: string;
}

export interface GenerationConfig {
  temperature: number;
  model: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string; // User instruction for this specific chapter
  content: string;
  wordCount: number;
  status: 'empty' | 'draft' | 'complete';
}

export interface BookConfig {
  title: string;
  genre: string;
  targetAudience: string;
  tone: string; // e.g., "Dark, Gritty", "Optimistic"
  background: string; // World building, character backstories
  perspective: string; // e.g., "First Person (Protagonist)", "Third Person Omniscient"
}

export const MOCK_DOCS: Document[] = [
  {
    id: '1',
    title: 'Project Alpha Specs',
    type: 'markdown',
    uploadedAt: Date.now(),
    content: "Project Alpha focuses on sustainable energy solutions. The core technology relies on photovoltaic cells with 24% efficiency.",
    chunks: [
      { id: 'c1', docId: '1', index: 0, content: "Project Alpha focuses on sustainable energy solutions. The core technology relies on photovoltaic cells with 24% efficiency." },
      { id: 'c2', docId: '1', index: 1, content: "Initial deployment is scheduled for Q3 2025 in the Nevada desert test site." }
    ]
  },
  {
    id: '2',
    title: 'Competitor Analysis',
    type: 'text',
    uploadedAt: Date.now(),
    content: "Competitor X has released a new battery pack. It suffers from thermal throttling.",
    chunks: [
      { id: 'c3', docId: '2', index: 0, content: "Competitor X has released a new battery pack. However, recent benchmarks suggest it suffers from significant thermal throttling under load." }
    ]
  }
];