

class ReaderApp {
  constructor() {
    // DOM refs
    this.titleEl = document.getElementById("title");
    this.statusEl = document.getElementById("status");
    this.listEl = document.getElementById("readerList");
    this.backBtn = document.getElementById("backBtn");

    // State 
    this.timerId = null;

    // Bound handlers  
    this.tick = () => this.retrieveAndRender();
    this.onStorage = (e) => this._onStorage(e);
    this.onBeforeUnload = () => this.destroy();
  }

  // UI - Render a read-only list of notes.
  renderReader(notes) {
    this.listEl.innerHTML = "";
    if (!notes.length) {
      const p = document.createElement("p");
      p.textContent = MESSAGES.none;
      this.listEl.appendChild(p);
      return;
    }
    for (const n of notes) {
      const div = document.createElement("div");
      div.className = "reader-item";
      div.textContent = n.text && n.text.trim().length ? n.text : MESSAGES.empty;
      this.listEl.appendChild(div);
    }
  }

  /**
   * Fetch from LocalStorage, render, and stamp "Last retrieved" time.
   * Called on load, every 2s via polling, and immediately on 'storage' changes.
   */
  retrieveAndRender() {
    const notes = loadNotes();           // storage.js helper
    this.renderReader(notes);
    const when = setRetrievedNow();      // record "last retrieved"
    this.statusEl.textContent = MESSAGES.last_retrieved_prefix + formatTime(when);
  }

  /** On cross-tab changes to notes, refresh immediately (don’t wait for polling tick). */
  _onStorage(e) {
    if (e.key === STORAGE_KEYS.NOTES) {
      this.retrieveAndRender();          // instant refresh on cross-tab save
    }
  }

  // Lifecycle - Initialize labels, do first render, start polling, and listen for 'storage' events.
  init() {
    // Labels
    this.titleEl.textContent = MESSAGES.title_reader;
    this.backBtn.textContent = MESSAGES.back;

    // First render immediately
    this.retrieveAndRender();

    // Poll every 2 seconds per spec
    this.timerId = setInterval(this.tick, 2000);

    // Cross-tab instant updates
    window.addEventListener("storage", this.onStorage);
    window.addEventListener("beforeunload", this.onBeforeUnload);
  }

  /** Clean up timer/listeners on page unload. */
  destroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    window.removeEventListener("storage", this.onStorage);
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  }
}

// Bootstrap the app once DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const app = new ReaderApp();
  app.init();
});


