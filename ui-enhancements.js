/* Office Photo Hunt UI enhancements v8.2
   Load AFTER app.js and winner-patch.js.
   Adds global loading overlay and host/non-host assignment-button states.
*/
(() => {
  const $ = s => document.querySelector(s);
  let busyCount = 0;

  function ensureOverlay() {
    if ($('#ophLoading')) return;
    const el = document.createElement('div');
    el.id = 'ophLoading';
    el.className = 'oph-loading';
    el.hidden = true;
    el.innerHTML = `
      <div class="oph-loading-card" role="status" aria-live="polite" aria-busy="true">
        <div class="oph-spinner" aria-hidden="true"></div>
        <strong id="ophLoadingText">Loading…</strong>
        <small>Please wait. Do not close or refresh this page.</small>
      </div>`;
    document.body.appendChild(el);
  }

  function loadingText(action) {
    return ({
      createGame: 'Creating game…',
      join: 'Joining game…',
      assignTeams: 'Randomly assigning teams…',
      uploadPhoto: 'Uploading photo…',
      ready: 'Preparing photo hunt…',
      saveScore: 'Saving match score…'
    })[action] || 'Loading…';
  }

  function showLoading(text) {
    ensureOverlay();
    busyCount++;
    $('#ophLoadingText').textContent = text || 'Loading…';
    $('#ophLoading').hidden = false;
  }

  function hideLoading() {
    busyCount = Math.max(0, busyCount - 1);
    if (!busyCount && $('#ophLoading')) $('#ophLoading').hidden = true;
  }

  // Wrap the existing global api() function without changing game logic.
  // Polling/state/photo reads remain silent, while player-triggered writes show feedback.
  if (typeof api === 'function') {
    const originalApi = api;
    const loadingActions = new Set(['createGame','join','assignTeams','uploadPhoto','ready','saveScore']);
    api = async function(action, payload = {}) {
      const useOverlay = loadingActions.has(action);
      if (useOverlay) showLoading(loadingText(action));
      try {
        return await originalApi(action, payload);
      } finally {
        if (useOverlay) hideLoading();
      }
    };
  }

  function updateHostButton() {
    const btn = $('#assignBtn');
    if (!btn || typeof G === 'undefined' || !G || G.phase !== 'LOBBY') return;

    // Show the same control to everyone so non-hosts know what they are waiting for.
    btn.hidden = false;

    if (G.isHost) {
      btn.disabled = false;
      btn.classList.remove('host-locked');
      btn.textContent = 'Close joining & randomly assign teams';
      btn.title = 'Only the game creator can perform this action.';
    } else {
      btn.disabled = true;
      btn.classList.add('host-locked');
      btn.textContent = '🔒 Close joining & randomly assign teams';
      btn.title = 'Only the game creator can perform this action.';
    }

    let note = $('#hostPermissionNote');
    if (!note) {
      note = document.createElement('p');
      note.id = 'hostPermissionNote';
      note.className = 'host-permission-note';
      btn.insertAdjacentElement('afterend', note);
    }
    note.textContent = G.isHost
      ? 'You created this game. Close joining when everyone has arrived.'
      : 'Only the game creator can close joining and assign teams.';
  }

  ensureOverlay();
  setInterval(updateHostButton, 350);
})();
