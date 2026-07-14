/* ============================================================
   AUTH.JS — Authentication System
   Local Storage & Firebase Cloud sync fallback
   ============================================================ */

'use strict';

// Dynamically load Firebase SDK if configured
let firebaseInitialized = false;

function loadFirebaseSDK() {
  return new Promise((resolve) => {
    // Load config template
    const configScript = document.createElement('script');
    configScript.src = 'js/firebase-config.js';
    configScript.onload = () => {
      if (typeof firebaseConfig === 'undefined' || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('REEMPLAZAR')) {
        console.log('Firebase not configured. Using local storage fallback.');
        resolve(false);
        return;
      }
      
      // Load Firebase app
      const appScript = document.createElement('script');
      appScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
      appScript.onload = () => {
        // Load Auth and Firestore
        let loaded = 0;
        const onLoaded = () => {
          loaded++;
          if (loaded === 2) {
            try {
              firebase.initializeApp(firebaseConfig);
              Auth.db = firebase.firestore();
              Auth.firebaseAuth = firebase.auth();
              Auth.useFirebase = true;
              firebaseInitialized = true;
              console.log('Firebase initialized successfully.');
              resolve(true);
            } catch (e) {
              console.error('Firebase initialization failed:', e);
              resolve(false);
            }
          }
        };

        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js';
        authScript.onload = onLoaded;

        const dbScript = document.createElement('script');
        dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
        dbScript.onload = onLoaded;

        document.head.appendChild(authScript);
        document.head.appendChild(dbScript);
      };
      document.head.appendChild(appScript);
    };
    configScript.onerror = () => resolve(false);
    document.head.appendChild(configScript);
  });
}

const firebaseLoadPromise = loadFirebaseSDK();

const Auth = {
  STORAGE_KEY: 'abitur_users',
  SESSION_KEY: 'abitur_session',
  useFirebase: false,
  db: null,
  firebaseAuth: null,

  // ── Get all users (Local Fallback) ────────────────────────────────────────────
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch { return {}; }
  },

  // ── Save users (Local Fallback) ───────────────────────────────────────────────
  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  // ── Hash password (Local Fallback simple obfuscation) ──────────────────────
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return btoa(hash + password.length + 'abiturDSV2025').replace(/=/g, '');
  },

  // ── Register ─────────────────────────────────────────────────
  async register(username, password, email = '') {
    username = username.trim().toLowerCase();

    if (!username || username.length < 3) {
      return { ok: false, error: 'El usuario debe tener al menos 3 caracteres' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    await firebaseLoadPromise;

    if (this.useFirebase) {
      try {
        const finalEmail = email.trim() || `${username}@abitur.local`;
        
        // Check if username document exists in Firestore first
        const userDoc = await this.db.collection('users').doc(username).get();
        if (userDoc.exists) {
          return { ok: false, error: 'Ese nombre de usuario ya existe' };
        }

        // Create Firebase auth user
        const credential = await this.firebaseAuth.createUserWithEmailAndPassword(finalEmail, password);
        await credential.user.updateProfile({ displayName: username });

        // Save username map in Firestore
        const userDetails = {
          username,
          email: finalEmail,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          uid: credential.user.uid
        };
        await this.db.collection('users').doc(username).set(userDetails);

        // Initialize progress for new user
        if (typeof Progress !== 'undefined') {
          await Progress.initForUser(username);
        }

        const user = { username, email: finalEmail };
        this.createSession(user);
        return { ok: true, user };
      } catch (e) {
        console.error('Firebase registration error:', e);
        return { ok: false, error: e.message || 'Error al registrar usuario' };
      }
    } else {
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

      if (typeof Progress !== 'undefined') {
        Progress.initForUser(username);
      }

      this.createSession(user);
      return { ok: true, user };
    }
  },

  // ── Login ────────────────────────────────────────────────────
  async login(username, password) {
    username = username.trim().toLowerCase();
    await firebaseLoadPromise;

    if (this.useFirebase) {
      try {
        // Try to fetch email from Firestore by username
        const userDoc = await this.db.collection('users').doc(username).get();
        let email = username;
        if (userDoc.exists) {
          email = userDoc.data().email;
        } else {
          // If not in firestore, maybe username is an email address
          if (!username.includes('@')) {
            return { ok: false, error: 'Usuario no encontrado' };
          }
        }

        const credential = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
        const resolvedUsername = userDoc.exists ? userDoc.data().username : (credential.user.displayName || username.split('@')[0]);

        // Update last login in Firestore
        if (userDoc.exists) {
          await this.db.collection('users').doc(resolvedUsername).update({ lastLogin: Date.now() });
        }

        const user = { username: resolvedUsername, email };
        this.createSession(user);

        // Pull progress from Firestore and overwrite local
        if (typeof Progress !== 'undefined') {
          await Progress.pullProgressFromCloud(resolvedUsername);
        }

        return { ok: true, user };
      } catch (e) {
        console.error('Firebase login error:', e);
        return { ok: false, error: 'Usuario o contraseña incorrectos' };
      }
    } else {
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
    }
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
    if (this.firebaseAuth) {
      this.firebaseAuth.signOut().catch(console.error);
    }
    window.location.href = 'auth.html';
  },

  // ── Update profile ───────────────────────────────────────────
  async updateProfile(username, updates) {
    await firebaseLoadPromise;
    if (this.useFirebase) {
      try {
        await this.db.collection('users').doc(username.toLowerCase()).update(updates);
      } catch (e) {
        console.error('Firebase updateProfile error:', e);
      }
    } else {
      const users = this.getUsers();
      if (!users[username]) return false;
      Object.assign(users[username], updates);
      this.saveUsers(users);
    }

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
  loginForm?.addEventListener('submit', async (e) => {
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

    try {
      const result = await Auth.login(username, password);
      if (result.ok) {
        window.location.href = 'index.html';
      } else {
        btn.disabled = false;
        btn.textContent = currentLang === 'de' ? 'Anmelden' : 'Iniciar sesión';
        showError('loginError', result.error);
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = currentLang === 'de' ? 'Anmelden' : 'Iniciar sesión';
      showError('loginError', 'Error de conexión a internet o de base de datos');
    }
  });

  // Register submit
  registerForm?.addEventListener('submit', async (e) => {
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

    try {
      const result = await Auth.register(username, password, email);
      if (result.ok) {
        window.location.href = 'index.html';
      } else {
        btn.disabled = false;
        btn.textContent = currentLang === 'de' ? 'Registrieren' : 'Crear cuenta';
        showError('registerError', result.error);
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = currentLang === 'de' ? 'Registrieren' : 'Crear cuenta';
      showError('registerError', 'Error de conexión a internet o de base de datos');
    }
  });

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
  }
});
