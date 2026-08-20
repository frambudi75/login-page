/* ============================================================
   NexusID — Interactive Login JS
   Features: Matrix Rain, Typing Effect, Counter Animation,
             Form Validation, Password Strength, Ripple
============================================================ */

'use strict';

// ─── Matrix Rain Canvas ────────────────────────────────
const matCanvas = document.getElementById('matrix-canvas');
const matCtx = matCanvas.getContext('2d');
let matW, matH, cols, drops;

const MATRIX_CHARS = 'ネウソヌニヒノハラルリレロワヲンABCDEF0123456789<>[]{}|=+';

function initMatrix() {
  matW = matCanvas.width = window.innerWidth;
  matH = matCanvas.height = window.innerHeight;
  cols = Math.floor(matW / 18);
  drops = Array.from({ length: cols }, () => Math.random() * -50);
}
initMatrix();
window.addEventListener('resize', initMatrix);

function drawMatrix() {
  matCtx.fillStyle = 'rgba(4, 8, 15, 0.055)';
  matCtx.fillRect(0, 0, matW, matH);

  matCtx.font = '13px JetBrains Mono, monospace';

  drops.forEach((y, i) => {
    const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    const x = i * 18;

    // Lead character (bright)
    matCtx.fillStyle = '#00f5c8';
    matCtx.fillText(char, x, y * 18);

    // Trailing gradient effect - use random green chars below
    if (Math.random() > 0.975) {
      matCtx.fillStyle = 'rgba(0, 245, 200, 0.4)';
      matCtx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], x, (y - 1) * 18);
    }

    if (y * 18 > matH && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 0.5;
  });

  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// ─── Typing Effect ─────────────────────────────────────
const phrases = [
  'Sistem Terpusat & Aman.',
  'Enkripsi AES-256 Penuh.',
  'Autentikasi Dua Faktor.',
  'Zero-Trust Architecture.',
  'Real-time Monitoring.',
];
let pIdx = 0, cIdx = 0, isDeleting = false;
const typingEl = document.getElementById('typing-text');

function typeLoop() {
  const current = phrases[pIdx];
  if (!isDeleting) {
    typingEl.textContent = current.substring(0, cIdx + 1);
    cIdx++;
    if (cIdx === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
    setTimeout(typeLoop, 65);
  } else {
    typingEl.textContent = current.substring(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) {
      isDeleting = false;
      pIdx = (pIdx + 1) % phrases.length;
    }
    setTimeout(typeLoop, 35);
  }
}
setTimeout(typeLoop, 1200);

// ─── Counter Animation ─────────────────────────────────
function animateCounter(el, target, decimals = 0, duration = 1800) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const val = eased * target;
    el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Trigger counters after a short delay
setTimeout(() => {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const decimals = target % 1 !== 0 ? 1 : 0;
    animateCounter(el, target, decimals, 2000);
  });
}, 700);

// ─── Password Toggle ───────────────────────────────────
const eyeBtn   = document.getElementById('eye-btn');
const passInp  = document.getElementById('password');
const eyeOpen  = eyeBtn.querySelector('.eye-open');
const eyeClose = eyeBtn.querySelector('.eye-close');

eyeBtn.addEventListener('click', () => {
  const show = passInp.type === 'password';
  passInp.type = show ? 'text' : 'password';
  eyeOpen.style.display  = show ? 'none' : '';
  eyeClose.style.display = show ? '' : 'none';
  eyeBtn.style.transform = 'scale(0.8)';
  setTimeout(() => eyeBtn.style.transform = '', 140);
});

// ─── Password Strength ─────────────────────────────────
const strengthWrap  = document.getElementById('strength-wrap');
const strengthFill  = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_DATA = [
  { label: 'Sangat Lemah', color: '#ff4d6d', pct: '15%' },
  { label: 'Lemah',        color: '#ff8c42', pct: '30%' },
  { label: 'Sedang',       color: '#ffd166', pct: '55%' },
  { label: 'Kuat',         color: '#06d6a0', pct: '78%' },
  { label: 'Sangat Kuat',  color: '#00f5c8', pct: '100%' },
];

passInp.addEventListener('input', () => {
  const val = passInp.value;
  if (!val) {
    strengthWrap.classList.remove('visible');
    return;
  }
  strengthWrap.classList.add('visible');
  const s = Math.min(calcStrength(val), 5) - 1;
  const d = STRENGTH_DATA[Math.max(s, 0)];
  strengthFill.style.width = d.pct;
  strengthFill.style.background = d.color;
  strengthLabel.textContent = d.label;
  strengthLabel.style.color = d.color;
});

