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
    'tips.pomodoro.desc':    '25 min estudio + 5 min pausa. Ideal para quien no está acostumbrado.',
    'tips.8weeks':           '8 semanas antes',
    'tips.8weeks.desc':      'Plan de estudio personalizado por semanas. Matemáticas: 3h/semana, Deutsch: 2h/semana.',

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
    'misc.locked':  'Bloqueado',
    'misc.unlock':  'Desbloquear',

    // Exam generator additional keys
    'exam.gen-type':            'Tipo de Generación',
    'exam.gen-random':          '🎲 Aleatorio',
    'exam.gen-official':        '📜 Examen Oficial',
    'exam.select-official-desc': 'Selecciona un examen real de años anteriores:',
    'exam.all-diffs':           'Todos',
    'exam.questions-count':     'Número de preguntas',
    'exam.modality':            'Modo de examen',
    'exam.practice-mode-desc':   'Sin temporizador. Ve a tu ritmo. Feedback inmediato.',
    'exam.simulation-mode-desc': 'Con temporizador oficial DIA. Condiciones reales.',
    'exam.summary-title':       '📋 Resumen',

    // Exam Bank specific keys (es)
    'bank.search-placeholder':  '🔍 Buscar por tema, año, palabra clave...',
    'bank.all-subjects':        'Todas las asignaturas',
    'bank.all-difficulties':    'Todas las dificultades',
    'bank.clear':               'Limpiar',
    'bank.total-questions':     'Preguntas totales',
    'bank.easy-questions':      'Fáciles',
    'bank.medium-questions':    'Medias',
    'bank.hard-questions':      'Difíciles',
    'bank.tab-test':            '❓ Preguntas Tipo Test',
    'bank.tab-written':         '📜 Exámenes de Desarrollo Oficiales',
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
    'tips.pomodoro.desc':    '25 Min. Lernen + 5 Min. Pause. Ideal für Einsteiger.',
    'tips.8weeks':           '8 Wochen vorher',
    'tips.8weeks.desc':      'Personalisierter Wochenlernplan. Mathe: 3 Std./Woche, Deutsch: 2 Std./Woche.',

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

    // Exam generator additional keys
    'exam.gen-type':            'Erstellungsart',
    'exam.gen-random':          '🎲 Zufällig',
    'exam.gen-official':        '📜 Offizielle Prüfung',
    'exam.select-official-desc': 'Wähle eine echte Prüfung aus den Vorjahren:',
    'exam.all-diffs':           'Alle',
    'exam.questions-count':     'Anzahl der Fragen',
    'exam.modality':            'Prüfungsmodus',
    'exam.practice-mode-desc':   'Kein Timer. Gehe in deinem eigenen Tempo. Sofortiges Feedback.',
    'exam.simulation-mode-desc': 'Mit offiziellem DIA-Timer. Unter echten Bedingungen.',
    'exam.summary-title':       '📋 Zusammenfassung',

    // Exam Bank specific keys (de)
    'bank.search-placeholder':  '🔍 Suche nach Thema, Jahr, Schlüsselwort...',
    'bank.all-subjects':        'Alle Fächer',
    'bank.all-difficulties':    'Alle Schwierigkeitsgrade',
    'bank.clear':               'Löschen',
    'bank.total-questions':     'Fragen insgesamt',
    'bank.easy-questions':      'Leicht',
    'bank.medium-questions':    'Mittel',
    'bank.hard-questions':      'Schwer',
    'bank.tab-test':            '❓ Multiple-Choice-Fragen',
    'bank.tab-written':         '📜 Offizielle schriftliche Prüfungen',
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
    this.updateUserUI(); // Update level text
    this.setupLangSwitcher(); // Rebind any new switcher elements
    
    // Dynamically update document tab title based on page context
    const navKeyMap = {
      'index.html': 'nav.dashboard',
      'subjects.html': 'nav.subjects',
      'exam-generator.html': 'nav.exam-gen',
      'exam-bank.html': 'nav.exam-bank',
      'progress.html': 'nav.progress',
      'study-tips.html': 'nav.study-tips',
      'study-material.html': 'nav.study-material',
      'admin.html': 'nav.admin'
    };
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const translationKey = navKeyMap[page] || 'nav.dashboard';
    document.title = `AbiturDSV — ${this.t(translationKey)}`;

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
      // Do not overwrite translation keys that are inside dynamic subject/material panels which render separately
      if (el.closest('#materialPanel') || el.closest('#subjectPanel')) return;

      const key = el.dataset.i18n;
      const text = this.t(key);
      if (el.tagName === 'INPUT' && el.type !== 'submit') {
        el.placeholder = text;
      } else if (el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      if (el.closest('#materialPanel') || el.closest('#subjectPanel')) return;
      el.title = this.t(el.dataset.i18nTitle);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
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
    this.initFontSizeControl(); // Run first to apply saved font scaling class on html tag
    
    // Set dynamic tab title on page load
    const navKeyMap = {
      'index.html': 'nav.dashboard',
      'subjects.html': 'nav.subjects',
      'exam-generator.html': 'nav.exam-gen',
      'exam-bank.html': 'nav.exam-bank',
      'progress.html': 'nav.progress',
      'study-tips.html': 'nav.study-tips',
      'study-material.html': 'nav.study-material',
      'admin.html': 'nav.admin'
    };
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const translationKey = navKeyMap[page] || 'nav.dashboard';
    document.title = `AbiturDSV — ${this.t(translationKey)}`;

    this.applyTranslations();
    this.markActivePage();
    this.updateUserUI();
    // Update daily streak
    if (this.currentUser) {
      Progress.updateStreak();
    }
  },

  // ── Font Size Control (A+ / A-) ──────────────────────────────
  initFontSizeControl() {
    let sizeClass = localStorage.getItem('abitur_font_size') || 'normal';
    this.applyFontSize(sizeClass);

    // Use event delegation on the document to avoid listener detachment on dynamic loads
    document.addEventListener('click', (e) => {
      const btnIncrease = e.target.closest('#btnFontSizeIncrease');
      const btnDecrease = e.target.closest('#btnFontSizeDecrease');

      if (btnIncrease) {
        e.preventDefault();
        let current = localStorage.getItem('abitur_font_size') || 'normal';
        let next = current === 'normal' ? 'large' : current === 'small' ? 'normal' : 'large';
        localStorage.setItem('abitur_font_size', next);
        this.applyFontSize(next);
      } else if (btnDecrease) {
        e.preventDefault();
        let current = localStorage.getItem('abitur_font_size') || 'normal';
        let next = current === 'normal' ? 'small' : current === 'large' ? 'normal' : 'small';
        localStorage.setItem('abitur_font_size', next);
        this.applyFontSize(next);
      }
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
    // Bind active state classes
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    if (!window._langBoundDelegated) {
      window._langBoundDelegated = true;
      document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn[data-lang]');
        if (btn) {
          e.preventDefault();
          this.setLang(btn.dataset.lang);
        }
      });
    }
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
