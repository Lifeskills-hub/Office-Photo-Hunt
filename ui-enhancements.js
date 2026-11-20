(function () {
  'use strict';

  var busyCount = 0;

  function find(selector) {
    return document.querySelector(selector);
  }

  function ensureOverlay() {
    var overlay = find('#ophLoading');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ophLoading';
      overlay.className = 'oph-loading';
      overlay.hidden = true;
      overlay.innerHTML = '<div class="oph-loading-card" role="status" aria-live="polite" aria-busy="true">' +
        '<div class="oph-spinner" aria-hidden="true"></div>' +
        '<strong id="ophLoadingText">Loading...</strong>' +
        '<small>Please wait. Do not close or refresh this page.</small>' +
        '</div>';
    }

    if (overlay.parentNode !== document.body) {
      document.body.appendChild(overlay);
    }

    return overlay;
  }

  function getLoadingText(action) {
    var labels = {
      createGame: 'Creating game...',
      join: 'Joining game...',
      assignTeams: 'Randomly assigning teams...',
      uploadPhoto: 'Uploading photo...',
      ready: 'Preparing photo hunt...',
      saveScore: 'Saving match score...'
    };

    return labels[action] || 'Loading...';
  }

  function showLoading(text) {
    var overlay = ensureOverlay();
    var label = find('#ophLoadingText');

    busyCount += 1;

    if (label) {
      label.textContent = text || 'Loading...';
    }

    overlay.hidden = false;
  }

  function hideLoading() {
    var overlay = find('#ophLoading');

    busyCount = Math.max(0, busyCount - 1);

    if (overlay && busyCount === 0) {
      overlay.hidden = true;
    }
  }

  window.OPH_UI = {
    showLoading: showLoading,
    hideLoading: hideLoading
  };

  if (typeof api === 'function') {
    var originalApi = api;
    var loadingActions = {
      createGame: true,
      join: true,
      assignTeams: true,
      uploadPhoto: true,
      ready: true,
      saveScore: true
    };

    api = async function (action, payload) {
      var useLoading = loadingActions[action] === true;

      if (useLoading) {
        showLoading(getLoadingText(action));
      }

      try {
        return await originalApi(action, payload || {});
      } finally {
        if (useLoading) {
          hideLoading();
        }
      }
    };
  }

  function updateHostButton() {
    var button;
    var note;

    if (typeof G === 'undefined' || !G || G.phase !== 'LOBBY') {
      return;
    }

    button = find('#assignBtn');

    if (!button) {
      return;
    }

    button.hidden = false;

    if (G.isHost === true) {
      button.disabled = false;
      button.classList.remove('host-locked');
      button.textContent = 'Close joining & randomly assign teams';
    } else {
      button.disabled = true;
      button.classList.add('host-locked');
      button.textContent = 'LOCKED - Close joining & randomly assign teams';
    }

    note = find('#hostPermissionNote');

    if (note) {
      note.textContent = G.isHost === true
        ? 'You created this game. Close joining when everyone has arrived.'
        : 'Only the game creator can close joining and assign teams.';
    }
  }

  function getReadyKey() {
    if (typeof S === 'undefined' || !S || !S.gameId) {
      return null;
    }

    return 'ophTeamReady:' + S.gameId;
  }

  function updateReadyButton() {
    var button;
    var key;
    var submitted;

    if (typeof G === 'undefined' || !G) {
      return;
    }

    button = find('#readyBtn');

    if (!button) {
      return;
    }

    key = getReadyKey();

    if (G.phase !== 'TEAM') {
      if (key) {
        localStorage.removeItem(key);
      }
      return;
    }

    submitted = key && localStorage.getItem(key) === '1';

    if (submitted) {
      button.classList.add('ready-submitted');
      button.disabled = true;
      button.textContent = '5 photos ready - Waiting for other teams...';
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('#readyBtn') : null;
    var key;

    if (!button || button.disabled) {
      return;
    }

    if (
      typeof G !== 'undefined' &&
      G &&
      Array.isArray(G.myPhotos) &&
      G.myPhotos.length === 5
    ) {
      key = getReadyKey();

      if (key) {
        localStorage.setItem(key, '1');
      }

      button.classList.add('ready-submitted');
      button.disabled = true;
      button.textContent = '5 photos ready - Waiting for other teams...';
    }
  }, true);

  ensureOverlay();

  window.setInterval(function () {
    updateHostButton();
    updateReadyButton();
  }, 250);
}());
