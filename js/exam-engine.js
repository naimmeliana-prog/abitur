/* ============================================================
   EXAM-ENGINE.JS — Exam Generator + Autocorrection
   Supports Practice Mode & Simulation Mode
   ============================================================ */

'use strict';

const ExamEngine = {
  currentExam: null,
  currentQuestion: 0,
  answers: {},
  startTime: null,
  timer: null,
  timerSeconds: 0,

  // ── Build exam from data ──────────────────────────────────────
  buildExam({ subjects, difficulty, mode, years, questionCount, officialExamId }) {
    if (officialExamId) {
      const subjectId = subjects[0];
      const data = ExamEngine.getSubjectData(subjectId);
      const officialExam = (data?.official_exams_archive || data?.official_exams || []).find(e => e.id === officialExamId);
      if (officialExam) {
        const questions = officialExam.questions.map(q => ({ ...q, subjectId }));
        const exam = {
          id: Date.now(),
          name: officialExam.title || officialExam.name || 'Examen Oficial',
          mode,
          subjects,
          difficulty: 'all',
          questions: questions,
          totalQuestions: questions.length,
          timeLimit: mode === 'simulacro' ? this.calcTimeLimit(subjects) : null,
          createdAt: new Date().toISOString(),
          year: officialExam.year || 'Oficial',
          isOfficial: true,
        };
        this.currentExam = exam;
        this.currentQuestion = 0;
        this.answers = {};
        this.startTime = Date.now();
        return exam;
      }
    }

    const allQuestions = [];

    subjects.forEach(subjectId => {
      const data = ExamEngine.getSubjectData(subjectId);
      if (!data || !data.questions) return;

      let questions = data.questions.filter(q => {
        const diffMatch = !difficulty || difficulty === 'all' || q.difficulty === difficulty;
        return diffMatch;
      });

      if (questions.length === 0) questions = data.questions;
      allQuestions.push(...questions.map(q => ({ ...q, subjectId })));
    });

    // Shuffle
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount || Math.min(10, shuffled.length));

    const exam = {
      id: Date.now(),
      mode,
      subjects,
      difficulty: difficulty || 'all',
      questions: selected,
      totalQuestions: selected.length,
      timeLimit: mode === 'simulacro' ? this.calcTimeLimit(subjects) : null,
      createdAt: new Date().toISOString(),
      isOfficial: false,
    };

    this.currentExam = exam;
    this.currentQuestion = 0;
    this.answers = {};
    this.startTime = Date.now();

    return exam;
  },

  // ── Time limit for simulacro ──────────────────────────────────
  calcTimeLimit(subjects) {
    const limits = { deutsch: 300*60, mathe: 240*60, englisch: 240*60, espanol: 240*60, philosophie: 20*60 };
    if (subjects.length === 1) return limits[subjects[0]] || 60*60;
    return Math.min(...subjects.map(s => limits[s] || 60*60));
  },

  // ── Answer a question ─────────────────────────────────────────
  answer(questionIndex, optionIndex) {
    if (this.answers[questionIndex] !== undefined) return false; // Already answered
    this.answers[questionIndex] = optionIndex;
    return true;
  },

  // ── Check if answer is correct ────────────────────────────────
  isCorrect(questionIndex) {
    const q = this.currentExam?.questions[questionIndex];
    if (!q) return false;
    return this.answers[questionIndex] === q.correct;
  },

  // ── Calculate score ───────────────────────────────────────────
  calculateScore() {
    if (!this.currentExam) return null;
    const total = this.currentExam.questions.length;
    const answered = Object.keys(this.answers).length;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      if (this.isCorrect(i)) correct++;
    }
    const percentage = Math.round((correct / total) * 100);
    const timeUsed = Math.floor((Date.now() - this.startTime) / 1000);
    return { correct, wrong: answered - correct, total, percentage, timeUsed };
  },

  // ── Submit exam ───────────────────────────────────────────────
  submit() {
    this.stopTimer();
    const score = this.calculateScore();
    if (!score) return null;

    // Record in progress
    const subjects = this.currentExam.subjects;
    subjects.forEach(subject => {
      const subjectQuestions = this.currentExam.questions.filter(q => q.subjectId === subject);
      if (subjectQuestions.length === 0) return;
      const subjectAnswered = subjectQuestions.filter((q, i) => this.answers[this.currentExam.questions.indexOf(q)] !== undefined).length;
      const subjectCorrect = subjectQuestions.filter((q, i) => {
        const idx = this.currentExam.questions.indexOf(q);
        return this.isCorrect(idx);
      }).length;

      Progress.recordExam({
        subject,
        score: subjectCorrect,
        total: subjectQuestions.length,
        time: score.timeUsed,
        mode: this.currentExam.mode,
        year: this.currentExam.year,
      });
    });

    return score;
  },

  // ── Timer ─────────────────────────────────────────────────────
  startTimer(onTick, onExpire) {
    if (!this.currentExam?.timeLimit) return;
    this.timerSeconds = this.currentExam.timeLimit;

    this.timer = setInterval(() => {
      this.timerSeconds--;
      if (onTick) onTick(this.timerSeconds);
      if (this.timerSeconds <= 0) {
        this.stopTimer();
        if (onExpire) onExpire();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  // ── Load subject data from JSON ───────────────────────────────
  subjectDataCache: {},

  async loadSubjectData(subjectId) {
    if (this.subjectDataCache[subjectId]) return this.subjectDataCache[subjectId];
    try {
      const res = await fetch(`data/${subjectId}.json?t=${Date.now()}`);
      const data = await res.json();
      this.subjectDataCache[subjectId] = data;
      return data;
    } catch (e) {
      console.warn(`Could not load data for ${subjectId}:`, e);
      return null;
    }
  },

  getSubjectData(subjectId) {
    return this.subjectDataCache[subjectId] || null;
  },

  async preloadAll() {
    const subjects = ['deutsch','englisch','mathe','espanol','philosophie'];
    await Promise.all(subjects.map(s => this.loadSubjectData(s)));
  },
};
