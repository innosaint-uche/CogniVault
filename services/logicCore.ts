import { Chunk, Document, SearchResult } from '../types';

// Simple stop words list
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'
]);

/**
 * Splits text into semantic chunks (simplified paragraph/sentence splitter)
 */
export const chunkText = (text: string, docId: string): Chunk[] => {
  // Split by double newline for paragraphs, then ensure they aren't too long
  const rawParagraphs = text.split(/\n\s*\n/);
  const chunks: Chunk[] = [];
  
  rawParagraphs.forEach((para, index) => {
    const cleanPara = para.trim();
    if (cleanPara.length > 0) {
      chunks.push({
        id: `${docId}-chunk-${index}`,
        docId,
        content: cleanPara,
        index
      });
    }
  });

  return chunks;
};

/**
 * Tokenizes text into normalized terms
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
};

/**
 * Calculates Term Frequency (TF)
 */
const computeTF = (term: string, tokens: string[]): number => {
  const matchCount = tokens.filter(t => t === term).length;
  return matchCount / tokens.length;
};

/**
 * Calculates Inverse Document Frequency (IDF) - Simplified for client-side
 * We treat the set of all chunks as the corpus
 */
const computeIDF = (term: string, allChunks: Chunk[]): number => {
  const docsWithTerm = allChunks.filter(chunk => 
    chunk.content.toLowerCase().includes(term)
  ).length;
  if (docsWithTerm === 0) return 0;
  return Math.log(allChunks.length / docsWithTerm);
};

/**
 * Performs TF-IDF search on local chunks
 */
export const performSearch = (query: string, documents: Document[]): SearchResult[] => {
  if (!query.trim()) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Flatten all chunks
  const allChunks = documents.flatMap(d => d.chunks);
  const results: SearchResult[] = [];

  allChunks.forEach(chunk => {
    const chunkTokens = tokenize(chunk.content);
    if (chunkTokens.length === 0) return;

    let score = 0;
    
    // Calculate TF-IDF for each query token in this chunk
    queryTokens.forEach(token => {
      const tf = computeTF(token, chunkTokens);
      // Optimization: Only compute IDF if TF > 0
      if (tf > 0) {
        const idf = computeIDF(token, allChunks);
        score += tf * idf;
      }
    });

    if (score > 0) {
      const doc = documents.find(d => d.id === chunk.docId);
      results.push({
        chunk,
        score,
        docTitle: doc?.title || 'Unknown Document'
      });
    }
  });

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 5); // Return top 5
};