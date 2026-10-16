(() => {
  const link=document.createElement('link');link.rel='stylesheet';link.href='v12.css';document.head.appendChild(link);
  if(!document.getElementById('bestStreak')){const compat=document.createElement('b');compat.id='bestStreak';compat.hidden=true;document.body.appendChild(compat);}
  window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('script');s.src='v12.js';document.body.appendChild(s);},{once:true});
})();
