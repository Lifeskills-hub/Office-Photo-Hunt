/* Office Photo Hunt - clean UI enhancements v8.7
   Load AFTER app.js and winner-patch.js.
   Keeps the existing game logic untouched.
*/
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  let busyCount = 0;

  function ensureOverlay() {
    let overlay = $('#ophLoading');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ophLoading';
      overlay.className = 'oph-loading';
      overlay.hidden = true;
      overlay.innerHTML = `
        <div class="oph-loading-card" role="status" aria-live="polite" aria-busy="true">
          <div class="oph-spinner" aria-hidden="true"></div>
          <strong id="ophLoadingText">Loading…</strong>
          <small>Please wait. Do not close or refresh this page.</small>
        </div>`;
    }

    /* Keep overlay directly under body to avoid transformed-parent offsets. */
    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }

    return overlay;
  }

  function actionText(action) {
    const labels = {
      createGame: 'Creating game…',
      join: 'Joining game…',
      assignTeams: 'Randomly assigning teams…',
      uploadPhoto: 'Uploading photo…',
      ready: 'Preparing photo hunt…',
      saveScore: 'Saving match score…'
    };
    return labels[action] || 'Loading…';
  }

  function showLoading(text) {
    const overlay = ensureOverlay();
    busyCount += 1;

    const label = $('#ophLoadingText');
    if (label) label.textContent = text || 'Loading…';

    overlay.hidden = false;
  }

  function hideLoading() {
    busyCount = Math.max(0, busyCount - 1);
    const overlay = $('#ophLoading');

    if (overlay && busyCount === 0) {
      overlay.hidden = true;
    }
  }

  window.OPH_UI = { showLoading, hideLoading };

  /*
    Wrap the existing API function from app.js.
    Read-only polling remains silent; player actions show the loading overlay.
  */
  if (typeof api === 'function') {
    const originalApi = api;
    const loadingActions = new Set([
      'createGame',
      'join',
      'assignTeams',
      'uploadPhoto',
      'ready',
      'saveScore'
    ]);

    api = async function (action, payload = {}) {
      const useLoading = loadingActions.has(action);

      if (useLoading) {
        showLoading(actionText(action));
      }

      try {
        return await originalApi(action, payload);
      } finally {
        if (useLoading) {
          hideLoading();
        }
      }
    };
  }

  function updateHostButton() {
    if (typeof G === 'undefined' || !G || G.phase !== 'LOBBY') {
      return;
    }

    const button = $('#assignBtn');
    if (!button) return;

    /* Always show it. Host can press it; everyone else sees a locked version. */
    button.hidden = false;

    if (G.isHost === true) {
      button.disabled = false;
      button.classList.remove('host-locked');
      button.textContent = 'Close joining & randomly assign teams';
    } else {
      button.disabled = true;
      button.classList.add('host-locked');
      button.textContent = '🔒 Close joining & randomly assign teams';
    }

    const note = $('#hostPermissionNote');
    if (note) {
      note.textContent = G.isHost === true
        ? 'You created this game. Close joining when everyone has arrived.'
        : 'Only the game creator can close joining and assign teams.';
    }
  }

  function readyStorageKey() {
    if (typeof S === 'undefined' || !S || !S.gameId) return null;
    return 'ophTeamReady:' + S.gameId;
  }

  function updateReadyButton() {
    if (typeof G === 'undefined' || !G) return;

    const button = $('#readyBtn');
    if (!button) return;

    const key = readyStorageKey();

    if (G.phase !== 'TEAM') {
      if (key) localStorage.removeItem(key);
      return;
    }

    const submitted = key && localStorage.getItem(key) === '1';

    if (submitted) {
      button.classList.add('ready-submitted');
      button.disabled = true;
      button.textContent = '✓ 5 photos ready — Waiting for other teams…';
    }
  }

  /*
    Capture the Ready click before app.js handles it.
    Store the green state only when five server-known photo records exist.
  */
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#readyBtn');
    if (!button || button.disabled) return;

    if (
      typeof G !== 'undefined' &&
      G &&
      Array.isArray(G.myPhotos) &&
      G.myPhotos.length === 5
    ) {
      const key = readyStorageKey();
      if (key) localStorage.setItem(key, '1');

      button.classList.add('ready-submitted');
      button.disabled = true;
      button.textContent = '✓ 5 photos ready — Waiting for other teams…';
    }
  }, true);

  ensureOverlay();

  /* Re-apply UI state after app.js background refreshes/re-renders. */
  setInterval(() => {
    updateHostButton();
    updateReadyButton();
  }, 250);
})();
