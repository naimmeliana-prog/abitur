/* ============================================================
   AUTH.JS — Authentication System
   Local Storage based (no backend needed)
   ============================================================ */

'use strict';

const Auth = {
  STORAGE_KEY: 'abitur_users',
  SESSION_KEY: 'abitur_session',

  // ── Get all users ────────────────────────────────────────────
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch { return {}; }
  },

  // ── Save users ───────────────────────────────────────────────
  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  // ── Hash password (simple obfuscation) ──────────────────────
  hashPassword(password) {
    // Simple but better than plaintext — for a production app use bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return btoa(hash + password.length + 'abiturDSV2025').replace(/=/g, '');
  },

  // ── Register ─────────────────────────────────────────────────
  register(username, password, email = '') {
    username = username.trim().toLowerCase();

    if (!username || username.length < 3) {
      return { ok: false, error: 'El usuario debe tener al menos 3 caracteres' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const users = this.getUsers();
    if (users[username]) {
      return { ok: false, error: 'Ese nombre de usuario ya existe' };
    }

    const user = {
      username,
      passwordHash: this.hashPassword(password),
      email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    users[username] = user;
    this.saveUsers(users);

    // Initialize progress for new user
    Progress.initForUser(username);

    // Create session
    this.createSession(user);
    return { ok: true, user };
  },

  // ── Login ────────────────────────────────────────────────────
  login(username, password) {
    username = username.trim().toLowerCase();
    const users = this.getUsers();
    const user = users[username];

    if (!user) {
      return { ok: false, error: 'Usuario no encontrado' };
    }

    if (user.passwordHash !== this.hashPassword(password)) {
      return { ok: false, error: 'Contraseña incorrecta' };
    }

    // Update last login
    user.lastLogin = Date.now();
    users[username] = user;
    this.saveUsers(users);

    this.createSession(user);
    return { ok: true, user };
  },

  // ── Session ──────────────────────────────────────────────────
  createSession(user) {
    const session = {
      username: user.username,
      email: user.email || '',
      loginTime: Date.now(),
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    // Also save to localStorage for persistence across tabs
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  getCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
      if (!session) return null;
      return session;
    } catch { return null; }
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'auth.html';
  },

  // ── Update profile ───────────────────────────────────────────
  updateProfile(username, updates) {
    const users = this.getUsers();
    if (!users[username]) return false;
    Object.assign(users[username], updates);
    this.saveUsers(users);
    // Update session
    const session = this.getCurrentUser();
    if (session) {
      Object.assign(session, updates);
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
    return true;
  },
};

// ─── Auth Page Logic ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Only run on auth.html
  if (!document.getElementById('authCard')) return;

  // If already logged in, redirect
  if (Auth.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin    = document.getElementById('showLogin');
  const loginCard    = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const langBtns     = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('abitur_lang') || 'es';

  // Lang switcher on auth page
  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem('abitur_lang', currentLang);
      langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
      applyAuthTranslations();
    });
  });

  function applyAuthTranslations() {
    if (typeof TRANSLATIONS !== 'undefined') {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['es']?.[key] || key;
        if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      });
    }
  }
  applyAuthTranslations();

  // Show/hide forms
  showRegister?.addEventListener('click', () => {
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
  });

  showLogin?.addEventListener('click', () => {
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });

  // Login submit
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const btn = loginForm.querySelector('[type="submit"]');

    if (!username || !password) {
      showError('loginError', 'Por favor completa todos los campos');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    setTimeout(() => {
      const result = Auth.login(username, password);
      if (result.ok) {
        window.location.href = 'index.html';
      } else {
        btn.disabled = false;
        btn.textContent = currentLang === 'de' ? 'Anmelden' : 'Iniciar sesión';
        showError('loginError', result.error);
      }
    }, 600);
  });

  // Register submit
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('regConfirm').value;
    const email    = document.getElementById('regEmail').value;
    const btn = registerForm.querySelector('[type="submit"]');

    if (password !== confirm) {
      showError('registerError', 'Las contraseñas no coinciden');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    setTimeout(() => {
      const result = Auth.register(username, password, email);
      if (result.ok) {
        window.location.href = 'index.html';
      } else {
        btn.disabled = false;
        btn.textContent = currentLang === 'de' ? 'Registrieren' : 'Crear cuenta';
        showError('registerError', result.error);
      }
    }, 600);
  });

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
  }
});
