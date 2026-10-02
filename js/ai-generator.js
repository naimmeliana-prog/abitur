/* ============================================================
   AI-GENERATOR.JS — AI-powered question generator (VERSIÓN ACTUALIZADA)
   Soporta: Gemini (Google AI Studio), Groq, OpenRouter, Nvidia NIM, Cerebras
   All calls are client-side — no backend required.
   API keys stored in localStorage (user-provided).
   ============================================================ */

'use strict';

const AIGenerator = {

  // ── Provider configurations (Modelos 100% activos y gratuitos) ────────
  providers: {
    gemini: {
      name: 'Gemini (Google AI Studio)',
      icon: '✨',
      models: [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro'
      ],
      defaultModel: 'gemini-2.5-flash',
      free: true,
      rateLimit: 'Gratis: 15 RPM / 1.500 req/día (Tier Free de Google AI Studio)',
      getKeyUrl: 'https://aistudio.google.com/app/apikey',
      placeholder: 'AIzaSy...',
      docs: 'gemini-2.5-flash es el modelo recomendado activo. Los modelos 1.5 y 2.0 fueron retirados.',
    },
    groq: {
      name: 'Groq (Ultra-Rápido ~800 t/s)',
      icon: '⚡',
      models: [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'qwen-qwq-32b',
        'deepseek-r1-distill-llama-70b'
      ],
      defaultModel: 'llama-3.3-70b-versatile',
      free: true,
      rateLimit: 'Gratis: 14.400 req/día, hasta 6.000 TPM',
      getKeyUrl: 'https://console.groq.com/keys',
      placeholder: 'gsk_...',
      docs: 'Modelos mixtral-8x7b y gemma2 están apagados. Llama-3.3-70b funciona con máxima precisión.',
    },
    openrouter: {
      name: 'OpenRouter (Modelos :free)',
      icon: '🔀',
      models: [
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemini-2.5-flash:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'deepseek/deepseek-r1:free',
        'mistralai/mistral-7b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free'
      ],
      defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
      free: true,
      rateLimit: 'Acceso a modelos con sufijo :free sin coste',
      getKeyUrl: 'https://openrouter.ai/keys',
      placeholder: 'sk-or-v1-...',
      docs: 'gemini-2.0-flash-exp:free expiró. Usa meta-llama/llama-3.3-70b o gemini-2.5-flash:free.',
    },
    nvidia: {
      name: 'Nvidia NIM (build.nvidia.com)',
      icon: '🟢',
      models: [
        'meta/llama-3.3-70b-instruct',
        'deepseek-ai/deepseek-r1',
        'mistralai/mistral-large-2-instruct',
        'nvidia/llama-3.1-nemotron-70b-instruct'
      ],
      defaultModel: 'meta/llama-3.3-70b-instruct',
      free: true,
      rateLimit: 'Gratis: 1.000 créditos API al registrarte',
      getKeyUrl: 'https://build.nvidia.com/explore/discover',
      placeholder: 'nvapi-...',
      docs: 'Integración completa añadida con endpoints estándar de chat.',
    },
    cerebras: {
      name: 'Cerebras (Velocidad extrema ~1.800 t/s)',
      icon: '🧠',
      models: [
        'llama3.3-70b',
        'llama3.1-8b'
      ],
      defaultModel: 'llama3.3-70b',
      free: true,
      rateLimit: 'Gratis: 1.000.000 tokens/día (Free Developer Tier)',
      getKeyUrl: 'https://cloud.cerebras.ai',
      placeholder: 'csk-...',
      docs: 'Generación instantánea de exámenes mediante hardware wafer-scale.',
    },
  },

  // ── Settings (localStorage) ──────────────────────────────────
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

  setApiKey(provider, key) {
    const settings = this.getSettings();
    settings[`${provider}_key`] = (key || '').trim();
    this.saveSettings(settings);
  },

  getSelectedProvider() {
    const p = this.getSettings().provider;
    if (p && this.providers[p]) return p;
    return 'gemini';
  },

  setSelectedProvider(provider) {
    const settings = this.getSettings();
    settings.provider = provider;
    this.saveSettings(settings);
  },

  getSelectedModel(provider) {
    const p = (provider && this.providers[provider]) ? provider : this.getSelectedProvider();
    const saved = this.getSettings()[`${p}_model`];
    if (saved && this.providers[p]?.models.includes(saved)) return saved;
    return this.providers[p]?.defaultModel || '';
  },

  setSelectedModel(provider, model) {
    const settings = this.getSettings();
    settings[`${provider}_model`] = model;
    this.saveSettings(settings);
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
      deutsch: 'Alemán (Deutsch) — DIA Literatur, Textanalyse und Sprachgebrauch',
      englisch: 'Inglés (Englisch) — Literature, Grammar, Reading Comprehension & Style',
      mathe: 'Matemáticas (Mathematik) — Analysis, Lineare Algebra, Stochastik und Geometrie',
      espanol: 'Español (Lengua Castellana y Literatura) — Sintaxis, Comentario de Texto y Literatura',
      philosophie: 'Filosofía (Philosophie) — Historia de la Filosofía, Ética y Epistemología',
    };

    let contextSummary = '';
    if (subjectData?.formulas?.length) {
      const topics = subjectData.formulas.map(f => {
        const cat = f.category?.es || f.category?.de || '';
        const items = (f.items || []).map(i => i.title?.es || i.title?.de || '').join(', ');
        return `• ${cat}: ${items}`;
      }).join('\n');
      contextSummary = `\nTEMARIO DISPONIBLE:\n${topics}`;
    }

    return `Eres un profesor titular y examinador oficial del Abitur DIA (Deutsches Internationales Abitur) en España.
Tu tarea es generar exactamente ${count} preguntas de examen tipo test con alta calidad pedagógica para: ${subjectNames[subjectId] || subjectId}.
${contextSummary}

REGLAS ESTRICTAS:
1. Cada pregunta debe tener EXACTAMENTE 4 opciones (índices 0, 1, 2, 3 correspondientes a A, B, C, D).
2. Solo UNA de las 4 opciones es correcta.
3. Las tres opciones incorrectas (distractores) deben ser plausibles y basadas en confusiones reales del alumnado.
4. "correct" DEBE ser un número entero entre 0 y 3 (0=A, 1=B, 2=C, 3=D).
5. Incluye una explicación clara y didáctica de por qué la respuesta es la adecuada.
6. Nivel: Bachillerato avanzado / Abitur DIA.
7. Varía los temas sin repetir conceptos.

FORMATO JSON ESTRICTO:
Responde ÚNICAMENTE con un array JSON válido, sin delimitadores de markdown, sin texto antes o después.

[
  {
    "question": "Enunciado de la pregunta de examen",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0,
    "explanation": "Explicación razonada de la respuesta correcta.",
    "difficulty": "medium",
    "topic": "Área temática concreta"
  }
]

Valores para "difficulty": "easy", "medium", "hard".
Genera exactamente ${count} preguntas.`;
  },

  // ── Call Gemini API con Modelos 2.5 y JSON Mode ───────────────
  async callGemini(apiKey, model, prompt) {
    const preferredModel = model || 'gemini-2.5-flash';
    const fallbackChain = [
      preferredModel,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
    ];
    const uniqueModels = [...new Set(fallbackChain)];
    let lastError = null;

    for (const m of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json', // Garantiza respuesta JSON pura
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`[Modelo ${m}]: ${errData?.error?.message || res.statusText}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return text;
      } catch (err) {
        console.warn(`Aviso Gemini: modelo ${m} falló:`, err.message);
        lastError = err;
      }
    }
    throw lastError || new Error('No se pudo obtener respuesta de ningún modelo de Gemini');
  },

  // ── Call Groq API con Modelos Activos ─────────────────────────
  async callGroq(apiKey, model, prompt) {
    const selectedModel = model || 'llama-3.3-70b-versatile';
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'Eres un examinador de Abitur DIA. Devuelves SIEMPRE y ÚNICAMENTE un array JSON válido sin texto envolvente.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Call OpenRouter API con Modelos :free ─────────────────────
  async callOpenRouter(apiKey, model, prompt) {
    const selectedModel = model || 'meta-llama/llama-3.3-70b-instruct:free';
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://abitur-dia.app';

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': origin,
        'X-Title': 'Abitur DIA Question Generator',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'Responde exclusivamente con el array JSON solicitado, sin markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Call Nvidia NIM API ───────────────────────────────────────
  async callNvidia(apiKey, model, prompt) {
    const selectedModel = model || 'meta/llama-3.3-70b-instruct';
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'Eres un examinador de Abitur DIA. Devuelve exclusivamente un array JSON válido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Nvidia NIM HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Call Cerebras API ─────────────────────────────────────────
  async callCerebras(apiKey, model, prompt) {
    const selectedModel = model || 'llama3.3-70b';
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'Responde exclusivamente con el array JSON solicitado.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Cerebras HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  },

  // ── Comprobador rápido de conexión (Ping en 1 seg) ────────────
  async testConnection(provider, apiKey, model) {
    const p = provider || this.getSelectedProvider();
    const key = apiKey || this.getApiKey(p);
    const m = model || this.getSelectedModel(p);

    if (!key) throw new Error(`Falta ingresar la API key para ${this.providers[p]?.name || p}`);

    const startTime = Date.now();
    const testPrompt = 'Responde con {"status":"OK"}';

    let raw = '';
    if (p === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m || 'gemini-2.5-flash'}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 50, responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (p === 'groq') {
      raw = await this.callGroq(key, m, testPrompt);
    } else if (p === 'openrouter') {
      raw = await this.callOpenRouter(key, m, testPrompt);
    } else if (p === 'nvidia') {
      raw = await this.callNvidia(key, m, testPrompt);
    } else if (p === 'cerebras') {
      raw = await this.callCerebras(key, m, testPrompt);
    }

    const latency = Date.now() - startTime;
    return {
      success: true,
      latency,
      provider: p,
      model: m,
      message: `Conexión exitosa con ${m} (${latency}ms)`,
    };
  },

  // ── Parser JSON Ultra-Robusto ─────────────────────────────────
  parseResponse(text, subjectId) {
    if (!text || typeof text !== 'string') throw new Error('La respuesta de la IA está vacía');

    let cleaned = text.trim();

    // 1. Extraer bloques markdown si existen
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1].trim();
    }

    // 2. Si viene envuelto en objeto { "questions": [...] }
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      try {
        const obj = JSON.parse(cleaned);
        const found = Object.values(obj).find(v => Array.isArray(v));
        if (found) cleaned = JSON.stringify(found);
      } catch {}
    }

    // 3. Localizar límites de array [ ... ]
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      throw new Error('No se detectó un array JSON en la respuesta de la IA.');
    }

    let jsonSubstring = cleaned.slice(startIdx, endIdx + 1);

    // 4. Limpiar trailing commas: [1, 2, ] -> [1, 2]
    jsonSubstring = jsonSubstring.replace(/,(\s*[\]\}])/g, '$1');

    // 5. Parsear
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonSubstring);
    } catch (e) {
      const sanitized = jsonSubstring.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
      parsedQuestions = JSON.parse(sanitized);
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('El modelo no devolvió preguntas en el formato esperado.');
    }

    // 6. Normalizar preguntas
    return parsedQuestions
      .filter(q => (q.question || q.enunciado) && Array.isArray(q.options || q.opciones))
      .map((q, idx) => {
        let opts = (q.options || q.opciones).map(String);
        while (opts.length < 4) opts.push(`Opción ${String.fromCharCode(65 + opts.length)}`);
        if (opts.length > 4) opts = opts.slice(0, 4);

        let correct = 0;
        if (typeof q.correct === 'number') correct = Math.floor(q.correct);
        else if (typeof q.correct === 'string') {
          const l = q.correct.trim().toUpperCase();
          if (l === 'B' || l === '1') correct = 1;
          else if (l === 'C' || l === '2') correct = 2;
          else if (l === 'D' || l === '3') correct = 3;
        }

        return {
          id: `ai_${subjectId}_${Date.now()}_${idx}`,
          subjectId,
          question: String(q.question || q.enunciado).trim(),
          options: opts,
          correct: Math.max(0, Math.min(3, correct)),
          explanation: q.explanation || q.explicacion || 'Solución curricular Abitur DIA.',
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
          topic: q.topic || q.tema || 'General',
          isAI: true,
          generatedAt: new Date().toISOString(),
        };
      });
  },

  // ── Generación principal ──────────────────────────────────────
  async generate({ subjectId, subjectData, count = 5, onProgress }) {
    const provider = this.getSelectedProvider();
    const model = this.getSelectedModel(provider);
    const apiKey = this.getApiKey(provider);

    if (!apiKey) throw new Error(`Falta la API Key para ${this.providers[provider]?.name || provider}.`);
    if (!model) throw new Error('No se ha seleccionado ningún modelo.');

    if (onProgress) onProgress('Preparando temario y prompt...', 15);
    const prompt = this.buildPrompt(subjectId, subjectData, 'es', count);

    if (onProgress) onProgress(`Consultando ${this.providers[provider]?.name} (${model})...`, 40);

    const startTime = Date.now();
    let rawText = '';

    if (provider === 'gemini') rawText = await this.callGemini(apiKey, model, prompt);
    else if (provider === 'groq') rawText = await this.callGroq(apiKey, model, prompt);
    else if (provider === 'openrouter') rawText = await this.callOpenRouter(apiKey, model, prompt);
    else if (provider === 'nvidia') rawText = await this.callNvidia(apiKey, model, prompt);
    else if (provider === 'cerebras') rawText = await this.callCerebras(apiKey, model, prompt);
    else throw new Error(`Proveedor desconocido: ${provider}`);

    const elapsedMs = Date.now() - startTime;

    if (onProgress) onProgress('Validando estructura JSON...', 75);
    const questions = this.parseResponse(rawText, subjectId);

    if (onProgress) onProgress('Guardando en banco local...', 90);
    const added = this.appendAiQuestions(subjectId, questions);

    if (onProgress) onProgress(`✅ ¡Listo! ${added} preguntas añadidas (${(elapsedMs / 1000).toFixed(1)}s)`, 100);

    return { questions, added, elapsedMs, provider, model, rawText };
  },

  getEnrichedQuestions(subjectId, staticQuestions) {
    const aiQuestions = this.getAiQuestions(subjectId);
    return [...(staticQuestions || []), ...aiQuestions];
  },

  getStats() {
    const subjects = ['deutsch', 'englisch', 'mathe', 'espanol', 'philosophie'];
    const stats = {};
    subjects.forEach(s => { stats[s] = this.getAiQuestions(s).length; });
    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
    return stats;
  },
};

if (typeof window !== 'undefined') window.AIGenerator = AIGenerator;
if (typeof module !== 'undefined' && module.exports) module.exports = AIGenerator;
