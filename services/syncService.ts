import { db } from '../firebaseConfig';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { BookConfig, Chapter, Document } from '../types';

export interface ProjectState {
  bookConfig: BookConfig;
  chapters: Chapter[];
  documents: Document[];
  lastModified: number;
}

let saveTimeout: any = null;

/**
 * Saves the project state to Firestore with a debounce to prevent excessive writes.
 */
export const saveProjectDebounced = (
  projectId: string, 
  data: Omit<ProjectState, 'lastModified'>,
  onStatusChange: (status: 'syncing' | 'saved' | 'error') => void
) => {
  if (!db) return;

  onStatusChange('syncing');
  
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    try {
      const projectRef = doc(db, "projects", projectId);
      await setDoc(projectRef, {
        ...data,
        lastModified: Date.now()
      }, { merge: true });
      onStatusChange('saved');
    } catch (error) {
      console.error("Error saving project:", error);
      onStatusChange('error');
    }
  }, 2000); // 2 second debounce
};

/**
 * Subscribes to real-time updates for a specific project
 */
export const subscribeToProject = (
  projectId: string,
  onUpdate: (data: ProjectState) => void
) => {
  if (!db) return () => {};

  const projectRef = doc(db, "projects", projectId);
  
  const unsubscribe = onSnapshot(projectRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as ProjectState;
      onUpdate(data);
    }
  });

  return unsubscribe;
};