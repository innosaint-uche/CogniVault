# Setup Guide

## Prerequisites

Ensure you have the following installed:
-   **Node.js**: Version 18.0.0 or later.
-   **npm**: Comes with Node.js.

## Installation Steps

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd cognivault-studio
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env.local` file in the root of the project. This file is ignored by git and will store your sensitive keys.

    **Required for Neural Mode (Choose at least one):**

    *Option A: Google Gemini (Direct)*
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

    *Option B: OpenRouter (Aggregator - supports free models)*
    ```env
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```

    **Optional for Syncing:**
    If you want to use Firebase for saving your project state:
    ```env
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the Application**:
    ```bash
    npm run dev
    ```
    The app will start at `http://localhost:3000`.

## Building for Production

To create a production build:
```bash
npm run build
```
The output will be in the `dist/` directory. You can preview the build with:
```bash
npm run preview
```
