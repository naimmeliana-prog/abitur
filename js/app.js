/* ============================================================
   APP.JS — AbiturDSV Main Controller
   Router + i18n (ES/DE) + Utilities
   ============================================================ */

'use strict';

// ─── i18n Translations ──────────────────────────────────────
const TRANSLATIONS = {
  es: {
    // Navigation
    'nav.dashboard':    'Inicio',
    'nav.subjects':     'Asignaturas',
    'nav.exam-gen':     'Generar Examen',
    'nav.exam-bank':    'Banco de Exámenes',
    'nav.progress':     'Mi Progreso',
    'nav.study-tips':   'Técnicas de Estudio',
    'nav.study-material': 'Material Didáctico',
    'nav.admin':        'Admin',
    'nav.logout':       'Cerrar sesión',
    'nav.section.principal': 'Principal',
    'nav.section.exams':     'Exámenes',
    'nav.section.progress':  'Mi Progreso',
    'nav.section.admin':     'Admin',

    // Subjects
    'subject.deutsch':     'Alemán',
    'subject.englisch':    'Inglés',
    'subject.mathe':       'Matemáticas',
    'subject.espanol':     'Español',
    'subject.philosophie': 'Filosofía',

    // Dashboard
    'dashboard.welcome':       'Bienvenido,',
    'dashboard.subtitle':      'Prepárate para tu Abitur en el DSV',
    'dashboard.streak':        'días seguidos',
    'dashboard.continue':      'Continuar estudiando',
    'dashboard.exams-done':    'Exámenes completados',
    'dashboard.avg-score':     'Nota media',
    'dashboard.hours':         'Horas de estudio',
    'dashboard.level':         'Nivel actual',
    'dashboard.recent':        'Actividad reciente',
    'dashboard.quick-access':  'Acceso rápido',
    'dashboard.new-material':  '¡Nuevo material disponible!',

    // Exam
    'exam.generate':         'Generar Examen',
    'exam.practice-mode':    'Modo Práctica',
    'exam.simulation-mode':  'Modo Simulacro',
    'exam.difficulty':       'Dificultad',
    'exam.easy':             'Fácil',
    'exam.medium':           'Medio',
    'exam.hard':             'Difícil',
    'exam.year':             'Año',
    'exam.start':            'Comenzar',
    'exam.submit':           'Entregar',
    'exam.next':             'Siguiente',
    'exam.prev':             'Anterior',
    'exam.check':            'Corregir',
    'exam.result':           'Resultado',
    'exam.print-pdf':        'Imprimir / PDF',
    'exam.score':            'Puntuación',
    'exam.correct':          'Correctas',
    'exam.wrong':            'Incorrectas',
    'exam.tip':              'Consejo',
    'exam.explanation':      'Explicación',
    'exam.time-left':        'Tiempo restante',
    'exam.time-warning':     '⚠️ ¡Menos de 10 minutos!',
    'exam.auto-submit':      'Se entrega automáticamente',

    // Progress
    'progress.level':        'Nivel',
    'progress.xp':           'XP Total',
    'progress.next-level':   'Próximo nivel',
    'progress.achievements': 'Logros',
    'progress.history':      'Historial',
    'progress.streak':       'Racha actual',
    'progress.best-streak':  'Mejor racha',
    'progress.stats':        'Estadísticas',

    // Study Tips
    'tips.title':            'Técnicas de Estudio',
    'tips.for-lazy':         'Para el estudiante que no estudia en casa',
    'tips.pomodoro':         'Técnica Pomodoro',
    'tips.spaced':           'Repetición Espaciada',
    'tips.mindmap':          'Mapas Mentales',
    'tips.plan':             'Plan de Estudio',
    'tips.emergency':        'Modo Emergencia',

    // Auth
    'auth.login':            'Iniciar sesión',
    'auth.register':         'Registrarse',
    'auth.username':         'Usuario',
    'auth.password':         'Contraseña',
    'auth.email':            'Email (opcional)',
    'auth.forgot':           '¿Olvidaste tu contraseña?',
    'auth.no-account':       '¿No tienes cuenta?',
    'auth.have-account':     '¿Ya tienes cuenta?',
    'auth.welcome-back':     'Bienvenido de nuevo',
    'auth.create-account':   'Crear cuenta',

    // Levels
    'level.1':  'Schüler',
    'level.2':  'Lernender',
    'level.3':  'Fleißiger',
    'level.4':  'Wissbegieriger',
    'level.5':  'Gymnasiast',
    'level.6':  'Fortgeschrittener',
    'level.7':  'Vorbereiter',
    'level.8':  'Experte',
    'level.9':  'Meister',
    'level.10': 'Abiturient',

    // Misc
    'btn.save':     'Guardar',
    'btn.cancel':   'Cancelar',
    'btn.delete':   'Eliminar',
    'btn.edit':     'Editar',
    'btn.back':     'Volver',
    'btn.close':    'Cerrar',
    'btn.confirm':  'Confirmar',
    'btn.add':      'Añadir',
    'misc.loading': 'Cargando...',
    'misc.error':   'Ha ocurrido un error',
    'misc.success': '¡Completado!',
    'misc.new':     'NUEVO',
    'misc.locked':  'Bloqueado',
    'misc.unlock':  'Desbloquear',
  },
  de: {
    // Navigation
    'nav.dashboard':    'Startseite',
    'nav.subjects':     'Fächer',
    'nav.exam-gen':     'Prüfung generieren',
    'nav.exam-bank':    'Prüfungsbank',
    'nav.progress':     'Mein Fortschritt',
    'nav.study-tips':   'Lerntechniken',
    'nav.study-material': 'Lehrmaterial',
    'nav.admin':        'Admin',
    'nav.logout':       'Abmelden',
    'nav.section.principal': 'Hauptmenü',
    'nav.section.exams':     'Prüfungen',
    'nav.section.progress':  'Mein Fortschritt',
    'nav.section.admin':     'Admin',

    // Subjects
    'subject.deutsch':     'Deutsch',
    'subject.englisch':    'Englisch',
    'subject.mathe':       'Mathematik',
    'subject.espanol':     'Spanisch',
    'subject.philosophie': 'Philosophie',

    // Dashboard
    'dashboard.welcome':       'Willkommen,',
    'dashboard.subtitle':      'Bereite dich auf dein Abitur an der DSV vor',
    'dashboard.streak':        'Tage in Folge',
    'dashboard.continue':      'Weiterlernen',
    'dashboard.exams-done':    'Prüfungen abgeschlossen',
    'dashboard.avg-score':     'Durchschnittsnote',
    'dashboard.hours':         'Lernstunden',
    'dashboard.level':         'Aktuelles Level',
    'dashboard.recent':        'Letzte Aktivitäten',
    'dashboard.quick-access':  'Schnellzugriff',
    'dashboard.new-material':  'Neues Material verfügbar!',

    // Exam
    'exam.generate':         'Prüfung generieren',
    'exam.practice-mode':    'Übungsmodus',
    'exam.simulation-mode':  'Simulationsmodus',
    'exam.difficulty':       'Schwierigkeit',
    'exam.easy':             'Leicht',
    'exam.medium':           'Mittel',
    'exam.hard':             'Schwer',
    'exam.year':             'Jahr',
    'exam.start':            'Beginnen',
    'exam.submit':           'Abgeben',
    'exam.next':             'Weiter',
    'exam.prev':             'Zurück',
    'exam.check':            'Korrigieren',
    'exam.result':           'Ergebnis',
    'exam.print-pdf':        'Drucken / PDF',
    'exam.score':            'Punktzahl',
    'exam.correct':          'Richtige',
    'exam.wrong':            'Falsche',
    'exam.tip':              'Tipp',
    'exam.explanation':      'Erklärung',
    'exam.time-left':        'Verbleibende Zeit',
    'exam.time-warning':     '⚠️ Weniger als 10 Minuten!',
    'exam.auto-submit':      'Wird automatisch abgegeben',

    // Progress
    'progress.level':        'Level',
    'progress.xp':           'Gesamt-XP',
    'progress.next-level':   'Nächstes Level',
    'progress.achievements': 'Errungenschaften',
    'progress.history':      'Verlauf',
    'progress.streak':       'Aktuelle Serie',
    'progress.best-streak':  'Beste Serie',
    'progress.stats':        'Statistiken',

    // Study Tips
    'tips.title':            'Lerntechniken',
    'tips.for-lazy':         'Für den Schüler, der zuhause nicht lernt',
    'tips.pomodoro':         'Pomodoro-Technik',
    'tips.spaced':           'Spaced Repetition',
    'tips.mindmap':          'Mindmaps',
    'tips.plan':             'Lernplan',
    'tips.emergency':        'Notfall-Modus',

    // Auth
    'auth.login':            'Anmelden',
    'auth.register':         'Registrieren',
    'auth.username':         'Benutzername',
    'auth.password':         'Passwort',
    'auth.email':            'E-Mail (optional)',
    'auth.forgot':           'Passwort vergessen?',
    'auth.no-account':       'Noch kein Konto?',
    'auth.have-account':     'Bereits ein Konto?',
    'auth.welcome-back':     'Willkommen zurück',
    'auth.create-account':   'Konto erstellen',

    // Levels
    'level.1':  'Schüler',
    'level.2':  'Lernender',
    'level.3':  'Fleißiger',
    'level.4':  'Wissbegieriger',
    'level.5':  'Gymnasiast',
    'level.6':  'Fortgeschrittener',
    'level.7':  'Vorbereiter',
    'level.8':  'Experte',
    'level.9':  'Meister',
    'level.10': 'Abiturient',

    // Misc
    'btn.save':     'Speichern',
    'btn.cancel':   'Abbrechen',
    'btn.delete':   'Löschen',
    'btn.edit':     'Bearbeiten',
    'btn.back':     'Zurück',
    'btn.close':    'Schließen',
    'btn.confirm':  'Bestätigen',
    'btn.add':      'Hinzufügen',
    'misc.loading': 'Laden...',
    'misc.error':   'Fehler aufgetreten',
    'misc.success': 'Abgeschlossen!',
    'misc.new':     'NEU',
    'misc.locked':  'Gesperrt',
    'misc.unlock':  'Freischalten',
  }
};

