/* ========================================================
   Aurora Auth — Interactive Login JS
   Features: Particles, Cursor Glow, Form Validation,
             Password Toggle, Loading State, Tilt Effect
======================================================== */

'use strict';

// ─── Cursor Glow ───────────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let glowX = mouseX, glowY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  glowX += (mouseX - glowX) * 0.09;
  glowY += (mouseY - glowY) * 0.09;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ─── Particle Canvas ───────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#a78bfa', '#7c3aed', '#60a5fa', '#22d3ee', '#818cf8'];

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x    = Math.random() * W;
    this.y    = init ? Math.random() * H : H + 10;
    this.r    = Math.random() * 1.8 + 0.4;
    this.vx   = (Math.random() - 0.5) * 0.35;
    this.vy   = -(Math.random() * 0.6 + 0.25);
    this.life = 0;
    this.maxLife = Math.random() * 260 + 180;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.twinkleSpeed = Math.random() * 0.04 + 0.01;
    this.twinkleOffset = Math.random() * Math.PI * 2;
  }
  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset();
  }
  draw() {
    const progress = this.life / this.maxLife;
    const fade     = progress < 0.1 ? progress / 0.1 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    const twinkle  = (Math.sin(this.life * this.twinkleSpeed + this.twinkleOffset) + 1) / 2;
    const alpha    = fade * (0.4 + twinkle * 0.55);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.restore();
  }
}

// Init particles
for (let i = 0; i < 140; i++) particles.push(new Particle());

// Mouse-attracted extra particles
let mouseParticles = [];
document.addEventListener('mousemove', () => {
  if (Math.random() < 0.3) {
    const p = new Particle();
    p.x = mouseX + (Math.random() - 0.5) * 20;
    p.y = mouseY + (Math.random() - 0.5) * 20;
    p.r = Math.random() * 1.2 + 0.3;
    p.vy = -(Math.random() * 1.2 + 0.4);
    p.maxLife = 80;
    mouseParticles.push(p);
    if (mouseParticles.length > 40) mouseParticles.shift();
  }
});

function drawFrame() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  mouseParticles.forEach((p, i) => {
    p.update(); p.draw();
  });
  requestAnimationFrame(drawFrame);
}
drawFrame();

// ─── Card Tilt Effect ──────────────────────────────────
const card = document.getElementById('login-card');
let cardRect;

function getRect() { cardRect = card.getBoundingClientRect(); }
getRect();
window.addEventListener('resize', getRect);

document.addEventListener('mousemove', (e) => {
  if (!cardRect) return;
  const cx = cardRect.left + cardRect.width  / 2;
  const cy = cardRect.top  + cardRect.height / 2;
  const dx = (e.clientX - cx) / (cardRect.width  / 2);
  const dy = (e.clientY - cy) / (cardRect.height / 2);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rx =  clamp(dy * -6, -6, 6);
  const ry =  clamp(dx *  6, -6, 6);
  card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
});
document.addEventListener('mouseleave', () => {
  card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  card.style.transition = 'transform 0.6s ease';
  setTimeout(() => card.style.transition = '', 600);
});

// ─── Password Toggle ───────────────────────────────────
const toggleBtn = document.getElementById('toggle-password');
const passInput = document.getElementById('password');
const eyeShow   = toggleBtn.querySelector('.eye-show');
const eyeHide   = toggleBtn.querySelector('.eye-hide');

toggleBtn.addEventListener('click', () => {
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  eyeShow.style.display = isPass ? 'none'  : '';
  eyeHide.style.display = isPass ? ''      : 'none';
  toggleBtn.style.transform = 'scale(0.85)';
  setTimeout(() => toggleBtn.style.transform = '', 150);
});

// ─── Real-time Validation ──────────────────────────────
const emailInput = document.getElementById('email');

function showError(inputEl, msgId, msg) {
  const msgEl = document.getElementById(msgId);
  inputEl.classList.add('has-error');
  inputEl.classList.remove('is-valid');
  msgEl.textContent = msg;
  msgEl.classList.add('show');
}

function clearError(inputEl, msgId) {
  const msgEl = document.getElementById(msgId);
  inputEl.classList.remove('has-error');
  msgEl.textContent = '';
  msgEl.classList.remove('show');
}

function setValid(inputEl) {
  inputEl.classList.add('is-valid');
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

emailInput.addEventListener('input', () => {
  const v = emailInput.value.trim();
  if (!v) { clearError(emailInput, 'email-error'); return; }
  if (!validateEmail(v)) {
    showError(emailInput, 'email-error', 'Format email tidak valid');
  } else {
    clearError(emailInput, 'email-error');
    setValid(emailInput);
  }
});

passInput.addEventListener('input', () => {
  clearError(passInput, 'password-error');
  if (passInput.value.length >= 6) setValid(passInput);
  else passInput.classList.remove('is-valid');
});

// ─── Form Submit ───────────────────────────────────────
const form    = document.getElementById('login-form');
const btnLogin = document.getElementById('btn-login');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;

  const email    = emailInput.value.trim();
  const password = passInput.value;

  if (!email) {
    showError(emailInput, 'email-error', 'Email tidak boleh kosong');
    valid = false;
  } else if (!validateEmail(email)) {
    showError(emailInput, 'email-error', 'Format email tidak valid');
    valid = false;
  }

  if (!password) {
    showError(passInput, 'password-error', 'Kata sandi tidak boleh kosong');
    valid = false;
  } else if (password.length < 6) {
    showError(passInput, 'password-error', 'Minimal 6 karakter');
    valid = false;
  }

  if (!valid) {
    card.classList.add('shake');
    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
    return;
  }

  // Simulate loading
  btnLogin.classList.add('loading');
  btnLogin.disabled = true;

  await new Promise(r => setTimeout(r, 2200));

  btnLogin.classList.remove('loading');
  btnLogin.disabled = false;

  // Simulate success (demo)
  card.classList.add('success');
  btnLogin.style.background = 'linear-gradient(135deg, #059669, #10b981)';
  btnLogin.querySelector('.btn-text').textContent = 'Berhasil Masuk! ✓';

  // Reset after 2s
  setTimeout(() => {
    btnLogin.style.background = '';
    btnLogin.querySelector('.btn-text').textContent = 'Masuk';
    card.classList.remove('success');
    form.reset();
    [emailInput, passInput].forEach(i => {
      i.classList.remove('is-valid', 'has-error');
    });
  }, 2500);
});

// ─── Social Button Ripple ──────────────────────────────
document.querySelectorAll('.btn-social, .btn-login').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%; background:rgba(255,255,255,0.18);
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      transform:scale(0); animation:rippleAnim 0.55s linear forwards;
      pointer-events:none; z-index:0;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// Ripple keyframes injected via JS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

// ─── Entrance stagger for form fields ─────────────────
document.querySelectorAll('.field-wrapper, .options-row, .btn-login, .divider, .social-row, .register-text').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = `opacity 0.5s ${0.5 + i * 0.08}s ease, transform 0.5s ${0.5 + i * 0.08}s ease`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});
