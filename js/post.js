// Simple read progress bar
document.addEventListener('scroll', () => {
  const el = document.getElementById('post-progress');
  if (!el) return;
  const h = document.body.scrollHeight - window.innerHeight;
  const y = Math.max(0, Math.min(1, window.scrollY / h));
  el.style.width = (y * 100) + '%';
});




