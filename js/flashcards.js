/* ============================================================
   FLASHCARDS.JS — Leitner System for AbiturDSV
   ============================================================ */

'use strict';

const FlashcardsApp = {
  SUBJECTS_META: [
    { id: 'deutsch',     name: 'Alemán',     nameDE: 'Deutsch',     icon: '🇩🇪', color: 'deutsch',     file: 'deutsch.json' },
    { id: 'englisch',    name: 'Inglés',     nameDE: 'Englisch',    icon: '🇬🇧', color: 'englisch',    file: 'englisch.json' },
    { id: 'mathe',       name: 'Matemáticas',nameDE: 'Mathematik',  icon: '📐', color: 'mathe',       file: 'mathe.json' },
    { id: 'espanol',     name: 'Español',    nameDE: 'Español',     icon: '🇪🇸', color: 'espanol',     file: 'espanol.json' },
    { id: 'philosophie', name: 'Filosofía',  nameDE: 'Philosophie', icon: '🧠', color: 'philosophie', file: 'philosophie.json' }
  ],

  currentSubject: null,
  subjectData: null,
  cards: [],
  currentIndex: 0,
  isFlipped: false,

  async init() {
    App.init();
    
    // Set up translation hook
    window.onLangChange = () => {
      this.renderTabs();
      this.renderUI();
    };

    // Render tabs
    this.renderTabs();

    // Default subject
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    if (s && this.SUBJECTS_META.some(sub => sub.id === s)) {
      await this.selectSubject(s);
    } else {
      await this.selectSubject('deutsch');
    }

    // Set up event listeners
    document.getElementById('flashcardContainer').addEventListener('click', () => this.toggleFlip());
    document.getElementById('btnPrevCard').addEventListener('click', () => this.prevCard());
    document.getElementById('btnNextCard').addEventListener('click', () => this.nextCard());
    document.getElementById('btnEvalHard').addEventListener('click', () => this.evaluateCard(false));
    document.getElementById('btnEvalEasy').addEventListener('click', () => this.evaluateCard(true));
  },

  renderTabs() {
    const lang = App.currentLang;
    const tabsContainer = document.getElementById('flashcardSubjectTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = this.SUBJECTS_META.map(s => `
      <button class="difficulty-btn ${this.currentSubject?.id === s.id ? 'selected easy' : ''}"
        style="min-width:100px;"
        onclick="FlashcardsApp.selectSubject('${s.id}')">
        ${s.icon} ${lang === 'de' ? s.nameDE : s.name}
      </button>`).join('');
  },

  async selectSubject(id) {
    const meta = this.SUBJECTS_META.find(s => s.id === id);
    if (!meta) return;
    this.currentSubject = meta;
    this.renderTabs();

    // Show loading
    document.getElementById('frontText').innerHTML = `<div style="text-align:center;padding:50px 0;"><div class="spinner"></div></div>`;
    document.getElementById('backText').innerHTML = `...`;

    try {
      const res = await fetch(`data/${meta.file}?t=${Date.now()}`);
      this.subjectData = await res.json();
      this.loadCards();
    } catch (e) {
      document.getElementById('frontText').textContent = 'Error cargando las tarjetas de estudio.';
    }
  },

  loadCards() {
    if (!this.subjectData) return;
    const lang = App.currentLang;
    const rawQuestions = this.subjectData.questions || [];

    // Parse Leitner box states from localStorage
    const savedBoxState = JSON.parse(localStorage.getItem(`leitner_box_${this.currentSubject.id}`)) || {};

    this.cards = rawQuestions.map((q, idx) => {
      const id = q.id || `q_${idx}`;
      const box = savedBoxState[id] || 1;

      // Question formatting
      let qText = q.question?.[lang] || q.question?.es || q.question || '';
      if (q.options && q.options.length > 0) {
        qText += '\n\n' + q.options.map((opt, oIdx) => {
          const optVal = typeof opt === 'object' ? (opt[lang] || opt.es) : opt;
          return `${String.fromCharCode(65 + oIdx)}) ${optVal}`;
        }).join('\n');
      }

      // Answer formatting
      let aText = '';
      if (q.correct !== undefined && q.options) {
        const correctOpt = q.options[q.correct];
        const correctVal = typeof correctOpt === 'object' ? (correctOpt[lang] || correctOpt.es) : correctOpt;
        aText += `${lang === 'de' ? 'Richtige Antwort' : 'Respuesta correcta'}: ${String.fromCharCode(65 + q.correct)}) ${correctVal}\n\n`;
      }
      const exp = q.explanation?.[lang] || q.explanation?.es || q.explanation || '';
      if (exp) {
        aText += `${lang === 'de' ? 'Erklärung' : 'Explicación'}:\n${exp}`;
      }
      const tip = q.tip?.[lang] || q.tip?.es || q.tip || '';
      if (tip) {
        aText += `\n\n💡 ${tip}`;
      }

      return {
        id,
        question: qText,
        answer: aText || (lang === 'de' ? 'Keine Lösung hinterlegt.' : 'No hay explicación disponible.'),
        box: box,
        topic: q.topic || 'General'
      };
    });

    this.currentIndex = 0;
    this.isFlipped = false;
    document.getElementById('flashcardContainer').classList.remove('flipped');

    this.renderUI();
  },

  renderUI() {
    const lang = App.currentLang;
    const activeCard = this.cards[this.currentIndex];

    // Localized Text
    document.getElementById('boxTitle').textContent = lang === 'de' ? 'Leitner-Boxen' : 'Cajas Leitner';
    document.getElementById('boxSubtitle').textContent = lang === 'de' 
      ? 'Der Leitner-Algorithmus organisiert das Wiederholen je nach Behaltensniveau.'
      : 'El algoritmo Leitner programa tus repasos según el nivel de retención.';

    document.getElementById('frontBadge').textContent = lang === 'de' ? 'FRAGE' : 'PREGUNTA';
    document.getElementById('backBadge').textContent = lang === 'de' ? 'ANTWORT & ERKLÄRUNG' : 'RESPUESTA Y EXPLICACIÓN';
    
    document.getElementById('frontHint').textContent = lang === 'de' ? 'Klicken Sie zum Umdrehen' : 'Haz clic para revelar la respuesta';
    document.getElementById('backHint').textContent = lang === 'de' ? 'Klicken Sie für die Frage' : 'Haz clic para ver la pregunta';

    document.getElementById('btnEvalHard').textContent = lang === 'de' ? '❌ Nicht gewusst' : '❌ No me la sabía';
    document.getElementById('btnEvalEasy').textContent = lang === 'de' ? '✅ Gewusst!' : '✅ ¡Me la sabía!';

    // Render Box counts
    const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.cards.forEach(c => {
      boxCounts[c.box] = (boxCounts[c.box] || 0) + 1;
    });

    const boxesContainer = document.getElementById('leitnerBoxesList');
    boxesContainer.innerHTML = [1, 2, 3, 4, 5].map(bNum => {
      const boxNames = {
        es: ['Diario', 'Cada 2 días', 'Cada 4 días', 'Cada 8 días', 'Cada 16 días'],
        de: ['Täglich', 'Alle 2 Tage', 'Alle 4 Tage', 'Alle 8 Tage', 'Alle 16 Tage']
      };
      const label = boxNames[lang][bNum - 1];
      return `
        <div class="leitner-box-item">
          <span>${lang === 'de' ? 'Box' : 'Caja'} ${bNum} (${label})</span>
          <span class="leitner-box-count">${boxCounts[bNum]}</span>
        </div>
      `;
    }).join('');

    // Render Active Card
    if (!activeCard) {
      document.getElementById('frontText').innerHTML = `<p style="text-align:center;color:var(--text-muted);">${lang === 'de' ? 'Keine Karten vorhanden.' : 'No hay tarjetas de estudio disponibles en esta materia.'}</p>`;
      document.getElementById('backText').textContent = '';
      document.getElementById('evalButtons').style.display = 'none';
      document.getElementById('instructionLabel').style.display = 'block';
      document.getElementById('frontBoxLabel').textContent = '';
      document.getElementById('backBoxLabel').textContent = '';
      return;
    }

    document.getElementById('frontText').textContent = activeCard.question;
    document.getElementById('backText').textContent = activeCard.answer;
    document.getElementById('frontBoxLabel').textContent = `${lang === 'de' ? 'Box' : 'Caja'} ${activeCard.box}`;
    document.getElementById('backBoxLabel').textContent = `${lang === 'de' ? 'Box' : 'Caja'} ${activeCard.box}`;

    this.updateControls();
  },

  updateControls() {
    const evalButtons = document.getElementById('evalButtons');
    const instructionLabel = document.getElementById('instructionLabel');

    if (this.isFlipped) {
      evalButtons.style.display = 'flex';
      instructionLabel.style.display = 'none';
    } else {
      evalButtons.style.display = 'none';
      instructionLabel.style.display = 'block';
    }
  },

  toggleFlip() {
    if (this.cards.length === 0) return;
    this.isFlipped = !this.isFlipped;
    const container = document.getElementById('flashcardContainer');
    if (this.isFlipped) {
      container.classList.add('flipped');
    } else {
      container.classList.remove('flipped');
    }
    this.updateControls();
  },

  prevCard() {
    if (this.cards.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.isFlipped = false;
    document.getElementById('flashcardContainer').classList.remove('flipped');
    this.renderUI();
  },

  nextCard() {
    if (this.cards.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.isFlipped = false;
    document.getElementById('flashcardContainer').classList.remove('flipped');
    this.renderUI();
  },

  evaluateCard(isEasy) {
    if (this.cards.length === 0) return;
    const activeCard = this.cards[this.currentIndex];

    // Leitner Box promotion/demotion logic
    if (isEasy) {
      activeCard.box = Math.min(activeCard.box + 1, 5);
    } else {
      activeCard.box = 1; // Always goes back to box 1 on mistake
    }

    // Save state
    const savedBoxState = JSON.parse(localStorage.getItem(`leitner_box_${this.currentSubject.id}`)) || {};
    savedBoxState[activeCard.id] = activeCard.box;
    localStorage.setItem(`leitner_box_${this.currentSubject.id}`, JSON.stringify(savedBoxState));

    // Notify user via toast
    const lang = App.currentLang;
    const msg = isEasy 
      ? (lang === 'de' ? 'Karte befördert!' : '¡Tarjeta promovida!') 
      : (lang === 'de' ? 'Zurück zu Box 1' : 'De vuelta a la caja 1');
    App.showToast(msg, isEasy ? 'success' : 'warning');

    // Auto-advance
    setTimeout(() => {
      this.nextCard();
    }, 300);
  }
};

// Global accessor
window.FlashcardsApp = FlashcardsApp;

document.addEventListener('DOMContentLoaded', () => {
  FlashcardsApp.init();
});
