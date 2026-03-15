
  /**
   * account_page.js (single-file modular structure)
   * ------------------------------------------------
   * Single HTML file with embedded JS structured as small modules:
   * - utils: helpers (time, dom)
   * - api: network calls 
   * - ui: menu and toast components
   * - controller: page initialization and wiring
   *
   * Conventions:
   * - snake_case function and variable names
   * - small functions (aim <= 30 lines)
   * - explicit APP_STATE object (no hidden state)
   */

  /* =========================
     Constants & Explicit State
     ========================= */
  const API_TIMEOUT_MS = 10_000;
  const POLL_TRACK_INTERVAL_MS = 60_000;

  /**
   * APP_STATE is explicit single source of truth for this page.
   * This avoids hidden / implicit state and makes testing easier.
   */
  const APP_STATE = {
    user_name: null,
    btn1_href: '/api/auth/signout',
    btn2_href: '/login'
  };


  /* =========================
     Utils Module
     ========================= */
  const utils = (function () {
    /**
     * iso_today
     * Return today's date in YYYY-MM-DD according to local timezone.
     */
    function iso_today() {
      const now = new Date();
      const tz_offset_ms = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - tz_offset_ms).toISOString().slice(0, 10);
    }

    /**
     * safe_fetch
     * Wrapper around fetch that adds a timeout and throws on non-OK.
     * @param {string} url
     * @param {object} opts
     */
    async function safe_fetch(url, opts = {}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      opts.signal = controller.signal;

      try {
        const res = await fetch(url, opts);
        clearTimeout(timeout);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const err = new Error(`HTTP ${res.status} ${res.statusText}`);
          err.status = res.status;
          err.body = text;
          throw err;
        }
        // assume JSON by default
        const ct = (res.headers.get('content-type') || '');
        if (ct.includes('application/json')) return res.json();
        return res.text();
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    }

    return { iso_today, safe_fetch };
  })();

  /* =========================
     API Module 
     ========================= */
  const api = (function (u) {
    /**
     * get_user_id
     * Fetches current user ID from /api/auth/me.
     */

    async function get_user(){
      const url = `/api/auth/me`;
      const data = await u.safe_fetch(url, { method: 'GET' });
      return data.data;    
    }

    async function get_user_id(){
      user = await get_user();
      return user.id;    
    }

    return { get_user_id,get_user};
  })(utils);

  /* =========================
     UI Module (toast + menu)
     ========================= */
  const ui = (function () {
    const TOAST_CONTAINER_ID = 'toast_container';

    /**
     * create_toast
     * Small, reusable toast implementation.
     * type: 'info' | 'success' | 'error'
     */
    function create_toast(message, type = 'info') {
      const container = document.getElementById(TOAST_CONTAINER_ID);
      if (!container) return;

      const el = document.createElement('div');
      el.className = `toast toast-${type}`;
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.innerHTML = `<span>${escape_html(String(message))}</span>`;

      container.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }

    /**
     * escape_html
     * Minimal escaping to avoid accidental HTML injection in toasts.
     */
    function escape_html(str) {
      return str.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
    }

    /**
     * menu_init
     * Wire menu toggle and ARIA updates.
     */
    function menu_init() {
      const menuBtn = document.querySelector('.hamburger-menu');
      const menuBar = document.getElementById('menuBar');
      
      // Toggle menu (keeps same interaction as previous)
      menuBtn.addEventListener('click', () => {
        menuBar.classList.toggle('menu-active');
      });
      
      const menu_box = document.querySelector(".menu__box")
      // close when clicking outside (improves UX)
      document.addEventListener('click', (ev) => {
        if (!menuBar.contains(ev.target) && menuBar.classList.contains('menu-active')) {
          menuBar.classList.remove('menu-active');
          toggle.setAttribute('aria-expanded', 'false');
          menu_box.setAttribute('aria-hidden', 'true');
        }
      });
    }

    return { create_toast, menu_init };
  })();

  /* =========================
     Controller (page wiring)
     ========================= */
  (function controller(api_mod, ui_mod, utils_mod) {
    /**
     * wire_buttons
     * Attach behaviour to primary buttons. Keeps logic explicit.
     */
    function wire_buttons() {
      const btn1 = document.getElementById('btn1');
      const btn2 = document.getElementById('btn2');
      if (btn1) btn1.addEventListener('click', () => { window.location.href = APP_STATE.btn1_href; });
      if (btn2) btn2.addEventListener('click', () => { window.location.href = APP_STATE.btn2_href; });
    }

   
    /**
     * render_user_header
     * Update main header text and message.
     */
    function render_user_header(name, plan) {
      const hello = document.getElementById('hello');
      const msg = document.getElementById('msg');
      if (hello) hello.textContent = name ? `Welcome, ${name}` : 'Welcome';
      if (msg) msg.textContent = plan ? `Plan: ${plan}` : 'Thank you for supporting us';
    }

    /**
     * init
     * Main entrypoint for the page.
     * Loads plan + domain, wires UI, then fetches counts.
     */
    async function init() {
      try {
        ui_mod.menu_init();
        wire_buttons();


        // set default button hrefs (can be overridden by other flows)
        APP_STATE.btn1_href = '/logout';
        APP_STATE.btn2_href = '/logme';

      } catch (err) {
        console.error('init error', err);
        ui_mod.create_toast('Failed to initialize user data', 'error');
      }
    }

    // start when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
  })(api, ui, utils);