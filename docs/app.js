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
    _isMobile() {
      return document.body.classList.contains('view-mobile');
    },
    _frame() {
      return document.getElementById('mobile-frame');
    },
    save() {
      const pos = this._isMobile()
        ? (this._frame() ? this._frame().scrollTop : 0)
        : Math.round(window.scrollY);
      sessionStorage.setItem(this.KEY, String(pos));
    },
    restore() {
      const y = parseInt(sessionStorage.getItem(this.KEY), 10);
      this.clear();
      if (isNaN(y)) return;
      // Disable browser scroll restoration so it doesn't override ours
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      // setTimeout runs after the browser's own scroll restoration attempt
      setTimeout(() => {
        if (this._isMobile()) {
          const frame = this._frame();
          if (frame) frame.scrollTop = y;
        } else {
          window.scrollTo(0, y);
        }
      }, 0);
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
      const btn = document.getElementById('view-toggle-btn');
      if (btn) {
        btn.textContent = mode === 'desktop' ? '&#9741; Mobile View' : '&#9741; Desktop View';
        btn.innerHTML  = mode === 'desktop' ? '&#128247; Mobile View' : '&#128444;&#xFE0E; Desktop View';
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

      // Dev toolbar — injected as first child of body, above all page content
      const bar = document.createElement('div');
      bar.id = 'dev-toolbar';
      bar.className = 'dev-toolbar';
      bar.innerHTML = `
        <span class="dev-toolbar-label">&#9881; DEV</span>
        <span class="dev-toolbar-version">Vers. 1.3</span>
        <div class="dev-toolbar-actions">
          <button id="view-toggle-btn" class="dev-toolbar-btn"></button>
          <span class="dev-toolbar-divider"></span>
          <button id="reset-zip-btn" class="dev-toolbar-btn dev-toolbar-reset" title="Reset ZIP — clear the in-progress download">&#8635; Reset ZIP</button>
        </div>
      `;
      document.body.insertBefore(bar, document.body.firstChild);

      document.getElementById('view-toggle-btn').addEventListener('click', () => {
        setMode(currentMode === 'desktop' ? 'mobile' : 'desktop');
      });
      document.getElementById('reset-zip-btn').addEventListener('click', () => {
        sessionStorage.removeItem('zf_return_status_url');
        window.location.href = 'index.html';
      });

      applyMode(saved);
    }

    function onChange(cb) {
      callbacks.push(cb);
    }

    return { init, getMode, setMode, onChange };
  })();

  return { URLParams, ScrollMemory, Unsplash, Modal, ViewToggle };
})();
