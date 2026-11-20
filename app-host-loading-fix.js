/* Office Photo Hunt v8.5 - host button + loading fix
   Replace ui-enhancements.js with this file (rename to ui-enhancements.js).
*/
(()=>{
  const $ = s => document.querySelector(s);
  let busy = 0;

  function ensureOverlay(){
    let el=$('#ophLoading');
    if(!el){
      el=document.createElement('div');
      el.id='ophLoading'; el.className='oph-loading'; el.hidden=true;
      el.innerHTML='<div class="oph-loading-card" role="status" aria-live="polite" aria-busy="true"><div class="oph-spinner"></div><strong id="ophLoadingText">Loading…</strong><small>Please wait. Do not close or refresh this page.</small></div>';
    }
    // Critical: overlay must be a direct child of BODY, never inside a transformed page container.
    if(el.parentElement!==document.body) document.body.appendChild(el);
  }
  const labels={createGame:'Creating game…',join:'Joining game…',assignTeams:'Randomly assigning teams…',uploadPhoto:'Uploading photo…',ready:'Preparing photo hunt…',saveScore:'Saving match score…'};
  function showLoading(t){ensureOverlay();busy++;$('#ophLoadingText').textContent=t||'Loading…';$('#ophLoading').hidden=false;document.documentElement.classList.add('oph-busy')}
  function hideLoading(){busy=Math.max(0,busy-1);if(!busy){$('#ophLoading').hidden=true;document.documentElement.classList.remove('oph-busy')}}
  window.OPH_UI={showLoading,hideLoading};

  // app.js defines api with `let`/function in global script scope; wrap it after app.js loads.
  if(typeof api==='function'){
    const originalApi=api;
    const actions=new Set(Object.keys(labels));
    api=async function(action,payload={}){
      const loading=actions.has(action);
      if(loading) showLoading(labels[action]);
      try{return await originalApi(action,payload)}finally{if(loading) hideLoading()}
    };
  }

  function syncLobby(){
    if(typeof G==='undefined'||!G||G.phase!=='LOBBY') return;
    const btn=$('#assignBtn'); if(!btn) return;
    // app.js currently hides this for non-hosts. Override that presentation here.
    btn.hidden=false;
    if(G.isHost===true){
      btn.disabled=false;
      btn.classList.remove('host-locked');
      btn.textContent='Close joining & randomly assign teams';
    }else{
      btn.disabled=true;
      btn.classList.add('host-locked');
      btn.textContent='🔒 Close joining & randomly assign teams';
    }
    const note=$('#hostPermissionNote');
    if(note) note.textContent=G.isHost===true?'You created this game. Close joining when everyone has arrived.':'Only the game creator can close joining and assign teams.';
  }

  ensureOverlay();
  setInterval(syncLobby,200);
})();
