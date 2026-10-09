// Select DOM elements
const noteForm = document.getElementById('note-form');
const noteText = document.getElementById('note-text');
const noteCategory = document.getElementById('note-category');
const addNoteBtn = document.getElementById('add-note');
const notesList = document.getElementById('notes-list');
const errorMessage = document.getElementById('error-message');
const noteCount = document.getElementById('note-count');
const clearAllBtn = document.getElementById('clear-all-btn');

// Search DOM elements
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchBox = document.getElementById('search-box');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');

// Normalize notes from localStorage to support both string legacy notes and note objects
function loadStoredNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem('notes') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      if (typeof item === 'string') {
        return {
          id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
          text: item,
          category: 'General',
          createdAt: new Date().toLocaleString()
        };
      }
      return item;
    });
  } catch (e) {
    return [];
  }
}

let notes = loadStoredNotes();
let searchQuery = '';

// Helper to format date and time in a clean, readable format
function formatReadableDate(date = new Date()) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Function to update the note count display
function updateNoteCount() {
  if (noteCount) {
    const count = notes.length;
    if (count === 0) {
      noteCount.textContent = 'You have no notes yet.';
    } else if (count === 1) {
      noteCount.textContent = 'You have 1 note.';
    } else {
      noteCount.textContent = `You have ${count} notes.`;
    }
  }

  if (clearAllBtn) {
    clearAllBtn.disabled = notes.length === 0;
  }
}

// Function to show error message
function showError(msg) {
  if (errorMessage) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
  }
  if (noteText) {
    noteText.classList.add('input-error');
  }
}

// Function to clear error message
function clearError() {
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.classList.remove('visible');
  }
  if (noteText) {
    noteText.classList.remove('input-error');
  }
}

// Function to delete an individual note by id
function deleteNoteById(id) {
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
  updateNoteCount();
  renderNotes();
}

// Function to render notes (with search filtering)
function renderNotes() {
  if (!notesList) return;
  notesList.innerHTML = '';

  const filter = searchQuery.trim().toLowerCase();
  const matchedNotes = notes.filter((note) => {
    if (!filter) return true;
    const textMatch = note.text && note.text.toLowerCase().includes(filter);
    const catMatch = note.category && note.category.toLowerCase().includes(filter);
    return textMatch || catMatch;
  });

  if (matchedNotes.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-search-message';
    emptyLi.textContent = notes.length === 0 ? 'No notes added yet.' : 'No matching notes found.';
    notesList.appendChild(emptyLi);
    return;
  }

  matchedNotes.forEach((note) => {
    const li = document.createElement('li');
    li.className = 'note-card-item';
    li.dataset.id = note.id;

    // Header with category badge and formatted date
    const noteMeta = document.createElement('div');
    noteMeta.className = 'note-meta';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = `category-tag tag-${(note.category || 'General').toLowerCase().replace(/\s+/g, '-')}`;
    categoryBadge.textContent = note.category || 'General';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'note-date';
    dateSpan.textContent = note.createdAt || '';

    noteMeta.appendChild(categoryBadge);
    noteMeta.appendChild(dateSpan);

    // Note body / text content
    const textDiv = document.createElement('div');
    textDiv.className = 'note-content';
    textDiv.textContent = note.text;

    // Footer with action button
    const noteFooter = document.createElement('div');
    noteFooter.className = 'note-footer';

    const itemDeleteBtn = document.createElement('button');
    itemDeleteBtn.type = 'button';
    itemDeleteBtn.className = 'delete-note-btn';
    itemDeleteBtn.setAttribute('aria-label', `Delete note: ${note.text.slice(0, 20)}`);
    itemDeleteBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span>Delete</span>
    `;
    itemDeleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNoteById(note.id);
    });

    noteFooter.appendChild(itemDeleteBtn);

    li.appendChild(noteMeta);
    li.appendChild(textDiv);
    li.appendChild(noteFooter);
    notesList.appendChild(li);
  });
}

// Function to clear textarea and draft
function clearInputs() {
  if (noteText) {
    noteText.value = '';
  }
  if (noteCategory) {
    noteCategory.selectedIndex = 0;
  }
  localStorage.removeItem('note-draft');
}

// Event listener for Escape key inside textarea
if (noteText) {
  noteText.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearInputs();
      clearError();
    }
  });

  // Save draft and clear errors on typing if valid
  noteText.addEventListener('input', () => {
    localStorage.setItem('note-draft', noteText.value);
    if (errorMessage && errorMessage.classList.contains('visible')) {
      const trimmed = noteText.value.trim();
      if (trimmed !== '' && noteText.value.length <= 200) {
        clearError();
      }
    }
  });
}

// Handle form submission to validate and create note object
function handleAddNote(e) {
  if (e) e.preventDefault();
  if (!noteText) return;

  const rawValue = noteText.value;
  const text = rawValue.trim();

  // Validation rules
  if (text === '') {
    showError('Please type a note first.');
    noteText.focus();
    return;
  }

  if (rawValue.length > 200) {
    showError('Notes must be 200 characters or fewer.');
    noteText.focus();
    return;
  }

  // Clear any existing error when valid note is added
  clearError();

  const category = noteCategory ? noteCategory.value : 'General';
  const newNote = {
    id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
    text: text,
    category: category,
    createdAt: formatReadableDate()
  };

  notes.unshift(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));
  updateNoteCount();
  renderNotes();
  clearInputs();
  noteText.focus();
}

if (noteForm) {
  noteForm.addEventListener('submit', handleAddNote);
} else if (addNoteBtn) {
  addNoteBtn.addEventListener('click', handleAddNote);
}

// Function to clear all notes with confirmation
function clearAllNotes() {
  if (notes.length === 0) return;
  const confirmed = confirm('Delete all notes?');
  if (confirmed) {
    notes = [];
    localStorage.setItem('notes', JSON.stringify(notes));
    updateNoteCount();
    renderNotes();
  }
}

if (clearAllBtn) {
  clearAllBtn.addEventListener('click', clearAllNotes);
}

// Search functionality
if (searchToggleBtn && searchBox && searchInput) {
  searchToggleBtn.addEventListener('click', () => {
    const isHidden = searchBox.classList.contains('hidden');
    if (isHidden) {
      searchBox.classList.remove('hidden');
      searchToggleBtn.classList.add('active');
      searchInput.focus();
    } else {
      searchBox.classList.add('hidden');
      searchToggleBtn.classList.remove('active');
      searchQuery = '';
      searchInput.value = '';
      renderNotes();
    }
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderNotes();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchBox.classList.add('hidden');
      searchToggleBtn.classList.remove('active');
      searchQuery = '';
      searchInput.value = '';
      renderNotes();
    }
  });
}

if (searchClearBtn && searchInput) {
  searchClearBtn.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    searchInput.focus();
    renderNotes();
  });
}

// Initialize state when page loads
function init() {
  // Restore saved draft
  const savedDraft = localStorage.getItem('note-draft');
  if (savedDraft !== null && noteText) {
    noteText.value = savedDraft;
  }

  // Update note count
  updateNoteCount();

  // Ensure notes list is rendered
  renderNotes();
}

// Execute initialization
init();