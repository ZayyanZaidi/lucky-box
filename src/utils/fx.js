let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  const css = `
  @keyframes confettiFall {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
  }
  .fx-confetti-piece {
    position: fixed; top: -10vh; width: 10px; height: 14px; border-radius: 2px;
    pointer-events: none; z-index: 2000; will-change: transform, opacity;
    animation: confettiFall 1800ms ease-out forwards;
  }
  @keyframes bodyPulse {
    0% { transform: none; }
    50% { transform: scale(1.01); }
    100% { transform: none; }
  }
  .fx-pulse-once { animation: bodyPulse 360ms ease; }
  `;
  const tag = document.createElement('style');
  tag.setAttribute('data-fx', 'true');
  tag.textContent = css;
  document.head.appendChild(tag);
  stylesInjected = true;
}

export function fireConfetti(count = 40) {
  if (typeof document === 'undefined') return;
  ensureStyles();
  const colors = [
    '#00d4ff', '#6a5cff', '#ffd166', '#ef476f', '#06d6a0', '#118ab2'
  ];
  const body = document.body;
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'fx-confetti-piece';
    piece.style.left = Math.random() * vw + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `translateY(${Math.random()*-40}vh)`;
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    piece.style.animationDuration = (1200 + Math.random()*1200) + 'ms';
    body.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

export function pulseBody() {
  if (typeof document === 'undefined') return;
  ensureStyles();
  const el = document.documentElement;
  el.classList.add('fx-pulse-once');
  setTimeout(() => el.classList.remove('fx-pulse-once'), 380);
}
