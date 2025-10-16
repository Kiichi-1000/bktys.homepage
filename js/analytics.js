// Minimal analytics helper (dataLayer first)
(function(){
  if (!window.dataLayer) window.dataLayer = [];
  function push(event, payload){
    try{ window.dataLayer.push({ event, ...payload }); }
    catch(e){ console.warn('analytics push failed', e); }
  }
  window.BKTYSA = { push };
})();









