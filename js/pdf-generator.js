/* ============================================================
   PDF-GENERATOR.JS — PDF Exam Export
   Uses jsPDF (CDN loaded in HTML)
   ============================================================ */

'use strict';

const PDFGenerator = {

  _sanitizeText(text) {
    if (!text || typeof text !== 'string') return text || '';
    
    // Remove vector arrow combinator (which renders as corrupt overlap)
    let s = text.replace(/\u20d7/g, ''); 
    
    // Replace typical Abitur/DIA symbols with standard ASCII equivalents
    s = s.replace(/→/g, ' -> ');
    s = s.replace(/⇒/g, ' => ');
    s = s.replace(/·/g, ' * ');
    s = s.replace(/×/g, ' x ');
    s = s.replace(/≠/g, ' != ');
    s = s.replace(/≤/g, ' <= ');
    s = s.replace(/≥/g, ' >= ');
    s = s.replace(/π/g, 'pi');
    s = s.replace(/μ/g, 'mu');
    s = s.replace(/σ/g, 'sigma');
    s = s.replace(/Φ/g, 'Phi');
    s = s.replace(/∩/g, ' inter ');
    s = s.replace(/√/g, 'sqrt');
    s = s.replace(/≈/g, ' approx. ');
    s = s.replace(/∫/g, 'integral');
    s = s.replace(/±/g, '+/-');
    s = s.replace(/’/g, "'"); 
    s = s.replace(/`/g, "'");
    
    // Replace vector notations to standard readable forms
    s = s.replace(/([a-zA-Z])⃗/g, 'vec($1)'); 
    s = s.replace(/n₀/g, 'n0');
    
    // Strip emojis
    s = s.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
    
    return s;
  },

  generate(exam, answers, score) {
    // jsPDF must be loaded via CDN
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      App.showToast('PDF: Cargando librería...', 'info');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => this._doGenerate(exam, answers, score);
      document.head.appendChild(script);
      return;
    }
    this._doGenerate(exam, answers, score);
  },

  _doGenerate(exam, answers, score) {
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const lang = localStorage.getItem('abitur_lang') || 'es';
    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const subjectNames = {
      es: { deutsch:'Alemán', englisch:'Inglés', mathe:'Matemáticas', espanol:'Español', philosophie:'Filosofía' },
      de: { deutsch:'Deutsch', englisch:'Englisch', mathe:'Mathematik', espanol:'Spanisch', philosophie:'Philosophie' }
    };

    // ── Header ───────────────────────────────────────────────────
    doc.setFillColor(26, 43, 95); // --color-blue
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(245, 200, 66); // --color-gold
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AbiturDSV', margin, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 240);
    doc.text('Deutsche Schule Valencia — DIA Preparation Platform', margin, 22);

    const dateStr = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'es-ES');
    doc.text(dateStr, pageW - margin, 15, { align: 'right' });

    // Mode badge
    const modeText = exam.mode === 'simulacro'
      ? (lang === 'de' ? 'SIMULATION' : 'SIMULACRO')
      : (lang === 'de' ? 'ÜBUNG' : 'PRÁCTICA');
    doc.setFillColor(245, 200, 66);
    doc.roundedRect(pageW - margin - 28, 20, 28, 8, 2, 2, 'F');
    doc.setTextColor(26, 43, 95);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(modeText, pageW - margin - 14, 25.5, { align: 'center' });

    y = 45;

    // ── Exam Info ─────────────────────────────────────────────────
    doc.setTextColor(50, 50, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const subjNames = exam.subjects.map(s => subjectNames[lang]?.[s] || s).join(' + ');
    doc.text(subjNames, margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 130);
    doc.text(`${lang === 'de' ? 'Schwierigkeit' : 'Dificultad'}: ${exam.difficulty} | ${lang === 'de' ? 'Fragen' : 'Preguntas'}: ${exam.totalQuestions}`, margin, y);
    y += 5;

    // Score if available
    if (score) {
      const gradeInfo = Progress.getGrade(score.percentage);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const scoreColor = score.percentage >= 70 ? [34, 197, 94] : score.percentage >= 50 ? [245, 166, 35] : [239, 68, 68];
      doc.setTextColor(...scoreColor);
      doc.text(`${lang === 'de' ? 'Ergebnis' : 'Resultado'}: ${score.percentage}% — ${lang === 'de' ? gradeInfo.textDE : gradeInfo.text} (${score.correct}/${score.total})`, margin, y);
      y += 5;
    }

    // Divider
    doc.setDrawColor(200, 210, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 10;

    // ── Questions ─────────────────────────────────────────────────
    exam.questions.forEach((q, qi) => {
      // Check page break
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const lang2 = lang;
      const userAnswer = answers?.[qi];
      const isCorrect = userAnswer === q.correct;

      // Question number + topic
      doc.setFillColor(240, 244, 255);
      doc.roundedRect(margin, y - 4, contentW, 7, 1.5, 1.5, 'F');
      doc.setTextColor(45, 74, 158);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${qi + 1}. ${q.topic || ''}`, margin + 3, y + 0.5);

      if (score && userAnswer !== undefined) {
        const resultText = isCorrect ? '✓' : '✗';
        const col = isCorrect ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(...col);
        doc.text(resultText, pageW - margin - 5, y + 0.5);
      }
      y += 10;

      // Question text
      doc.setTextColor(30, 30, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const qText = this._sanitizeText(q.question?.[lang2] || q.question?.es || '');
      const qLines = doc.splitTextToSize(qText, contentW - 8);
      doc.text(qLines, margin + 3, y);
      y += qLines.length * 5 + 3;

      // Options
      (q.options || []).forEach((opt, oi) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const optRaw = typeof opt === 'object' ? (opt[lang2] || opt.es) : opt;
        const optText = this._sanitizeText(optRaw);
        const letter = String.fromCharCode(65 + oi);
        const isUserChoice = userAnswer === oi;
        const isCorrectOpt = oi === q.correct;

        if (score) {
          if (isCorrectOpt) {
            doc.setFillColor(220, 252, 231);
            doc.setDrawColor(34, 197, 94);
          } else if (isUserChoice && !isCorrectOpt) {
            doc.setFillColor(254, 226, 226);
            doc.setDrawColor(239, 68, 68);
          } else {
            doc.setFillColor(248, 250, 255);
            doc.setDrawColor(200, 210, 240);
          }
          doc.setLineWidth(0.3);
          doc.roundedRect(margin + 3, y - 3.5, contentW - 6, 7, 1, 1, 'FD');
        }

        doc.setTextColor(50, 50, 80);
        doc.setFontSize(9);
        doc.setFont('helvetica', isUserChoice ? 'bold' : 'normal');
        const optLines = doc.splitTextToSize(`${letter}) ${optText}`, contentW - 12);
        doc.text(optLines, margin + 7, y + 0.5);
        y += optLines.length * 4.5 + 2;
      });

      // Explanation (if scored and wrong)
      if (score && userAnswer !== undefined && !isCorrect && q.explanation) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFillColor(255, 249, 230);
        doc.setDrawColor(245, 200, 66);
        doc.setLineWidth(0.5);
        
        const label = lang2 === 'de' ? 'Erklärung: ' : 'Explicación: ';
        const expRaw = q.explanation?.[lang2] || q.explanation?.es || '';
        const expText = this._sanitizeText(expRaw);
        const expLines = doc.splitTextToSize(`${label}${expText}`, contentW - 14);
        
        doc.roundedRect(margin + 3, y - 3, contentW - 6, expLines.length * 4.5 + 5, 1.5, 1.5, 'FD');
        doc.setTextColor(100, 80, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(expLines, margin + 6, y + 1);
        y += expLines.length * 4.5 + 8;
      }

      y += 6;
    });

    // ── Footer ────────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 180);
      doc.setFont('helvetica', 'normal');
      doc.text(`AbiturDSV — Deutsche Schule Valencia | DIA Prep | Página ${p}/${totalPages}`, margin, 290);
    }

    // ── Save ──────────────────────────────────────────────────────
    const filename = `AbiturDSV_${exam.subjects.join('-')}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
    if (typeof App !== 'undefined') {
      App.showToast('📄 PDF generado correctamente', 'success');
    }
  },

  generateWrittenExam(subjectId, examId, withSolutions) {
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      App.showToast('PDF: Cargando librería...', 'info');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => this._doGenerateWritten(subjectId, examId, withSolutions);
      document.head.appendChild(script);
      return;
    }
    this._doGenerateWritten(subjectId, examId, withSolutions);
  },

  async _doGenerateWritten(subjectId, examId, withSolutions) {
    if (typeof App !== 'undefined') {
      App.showToast('📄 Generando PDF del examen escrito...', 'info');
    }
    let data;
    try {
      const res = await fetch(`data/${subjectId}.json?t=${Date.now()}`);
      data = await res.json();
    } catch (e) {
      console.error(e);
      if (typeof App !== 'undefined') App.showToast('Error al cargar datos del examen', 'error');
      return;
    }

    const exam = (data.official_exams_archive || []).find(x => x.id === examId);
    if (!exam) {
      if (typeof App !== 'undefined') App.showToast('Examen no encontrado en el archivo', 'error');
      return;
    }

    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const lang = localStorage.getItem('abitur_lang') || 'es';
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    // Header styling
    doc.setFillColor(26, 43, 95); // Deep blue
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(245, 200, 66); // Gold
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AbiturDSV — Schriftliche Prüfung', margin, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 240);
    doc.text('Transversal DIA Written Exam Simulator | Deutsche Schule Valencia', margin, 26);

    const typeLabel = withSolutions 
      ? (lang === 'de' ? 'MUSTERLÖSUNG' : 'EXAMEN RESUELTO')
      : (lang === 'de' ? 'PRÜFUNGSBLATT' : 'ENUNCIADOS');
    doc.setFillColor(withSolutions ? [34, 197, 94] : [245, 200, 66]);
    doc.roundedRect(pageW - margin - 38, 20, 38, 8, 2, 2, 'F');
    doc.setTextColor(26, 43, 95);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(typeLabel, pageW - margin - 19, 25.5, { align: 'center' });

    y = 52;

    // Title
    doc.setTextColor(26, 43, 95);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const examTitleLines = doc.splitTextToSize(this._sanitizeText(exam.title), contentW);
    doc.text(examTitleLines, margin, y);
    y += examTitleLines.length * 5 + 3;

    // Intro text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 100);
    const introRaw = exam.intro?.[lang] || exam.intro?.es || '';
    const introLines = doc.splitTextToSize(this._sanitizeText(introRaw), contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 4.5 + 8;

    // Divider
    doc.setDrawColor(200, 210, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // Draw Blocks & Tasks
    (exam.blocks || []).forEach((block, bi) => {
      if (y > 250) { doc.addPage(); y = 20; }

      // Block header
      doc.setFillColor(240, 244, 255);
      doc.rect(margin, y - 4, contentW, 8, 'F');
      doc.setDrawColor(26, 43, 95);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 4, margin, y + 4); // Left accent border

      doc.setTextColor(26, 43, 95);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(this._sanitizeText(block.name), margin + 4, y + 1.5);
      y += 12;

      (block.tasks || []).forEach((task, ti) => {
        if (y > 245) { doc.addPage(); y = 20; }

        // Task Title
        doc.setTextColor(212, 163, 11); // Goldish text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(this._sanitizeText(`${task.title} (${task.points} Puntos / Punkte)`), margin, y);
        y += 6;

        // Question text
        doc.setTextColor(40, 40, 60);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        const qRaw = task.question?.[lang] || task.question?.es || '';
        const qText = this._sanitizeText(qRaw);
        const qLines = doc.splitTextToSize(qText, contentW - 5);
        doc.text(qLines, margin, y);
        y += qLines.length * 5 + 6;

        if (!withSolutions) {
          // Add blank lines for student writing space
          const numLines = Math.max(4, Math.floor(task.points * 1.5));
          for (let i = 0; i < numLines; i++) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(margin, y, pageW - margin, y);
            y += 7;
          }
          y += 5;
        } else {
          // Draw Solutions, Criteria, and Recommendations
          if (task.solution) {
            if (y > 250) { doc.addPage(); y = 20; }
            const solRaw = task.solution?.[lang] || task.solution?.es || '';
            const solLines = doc.splitTextToSize(this._sanitizeText(solRaw), contentW - 8);
            const boxH = solLines.length * 4.5 + 8;
            
            doc.setFillColor(243, 249, 243); // Light green box
            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, y - 4, contentW, boxH, 1.5, 1.5, 'FD');
            
            doc.setTextColor(21, 128, 61);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(lang === 'de' ? 'Musterlösung:' : 'Solución oficial:', margin + 4, y);
            
            doc.setTextColor(60, 60, 80);
            doc.setFont('helvetica', 'normal');
            doc.text(solLines, margin + 4, y + 5.5);
            y += boxH + 6;
          }

          if (task.criteria) {
            if (y > 250) { doc.addPage(); y = 20; }
            const critRaw = task.criteria?.[lang] || task.criteria?.es || '';
            const critLines = doc.splitTextToSize(this._sanitizeText(critRaw), contentW - 8);
            const boxH = critLines.length * 4.5 + 8;
            
            doc.setFillColor(255, 251, 235); // Light yellow box
            doc.setDrawColor(245, 158, 11);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, y - 4, contentW, boxH, 1.5, 1.5, 'FD');
            
            doc.setTextColor(180, 83, 9);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(lang === 'de' ? 'Bewertungskriterien (Erwartungshorizont):' : 'Criterios de Corrección (Erwartungshorizont):', margin + 4, y);
            
            doc.setTextColor(60, 60, 80);
            doc.setFont('helvetica', 'normal');
            doc.text(critLines, margin + 4, y + 5.5);
            y += boxH + 6;
          }

          if (task.recommendation) {
            if (y > 250) { doc.addPage(); y = 20; }
            const recRaw = task.recommendation?.[lang] || task.recommendation?.es || '';
            const recLines = doc.splitTextToSize(this._sanitizeText(recRaw), contentW - 8);
            const boxH = recLines.length * 4.5 + 8;
            
            doc.setFillColor(254, 242, 242); // Light red box
            doc.setDrawColor(239, 68, 68);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, y - 4, contentW, boxH, 1.5, 1.5, 'FD');
            
            doc.setTextColor(185, 28, 28);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(lang === 'de' ? 'Korrektoren-Tipps & Fehlerquellen:' : 'Consejos y Trampas del Tribunal:', margin + 4, y);
            
            doc.setTextColor(60, 60, 80);
            doc.setFont('helvetica', 'normal');
            doc.text(recLines, margin + 4, y + 5.5);
            y += boxH + 6;
          }
        }
        y += 4;
      });
      y += 5;
    });

    // Page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 180);
      doc.text(`AbiturDSV — Deutsche Schule Valencia | DIA written exam: ${subjectId} | Page ${p}/${totalPages}`, margin, pageH - 8);
    }

    const filename = `AbiturDSV_Written_${subjectId}_${examId}_${withSolutions ? 'Solved' : 'Blank'}.pdf`;
    doc.save(filename);
    if (typeof App !== 'undefined') {
      App.showToast('📄 PDF del examen generado correctamente', 'success');
    }
  },
};
