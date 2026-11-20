/* Office Photo Hunt - final screen v8.1
   Drop-in replacement for winner-patch.js
*/
(() => {
  const $ = s => document.querySelector(s);
  const escapeHTML = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ordinal(n) {
    const x = n % 100;
    if (x >= 11 && x <= 13) return n + 'th';
    return n + ({1:'st',2:'nd',3:'rd'}[n % 10] || 'th');
  }

  function ensureFinalMarkup() {
    const finished = $('#finished');
    if (!finished || $('#finalMyTeam')) return;
    finished.innerHTML = `
      <div class="card champion-card">
        <div class="trophy">🏆</div>
        <p id="finishReason"></p>
        <h1 id="championName">Champion</h1>
        <div id="championScore" class="champion-score"></div>
      </div>
      <div class="card my-team-card">
        <div class="my-team-label">YOUR TEAM</div>
        <h2 id="finalMyTeam">Team</h2>
        <div id="finalMyTeamResult" class="my-team-result"></div>
      </div>
      <div class="card">
        <h2>Final Leaderboard</h2>
        <div id="finalBoard"></div>
      </div>`;
  }

  function updateFinalScreen() {
    try {
      if (typeof G === 'undefined' || !G || G.phase !== 'FINISHED') return;
      ensureFinalMarkup();

      $('#finishReason').textContent = G.finishReason === 'ALL_COMPLETED'
        ? 'All active teams completed all 5 targets'
        : 'Time is up';

      if (G.champion) {
        $('#championName').textContent = G.champion.teamName + ' are Champions!';
        $('#championScore').textContent = G.champion.total + ' / 500';
      } else {
        $('#championName').textContent = 'Game Finished';
        $('#championScore').textContent = '';
      }

      const leaderboard = G.leaderboard || [];
      const myTeamName = G.teamName || '';
      const myIndex = leaderboard.findIndex(t => t.teamName === myTeamName);
      const myTeam = myIndex >= 0 ? leaderboard[myIndex] : null;

      $('#finalMyTeam').textContent = myTeamName || 'Unknown Team';
      if (!myTeam) {
        $('#finalMyTeamResult').textContent = 'Result unavailable';
      } else if (myTeam.eliminated) {
        $('#finalMyTeamResult').innerHTML = '<strong>OUT</strong><span>Eliminated before the hunt</span>';
      } else {
        $('#finalMyTeamResult').innerHTML = `<strong>${myTeam.total} / 500</strong><span>${ordinal(myIndex + 1)} Place</span>`;
      }

      $('#finalBoard').innerHTML = leaderboard.map((team, index) => {
        const mine = team.teamName === myTeamName;
        const winner = index === 0 && !team.eliminated;
        const rank = team.eliminated ? '–' : index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1;
        return `<div class="board-row ${winner ? 'winner-row' : ''} ${mine ? 'my-team-row' : ''}">
          <b>${rank}</b>
          <span>${escapeHTML(team.teamName)}${mine ? '<span class="you-badge">YOUR TEAM</span>' : ''}${team.eliminated ? ' ❌' : ''}${!team.eliminated ? `<small>${team.completedTargets}/5 targets</small>` : ''}</span>
          <b>${team.eliminated ? 'OUT' : team.total + '/500'}</b>
        </div>`;
      }).join('');
    } catch (e) {
      console.error('Final screen error:', e);
    }
  }

  ensureFinalMarkup();
  setInterval(updateFinalScreen, 500);
})();
