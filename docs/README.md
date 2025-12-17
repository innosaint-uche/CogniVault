# CogniVault Studio

**CogniVault Studio** is a privacy-first, hybrid-intelligence writing environment that combines offline logic with optional cloud neural links. It allows writers to organize their thoughts, manage documents, and leverage AI for outlining and drafting chapters.

## Features

-   **Logic Core Mode**: A secure, offline-first environment for organizing your writing.
-   **Neural Link Mode**: Connect to Google's Gemini AI to generate outlines, suggest chapter beats, and write prose.
-   **Reference Deck**: Automatically surface relevant chunks from your uploaded documents based on the current chapter context.
-   **Project Management**: Create chapters, manage summaries, and configure global book settings (genre, tone, etc.).
-   **Real-time Sync**: Optional Firebase integration for syncing projects across devices.

## Quick Start

### Prerequisites

-   Node.js (v18 or higher)
-   npm (v9 or higher)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory and add your API keys:
    ```env
    GEMINI_API_KEY=your_gemini_api_key
    # Optional: Firebase Config
    FIREBASE_API_KEY=...
    FIREBASE_AUTH_DOMAIN=...
    FIREBASE_PROJECT_ID=...
    FIREBASE_STORAGE_BUCKET=...
    FIREBASE_MESSAGING_SENDER_ID=...
    FIREBASE_APP_ID=...
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open `http://localhost:3000` in your browser.

## Documentation

-   [Setup Guide](SETUP.md)
-   [User Guide](USER_GUIDE.md)
-   [Architecture](ARCHITECTURE.md)
