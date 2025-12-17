# Architecture

## Tech Stack

-   **Frontend**: React (v18), TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **AI Integration**: `@google/genai` (Google Gemini)
-   **Backend / Persistence**: Firebase Firestore (Optional)

## Project Structure

```
.
├── components/          # React components
│   ├── Editor.tsx       # Main writing area
│   ├── ReferenceDeck.tsx# Right sidebar for search results
│   ├── SettingsModal.tsx# Global book configuration
│   └── Sidebar.tsx      # Left sidebar for navigation
├── services/            # Core logic and external services
│   ├── geminiService.ts # AI integration
│   ├── logicCore.ts     # TF-IDF search and text chunking
│   └── syncService.ts   # Firebase synchronization
├── tests/               # Playwright E2E tests
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main application controller
├── firebaseConfig.ts    # Firebase initialization
└── vite.config.ts       # Vite configuration
```

## Key Modules

### Logic Core (`services/logicCore.ts`)
-   **Chunking**: Splits uploaded documents into manageable pieces.
-   **Search**: Implements a client-side TF-IDF (Term Frequency - Inverse Document Frequency) algorithm to find relevant chunks based on a query. This runs entirely in the browser.

### Neural Service (`services/geminiService.ts`)
-   Wraps the Google Gemini API.
-   Constructs prompts by combining:
    -   Global Book Config (Tone, Genre).
    -   Chapter Context (Title, Summary).
    -   Retrieved Source Material (from Logic Core).
    -   Previous Chapter Context (for continuity).

### Sync Service (`services/syncService.ts`)
-   Handles real-time data synchronization with Firebase Firestore.
-   Uses debouncing to prevent excessive writes.

## Data Flow

1.  **User Input** -> **App State** (React `useState`).
2.  **Search**: `useEffect` watches active chapter -> triggers `logicCore.performSearch` -> updates `searchResults`.
3.  **AI Generation**: User clicks "Write" -> `App` gathers context -> calls `geminiService` -> updates `App State`.
4.  **Sync**: `useEffect` watches `App State` -> calls `syncService.saveProjectDebounced` -> writes to Firestore.
