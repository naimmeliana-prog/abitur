/* ============================================================
   AI-GENERATOR.JS — AI-powered question generator
   Supports: Gemini (Google AI Studio), OpenRouter, Nvidia NIM
   All calls are client-side — no backend required.
   API keys stored in localStorage (user-provided).
   ============================================================ */

'use strict';

const AIGenerator = {

  // ── Provider configurations ──────────────────────────────────
  providers: {
    gemini: {
      name: 'Gemini (Google)',
      icon: '✨',
      models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'],
      defaultModel: 'gemini-2.0-flash',
      free: true,
      rateLimit: '1500 req/día',
      getKeyUrl: 'https://aistudio.google.com/app/apikey',
      placeholder: 'AIza...',
    },
    openrouter: {
      name: 'OpenRouter',
      icon: '🔀',
      models: [
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'mistralai/mistral-7b-instruct:free',
        'google/gemma-3-27b-it:free',
      ],
      defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
      free: true,
      rateLimit: '~200 req/día (gratuito)',
      getKeyUrl: 'https://openrouter.ai/keys',
      placeholder: 'sk-or-...',
    },
    nvidia: {
      name: 'Nvidia NIM',
      icon: '🖥️',
      models: [
        'meta/llama-3.1-70b-instruct',
        'mistralai/mistral-7b-instruct-v0.3',
        'microsoft/phi-3-medium-128k-instruct',
      ],
      defaultModel: 'meta/llama-3.1-70b-instruct',
      free: true,
      rateLimit: '1000 req/mes',
      getKeyUrl: 'https://build.nvidia.com/',
      placeholder: 'nvapi-...',
    },
  },

  // ── Settings (from localStorage) ────────────────────────────
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('ai_settings') || '{}');
    } catch { return {}; }
  },

  saveSettings(settings) {
    localStorage.setItem('ai_settings', JSON.stringify(settings));
  },

  getApiKey(provider) {
    return this.getSettings()[`${provider}_key`] || '';
  },

  getSelectedProvider() {
    return this.getSettings().provider || 'gemini';
  },

  getSelectedModel(provider) {
    const p = provider || this.getSelectedProvider();
    return this.getSettings()[`${p}_model`] || this.providers[p]?.defaultModel || '';
  },

  // ── AI-generated question cache (localStorage) ───────────────
  getAiQuestions(subjectId) {
    try {
      return JSON.parse(localStorage.getItem(`ai_questions_${subjectId}`) || '[]');
    } catch { return []; }
  },

  saveAiQuestions(subjectId, questions) {
    localStorage.setItem(`ai_questions_${subjectId}`, JSON.stringify(questions));
  },

  appendAiQuestions(subjectId, newQuestions) {
    const existing = this.getAiQuestions(subjectId);
    // Deduplicate by question text
    const existingTexts = new Set(existing.map(q => q.question?.es || q.question));
    const unique = newQuestions.filter(q => {
      const text = q.question?.es || q.question;
      return text && !existingTexts.has(text);
    });
    const merged = [...existing, ...unique];
    this.saveAiQuestions(subjectId, merged);
    return unique.length;
  },

  clearAiQuestions(subjectId) {
    localStorage.removeItem(`ai_questions_${subjectId}`);
  },

  // ── Build prompt ──────────────────────────────────────────────
  buildPrompt(subjectId, subjectData, lang, count) {
    const subjectNames = {
      deutsch: 'Alemán (Deutsch) — Literatura y Lengua Alemana',
      englisch: 'Inglés (Englisch) — Literature, Grammar & Topics',
      mathe: 'Matemáticas (Mathematik) — Analysis, Stochastik, Geometrie',
      espanol: 'Español — Literatura y Lengua Española',
      philosophie: 'Filosofía (Philosophie) — Historia de la Filosofía y Ética',
    };

    // Extract formula summaries for context
    let contextSummary = '';
    if (subjectData?.formulas?.length) {
      const topics = subjectData.formulas.map(f => {
        const cat = f.category?.es || f.category?.de || '';
        const items = (f.items || []).map(i => i.title?.es || i.title?.de || '').join(', ');
        return `• ${cat}: ${items}`;
      }).join('\n');
      contextSummary = `\nTEMARIO DISPONIBLE (usa estos temas):\n${topics}`;
    }

    return `Eres un profesor experto del Abitur DIA (Deutsches Internationales Abitur) en España.
Genera exactamente ${count} preguntas de tipo test (opción múltiple) para la asignatura: ${subjectNames[subjectId] || subjectId}.
${contextSummary}

INSTRUCCIONES CRÍTICAS:
1. Cada pregunta debe tener EXACTAMENTE 4 opciones (a, b, c, d).
2. Solo UNA opción es correcta.
3. Las opciones incorrectas deben ser plausibles pero claramente erróneas para quien estudia.
4. Incluye una explicación clara y educativa de por qué la respuesta es correcta.
5. Varía los temas — no repitas conceptos.
6. Nivel: Abitur (bachillerato avanzado), no demasiado fácil.
7. Responde SOLO con un array JSON válido, sin texto adicional, sin markdown, sin bloques de código.

FORMATO JSON EXACTO (array de objetos):
[
  {
    "question": "Texto completo de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0,
    "explanation": "Explicación clara de por qué la opción A es correcta y las demás no.",
    "difficulty": "medium",
    "topic": "Tema concreto de la pregunta"
  }
]

Valores posibles para "correct": 0 (A), 1 (B), 2 (C), 3 (D).
Valores para "difficulty": "easy", "medium", "hard".
Genera exactamente ${count} preguntas. SOLO el array JSON, nada más.`;
  },

  // ── Call Gemini API ───────────────────────────────────────────
  async callGemini(apiKey, model, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  },

  // ── Call OpenRouter API ───────────────────────────────────────
  async callOpenRouter(apiKey, model, prompt) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AbiturDSV',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenRouter API error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Call Nvidia NIM API ───────────────────────────────────────
  async callNvidia(apiKey, model, prompt) {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful exam question generator. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Nvidia API error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Parse AI response ─────────────────────────────────────────
  parseResponse(text, subjectId) {
    // Try to extract JSON array from response
    let cleaned = text.trim();

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // If response is a JSON object with an array inside
    if (cleaned.startsWith('{')) {
      try {
        const obj = JSON.parse(cleaned);
        // Find the first array value
        const arr = Object.values(obj).find(v => Array.isArray(v));
        if (arr) cleaned = JSON.stringify(arr);
      } catch {}
    }

    // Find array boundaries
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('No se encontró un array JSON en la respuesta');

    const jsonStr = cleaned.slice(start, end + 1);
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('La IA no devolvió preguntas válidas');
    }

    // Normalize and validate questions
    return questions
      .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct === 'number')
      .map((q, i) => ({
        id: `ai_${subjectId}_${Date.now()}_${i}`,
        subjectId,
        question: q.question,
        options: q.options.map(String),
        correct: Math.max(0, Math.min(3, Math.floor(q.correct))),
        explanation: q.explanation || '',
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        topic: q.topic || '',
        isAI: true,
        generatedAt: new Date().toISOString(),
      }));
  },

  // ── Main generate function ────────────────────────────────────
  async generate({ subjectId, subjectData, count = 10, onProgress }) {
    const provider = this.getSelectedProvider();
    const model = this.getSelectedModel(provider);
    const apiKey = this.getApiKey(provider);

    if (!apiKey) throw new Error(`No hay API key para ${this.providers[provider]?.name}. Configúrala en Ajustes de IA.`);
    if (!model) throw new Error('No se ha seleccionado un modelo');

    if (onProgress) onProgress('Construyendo prompt con el temario...', 10);

    const prompt = this.buildPrompt(subjectId, subjectData, 'es', count);

    if (onProgress) onProgress(`Llamando a ${this.providers[provider]?.name} (${model})...`, 30);

    let rawText = '';
    try {
      if (provider === 'gemini') {
        rawText = await this.callGemini(apiKey, model, prompt);
      } else if (provider === 'openrouter') {
        rawText = await this.callOpenRouter(apiKey, model, prompt);
      } else if (provider === 'nvidia') {
        rawText = await this.callNvidia(apiKey, model, prompt);
      } else {
        throw new Error(`Proveedor desconocido: ${provider}`);
      }
    } catch (e) {
      throw new Error(`Error llamando a la API: ${e.message}`);
    }

    if (onProgress) onProgress('Procesando respuesta de la IA...', 70);

    const questions = this.parseResponse(rawText, subjectId);

    if (onProgress) onProgress('Guardando preguntas generadas...', 90);

    const added = this.appendAiQuestions(subjectId, questions);

    if (onProgress) onProgress(`✅ ${added} preguntas nuevas añadidas`, 100);

    return { questions, added };
  },

  // ── Get all questions (static + AI) for exam engine ──────────
  getEnrichedQuestions(subjectId, staticQuestions) {
    const aiQuestions = this.getAiQuestions(subjectId);
    return [...(staticQuestions || []), ...aiQuestions];
  },

  // ── Stats ─────────────────────────────────────────────────────
  getStats() {
    const subjects = ['deutsch', 'englisch', 'mathe', 'espanol', 'philosophie'];
    const stats = {};
    subjects.forEach(s => {
      stats[s] = this.getAiQuestions(s).length;
    });
    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
    return stats;
  },
};
