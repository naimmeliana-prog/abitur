/**
 * AUTO-UPDATER.JS — AbiturDSV Automatic Content Importer
 * ─────────────────────────────────────────────────────────────────────────────
 * Sistema DIA — Deutsches Internationales Abitur — Región 5 (DSV Valencia)
 * Autoridad oficial: ZfA (Zentralstelle für das Auslandsschulwesen)
 * Referencia:        https://www.zfa.bund.de/de/dia/
 *
 * NOTA: Los exámenes DIA oficiales NO son de acceso público en internet.
 * Este script importa contenido curado de alta calidad basado en los
 * currículos oficiales DIA/ZfA, con formato idéntico al examen real.
 * Actúa como base de datos de práctica.
 *
 * Ejecutar: node scripts/auto-updater.js
 * CI/CD:    Se ejecuta automáticamente cada domingo via GitHub Actions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SUBJECTS = ['deutsch', 'englisch', 'espanol', 'mathe', 'philosophie'];

const DIA_EXAM_BANK = {

  // ══════════════════════════════════════════════════════════════════
  // DEUTSCH — DIA Abitur
  // ══════════════════════════════════════════════════════════════════
  deutsch: [
    {
      id: "deutsch_dia_2023_eroetrterung",
      title: "DIA Abitur Deutsch 2023 — Erörterung & Textanalyse",
      year: "2023",
      source: "Basado en currículo DIA/ZfA — Contenido de práctica curado",
      intro: {
        es: "Examen de Alemán formato DIA. Parte A: análisis de texto periodístico sobre IA en educación. Parte B: Erörterung con postura personal.",
        de: "DIA-Prüfung Deutsch. Teil A: Analyse eines Zeitungsartikels zur KI im Bildungswesen. Teil B: Erörterung mit Stellungnahme."
      },
      blocks: [
        {
          name: "Teil A — Textanalyse",
          tasks: [
            {
              title: "Aufgabe 1a: Inhaltliche Wiedergabe",
              question: {
                es: "Resume el contenido central del artículo 'Künstliche Intelligenz im Klassenzimmer' (párrafos 1-4): tesis del autor y tres argumentos principales.",
                de: "Gib den Inhalt des Artikels 'Künstliche Intelligenz im Klassenzimmer' (Abs. 1–4) wieder. Benenne die Hauptthese und drei Argumente."
              },
              solution: {
                es: "ESTRUCTURA:\n1. TESIS: La IA puede ser herramienta de apoyo si se usa críticamente.\n2. Arg 1: Personalización del aprendizaje (párr. 1-2).\n3. Arg 2: Riesgo de dependencia tecnológica (párr. 3).\n4. Arg 3: Necesidad de formación docente (párr. 4).\nRespuesta objetiva, sin valoración personal.",
                de: "STRUKTUR:\n1. THESE: KI kann sinnvoll eingesetzt werden, wenn kritisch genutzt.\n2. Arg 1: Personalisiertes Lernen (Abs. 1–2).\n3. Arg 2: Technologieabhängigkeit (Abs. 3).\n4. Arg 3: Lehrerfortbildung (Abs. 4).\nKeine eigene Wertung."
              },
              points: 10,
              criteria: {
                es: "• 4 Puntos: Tesis y 3 argumentos correctos.\n• 4 Puntos: Lenguaje objetivo sin opinión.\n• 2 Puntos: Conectores y estructura cohesiva.",
                de: "• 4 Punkte: These und 3 Argumente.\n• 4 Punkte: Sachliche Sprache.\n• 2 Punkte: Konnektoren und Struktur."
              },
              recommendation: {
                es: "No añadas tu opinión. Usa 'Der Autor argumentiert, dass...'",
                de: "Keine eigene Meinung. Formulierungen wie 'Der Autor argumentiert...' verwenden."
              }
            },
            {
              title: "Aufgabe 1b: Sprachanalyse",
              question: {
                es: "Analiza tres recursos lingüísticos/retóricos del texto (con cita). Explica su función argumentativa.",
                de: "Analysiere drei sprachlich-rhetorische Mittel mit Textbeleg. Erkläre ihre argumentative Funktion."
              },
              solution: {
                es: "1. METÁFORA ('Die KI ist ein Werkzeug') → humaniza el debate, reduce el temor.\n2. PREGUNTA RETÓRICA ('Wer trägt die Verantwortung?') → involucra al lector.\n3. ESTADÍSTICA ('62% der Schüler...') → credibilidad científica (logos).\nEstructura: recurso → función → valoración.",
                de: "1. METAPHER ('Die KI ist ein Werkzeug') → nimmt Angst, rationalisiert.\n2. RHETORISCHE FRAGE ('Wer trägt die Verantwortung?') → Lesereinbezug.\n3. STATISTIK ('62% der Schüler...') → Logos-Appell.\nStruktur: Mittel → Funktion → Wirkung."
              },
              points: 15,
              criteria: {
                es: "• 5 Puntos por recurso: cita + nombre + función.\n• 2 Puntos extra: valoración global coherente.",
                de: "• 5 Punkte pro Mittel: Beleg + Name + Funktion.\n• 2 Punkte: Gesamtbewertung."
              },
              recommendation: {
                es: "Cita siempre entre comillas. No basta nombrar el recurso — explica POR QUÉ el autor lo usa.",
                de: "Immer Anführungszeichen. Das Mittel benennen reicht nicht — die Funktion muss erklärt werden."
              }
            }
          ]
        },
        {
          name: "Teil B — Erörterung",
          tasks: [
            {
              title: "Aufgabe 2: Erörterung — KI macht Lehrer überflüssig?",
              question: {
                es: "Escribe una Erörterung (400-500 palabras) sobre: 'Künstliche Intelligenz macht Lehrer überflüssig.' Pro y contra, con postura personal.",
                de: "Verfasse eine Erörterung (400–500 Wörter) zur These: 'Künstliche Intelligenz macht Lehrer überflüssig.' Pro- und Contra-Argumente, eigene Stellungnahme."
              },
              solution: {
                es: "EINLEITUNG: Contextualiza la IA en educación. Pregunta central.\n\nPRO: 1) Aprendizaje personalizado 24/7. 2) Reducción de costes.\n\nCONTRA: 1) Educación implica valores y empatía — imposible para IA. 2) La IA reproduce sesgos. 3) El docente como referente social es irreemplazable.\n\nSCHLUSS: La IA es complemento, no sustituto.",
                de: "EINLEITUNG: KI im Bildungskontext; Leitfrage.\n\nPRO: 1) Personalisiertes Lernen. 2) Kostensenkung.\n\nCONTRA: 1) Werte, Empathie — für KI unmöglich. 2) Trainingsbiases. 3) Lehrer als Vorbild.\n\nSCHLUSS: KI als Ergänzung, nicht Ersatz."
              },
              points: 25,
              criteria: {
                es: "• 8 Puntos: Estructura (Einleitung, Hauptteil ≥4 argumentos, Schluss).\n• 8 Puntos: Calidad argumentativa.\n• 5 Puntos: Alemán (registro, léxico, sintaxis).\n• 4 Puntos: Stellungnahme clara y fundamentada.",
                de: "• 8 Punkte: Aufbau.\n• 8 Punkte: Argumentationsqualität.\n• 5 Punkte: Deutschkenntnisse.\n• 4 Punkte: Klare Stellungnahme."
              },
              recommendation: {
                es: "Usa conectores explícitos: 'Einerseits', 'Andererseits', 'Dennoch', 'Abschließend'. La postura final debe ser inequívoca.",
                de: "Konnektoren: 'Einerseits', 'Andererseits', 'Dennoch'. Stellungnahme muss eindeutig sein."
              }
            }
          ]
        }
      ]
    }
  ],

  // ══════════════════════════════════════════════════════════════════
  // ENGLISCH — DIA Abitur
  // ══════════════════════════════════════════════════════════════════
  englisch: [
    {
      id: "englisch_dia_2023_media_society",
      title: "DIA Abitur Englisch 2023 — Media & Society",
      year: "2023",
      source: "Basado en currículo DIA/ZfA — Contenido de práctica curado",
      intro: {
        es: "Examen de Inglés formato DIA. Texto sobre redes sociales y democracia. Tareas: Outline, análisis retórico y Comment argumentado.",
        de: "DIA-Prüfung Englisch. Text über soziale Medien und Demokratie. Aufgaben: Outline, Analyse, Kommentar."
      },
      blocks: [
        {
          name: "Task 1 — Outline",
          tasks: [
            {
              title: "Task 1: Outline the main argument",
              question: {
                es: "Outline the author's central argument and three supporting points in 'Social Media: Democracy's Friend or Foe?' (approx. 150 words).",
                de: "Fasse die Hauptthese und drei zentrale Argumente des Artikels zusammen (ca. 150 Wörter)."
              },
              solution: {
                es: "Central argument: Social media poses a systemic threat to democracy through misinformation, polarization and algorithmic manipulation.\n\nMain points:\n1. Echo chambers reinforced by algorithms limit diverse viewpoints (para. 2–3).\n2. Viral misinformation outpaces fact-checking (para. 4).\n3. Regulatory frameworks have failed to keep pace (para. 5–6).\n\nNOTA: Objetivo, sin opinión propia. Usa reported speech.",
                de: "Hauptthese: Trotz demokratischen Potenzials bedrohen soziale Medien die Demokratie.\n\nHauptpunkte:\n1. Echokammern durch Algorithmen (Abs. 2–3).\n2. Desinformation übertrifft Faktenchecks (Abs. 4).\n3. Regulierung hält nicht Schritt (Abs. 5–6).\n\nHINWEIS: Objektiv, keine eigene Meinung."
              },
              points: 15,
              criteria: {
                es: "• 6 Puntos: Tesis y 3 argumentos correctos.\n• 5 Puntos: Lenguaje objetivo (no 'I think').\n• 4 Puntos: Claridad dentro del límite de palabras.",
                de: "• 6 Punkte: These und 3 Argumente.\n• 5 Punkte: Objektive Sprache.\n• 4 Punkte: Klarheit im Wortlimit."
              },
              recommendation: {
                es: "Usa 'The author argues that...', 'According to the text...'. NUNCA primera persona.",
                de: "Formulierungen: 'The author argues...', 'According to...'. Niemals Ich-Perspektive."
              }
            }
          ]
        },
        {
          name: "Task 2 — Analysis",
          tasks: [
            {
              title: "Task 2: Analyse language and rhetoric",
              question: {
                es: "Analyse THREE rhetorical/linguistic devices used by the author. Quote the text and explain the effect on the reader.",
                de: "Analysiere DREI rhetorische/sprachliche Mittel mit Textbeleg. Erkläre die Wirkung auf den Leser."
              },
              solution: {
                es: "1. EMOTIVE LANGUAGE: 'democracy is bleeding out' — metaphor creating urgency. Effect: reader sees issue as emergency.\n2. RHETORICAL QUESTION: 'How many more elections...' — implicates reader, suggests inaction is morally wrong.\n3. STATISTICS: '73% of users...' — logos appeal, scientific authority.\n\nStructure: DEVICE + QUOTE + EFFECT ON READER",
                de: "1. METAPHER: 'democracy is bleeding out' — Dringlichkeit, Krise.\n2. RHETORISCHE FRAGE: 'How many more elections...' — Lesereinbezug, moralische Verantwortung.\n3. STATISTIK: '73% of users...' — Logos-Appell.\n\nStruktur: MITTEL + ZITAT + WIRKUNG"
              },
              points: 20,
              criteria: {
                es: "• 6 Puntos por dispositivo: nombre + cita + efecto en el lector.\n• 2 Puntos: valoración global de la estrategia persuasiva.",
                de: "• 6 Punkte pro Mittel: Name + Zitat + Wirkung.\n• 2 Punkte: Gesamtbewertung."
              },
              recommendation: {
                es: "La pregunta es CÓMO afecta al lector — ese matiz diferencia una respuesta básica de una excelente.",
                de: "Die Wirkung auf den Leser ist entscheidend — nicht nur das Mittel benennen."
              }
            }
          ]
        },
        {
          name: "Task 3 — Comment",
          tasks: [
            {
              title: "Task 3: Comment on social media regulation",
              question: {
                es: "Write a comment (300-350 words) for an English newspaper: 'Should governments regulate social media to protect democracy?' Express and justify YOUR opinion.",
                de: "Schreibe einen Kommentar (300–350 Wörter): 'Sollten Regierungen soziale Medien regulieren?' Klare eigene Position."
              },
              solution: {
                es: "STRUCTURE:\nHOOK: impactante stat or rhetorical question.\nBODY:\n- P1: Main argument for regulation (algorithmic transparency).\n- P2: Counter-argument acknowledged (free speech, censorship risk).\n- P3: Refutation + reinforced position.\nCONCLUSION: Call to action or reflection.\n\nREGISTER: Formal. Use 'one could argue', 'the evidence suggests'.",
                de: "STRUKTUR:\nEINSTIEG: Statistik oder rhetorische Frage.\nHAUPTTEIL:\n- A1: Regulierung (algorithmische Transparenz).\n- A2: Gegenargument (Meinungsfreiheit).\n- A3: Widerlegung + eigene Position.\nSCHLUSS: Handlungsaufruf.\n\nREGISTER: Formal. 'One could argue', 'the evidence suggests'."
              },
              points: 25,
              criteria: {
                es: "• 8 Puntos: Estructura (hook, argumentos, conclusión).\n• 8 Puntos: Calidad argumentativa.\n• 9 Puntos: Inglés (registro, léxico, gramática, cuhesión).",
                de: "• 8 Punkte: Aufbau.\n• 8 Punkte: Argumentationsqualität.\n• 9 Punkte: Englischkenntnisse."
              },
              recommendation: {
                es: "El Comment necesita UNA postura clara. Reconoce el contraargumento pero refútalo. Evita 'on one hand / on the other hand' sin conclusión.",
                de: "Klare Position. Gegenargument anerkennen, aber widerlegen. Nicht enden mit 'on the other hand'."
              }
            }
          ]
        }
      ]
    }
  ],

  // ══════════════════════════════════════════════════════════════════
  // ESPAÑOL — DIA Abitur
  // ══════════════════════════════════════════════════════════════════
  espanol: [
    {
      id: "espanol_dia_2023_disertacion",
      title: "DIA Abitur Español 2023 — Literatura y Disertación",
      year: "2023",
      source: "Basado en currículo DIA/ZfA — Contenido de práctica curado",
      intro: {
        es: "Examen de Español formato DIA. Texto: fragmento literario (Javier Marías). Tareas: análisis, contextualización y disertación sobre memoria e identidad.",
        de: "DIA-Prüfung Español. Text: Auszug aus Javier Marías. Aufgaben: Analyse, Kontextualisierung, Disertación über Erinnerung und Identität."
      },
      blocks: [
        {
          name: "Tarea 1 — Análisis del texto",
          tasks: [
            {
              title: "Tarea 1a: Resumen del fragmento",
              question: {
                es: "Resume objetivamente el fragmento (máx. 120 palabras): situación narrativa, conflicto central y tono del narrador.",
                de: "Fasse den Auszug objektiv zusammen (max. 120 Wörter): Erzählsituation, zentraler Konflikt, Ton."
              },
              solution: {
                es: "El narrador, en primera persona, reflexiona sobre un encuentro fortuito con alguien de su pasado. Conflicto: tensión entre el recuerdo idealizado y la realidad presente. Tono: introspectivo y melancólico, con prosa pausada y filosófica. El narrador no actúa: observa, recuerda y duda.",
                de: "Ich-Erzähler, der über eine zufällige Begegnung mit jemandem aus seiner Vergangenheit nachdenkt. Konflikt: Spannung zwischen idealisierter Erinnerung und Realität. Ton: introspektiv, melancholisch, philosophisch. Der Erzähler handelt nicht — er beobachtet und zweifelt."
              },
              points: 10,
              criteria: {
                es: "• 4 Puntos: Situación narrativa, conflicto y tono correctos.\n• 3 Puntos: Lenguaje objetivo, sin análisis prematuro.\n• 3 Puntos: Coherencia y límite respetado.",
                de: "• 4 Punkte: Erzählsituation, Konflikt, Ton korrekt.\n• 3 Punkte: Objektive Sprache.\n• 3 Punkte: Wortlimit."
              },
              recommendation: {
                es: "El resumen NUNCA lleva tu opinion. El error más frecuente es comenzar a analizar antes de tiempo.",
                de: "Zusammenfassung = keine eigene Meinung. Häufigster Fehler: zu früh analysieren."
              }
            },
            {
              title: "Tarea 1b: Análisis lingüístico-literario",
              question: {
                es: "Analiza CUATRO recursos literarios del fragmento (con cita). Explica su función en relación al tema de la memoria y la identidad.",
                de: "Analysiere VIER literarische Mittel mit Textbeleg. Erkläre ihre Funktion in Bezug auf Erinnerung und Identität."
              },
              solution: {
                es: "1. NARRADOR HOMODIEGÉTICO (1ª persona) → intimidad; acceso directo a la conciencia.\n2. ANALEPSIS (flashback) → subrayar la omnipresencia de la memoria.\n3. POLISÍNDETON ('y recordé y dudé y me pregunté') → reproduce el encadenamiento involuntario de recuerdos.\n4. OXÍMORON ('recuerdo olvidado') → paradoja esencial del tema.\n\nEstructura: recurso + cita + función temática.",
                de: "1. HOMODIEGETISCHER ERZÄHLER → Intimität, direkte Innenperspektive.\n2. ANALEPSE → Allgegenwart der Erinnerung.\n3. POLYSYNDETON → unwillkürliche Erinnerungsketten.\n4. OXYMORON ('recuerdo olvidado') → Erinnerung als Präsenz der Abwesenheit.\n\nStruktur: Mittel + Zitat + thematische Funktion."
              },
              points: 20,
              criteria: {
                es: "• 4 Puntos por recurso: nombre + cita + función temática.\n• 4 Puntos extra: profundidad interpretativa.",
                de: "• 4 Punkte pro Mittel: Name + Beleg + thematische Funktion.\n• 4 Punkte: Interpretationstiefe."
              },
              recommendation: {
                es: "El DIA Español valora la conexión entre recurso y TEMA. No es suficiente identificar la metáfora — debes explicar qué dice sobre la memoria.",
                de: "Im DIA Español zählt die Verbindung Mittel–Thema. Nicht nur identifizieren — die thematische Bedeutung erklären."
              }
            }
          ]
        },
        {
          name: "Tarea 2 — Disertación",
          tasks: [
            {
              title: "Tarea 2: Disertación — La memoria y la identidad",
              question: {
                es: "Escribe una disertación (400-500 palabras): 'La memoria no nos define: somos libres de construir nuestra identidad más allá del pasado.' Defiende o rebate esta tesis con argumentos, ejemplos y conclusión personal.",
                de: "Verfasse eine Disertación (400–500 Wörter): 'Die Erinnerung definiert uns nicht — wir sind frei, unsere Identität zu gestalten.' Vertrete oder widerlege mit Argumenten, Beispielen, eigener Schlussfolgerung."
              },
              solution: {
                es: "INTRODUCCIÓN: Define memoria e identidad. Formula tu tesis.\n\nA FAVOR: Neuroplasticidad — narrativas personales son reescribibles. Sartre: existencia precede a la esencia.\n\nEN CONTRA: Psicología: traumas moldean la personalidad de forma inconsciente. Halbwachs: memoria colectiva nos constituye. Proust: memoria involuntaria como sustrato identitario.\n\nCONCLUSIÓN: Postura matizada — ni determinismo ni libertad absoluta.",
                de: "EINLEITUNG: Schlüsselbegriffe; eigene These.\n\nPRO: Neuroplastizität. Sartre: Existenz geht Essenz voraus.\n\nCONTRA: Trauma formt unbewusst (Psychologie). Halbwachs: kollektives Gedächtnis. Proust: unwillkürliche Erinnerung.\n\nSCHLUSS: Nuancierte Position."
              },
              points: 30,
              criteria: {
                es: "• 10 Puntos: Estructura (intro, ≥4 argumentos, conclusión).\n• 10 Puntos: Calidad argumentativa (diversidad de fuentes, coherencia).\n• 10 Puntos: Expresión escrita (léxico, registro formal, sintaxis variada).",
                de: "• 10 Punkte: Aufbau.\n• 10 Punkte: Argumentationsqualität.\n• 10 Punkte: Sprachliche Qualität."
              },
              recommendation: {
                es: "El español académico exige léxico rico — evita repetir palabras. Usa sinónimos y estructuras subordinadas complejas.",
                de: "Akademisches Spanisch erfordert Wortschatzreichtum. Wortwiederholungen vermeiden."
              }
            }
          ]
        }
      ]
    }
  ],

  // ══════════════════════════════════════════════════════════════════
  // MATHE — DIA Abitur
  // ══════════════════════════════════════════════════════════════════
  mathe: [
    {
      id: "mathe_dia_2023_vollstaendig",
      title: "DIA Abitur Mathematik 2023 — Analysis, Geometrie & Stochastik",
      year: "2023",
      source: "Basado en currículo DIA/ZfA — Contenido de práctica curado",
      intro: {
        es: "Examen de Matemáticas formato DIA completo. Teil A (sin calculadora): Análisis y Geometría analítica. Teil B (con calculadora CAS): Stochastik y modelización.",
        de: "Vollständige DIA-Matheprüfung. Teil A (kein Hilfsmittel): Analysis und Geometrie. Teil B (CAS): Stochastik und Modellierung."
      },
      blocks: [
        {
          name: "Teil A — Analysis (Sin calculadora)",
          tasks: [
            {
              title: "A1: Untersuchen einer ganzrationalen Funktion",
              question: {
                es: "Dada f(x) = x⁴ - 4x³ + 4x²:\na) Calcula los ceros de f.\nb) Determina y clasifica todos los puntos críticos.\nc) Bosqueja la gráfica en [-1, 4].",
                de: "Gegeben f(x) = x⁴ - 4x³ + 4x²:\na) Bestimme die Nullstellen.\nb) Bestimme und klassifiziere alle Extrempunkte und Wendepunkte.\nc) Skizziere den Graphen für x ∈ [-1, 4]."
              },
              solution: {
                es: "a) f(x) = x²(x-2)² → x₁=0 (doble), x₂=2 (doble).\n\nb) f'(x) = 4x(x-1)(x-2) → puntos críticos x=0, x=1, x=2.\nf''(x) = 12x²-24x+8\nf''(0)=8>0 → Mínimo (0,0)\nf''(1)=-4<0 → Máximo (1,1)\nf''(2)=8>0 → Mínimo (2,0)\nInflexión: x=(3±√3)/3\n\nc) Curva en W simétrica respecto a x=1.",
                de: "a) f(x) = x²(x-2)² → x₁=0 (doppelt), x₂=2 (doppelt).\n\nb) f'(x) = 4x(x-1)(x-2); Extrempunkte bei x=0,1,2.\nf''(0)=8>0 → lok. Min. (0,0); f''(1)=-4<0 → lok. Max. (1,1); f''(2)=8>0 → lok. Min. (2,0).\nWendepunkte: x=(3±√3)/3.\n\nc) W-förmige Kurve, symmetrisch zu x=1."
              },
              points: 15,
              criteria: {
                es: "• 4 Puntos: Ceros con factorización.\n• 6 Puntos: Clasificación con segunda derivada.\n• 3 Puntos: Puntos de inflexión.\n• 2 Puntos: Bosquejo coherente.",
                de: "• 4 Punkte: Nullstellen mit Faktorisierung.\n• 6 Punkte: Klassifikation mit 2. Ableitung.\n• 3 Punkte: Wendepunkte.\n• 2 Punkte: Skizze."
              },
              recommendation: {
                es: "Los ceros dobles son tangentes al eje X — el bosquejo debe reflejarlo. Clasifica siempre con f''.",
                de: "Doppelte Nullstellen = Berührungspunkte. Immer mit dem 2. Ableitungstest klassifizieren."
              }
            },
            {
              title: "A2: Integralrechnung — Flächeninhalt",
              question: {
                es: "Sea g(x) = 3x - x²:\na) Área entre g(x) y el eje X.\nb) Área entre g(x) y h(x) = x.",
                de: "Gegeben g(x) = 3x - x²:\na) Fläche zwischen g(x) und der x-Achse.\nb) Fläche zwischen g(x) und h(x) = x."
              },
              solution: {
                es: "a) Ceros: x=0, x=3.\n∫₀³(3x-x²)dx = [3x²/2 - x³/3]₀³ = 27/2 - 9 = 9/2 = 4.5 u²\n\nb) Intersecciones: x=0, x=2.\n∫₀²[(3x-x²)-x]dx = ∫₀²(2x-x²)dx = [x²-x³/3]₀² = 4-8/3 = 4/3 u²",
                de: "a) Nullstellen: x=0, x=3.\n∫₀³(3x-x²)dx = 9/2 = 4,5 FE\n\nb) Schnittpunkte: x=0, x=2.\n∫₀²(2x-x²)dx = 4-8/3 = 4/3 FE"
              },
              points: 10,
              criteria: {
                es: "• 3 Puntos a): Límites + integral correcta.\n• 4 Puntos b): Intersecciones + integral de la diferencia.\n• 3 Puntos: Unidades y signo positivo.",
                de: "• 3 Punkte a): Grenzen + Integral.\n• 4 Punkte b): Schnittpunkte + Differenzintegral.\n• 3 Punkte: Einheiten und Vorzeichen."
              },
              recommendation: {
                es: "Para áreas entre dos curvas: siempre resta la función inferior de la superior. Verifica los signos antes de integrar.",
                de: "Bei Flächen: immer untere von oberer subtrahieren. Vorzeichen vorher prüfen."
              }
            }
          ]
        },
        {
          name: "Teil B — Stochastik (Con calculadora CAS)",
          tasks: [
            {
              title: "B1: Binomialverteilung — Qualitätskontrolle",
              question: {
                es: "El 8% de los circuitos producidos son defectuosos. Muestra de n=20.\na) P(exactamente 2 defectuosos).\nb) P(como máximo 3 defectuosos).\nc) Valor esperado y desviación típica.",
                de: "8% der produzierten Schaltkreise sind defekt. Stichprobe n=20.\na) P(genau 2 defekt).\nb) P(höchstens 3 defekt).\nc) Erwartungswert und Standardabweichung."
              },
              solution: {
                es: "X ~ B(20, 0.08)\n\na) P(X=2) = C(20,2)·0.08²·0.92¹⁸ ≈ 0.2711\n\nb) P(X≤3) = P(0)+P(1)+P(2)+P(3) ≈ 0.1887+0.3282+0.2711+0.1414 ≈ 0.9294\n\nc) μ = 20·0.08 = 1.6\nσ = √(20·0.08·0.92) ≈ 1.21",
                de: "X ~ B(20; 0,08)\n\na) P(X=2) = C(20;2)·0,08²·0,92¹⁸ ≈ 0,2711\n\nb) P(X≤3) ≈ 0,9294\n\nc) μ = 1,6; σ ≈ 1,21"
              },
              points: 12,
              criteria: {
                es: "• 4 Puntos a): Fórmula + sustitución + resultado.\n• 5 Puntos b): Los 4 términos correctos.\n• 3 Puntos c): Fórmulas correctas de μ y σ.",
                de: "• 4 Punkte a): Formel + Einsetzen + Ergebnis.\n• 5 Punkte b): 4 Terme korrekt.\n• 3 Punkte c): Formeln für μ und σ."
              },
              recommendation: {
                es: "Declara siempre la variable: 'X ~ B(20, 0.08)'. Escribe la fórmula antes de usar el CAS.",
                de: "Immer Zufallsvariable deklarieren: 'X ~ B(20; 0,08)'. Formel vor CAS-Einsatz aufschreiben."
              }
            }
          ]
        }
      ]
    }
  ],

  // ══════════════════════════════════════════════════════════════════
  // PHILOSOPHIE — DIA Abitur
  // ══════════════════════════════════════════════════════════════════
  philosophie: [
    {
      id: "philosophie_dia_2023_ethik_freiheit",
      title: "DIA Abitur Philosophie 2023 — Ethik & Freiheit",
      year: "2023",
      source: "Basado en currículo DIA/ZfA — Contenido de práctica curado",
      intro: {
        es: "Examen de Filosofía formato DIA. Texto: Kant, 'Grundlegung zur Metaphysik der Sitten'. Tareas: análisis del argumento, contextualización y erörterung sobre la libertad moral.",
        de: "DIA-Prüfung Philosophie. Text: Kant, 'Grundlegung zur Metaphysik der Sitten'. Aufgaben: Argumentanalyse, Kontextualisierung, Erörterung zur moralischen Freiheit."
      },
      blocks: [
        {
          name: "Teil A — Textanalyse",
          tasks: [
            {
              title: "Aufgabe 1: Rekonstruktion des kantischen Arguments",
              question: {
                es: "Reconstruye el argumento central de Kant sobre la autonomía de la voluntad: (a) premisa principal, (b) premisas auxiliares, (c) conclusión. Explica el imperativo categórico.",
                de: "Rekonstruiere Kants Kernargument zur Autonomie des Willens: (a) Hauptprämisse, (b) Hilfsprämissen, (c) Schlussfolgerung. Erkläre den kategorischen Imperativ."
              },
              solution: {
                es: "P1: Un ser racional actúa según leyes que él mismo se da.\nP2: La moralidad exige actuar según máximas que uno pueda querer como ley universal.\nP3: La heteronomía (actuar por deseos externos) destruye la moralidad.\nC: Solo la autonomía — actuar por deber, no por inclinación — fundamenta la moral.\n\nIMPERATIVO CATEGÓRICO: 'Actúa solo según la máxima que puedas querer como ley universal.' Es incondicional, formal y racional.",
                de: "P1: Vernunftwesen handeln nach selbstgegebenen Gesetzen.\nP2: Moralität: nur nach Maximen handeln, die man zum allgemeinen Gesetz wollen kann.\nP3: Heteronomie zerstört Moralität.\nK: Nur Autonomie — Handeln aus Pflicht — begründet Moral.\n\nKATEGORISCHER IMPERATIV: 'Handle nur nach der Maxime, die du zum allg. Gesetz wollen kannst.' Unbedingt, formal, rational."
              },
              points: 20,
              criteria: {
                es: "• 8 Puntos: Reconstrucción correcta (P1, P2, P3, C).\n• 7 Puntos: Explicación precisa del imperativo (incondicional, formal, universal).\n• 5 Puntos: Terminología kantiana correcta (autonomía, heteronomía, deber, máxima).",
                de: "• 8 Punkte: Korrekte Rekonstruktion.\n• 7 Punkte: Präzise Erklärung des Imperativs.\n• 5 Punkte: Kantische Terminologie."
              },
              recommendation: {
                es: "'Autonomía' no es 'libertad' genérica — es actuar según la ley que uno mismo se da como ser racional. Distingue siempre imperativo hipotético vs. categórico.",
                de: "'Autonomie' ist nicht einfach 'Freiheit' — es ist Handeln nach selbstgegebenem Gesetz. Immer zwischen hypothetischem und kategorischem Imperativ unterscheiden."
              }
            }
          ]
        },
        {
          name: "Teil B — Philosophische Erörterung",
          tasks: [
            {
              title: "Aufgabe 2: Freiheit und Determinismus",
              question: {
                es: "Discute filosóficamente: '¿Es posible la libertad moral en un mundo causalmente determinado?' Utiliza a Kant y al menos otro filósofo (Spinoza, Sartre o Schopenhauer).",
                de: "Erörtere philosophisch: 'Ist moralische Freiheit in einer kausal bestimmten Welt möglich?' Beziehe Kant und mind. einen weiteren Philosophen ein (Spinoza, Sartre, Schopenhauer)."
              },
              solution: {
                es: "TESIS DEL DETERMINISMO: Todo acontecimiento está causalmente determinado → la libertad parece imposible.\n\nKANT (compatibilismo transcendental): Como fenómeno → causalidad natural. Como noúmeno (ser racional) → puede actuar según razón pura. Libertad trascendental y determinismo coexisten.\n\nSARTRE (libertad radical): 'La existencia precede a la esencia.' Conciencia = pura espontaneidad. Estamos 'condenados a ser libres'.\n\nSCHOPENHAUER (contra la libertad): La voluntad ciega mueve todo. El yo que 'elige' es una ilusión del intelecto.\n\nCONCLUSIÓN: Postura propia fundamentada.",
                de: "DETERMINISMUS-THESE: Alle Ereignisse kausal bestimmt → Freiheit unmöglich?\n\nKANT (Kompatibilismus): Als Phänomen → Naturkausalität. Als Noumen → Handeln nach reiner Vernunft. Beides schließt sich nicht aus.\n\nSARTRE (radikale Freiheit): 'Existenz geht Essenz voraus.' Zur Freiheit verurteilt.\n\nSCHOPENHAUER: Blinder Wille bewegt alles. Freies Ich = Illusion.\n\nSCHLUSS: Eigene begründete Position."
              },
              points: 30,
              criteria: {
                es: "• 10 Puntos: Presentación profunda de Kant y otro filósofo.\n• 10 Puntos: Calidad argumentativa (diálogo entre posiciones, no yuxtaposición).\n• 10 Puntos: Expresión filosófica (precisión, estructura, postura propia).",
                de: "• 10 Punkte: Tiefe Darstellung von Kant und mind. einem weiteren Philosophen.\n• 10 Punkte: Argumentationsqualität (Dialog, nicht bloße Aufzählung).\n• 10 Punkte: Philosophischer Ausdruck und eigene Position."
              },
              recommendation: {
                es: "El error fatal es yuxtaponer posiciones sin conectarlas. El corrector quiere ver que los filósofos DIALOGAN entre sí. No es un resumen — es un debate filosófico.",
                de: "Positionen nebeneinanderstellen ist der häufigste Fehler. Die Philosophen sollen miteinander im Dialog stehen. Kein Wikipedia-Artikel — ein philosophischer Diskurs."
              }
            }
          ]
        }
      ]
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE IMPORTACIÓN
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log("══════════════════════════════════════════════════════");
  console.log("  ABITURDSV — IMPORTADOR DE CONTENIDO DIA/ZfA");
  console.log("  Deutsche Schule Valencia — Región 5");
  console.log("  Ref: https://www.zfa.bund.de/de/dia/");
  console.log("══════════════════════════════════════════════════════");

  let importedCount = 0;
  let skippedCount  = 0;

  for (const subject of SUBJECTS) {
    const filePath = path.join(DATA_DIR, `${subject}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath} — saltando.`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`❌ Error al parsear ${filePath}:`, e.message);
      continue;
    }

    const newExams = DIA_EXAM_BANK[subject] || [];
    if (newExams.length === 0) {
      console.log(`✓  ${subject}: sin nuevos exámenes en este ciclo.`);
      continue;
    }

    if (!data.official_exams_archive) data.official_exams_archive = [];

    let subjectChanged = false;
    for (const exam of newExams) {
      const exists = data.official_exams_archive.some(x => x.id === exam.id);
      if (!exists) {
        data.official_exams_archive.push(exam);
        console.log(`✨ [NUEVO] '${exam.title}'`);
        importedCount++;
        subjectChanged = true;
      } else {
        console.log(`✓  [YA EXISTE] '${exam.title}'`);
        skippedCount++;
      }
    }

    if (subjectChanged) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`💾 Guardado: ${filePath}`);
    }
  }

  console.log("══════════════════════════════════════════════════════");
  console.log(`🎉 Importación completada:`);
  console.log(`   • Nuevos exámenes importados: ${importedCount}`);
  console.log(`   • Ya existentes (sin cambios): ${skippedCount}`);
  console.log("══════════════════════════════════════════════════════");
}

run().catch(err => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
