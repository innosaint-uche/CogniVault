import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BookConfig, Chapter, Document } from '../types';

interface ProjectData {
  id: string;
  lastModified: number;
  bookConfig: BookConfig;
  chapters: Chapter[];
  documents: Document[];
}

interface CogniVaultDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectData;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'cognivault-db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<CogniVaultDB>>;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<CogniVaultDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
            const store = db.createObjectStore('projects', { keyPath: 'id' });
            store.createIndex('by-date', 'lastModified');
        }
      },
    });
  }
  return dbPromise;
};

export const saveProjectLocal = async (
  id: string,
  data: { bookConfig: BookConfig; chapters: Chapter[]; documents: Document[] }
) => {
  const db = await getDB();
  await db.put('projects', {
    id,
    lastModified: Date.now(),
    ...data
  });
};

export const loadProjectLocal = async (id: string) => {
  const db = await getDB();
  return db.get('projects', id);
};

export const listProjectsLocal = async () => {
  const db = await getDB();
  // Fallback to getAll if index has issues
  return db.getAll('projects');
};

export const deleteProjectLocal = async (id: string) => {
  const db = await getDB();
  await db.delete('projects', id);
};
