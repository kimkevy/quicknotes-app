// Select DOM elements
const noteForm = document.getElementById('note-form');
const noteText = document.getElementById('note-text');
const noteCategory = document.getElementById('note-category');
const addNoteBtn = document.getElementById('add-note');
const notesList = document.getElementById('notes-list');

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

// Function to delete an individual note by id
function deleteNoteById(id) {
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
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
    }
  });

  // Save draft on input
  noteText.addEventListener('input', () => {
    localStorage.setItem('note-draft', noteText.value);
  });
}

// Handle form submission to create note object
function handleAddNote(e) {
  if (e) e.preventDefault();
  if (!noteText) return;

  const text = noteText.value.trim();
  if (!text) return;

  const category = noteCategory ? noteCategory.value : 'General';
  const newNote = {
    id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
    text: text,
    category: category,
    createdAt: formatReadableDate()
  };

  notes.unshift(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
  clearInputs();
  noteText.focus();
}

if (noteForm) {
  noteForm.addEventListener('submit', handleAddNote);
} else if (addNoteBtn) {
  addNoteBtn.addEventListener('click', handleAddNote);
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

  // Ensure notes list is rendered
  renderNotes();
}

// Execute initialization
init();