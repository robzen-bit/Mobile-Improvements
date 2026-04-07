/**
 * ZF — Zenfolio Download Flow Prototype
 * Shared utilities used across all prototype pages.
 */

const ZF = (() => {

  // ─── URLParams ───────────────────────────────────────────────────────────────
  const URLParams = {
    get(key) {
      return new URLSearchParams(window.location.search).get(key);
    }
  };

  // ─── ScrollMemory ─────────────────────────────────────────────────────────────
  const ScrollMemory = {
    KEY: 'zf_gallery_scroll',
    save() {
      sessionStorage.setItem(this.KEY, String(Math.round(window.scrollY)));
    },
    restore() {
      const y = parseInt(sessionStorage.getItem(this.KEY), 10);
      if (!isNaN(y)) {
        // Wait for layout so the page has height before scrolling
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
        });
      }
      this.clear();
    },
    clear() {
      sessionStorage.removeItem(this.KEY);
    }
  };

  // ─── Unsplash ─────────────────────────────────────────────────────────────────
  const Unsplash = {
    url(index) {
      // picsum.photos serves photography images (Unsplash content) reliably.
      // seed/{index} gives a deterministic, unique image per index.
      return `https://picsum.photos/seed/${index}/800/600`;
    }
  };

  // ─── Modal ────────────────────────────────────────────────────────────────────
  const Modal = {
    _onEscape: null,
    open(el) {
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
      // Focus first focusable element
      const focusable = el.querySelector('input, button, [tabindex="0"]');
      if (focusable) setTimeout(() => focusable.focus(), 50);
      // Escape key closes
      this._onEscape = (e) => {
        if (e.key === 'Escape') this.close(el);
      };
      document.addEventListener('keydown', this._onEscape);
      // Click outside modal card closes
      el.addEventListener('click', this._outsideHandler = (e) => {
        if (e.target === el) this.close(el);
      });
    },
    close(el) {
      el.setAttribute('hidden', '');
      el.setAttribute('aria-hidden', 'true');
      if (this._onEscape) {
        document.removeEventListener('keydown', this._onEscape);
        this._onEscape = null;
      }
      if (this._outsideHandler) {
        el.removeEventListener('click', this._outsideHandler);
        this._outsideHandler = null;
      }
    }
  };

  // ─── ViewToggle ───────────────────────────────────────────────────────────────
  const ViewToggle = (() => {
    const KEY = 'zf_view_mode';
    const callbacks = [];
    let currentMode = 'desktop';

    function getMode() {
      return currentMode;
    }

    function applyMode(mode) {
      currentMode = mode;
      document.body.classList.remove('view-desktop', 'view-mobile');
      document.body.classList.add(`view-${mode}`);
      // Update button label
      const btn = document.getElementById('view-toggle-btn');
      if (btn) {
        btn.textContent = mode === 'desktop' ? 'Switch to Mobile View' : 'Switch to Desktop View';
        btn.setAttribute('aria-label', btn.textContent);
      }
      callbacks.forEach(cb => cb(mode));
    }

    function setMode(mode) {
      localStorage.setItem(KEY, mode);
      applyMode(mode);
    }

    function init() {
      // Read persisted preference; default desktop
      const saved = localStorage.getItem(KEY) || 'desktop';

      // Wrapper holds both buttons
      const wrap = document.createElement('div');
      wrap.className = 'view-toggle-wrap';

      // View toggle button
      const btn = document.createElement('button');
      btn.id = 'view-toggle-btn';
      btn.className = 'view-toggle-fixed';
      btn.addEventListener('click', () => {
        setMode(currentMode === 'desktop' ? 'mobile' : 'desktop');
      });

      // Reset ZIP button — clears the in-progress download state
      const resetBtn = document.createElement('button');
      resetBtn.id = 'reset-zip-btn';
      resetBtn.className = 'view-toggle-reset';
      resetBtn.textContent = '\u21BA';
      resetBtn.title = 'Reset ZIP — clear the in-progress download';
      resetBtn.addEventListener('click', () => {
        sessionStorage.removeItem('zf_return_status_url');
      });

      wrap.appendChild(btn);
      wrap.appendChild(resetBtn);
      document.body.appendChild(wrap);

      applyMode(saved);
    }

    function onChange(cb) {
      callbacks.push(cb);
    }

    return { init, getMode, setMode, onChange };
  })();

  return { URLParams, ScrollMemory, Unsplash, Modal, ViewToggle };
})();