// ─── Real-time Validation ──────────────────────────────
const emailInp  = document.getElementById('email');
const emailMsg  = document.getElementById('email-msg');
const passMsg   = document.getElementById('pass-msg');
const emailStat = document.getElementById('email-status');
const passStat  = document.getElementById('pass-status');

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function setFieldState(inp, msgEl, statEl, type, msg) {
  inp.classList.remove('is-error', 'is-ok');
  msgEl.classList.remove('show', 'error', 'ok');
  if (type === 'error') {
    inp.classList.add('is-error');
    msgEl.textContent = '⚠ ' + msg;
    msgEl.classList.add('show', 'error');
    statEl.textContent = '✗';
    statEl.style.color = '#ff4d6d';
  } else if (type === 'ok') {
    inp.classList.add('is-ok');
    msgEl.textContent = '✓ ' + msg;
    msgEl.classList.add('show', 'ok');
    statEl.textContent = '✓';
    statEl.style.color = '#00e676';
  } else {
    msgEl.textContent = '';
    statEl.textContent = '';
  }
  statEl.classList.toggle('show', type !== 'clear');
}

emailInp.addEventListener('input', () => {
  const v = emailInp.value.trim();
  if (!v) { setFieldState(emailInp, emailMsg, emailStat, 'clear'); return; }
  if (!isValidEmail(v)) setFieldState(emailInp, emailMsg, emailStat, 'error', 'Format email tidak valid');
  else setFieldState(emailInp, emailMsg, emailStat, 'ok', 'Email valid');
});

passInp.addEventListener('input', () => {
  const v = passInp.value;
  if (!v) { setFieldState(passInp, passMsg, passStat, 'clear'); return; }
  if (v.length < 6) setFieldState(passInp, passMsg, passStat, 'error', 'Minimal 6 karakter');
  else setFieldState(passInp, passMsg, passStat, 'ok', 'Kata sandi OK');
});

// ─── Form Submit ───────────────────────────────────────
const form      = document.getElementById('login-form');
const btnSubmit = document.getElementById('btn-submit');
const formCont  = document.getElementById('form-container');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let valid = true;
  const email = emailInp.value.trim();
  const pass  = passInp.value;

  if (!email) {
    setFieldState(emailInp, emailMsg, emailStat, 'error', 'ID pengguna tidak boleh kosong');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldState(emailInp, emailMsg, emailStat, 'error', 'Format email tidak valid');
    valid = false;
  }

  if (!pass) {
    setFieldState(passInp, passMsg, passStat, 'error', 'Kata sandi tidak boleh kosong');
    valid = false;
  } else if (pass.length < 6) {
    setFieldState(passInp, passMsg, passStat, 'error', 'Minimal 6 karakter');
    valid = false;
  }

  if (!valid) {
    formCont.classList.add('shake');
    formCont.addEventListener('animationend', () => formCont.classList.remove('shake'), { once: true });
    return;
  }

  // Loading
  btnSubmit.classList.add('loading');
  btnSubmit.disabled = true;

  await new Promise(r => setTimeout(r, 2400));

  btnSubmit.classList.remove('loading');
  btnSubmit.disabled = false;

  // Success
  btnSubmit.classList.add('success');
  const btnTxt = btnSubmit.querySelector('.btn-txt');
  const btnArrow = btnSubmit.querySelector('.btn-arrow');
  btnTxt.textContent = 'AKSES DIBERIKAN';
  if (btnArrow) btnArrow.style.display = 'none';

  // Reset after 2.5s
  setTimeout(() => {
    btnSubmit.classList.remove('success');
    btnTxt.textContent = 'MASUK';
    if (btnArrow) btnArrow.style.display = '';
    form.reset();
    [emailInp, passInp].forEach(inp => {
      inp.classList.remove('is-ok', 'is-error');
    });
    [emailMsg, passMsg].forEach(m => { m.textContent = ''; m.classList.remove('show', 'error', 'ok'); });
    [emailStat, passStat].forEach(s => { s.textContent = ''; s.classList.remove('show'); });
    strengthWrap.classList.remove('visible');
  }, 2800);
});

// ─── Ripple on Buttons ─────────────────────────────────
document.querySelectorAll('.btn-submit, .btn-soc').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const rpl = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    rpl.style.cssText = `
      position:absolute; border-radius:50%; background:rgba(0,245,200,0.15);
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      transform:scale(0); animation:rippleOut 0.55s linear forwards;
      pointer-events:none; z-index:5;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(rpl);
    rpl.addEventListener('animationend', () => rpl.remove());
  });
});

// ─── Stagger entrance for form fields ─────────────────
document.querySelectorAll(
  '.form-header, .field-group, .strength-wrap, .options-row, .btn-submit, .or-divider, .social-grid, .register-row'
).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition = `opacity 0.45s ${0.55 + i * 0.07}s ease, transform 0.45s ${0.55 + i * 0.07}s ease`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});
