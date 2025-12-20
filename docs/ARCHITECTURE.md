# Architecture

## Tech Stack

-   **Frontend**: React (v18), TypeScript, Vite
-   **Styling**: Tailwind CSS (v4)
-   **Icons**: Lucide React
-   **AI Integration**: `@google/genai` (Google Gemini), OpenRouter API
-   **Persistence**: IndexedDB (Local), Firebase Firestore (Optional/Cloud)
-   **Document Parsing**: `pdfjs-dist` (PDF), `mammoth` (DOCX), `xlsx` (Excel)

## Project Structure

```
.
├── components/          # React components
│   ├── Dashboard.tsx    # Project management screen
│   ├── Editor.tsx       # Main writing area
│   ├── ReferenceDeck.tsx# Right sidebar for search results
│   ├── SettingsModal.tsx# Global book configuration
│   └── Sidebar.tsx      # Left sidebar for navigation
├── services/            # Core logic and external services
│   ├── documentParser.ts# File ingestion (PDF/DOCX/XLSX)
│   ├── geminiService.ts # AI integration (Gemini + OpenRouter)
│   ├── logicCore.ts     # TF-IDF search and text chunking
│   ├── storageService.ts# IndexedDB persistence layer
│   └── syncService.ts   # Firebase synchronization
├── tests/               # Playwright E2E tests
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main application controller & Router
├── firebaseConfig.ts    # Firebase initialization
└── vite.config.ts       # Vite configuration
```

## Key Modules

### Dashboard & Storage (`services/storageService.ts`)
-   **IndexedDB**: Uses the `idb` library to store multiple projects locally in the browser.
-   **Dashboard**: Allows users to switch between projects.
-   **Persistence**: Projects, settings, and documents are stored as JSON objects in IndexedDB.

### Document Parsing (`services/documentParser.ts`)
-   **Client-Side Parsing**: Converts binary files (PDF, DOCX) into text directly in the browser.
-   **No Server Upload**: Files are processed locally for privacy and speed.

### Logic Core (`services/logicCore.ts`)
-   **Chunking**: Splits uploaded documents into manageable pieces.
-   **Search**: Implements a client-side TF-IDF (Term Frequency - Inverse Document Frequency) algorithm to find relevant chunks based on a query.

### Neural Service (`services/geminiService.ts`)
-   Wraps the Google Gemini API and OpenRouter API.
-   **Factory Pattern**: Dynamically switches between Gemini and OpenRouter based on user settings.
-   **Context Construction**: Combines Global Book Config, Chapter Context, Retrieved Source Material, and Previous Chapter Context.

## Data Flow

1.  **User Input** -> **App State** (React `useState`).
2.  **Persistence**: `useEffect` watches `App State` -> calls `storageService.saveProject` (debounced) -> writes to IndexedDB.
3.  **Search**: `useEffect` watches active chapter -> triggers `logicCore.performSearch` -> updates `searchResults`.
4.  **AI Generation**: User clicks "Write" -> `App` gathers context -> calls `geminiService` -> updates `App State`.
