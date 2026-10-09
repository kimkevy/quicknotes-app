# QuickNotes App

QuickNotes App is a lightweight, responsive note-taking web application designed to help users quickly jot down, organize, and manage thoughts in real time. It features category labeling, live text validation, instant search filtering, local draft preservation, and state persistence with `localStorage`, all wrapped in a sleek and modern user interface.

## Features

- **Categorized Notes**: Assign tags such as General, Personal, Work, Ideas, or Urgent to every note.
- **Input Validation & Feedback**: Real-time validation preventing empty notes and enforcing a 200-character limit with friendly error alerts.
- **Card-Based Note Layout**: Each note card displays the note text, a category badge, readable timestamp formatting, and an individual Delete action.
- **Dynamic Note Counter**: Displays dynamic counts (`You have no notes yet.`, `You have 1 note.`, or `You have N notes.`).
- **Live Search**: Fast search filter to find saved notes across both note content and categories.
- **Draft Auto-Save & Keyboard Shortcuts**: Saves textarea drafts as you type and allows clearing drafts/inputs with the `Escape` key.
- **Local Persistence**: Notes and drafts remain safely stored across browser refreshes via `localStorage`.

## How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kimkevy/quicknotes-app.git
   cd quicknotes-app
   ```

2. **Open in browser**:
   - Double-click `index.html` to open it directly in any modern web browser.
   - Alternatively, serve it using a local development server like VS Code's **Live Server** extension, or run:
     ```bash
     npx serve .
     ```
     or
     ```bash
     python -m http.server 8000
     ```
   - Visit `http://localhost:8000` (or the port specified in your terminal).

## What I Learned

1. **State Management with Web APIs**: Practiced managing client-side application state and syncing array mutations seamlessly with `localStorage` for offline persistence.
2. **Robust Form Validation & UX**: Implemented client-side edge-case validation (handling blank/whitespace strings, character bounds) while keeping error messages clear and responsive.
3. **Component-Oriented DOM Manipulation**: Structured reusable dynamic card elements with semantic tags, event delegation, and accessible controls (such as unique IDs and descriptive `aria-label` attributes) for smooth user interaction.
