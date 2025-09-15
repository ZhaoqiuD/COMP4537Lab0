// storage.js — shared helpers & model


/**
 * Centralized LocalStorage keys.
 */
const STORAGE_KEYS = Object.freeze({
  NOTES: "lab1_notes", // Json array of {id,text}
  SAVED_AT: "lab1_notes_savedAt", // ISO timestamp of last save
  RETRIEVED_AT: "lab1_notes_retrievedAt", // ISO timestamp of last retrieval
});

/** NoteItem — represents a single note (id + text) with DOM helpers */
class NoteItem {
  constructor(id, text = "") {
    this.id = id;
    this.text = text;

    // lazily created DOM elements (writer side)
    this.rowEl = null;
    this.textareaEl = null;
    this.removeBtnEl = null;
  }

  /** Convert to a plain object so JSON.stringify() drops class methods & DOM refs. */
  toJSON() {
    return { id: this.id, text: this.text };
  }

  // render this note as a row with textarea + remove button
  render(container, removeHandler, inputHandler, strings) {
    // Create DOM once; reuse references on subsequent renders
    if (!this.rowEl) {
      const row = document.createElement("div");
      row.className = "note-row";

      const ta = document.createElement("textarea");
      ta.value = this.text;
      ta.addEventListener("input", (e) => {
        this.text = e.target.value;
        inputHandler?.(this);
      });

      const actions = document.createElement("div");
      actions.className = "note-actions";

      const rm = document.createElement("button");
      rm.className = "btn btn-secondary";
      rm.type = "button";
      rm.textContent = strings.remove;
      rm.addEventListener("click", () => removeHandler?.(this));

      actions.appendChild(rm);
      row.appendChild(ta);
      row.appendChild(actions);

      this.rowEl = row;
      this.textareaEl = ta;
      this.removeBtnEl = rm;
    }
    container.appendChild(this.rowEl);
  }
}

// Persistence helpers
/**
 * Load notes from LocalStorage. Safely handles:
 *  - missing data
 *  - malformed JSON
 *  - non-array values
 * Returns an array of NoteItem instances.
 */
function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(obj => new NoteItem(obj.id, obj.text ?? ""));
  } catch {
    // If parsing fails, start fresh instead of crashing the app.
    return [];
  }
}

/**
 * Save notes to LocalStorage (as JSON) and record "last saved" time.
 */
function saveNotes(notes) {
  const serializable = notes.map(n => n.toJSON());
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(serializable));
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.SAVED_AT, now);
  return now;
}

/** Read the last-saved ISO timestamp (or null if not set). */
function getSavedAt() {
  return localStorage.getItem(STORAGE_KEYS.SAVED_AT);
}

/**
 * Stamp "last retrieved" with the current ISO time (used by reader page).
 */
function setRetrievedNow() {
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.RETRIEVED_AT, now);
  return now;
}

function getRetrievedAt() {
  return localStorage.getItem(STORAGE_KEYS.RETRIEVED_AT);
}

// format time for UI
function formatTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return "—";
  }
}