// ─── App State ───────────────────────────────────────────────
const App = {
  currentLang: localStorage.getItem('abitur_lang') || 'es',
  currentUser: null,
  currentPage: null,

  // ── i18n ────────────────────────────────────────────────────
  t(key) {
    return TRANSLATIONS[this.currentLang][key] || TRANSLATIONS['es'][key] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('abitur_lang', lang);
    this.applyTranslations();
    // Update active button only for buttons that have data-lang
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Trigger custom page-level callback if registered
    if (typeof window.onLangChange === 'function') {
      window.onLangChange(lang);
    }
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Do not overwrite translations inside dynamic render containers that manage their own translation logic
      if (el.closest('#materialPanel') || el.closest('#subjectPanel')) return;
      
      const key = el.dataset.i18n;
      if (el.tagName === 'INPUT' && el.type !== 'submit') {
        el.placeholder = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      if (el.closest('#materialPanel') || el.closest('#subjectPanel')) return;
      el.title = this.t(el.dataset.i18nTitle);
    });
  },

  // ── Init ────────────────────────────────────────────────────
  init() {
    this.currentUser = Auth.getCurrentUser();
    if (!this.currentUser && !window.location.pathname.endsWith('auth.html')) {
      window.location.href = 'auth.html';
      return;
    }
    if (this.currentUser && window.location.pathname.endsWith('auth.html')) {
      window.location.href = 'index.html';
      return;
    }
    this.setupSidebar();
    this.setupLangSwitcher();
    this.setupMobileNav();
    this.setupToasts();
    this.applyTranslations();
    this.markActivePage();
    this.updateUserUI();
    this.initFontSizeControl();
    // Update daily streak
    if (this.currentUser) {
      Progress.updateStreak();
    }
  },

  // ── Font Size Control (A+ / A-) ──────────────────────────────
  initFontSizeControl() {
    let sizeClass = localStorage.getItem('abitur_font_size') || 'normal';
    this.applyFontSize(sizeClass);

    // Setup listener for dynamic controls if they exist in header
    const btnIncrease = document.getElementById('btnFontSizeIncrease');
    const btnDecrease = document.getElementById('btnFontSizeDecrease');

    btnIncrease?.addEventListener('click', () => {
      let current = localStorage.getItem('abitur_font_size') || 'normal';
      let next = current === 'normal' ? 'large' : current === 'small' ? 'normal' : 'large';
      localStorage.setItem('abitur_font_size', next);
      this.applyFontSize(next);
    });

    btnDecrease?.addEventListener('click', () => {
      let current = localStorage.getItem('abitur_font_size') || 'normal';
      let next = current === 'normal' ? 'small' : current === 'large' ? 'normal' : 'small';
      localStorage.setItem('abitur_font_size', next);
      this.applyFontSize(next);
    });
  },

  applyFontSize(size) {
    document.documentElement.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    document.documentElement.classList.add(`font-size-${size}`);
  },

  // ── Sidebar ─────────────────────────────────────────────────
  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle  = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (!sidebar) return;

    const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (collapsed) sidebar.classList.add('collapsed');

    toggle?.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });

    menuBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      overlay?.classList.toggle('show');
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay?.classList.remove('show');
    });
  },

  // ── Language Switcher ────────────────────────────────────────
  setupLangSwitcher() {
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
      // Remove old click listeners before adding to avoid duplicated handlers
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => this.setLang(newBtn.dataset.lang));
    });
  },

  // ── Mobile Bottom Nav ────────────────────────────────────────
  setupMobileNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      const href = item.dataset.href || item.getAttribute('href');
      if (href && page.includes(href.replace('.html',''))) {
        item.classList.add('active');
      }
    });
  },

  // ── Active Nav Item ──────────────────────────────────────────
  markActivePage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href') || '';
      if (page === href || (page === 'index.html' && href === 'index.html')) {
        item.classList.add('active');
      }
    });
  },

  // ── User UI ──────────────────────────────────────────────────
  updateUserUI() {
    if (!this.currentUser) return;
    const progress = Progress.getData();
    const levelInfo = Progress.getLevelInfo(progress.xp);

    document.querySelectorAll('.user-name-display').forEach(el => {
      el.textContent = this.currentUser.username;
    });
    document.querySelectorAll('.user-level-display').forEach(el => {
      el.textContent = `${this.t('progress.level')} ${levelInfo.level} — ${this.t('level.' + levelInfo.level)}`;
    });
    document.querySelectorAll('.user-avatar-text').forEach(el => {
      el.textContent = this.currentUser.username.charAt(0).toUpperCase();
    });
  },

  // ── Toasts ──────────────────────────────────────────────────
  setupToasts() {
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },

  showToast(message, type = 'info', duration = 3500) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ── XP Float Animation ───────────────────────────────────────
  showXPGain(amount, x, y) {
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.textContent = `+${amount} XP`;
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top  = (y || window.innerHeight / 2) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  },

  // ── Confetti ─────────────────────────────────────────────────
  launchConfetti() {
    const colors = ['#F5C842','#2D4A9E','#E74C8B','#27AE60','#9B59B6'];
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-particle';
        el.style.left     = Math.random() * 100 + 'vw';
        el.style.top      = '-10px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        el.style.animationDelay   = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
      }, i * 30);
    }
  },

  // ── Modal ────────────────────────────────────────────────────
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  },

  // ── Accordion ────────────────────────────────────────────────
  setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  },

  // ── Tabs ─────────────────────────────────────────────────────
  setupTabs(containerSelector) {
    document.querySelectorAll(containerSelector || '.tabs').forEach(tabs => {
      tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const parent = tabs.closest('[data-tabs-parent]') || document;
          parent.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('hidden', panel.id !== target);
          });
        });
      });
    });
  },

  // ── Reading Progress ─────────────────────────────────────────
  setupReadingProgress() {
    const bar = document.getElementById('readingProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    });
  },

  // ── Format Date ──────────────────────────────────────────────
  formatDate(date) {
    return new Date(date).toLocaleDateString(this.currentLang === 'de' ? 'de-DE' : 'es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  // ── Format Duration ──────────────────────────────────────────
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  // ── Animate Count Up ─────────────────────────────────────────
  animateCount(el, target, duration = 1000) {
    const start = 0;
    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    let startTime;
    requestAnimationFrame((ts) => { startTime = ts; step(ts); });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
