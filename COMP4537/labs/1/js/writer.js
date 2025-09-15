

class WriterApp {
  constructor() {
    // State
    /** @type {NoteItem[]} */
    this.notes = [];
    this.dirty = false;
    this.saveTimerId = null;

    // DOM refs - Cache frequently used elements once for clarity/performance.
    this.titleEl = document.getElementById("title");
    this.statusEl = document.getElementById("status");
    this.addBtn = document.getElementById("addBtn");
    this.notesContainer = document.getElementById("notesContainer");
    this.backBtn = document.getElementById("backBtn");

    // Bound handlers - Arrow functions preserve `this` so we can pass them as callbacks.
    this.handleRemove = (note) => this._handleRemove(note);
    this.handleInput = (_note) => { this.dirty = true; };
    this.onAddClick = () => this.addNote("");
    this.onStorage = (e) => this._onStorage(e);
    this.onBeforeUnload = () => this.destroy();
  }

  /** UI Helpers - Update the "Last saved:" status line with a human-readable time. */
  updateStatusSaved(atIso) {
    this.statusEl.textContent = MESSAGES.last_saved_prefix + (formatTime(atIso));
  }
  /** Rebuild the notes list by asking each NoteItem to render itself. */
  renderAll() {
    this.notesContainer.innerHTML = "";
    for (const n of this.notes) {
      n.render(
        this.notesContainer,
        this.handleRemove,          // remove callback
        this.handleInput,           // input callback
        { remove: MESSAGES.remove } // i18n-friendly label
      );
    }
  }

  // Remove a note and save immediately (per spec).
  _handleRemove(note) {
    this.notes = this.notes.filter(n => n.id !== note.id);
    const savedAt = saveNotes(this.notes);  // immediate save per spec
    this.updateStatusSaved(savedAt);
    this.renderAll();
  }
  /** Create a new note with a unique id and re-render. */
  addNote(text = "") {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    const item = new NoteItem(id, text);
    this.notes.push(item);
    this.dirty = true;
    this.renderAll();
  }

  /** Start autosave loop (2s). Only writes when `dirty` is true. */
  startAutoSave() {
    this.saveTimerId = setInterval(() => {
      if (!this.dirty) return;       // write only when changed
      const savedAt = saveNotes(this.notes);
      this.updateStatusSaved(savedAt);
      this.dirty = false;
    }, 2000);
  }

  /** Stop autosave loop (good hygiene on page unload). */
  stopAutoSave() {
    if (this.saveTimerId) clearInterval(this.saveTimerId);
    this.saveTimerId = null;
  }

  /** Cross-tab sync: refresh immediately when another tab changes notes or save time. */
  _onStorage(e) {
    if (e.key === STORAGE_KEYS.NOTES || e.key === STORAGE_KEYS.SAVED_AT) {
      this.notes = loadNotes();
      this.renderAll();
      this.updateStatusSaved(getSavedAt());
    }
  }

  // Lifecycle - Initialize labels, load data, wire events, and start autosave. 
  init() {
    // Labels
    this.titleEl.textContent = MESSAGES.title_writer;
    this.addBtn.textContent = MESSAGES.add_note;
    this.backBtn.textContent = MESSAGES.back;

    // Data
    this.notes = loadNotes();
    this.renderAll();
    this.updateStatusSaved(getSavedAt());

    // Events
    this.addBtn.addEventListener("click", this.onAddClick);
    window.addEventListener("storage", this.onStorage);
    window.addEventListener("beforeunload", this.onBeforeUnload);

    // Autosave
    this.startAutoSave();
  }

  /** Tear down listeners/timers to avoid leaks (called on unload). */
  destroy() {
    this.stopAutoSave();
    this.addBtn.removeEventListener("click", this.onAddClick);
    window.removeEventListener("storage", this.onStorage);
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  }
}

// Bootstrap the app once DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const app = new WriterApp();
  app.init();
});

