/* ============================================================
   PDF-GENERATOR.JS — PDF Exam Export
   Uses jsPDF (CDN loaded in HTML)
   ============================================================ */

'use strict';

const PDFGenerator = {

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
      const qText = q.question?.[lang2] || q.question?.es || '';
      const qLines = doc.splitTextToSize(qText, contentW - 5);
      doc.text(qLines, margin + 3, y);
      y += qLines.length * 5 + 3;

      // Options
      (q.options || []).forEach((opt, oi) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const optText = typeof opt === 'object' ? (opt[lang2] || opt.es) : opt;
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
        const expText = q.explanation?.[lang2] || q.explanation?.es || '';
        const expLines = doc.splitTextToSize(`💡 ${expText}`, contentW - 10);
        doc.roundedRect(margin + 3, y - 3, contentW - 6, expLines.length * 4.5 + 5, 1.5, 1.5, 'FD');
        doc.setTextColor(100, 80, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
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
};
