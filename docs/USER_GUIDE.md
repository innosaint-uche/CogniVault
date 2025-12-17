# User Guide

## Interface Overview

CogniVault Studio is divided into three main areas:
1.  **Sidebar (Left)**: Manages documents (Sources) and the book outline (Chapters).
2.  **Editor (Center)**: The main writing area for the active chapter.
3.  **Reference Deck (Right)**: Displays relevant information from your sources based on what you are writing.

## Modes

-   **LOGIC CORE (Default)**:
    -   All processing happens locally.
    -   Use this for organizing documents, structuring chapters, and writing without AI assistance.
    -   Privacy is maximized; no data leaves your browser (unless Firebase sync is enabled).

-   **NEURAL LINK**:
    -   Connects to Google's Gemini AI.
    -   Enables AI features like "Auto Outline", "Suggest Outline", and "Write Prose".
    -   **Note**: Requires a valid `GEMINI_API_KEY`.

## Workflow

1.  **Project Setup**:
    -   Click the **Settings** (gear icon) in the top right to configure your book's Title, Genre, Tone, and Background.
    -   This context is crucial for the AI to generate relevant content.

2.  **Ingest Sources**:
    -   In the Sidebar, switch to the **Sources** tab.
    -   Click **Ingest Document** to upload text files (`.txt`, `.md`, etc.) containing research, character sheets, or world-building notes.
    -   The system chunks these documents for retrieval.

3.  **Outline**:
    -   Switch to the **Outline** tab in the Sidebar.
    -   Click **Add Chapter** to manually create a chapter.
    -   Or, click **Auto Outline** (in Neural Mode) to generate a chapter list based on your Project Settings and Sources.

4.  **Writing**:
    -   Select a chapter.
    -   Fill in the **Chapter Instructions / Summary** box.
    -   Start writing in the main editor.
    -   **AI Assistance (Neural Mode)**:
        -   **Suggest Outline**: Generates a beat sheet for the chapter.
        -   **Write Prose**: Generates full text for the chapter based on the summary and context.

5.  **Reference Deck**:
    -   As you type, or when you trigger a search, the Reference Deck on the right will show relevant chunks from your uploaded sources.
    -   Click the **Copy** icon on any card to insert that text into your editor.

## Saving

-   If **Firebase** is configured, changes are saved automatically ("Syncing..." -> "Saved").
-   If **Offline**, data is held in memory (and potentially lost on reload if not persistent - *Note: LocalStorage persistence is not currently implemented in the base version, so be careful to save your work manually or configure Firebase*).
