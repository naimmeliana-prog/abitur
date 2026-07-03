/* ============================================================
   PROGRESS.JS — Gamification & XP System
   Levels, Achievements, Streak, History
   ============================================================ */

'use strict';

const Progress = {
  STORAGE_PREFIX: 'abitur_progress_',

  // ── Level System ─────────────────────────────────────────────
  LEVELS: [
    { level: 1,  name: 'Schüler',          xpRequired: 0,     icon: '📚', color: '#6B7A99' },
    { level: 2,  name: 'Lernender',         xpRequired: 100,   icon: '✏️', color: '#3498DB' },
    { level: 3,  name: 'Fleißiger',         xpRequired: 250,   icon: '💪', color: '#27AE60' },
    { level: 4,  name: 'Wissbegieriger',    xpRequired: 500,   icon: '🔍', color: '#F39C12' },
    { level: 5,  name: 'Gymnasiast',        xpRequired: 1000,  icon: '🏫', color: '#E67E22' },
    { level: 6,  name: 'Fortgeschrittener', xpRequired: 2000,  icon: '⚡', color: '#E74C3C' },
    { level: 7,  name: 'Vorbereiter',       xpRequired: 3500,  icon: '🎯', color: '#9B59B6' },
    { level: 8,  name: 'Experte',           xpRequired: 5000,  icon: '🏆', color: '#F5C842' },
    { level: 9,  name: 'Meister',           xpRequired: 7500,  icon: '🌟', color: '#F5C842' },
    { level: 10, name: 'Abiturient',        xpRequired: 10000, icon: '🎓', color: '#F5C842' },
  ],

  ACHIEVEMENTS: [
    { id: 'first_exam',      name: 'Primer Examen',         nameDE: 'Erste Prüfung',        icon: '📝', desc: 'Completa tu primer examen',           descDE: 'Erste Prüfung abgeschlossen',     xp: 50  },
    { id: 'streak_3',        name: '3 Días Seguidos',       nameDE: '3 Tage in Folge',      icon: '🔥', desc: '3 días de estudio consecutivos',     descDE: '3 aufeinanderfolgende Lerntage',  xp: 75  },
    { id: 'streak_7',        name: 'Una Semana Perfecta',   nameDE: 'Perfekte Woche',       icon: '🔥', desc: '7 días de estudio consecutivos',     descDE: '7 aufeinanderfolgende Lerntage',  xp: 150 },
    { id: 'streak_30',       name: 'Un Mes Imparable',      nameDE: 'Unaufhaltsamer Monat', icon: '🔥', desc: '30 días de estudio consecutivos',    descDE: '30 Tage am Stück',               xp: 500 },
    { id: 'perfect_score',   name: 'Nota Perfecta',         nameDE: 'Perfekte Note',        icon: '💯', desc: '100% en un examen',                 descDE: '100% in einer Prüfung',          xp: 200 },
    { id: 'all_subjects',    name: 'Completo',               nameDE: 'Vollständig',         icon: '🌍', desc: 'Prueba las 5 asignaturas',           descDE: 'Alle 5 Fächer probiert',         xp: 100 },
    { id: 'night_owl',       name: 'Búho Nocturno',         nameDE: 'Nachteule',            icon: '🦉', desc: 'Estudia después de las 23:00',       descDE: 'Nach 23 Uhr lernen',             xp: 50  },
    { id: 'speed_demon',     name: 'Rayo',                  nameDE: 'Blitz',                icon: '⚡', desc: 'Simulacro con 5+ minutos de sobra',  descDE: 'Simulation mit >5 Min. übrig',   xp: 100 },
    { id: 'deutsch_master',  name: 'Deutschkenner',         nameDE: 'Deutschkenner',        icon: '🇩🇪', desc: '5 exámenes de Alemán',              descDE: '5 Deutsch-Prüfungen',            xp: 150 },
    { id: 'math_genius',     name: 'Genio Matemático',      nameDE: 'Mathematikgenie',      icon: '🧮', desc: '5 exámenes de Matemáticas',          descDE: '5 Mathematik-Prüfungen',         xp: 150 },
    { id: 'level_5',         name: 'Gymnasiast',            nameDE: 'Gymnasiast',           icon: '🏫', desc: 'Alcanza el nivel 5',                 descDE: 'Level 5 erreicht',               xp: 250 },
    { id: 'level_10',        name: 'Abiturient',            nameDE: 'Abiturient',           icon: '🎓', desc: '¡Nivel máximo! Preparado para el Abitur', descDE: 'Höchstes Level! Abitur-bereit', xp: 1000 },
  ],

  // ── Storage Key ──────────────────────────────────────────────
  key(username) {
    return this.STORAGE_PREFIX + (username || Auth.getCurrentUser()?.username || 'guest');
  },

  // ── Init for new user ─────────────────────────────────────────
  initForUser(username) {
    const key = this.STORAGE_PREFIX + username;
    if (!localStorage.getItem(key)) {
      const data = {
        xp: 0,
        level: 1,
        streak: 0,
        bestStreak: 0,
        lastStudyDate: null,
        totalExams: 0,
        totalTime: 0, // seconds
        achievements: [],
        history: [],
        subjectStats: {
          deutsch:     { exams: 0, avgScore: 0, totalScore: 0, totalTime: 0 },
          englisch:    { exams: 0, avgScore: 0, totalScore: 0, totalTime: 0 },
          mathe:       { exams: 0, avgScore: 0, totalScore: 0, totalTime: 0 },
          espanol:     { exams: 0, avgScore: 0, totalScore: 0, totalTime: 0 },
          philosophie: { exams: 0, avgScore: 0, totalScore: 0, totalTime: 0 },
        },
        flashcardReviews: {},
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  // ── Get data ──────────────────────────────────────────────────
  getData() {
    try {
      const data = JSON.parse(localStorage.getItem(this.key()) || 'null');
      if (!data) {
        const user = Auth.getCurrentUser();
        if (user) this.initForUser(user.username);
        return JSON.parse(localStorage.getItem(this.key()) || '{}');
      }
      return data;
    } catch { return {}; }
  },

  // ── Save data ─────────────────────────────────────────────────
  saveData(data) {
    localStorage.setItem(this.key(), JSON.stringify(data));
  },

  // ── Level info from XP ────────────────────────────────────────
  getLevelInfo(xp) {
    let current = this.LEVELS[0];
    let next = this.LEVELS[1];
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVELS[i].xpRequired) {
        current = this.LEVELS[i];
        next = this.LEVELS[i + 1] || null;
        break;
      }
    }
    const xpInLevel = xp - current.xpRequired;
    const xpNeeded  = next ? next.xpRequired - current.xpRequired : 999999;
    return {
      level: current.level,
      name: current.name,
      icon: current.icon,
      color: current.color,
      xp,
      xpInLevel,
      xpNeeded,
      nextLevel: next,
      progress: next ? Math.round((xpInLevel / xpNeeded) * 100) : 100,
    };
  },

  // ── Add XP ────────────────────────────────────────────────────
  addXP(amount, sourceX, sourceY) {
    const data = this.getData();
    const oldLevel = this.getLevelInfo(data.xp).level;
    data.xp += amount;
    const newLevelInfo = this.getLevelInfo(data.xp);
    data.level = newLevelInfo.level;
    this.saveData(data);

    // Show floating XP
    if (typeof App !== 'undefined') {
      App.showXPGain(amount, sourceX, sourceY);
    }

    // Level up!
    if (newLevelInfo.level > oldLevel) {
      this.onLevelUp(newLevelInfo);
    }

    return newLevelInfo;
  },

  // ── Level Up Event ────────────────────────────────────────────
  onLevelUp(levelInfo) {
    if (typeof App !== 'undefined') {
      App.launchConfetti();
      App.showToast(`🎉 ¡Nivel ${levelInfo.level} desbloqueado! — ${levelInfo.name}`, 'success', 5000);
    }

    // Check level achievements
    if (levelInfo.level === 5) this.unlock('level_5');
    if (levelInfo.level === 10) this.unlock('level_10');

    // Show level up modal
    const overlay = document.getElementById('levelUpOverlay');
    if (overlay) {
      document.getElementById('levelUpNumber').textContent = levelInfo.level;
      document.getElementById('levelUpName').textContent = levelInfo.name;
      document.getElementById('levelUpIcon').textContent = levelInfo.icon;
      overlay.classList.add('show');
      setTimeout(() => overlay.classList.remove('show'), 4000);
    }
  },

  // ── Record exam result ────────────────────────────────────────
  recordExam({ subject, score, total, time, mode, year }) {
    const data = this.getData();
    const percentage = Math.round((score / total) * 100);

    // History entry
    const entry = {
      id: Date.now(),
      subject,
      score,
      total,
      percentage,
      time,
      mode,
      year: year || 'Personalizado',
      date: new Date().toISOString(),
    };
    data.history.unshift(entry);
    if (data.history.length > 200) data.history = data.history.slice(0, 200);

    // Subject stats
    if (data.subjectStats[subject]) {
      const s = data.subjectStats[subject];
      s.exams++;
      s.totalScore += percentage;
      s.avgScore = Math.round(s.totalScore / s.exams);
      s.totalTime += (time || 0);
    }

    // Overall
    data.totalExams++;
    data.totalTime += (time || 0);

    // XP calculation
    let xp = 50; // base
    if (percentage >= 90) xp += 50;
    else if (percentage >= 75) xp += 30;
    else if (percentage >= 60) xp += 15;
    if (mode === 'simulacro') xp += 20;
    if (percentage === 100) xp += 50;

    this.saveData(data);
    this.addXP(xp);

    // Achievements
    if (data.totalExams === 1) this.unlock('first_exam');
    if (percentage === 100) this.unlock('perfect_score');
    this.checkSubjectAchievements(data, subject);
    this.checkAllSubjectsAchievement(data);

    // Night owl
    if (new Date().getHours() >= 23) this.unlock('night_owl');

    return { xp, levelInfo: this.getLevelInfo(data.xp + xp) };
  },

  // ── Achievements ──────────────────────────────────────────────
  unlock(achievementId) {
    const data = this.getData();
    if (data.achievements.includes(achievementId)) return;

    const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    data.achievements.push(achievementId);
    this.saveData(data);

    // Add XP for achievement
    this.addXP(achievement.xp);

    const lang = localStorage.getItem('abitur_lang') || 'es';
    const name = lang === 'de' ? achievement.nameDE : achievement.name;

    if (typeof App !== 'undefined') {
      App.showToast(`🏆 Logro desbloqueado: ${name}`, 'success', 4000);
    }
  },

  checkSubjectAchievements(data, subject) {
    const s = data.subjectStats[subject];
    if (!s) return;
    if (s.exams >= 5 && subject === 'deutsch')  this.unlock('deutsch_master');
    if (s.exams >= 5 && subject === 'mathe')    this.unlock('math_genius');
  },

  checkAllSubjectsAchievement(data) {
    const subjects = ['deutsch','englisch','mathe','espanol','philosophie'];
    const allTried = subjects.every(s => (data.subjectStats[s]?.exams || 0) > 0);
    if (allTried) this.unlock('all_subjects');
  },

  // ── Streak ────────────────────────────────────────────────────
  updateStreak() {
    const data = this.getData();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastStudyDate === today) return; // Already counted today

    if (data.lastStudyDate === yesterday) {
      data.streak++;
    } else if (data.lastStudyDate !== today) {
      data.streak = 1; // Reset
    }

    data.bestStreak = Math.max(data.streak, data.bestStreak || 0);
    data.lastStudyDate = today;
    this.saveData(data);

    // Streak XP
    this.addXP(10);

    // Streak achievements
    if (data.streak >= 3)  this.unlock('streak_3');
    if (data.streak >= 7)  this.unlock('streak_7');
    if (data.streak >= 30) this.unlock('streak_30');
  },

  // ── Get grade (Abitur scale) ──────────────────────────────────
  getGrade(percentage) {
    if (percentage >= 95) return { grade: '1', text: 'Muy bueno (15)',  textDE: 'Sehr gut',       css: 'grade-excellent' };
    if (percentage >= 85) return { grade: '2', text: 'Bueno (11-14)',   textDE: 'Gut',             css: 'grade-good' };
    if (percentage >= 70) return { grade: '3', text: 'Satisfactorio',   textDE: 'Befriedigend',    css: 'grade-good' };
    if (percentage >= 50) return { grade: '4', text: 'Suficiente',      textDE: 'Ausreichend',     css: 'grade-pass' };
    return { grade: '5', text: 'No superado',    textDE: 'Nicht bestanden', css: 'grade-fail' };
  },

  // ── Points scale (15-Punkte-System) ──────────────────────────
  getPoints(percentage) {
    if (percentage >= 95) return 15;
    if (percentage >= 90) return 14;
    if (percentage >= 85) return 13;
    if (percentage >= 80) return 12;
    if (percentage >= 75) return 11;
    if (percentage >= 70) return 10;
    if (percentage >= 65) return 9;
    if (percentage >= 60) return 8;
    if (percentage >= 55) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 45) return 5;
    if (percentage >= 40) return 4;
    if (percentage >= 33) return 3;
    if (percentage >= 27) return 2;
    if (percentage >= 20) return 1;
    return 0;
  },
};
