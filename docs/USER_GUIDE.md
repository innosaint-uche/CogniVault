# User Guide

## Interface Overview

CogniVault Studio is divided into three main areas:
1.  **Sidebar (Left)**: Manages documents (Sources) and the book outline (Chapters/Sections).
2.  **Editor (Center)**: The main writing area for the active chapter.
3.  **Reference Deck (Right)**: Displays relevant information from your sources based on what you are writing.

## Modes

-   **LOGIC CORE (Default)**:
    -   All processing happens locally.
    -   Use this for organizing documents, structuring chapters, and writing without AI assistance.
    -   Privacy is maximized; no data leaves your browser (unless Firebase sync is enabled).

-   **NEURAL LINK**:
    -   Connects to Cloud AI (Google Gemini or OpenRouter).
    -   Enables AI features like "Auto Outline", "Suggest Outline", and "Write Prose".
    -   **Note**: Requires valid API keys in `.env.local` or Settings.

## Project Types

In **Settings**, you can define your project type:
-   **Blog / Article**: Terminology changes to "Sections". AI adapts to blog writing styles (Tech, Entertainment, etc.).
-   **Book / Long-form**: Terminology uses "Chapters". AI adapts to storytelling or research styles.
-   **Other**: Generic structure.

## AI Providers

You can switch between AI providers in the **Settings** menu.

### 1. Google Gemini (Default)
-   Uses Google's official SDK.
-   Fast and reliable.
-   Requires `GEMINI_API_KEY`.

### 2. OpenRouter (Multi-Model / Free Tier)
-   Allows access to a wide range of models including Llama 3, Mistral, and Qwen.
-   **Free Radar**: The app comes pre-configured with a list of free/cheap models to help you stay within budget.
-   Select specific models from the dropdown in Settings.
-   Requires `OPENROUTER_API_KEY`.

## Workflow

1.  **Project Setup**:
    -   Click the **Settings** (gear icon) in the top right.
    -   Enter your **API Keys** (these are saved locally to your browser).
    -   Select **Project Classification** (e.g., Blog or Book).
    -   Select your preferred **Neural Link Provider**.

2.  **Ingest Sources**:
    -   In the Sidebar, switch to the **Sources** tab.
    -   Click **Ingest Document** to upload text files.

3.  **Outline**:
    -   Switch to the **Outline** tab in the Sidebar.
    -   Click **Add Chapter/Section** to manually create one.
    -   Or, click **Auto Outline** (in Neural Mode) to generate a structure.
    -   *Note*: Chapter titles are fully editable. Renaming a chapter "Introduction" will not break the automatic numbering of subsequent chapters.

4.  **Writing**:
    -   Select a chapter.
    -   Fill in the **Instructions / Summary** box.
    -   Start writing in the main editor.
    -   **Undo/Redo**: Use the buttons in the toolbar or `Ctrl+Z` / `Ctrl+Shift+Z`.
    -   **Save**: Project saves automatically. You can force a save with the **Save** icon or `Ctrl+S`.

5.  **Reference Deck**:
    -   As you type, relevant chunks from your sources appear on the right.
    -   Click **Copy** to insert text.

## Saving

-   **Auto-Save**: Changes are saved automatically (debounced).
-   **Manual Save**: Click the Save icon or press `Ctrl+S`.
-   **Sync Status**: Look for the indicator in the header ("Saved", "Syncing...", "Offline").
