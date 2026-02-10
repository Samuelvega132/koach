/**
 * ============================================
 * SERVICIO DE DIAGNÓSTICO VOCAL AVANZADO
 * ============================================
 * Motor de inferencia basado en reglas heurísticas de pedagogía vocal
 * Detecta patrones específicos de error y prescribe ejercicios correctivos
 */

import { SessionTelemetry, VocalDiagnosis } from '../types';

/**
 * Servicio de diagnóstico vocal con reglas expertas
 */
export class VocalDiagnosisService {
    // ============================================
    // UMBRALES DE DIAGNÓSTICO (Ajustados para sensibilidad)
    // ============================================
    private static readonly THRESHOLDS = {
        // Afinación (MÁS SENSIBLES: 10 cents es el límite profesional)
        HYPO_PITCH_CENTS: -10,        // Canta consistentemente bajo (flat)
        HYPER_PITCH_CENTS: 10,        // Canta consistentemente alto (sharp)
        PITCH_VARIANCE_HIGH: 20,      // Varianza alta en afinación

        // Estabilidad (MÁS SENSIBLES)
        STABILITY_VARIANCE_HIGH: 15,  // Hz - Tremolo/vibrato excesivo
        VIBRATO_RATE_EXCESSIVE: 6.5,  // Hz - Vibrato demasiado rápido (normal: 4-6 Hz)

        // Timing (MÁS SENSIBLES: 50ms es perceptible)
        TIMING_OFFSET_HIGH: 50,       // ms - Retraso/adelanto significativo
        EARLY_NOTES_RATIO: 1.5,       // Ratio de notas anticipadas vs retrasadas

        // Rango
        RANGE_COVERAGE_LOW: 0.4,      // 40% de notas falladas = problema de rango
    };

    // ============================================
    // SISTEMA DE PESOS POR SEVERIDAD
    // ============================================
    private static readonly SEVERITY_WEIGHTS = {
        severe: 100,
        moderate: 50,
        mild: 10,
    };

    /**
     * Analiza la telemetría de sesión y genera diagnóstico completo
     */
    static diagnose(telemetry: SessionTelemetry): VocalDiagnosis {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🩺 INICIANDO DIAGNÓSTICO VOCAL');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 TELEMETRÍA RECIBIDA:');
        console.log('   → Pitch Deviation Avg:', telemetry.pitchDeviationAverage.toFixed(2), 'cents');
        console.log('   → Pitch Deviation StdDev:', telemetry.pitchDeviationStdDev.toFixed(2), 'cents');
        console.log('   → Sharp Notes:', telemetry.sharpNotesCount);
        console.log('   → Flat Notes:', telemetry.flatNotesCount);
        console.log('   → Stability Variance:', telemetry.stabilityVariance.toFixed(2), 'Hz');
        console.log('   → Vibrato Rate:', telemetry.vibratoRate.toFixed(2), 'Hz');
        console.log('   → Rhythmic Offset Avg:', telemetry.rhythmicOffsetAverage.toFixed(0), 'ms');
        console.log('   → Early Notes:', telemetry.earlyNotesCount);
        console.log('   → Late Notes:', telemetry.lateNotesCount);
        console.log('   → Notes Missed:', telemetry.rangeCoverage.notesMissed.length);
        console.log('═══════════════════════════════════════════════════════════');

        const issues: Array<{ rule: string; diagnosis: string; prescription: string[]; severity: 'mild' | 'moderate' | 'severe'; weight: number; affectedRange?: 'low' | 'mid' | 'high' | 'full' }> = [];

        // ============================================
        // REGLA 1: HIPOAFINACIÓN (Canta Bajo - FLAT)
        // ============================================
        if (telemetry.pitchDeviationAverage < this.THRESHOLDS.HYPO_PITCH_CENTS) {
            const severity = this.calculateSeverity(
                Math.abs(telemetry.pitchDeviationAverage),
                10, 20, 35
            );
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R1 ACTIVADA: Hipoafinación');
            console.log('   → Desviación:', telemetry.pitchDeviationAverage.toFixed(2), 'cents (umbral:', this.THRESHOLDS.HYPO_PITCH_CENTS, ')');
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R1',
                diagnosis: 'Hipoafinación por falta de presión subglótica',
                prescription: [
                    '🫁 Respiración Diafragmática: Inhala profundamente expandiendo el abdomen, no el pecho',
                    '💋 Lip Trills (Trinos labiales): Exhala haciendo vibrar los labios mientras subes y bajas de tono',
                    '🎯 Sirenas Ascendentes: Desliza desde tu nota más grave hasta la más aguda con "NG" nasal',
                    '⚡ Ejercicio de Apoyo: Canta notas sostenidas presionando suavemente tu abdomen hacia adentro',
                ],
                severity,
                weight,
                affectedRange: this.detectAffectedRange(telemetry, 'flat'),
            });
        } else {
            console.log('❌ REGLA R1: No activada (Pitch avg:', telemetry.pitchDeviationAverage.toFixed(2), '>=', this.THRESHOLDS.HYPO_PITCH_CENTS, ')');
        }

        // ============================================
        // REGLA 2: HIPERAFINACIÓN (Canta Alto - SHARP)
        // ============================================
        if (telemetry.pitchDeviationAverage > this.THRESHOLDS.HYPER_PITCH_CENTS) {
            const severity = this.calculateSeverity(
                telemetry.pitchDeviationAverage,
                10, 20, 35
            );
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R2 ACTIVADA: Hiperafinación');
            console.log('   → Desviación:', telemetry.pitchDeviationAverage.toFixed(2), 'cents (umbral:', this.THRESHOLDS.HYPER_PITCH_CENTS, ')');
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R2',
                diagnosis: 'Hiperafinación por constricción laríngea (tensión)',
                prescription: [
                    '🧘 Masaje Laríngeo: Relaja tu garganta masajeando suavemente los músculos del cuello',
                    '🎵 Vocalización con "M": Canta escalas con la boca cerrada, sintiendo vibración en los labios',
                    '🌊 Descensos Cromáticos: Baja lentamente de tono con "AH" relajado, sin forzar',
                    '😌 Bostezo Simulado: Practica cantando con sensación de bostezo para abrir la garganta',
                ],
                severity,
                weight,
                affectedRange: this.detectAffectedRange(telemetry, 'sharp'),
            });
        } else {
            console.log('❌ REGLA R2: No activada (Pitch avg:', telemetry.pitchDeviationAverage.toFixed(2), '<=', this.THRESHOLDS.HYPER_PITCH_CENTS, ')');
        }

        // ============================================
        // REGLA 3: TREMOLO / INESTABILIDAD
        // ============================================
        if (telemetry.stabilityVariance > this.THRESHOLDS.STABILITY_VARIANCE_HIGH) {
            const severity = this.calculateSeverity(
                telemetry.stabilityVariance,
                15, 30, 50
            );
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R3 ACTIVADA: Tremolo/Inestabilidad');
            console.log('   → Variance:', telemetry.stabilityVariance.toFixed(2), 'Hz (umbral:', this.THRESHOLDS.STABILITY_VARIANCE_HIGH, ')');
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R3',
                diagnosis: 'Falta de control en el flujo de aire (Tremolo)',
                prescription: [
                    '🎼 Long Tones (Notas Largas): Sostén una nota durante 10-15 segundos sin vibrato',
                    '📏 Ejercicio de la Regla: Exhala lentamente durante 20 segundos con "SSS" constante',
                    '🎯 Notas Guiadas: Usa un afinador visual y mantén la aguja estable',
                    '💪 Fortalecimiento del Core: Ejercicios de plancha para mejorar el soporte abdominal',
                ],
                severity,
                weight,
                affectedRange: 'full',
            });
        } else {
            console.log('❌ REGLA R3: No activada (Stability variance:', telemetry.stabilityVariance.toFixed(2), '<=', this.THRESHOLDS.STABILITY_VARIANCE_HIGH, ')');
        }

        // ============================================
        // REGLA 7: TIMING INCONSISTENTE
        // ============================================
        if (Math.abs(telemetry.rhythmicOffsetAverage) > this.THRESHOLDS.TIMING_OFFSET_HIGH) {
            const isEarly = telemetry.rhythmicOffsetAverage < 0;
            const severity = this.calculateSeverity(
                Math.abs(telemetry.rhythmicOffsetAverage),
                50, 100, 200
            );
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R7 ACTIVADA: Timing Inconsistente');
            console.log('   → Rhythmic Offset:', telemetry.rhythmicOffsetAverage.toFixed(0), 'ms (umbral:', this.THRESHOLDS.TIMING_OFFSET_HIGH, ')');
            console.log('   → Dirección:', isEarly ? 'EARLY (Anticipado)' : 'LATE (Retrasado)');
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R7',
                diagnosis: isEarly
                    ? 'Anticipación excesiva (entradas adelantadas)'
                    : 'Retraso rítmico (entradas tardías)',
                prescription: [
                    '🥁 Práctica con Metrónomo: Canta con click a 60 BPM, aumenta gradualmente',
                    '👏 Clapping Exercises: Aplaude el ritmo antes de cantar para internalizarlo',
                    '🎧 Grabación y Análisis: Grábate y compara con la pista original',
                    isEarly
                        ? '⏸️ Onset Retardado: Practica entrar DESPUÉS del beat intencionalmente'
                        : '⚡ Ejercicios de Reacción: Responde rápidamente a señales auditivas',
                ],
                severity,
                weight,
                affectedRange: 'full',
            });
        } else {
            console.log('❌ REGLA R7: No activada (Rhythmic offset:', Math.abs(telemetry.rhythmicOffsetAverage).toFixed(0), '<=', this.THRESHOLDS.TIMING_OFFSET_HIGH, ')');
        }

        // ============================================
        // REGLA 4: VIBRATO EXCESIVO
        // ============================================
        if (telemetry.vibratoRate > this.THRESHOLDS.VIBRATO_RATE_EXCESSIVE) {
            const severity = 'mild';
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R4 ACTIVADA: Vibrato Excesivo');
            console.log('   → Vibrato Rate:', telemetry.vibratoRate.toFixed(2), 'Hz (umbral:', this.THRESHOLDS.VIBRATO_RATE_EXCESSIVE, ')');
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R4',
                diagnosis: 'Vibrato excesivo o descontrolado',
                prescription: [
                    '🎯 Ejercicios de Sostenimiento: Alterna entre notas con y sin vibrato',
                    '🧊 Straight Tone Practice: Practica notas completamente rectas (sin vibrato)',
                    '🎚️ Control Gradual: Empieza sin vibrato, añádelo gradualmente al final de la nota',
                ],
                severity,
                weight,
                affectedRange: 'full',
            });
        } else {
            console.log('❌ REGLA R4: No activada (Vibrato rate:', telemetry.vibratoRate.toFixed(2), '<=', this.THRESHOLDS.VIBRATO_RATE_EXCESSIVE, ')');
        }

        // ============================================
        // REGLA 5: DIFICULTAD EN AGUDOS
        // ============================================
        if (telemetry.rangeCoverage.notesMissed.some(note => this.isHighNote(note))) {
            const severity = 'moderate';
            const weight = this.SEVERITY_WEIGHTS[severity];
            const highNotesMissed = telemetry.rangeCoverage.notesMissed.filter(n => this.isHighNote(n));

            console.log('✅ REGLA R5 ACTIVADA: Dificultad en Agudos');
            console.log('   → Notas agudas falladas:', highNotesMissed.length);
            console.log('   → Notas:', highNotesMissed.join(', '));
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R5',
                diagnosis: 'Dificultad para alcanzar notas agudas',
                prescription: [
                    '🎵 Sirenas Ascendentes: Desliza suavemente hacia los agudos con "NG" o "M"',
                    '🗣️ Head Voice Training: Practica falsete y voz de cabeza con vocales cerradas (I, U)',
                    '🎭 Resonancia Nasal: Canta agudos con sensación de resonancia en la máscara facial',
                    '📈 Extensión Gradual: No fuerces, extiende tu rango medio tono por semana',
                ],
                severity,
                weight,
                affectedRange: 'high',
            });
        } else {
            console.log('❌ REGLA R5: No activada (Sin notas agudas falladas)');
        }

        // ============================================
        // REGLA 6: DIFICULTAD EN GRAVES
        // ============================================
        if (telemetry.rangeCoverage.notesMissed.some(note => this.isLowNote(note))) {
            const severity = 'moderate';
            const weight = this.SEVERITY_WEIGHTS[severity];
            const lowNotesMissed = telemetry.rangeCoverage.notesMissed.filter(n => this.isLowNote(n));

            console.log('✅ REGLA R6 ACTIVADA: Dificultad en Graves');
            console.log('   → Notas graves falladas:', lowNotesMissed.length);
            console.log('   → Notas:', lowNotesMissed.join(', '));
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R6',
                diagnosis: 'Dificultad para alcanzar notas graves',
                prescription: [
                    '🎵 Descensos Cromáticos: Baja lentamente con "AH" relajado',
                    '💪 Chest Voice Training: Practica voz de pecho con vocales abiertas (A, O)',
                    '🗣️ Vocal Fry: Usa "creaky voice" para explorar tu registro más bajo',
                    '📉 Relajación Laríngea: Evita tensión al bajar, deja que la laringe descienda naturalmente',
                ],
                severity,
                weight,
                affectedRange: 'low',
            });
        } else {
            console.log('❌ REGLA R6: No activada (Sin notas graves falladas)');
        }

        // ============================================
        // REGLA 8: ANTICIPACIÓN EXCESIVA
        // ============================================
        if (telemetry.earlyNotesCount > telemetry.lateNotesCount * this.THRESHOLDS.EARLY_NOTES_RATIO) {
            const severity = 'mild';
            const weight = this.SEVERITY_WEIGHTS[severity];

            console.log('✅ REGLA R8 ACTIVADA: Anticipación Excesiva');
            console.log('   → Early Notes:', telemetry.earlyNotesCount);
            console.log('   → Late Notes:', telemetry.lateNotesCount);
            console.log('   → Ratio:', (telemetry.earlyNotesCount / Math.max(telemetry.lateNotesCount, 1)).toFixed(2));
            console.log('   → Severidad:', severity.toUpperCase());
            console.log('   → Peso:', weight);

            issues.push({
                rule: 'R8',
                diagnosis: 'Anticipación excesiva (ansioso por entrar)',
                prescription: [
                    '⏸️ Delayed Onset Practice: Practica entrar medio tiempo DESPUÉS del beat',
                    '🧘 Respiración Pre-Entrada: Toma un respiro consciente antes de cada frase',
                    '🎯 Marcadores Visuales: Usa el piano roll para anticipar visualmente las entradas',
                ],
                severity,
                weight,
                affectedRange: 'full',
            });
        } else {
            console.log('❌ REGLA R8: No activada (Early/Late ratio:', (telemetry.earlyNotesCount / Math.max(telemetry.lateNotesCount, 1)).toFixed(2), '<=', this.THRESHOLDS.EARLY_NOTES_RATIO, ')');
        }

        // ============================================
        // SELECCIÓN DE DIAGNÓSTICO PRINCIPAL (Sistema de Pesos)
        // ============================================
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 RESULTADO DEL ANÁLISIS:');
        console.log('   → Total de reglas activadas:', issues.length);

        if (issues.length === 0) {
            console.log('   → Diagnóstico: EXCELENTE (Ninguna regla activada)');
            console.log('═══════════════════════════════════════════════════════════');
            return this.getExcellentDiagnosis();
        }

        // Ordenar por PESO (severidad × importancia)
        issues.sort((a, b) => b.weight - a.weight);

        console.log('   → Reglas ordenadas por peso:');
        issues.forEach(issue => {
            console.log(`      ${issue.rule}: ${issue.diagnosis} (${issue.severity.toUpperCase()}, peso: ${issue.weight})`);
        });

        const primaryIssue = issues[0];
        const secondaryIssues = issues.slice(1).map(i => i.diagnosis);

        console.log('   → ⭐ DIAGNÓSTICO PRINCIPAL:', primaryIssue.rule, '-', primaryIssue.diagnosis);
        if (secondaryIssues.length > 0) {
            console.log('   → Diagnósticos secundarios:', secondaryIssues.join(', '));
        }
        console.log('═══════════════════════════════════════════════════════════');

        return {
            primaryIssue: primaryIssue.diagnosis,
            secondaryIssues,
            diagnosis: this.generateDetailedDiagnosis(primaryIssue, telemetry),
            prescription: primaryIssue.prescription,
            severity: primaryIssue.severity,
            affectedRange: primaryIssue.affectedRange || 'full',
        };
    }

    /**
     * Calcula la severidad basada en umbrales
     */
    private static calculateSeverity(
        value: number,
        _mildThreshold: number,
        moderateThreshold: number,
        severeThreshold: number
    ): 'mild' | 'moderate' | 'severe' {
        if (value >= severeThreshold) return 'severe';
        if (value >= moderateThreshold) return 'moderate';
        return 'mild';
    }

    /**
   * Detecta el rango afectado basado en las notas falladas
   */
    private static detectAffectedRange(
        telemetry: SessionTelemetry,
        _type: 'flat' | 'sharp'
    ): 'low' | 'mid' | 'high' | 'full' {
        const missedNotes = telemetry.rangeCoverage.notesMissed;

        const hasLowIssues = missedNotes.some(note => this.isLowNote(note));
        const hasHighIssues = missedNotes.some(note => this.isHighNote(note));

        if (hasLowIssues && hasHighIssues) return 'full';
        if (hasHighIssues) return 'high';
        if (hasLowIssues) return 'low';
        return 'mid';
    }

    /**
     * Determina si una nota es aguda (>= C5)
     */
    private static isHighNote(note: string): boolean {
        const octave = parseInt(note.match(/\d+/)?.[0] || '0');
        return octave >= 5;
    }

    /**
     * Determina si una nota es grave (<= C3)
     */
    private static isLowNote(note: string): boolean {
        const octave = parseInt(note.match(/\d+/)?.[0] || '0');
        return octave <= 3;
    }

    /**
     * Genera diagnóstico detallado con contexto técnico
     */
    private static generateDetailedDiagnosis(
        issue: { rule: string; diagnosis: string; severity: string },
        telemetry: SessionTelemetry
    ): string {
        const templates: Record<string, string> = {
            R1: `Se detectó una desviación promedio de ${Math.abs(telemetry.pitchDeviationAverage).toFixed(1)} cents por debajo del tono objetivo. Esto indica falta de presión subglótica (apoyo respiratorio insuficiente). Tu voz necesita más soporte del diafragma para mantener la afinación correcta.`,

            R2: `Se detectó una desviación promedio de ${telemetry.pitchDeviationAverage.toFixed(1)} cents por encima del tono objetivo. Esto sugiere constricción laríngea (tensión en la garganta). Estás forzando las cuerdas vocales, lo que eleva artificialmente el pitch.`,

            R3: `Se detectó una varianza de ${telemetry.stabilityVariance.toFixed(1)} Hz en notas sostenidas. Tu voz fluctúa excesivamente, indicando control inconsistente del flujo de aire. Esto puede deberse a falta de soporte abdominal o tensión muscular.`,

            R7: `Se detectó un offset rítmico promedio de ${Math.abs(telemetry.rhythmicOffsetAverage).toFixed(0)} ms. Tus entradas están ${telemetry.rhythmicOffsetAverage < 0 ? 'adelantadas' : 'retrasadas'} consistentemente. Necesitas mejorar tu sincronización con la pista.`,

            R4: `Se detectó un vibrato de ${telemetry.vibratoRate.toFixed(1)} Hz. El vibrato natural debe estar entre 4-6 Hz. Un vibrato excesivo puede sonar artificial o nervioso.`,

            R5: `Fallaste ${telemetry.rangeCoverage.notesMissed.filter(n => this.isHighNote(n)).length} notas agudas. Tu rango cómodo actual termina en ${telemetry.rangeCoverage.comfortableRange[1]}. Necesitas desarrollar tu voz de cabeza (head voice).`,

            R6: `Fallaste ${telemetry.rangeCoverage.notesMissed.filter(n => this.isLowNote(n)).length} notas graves. Tu rango cómodo actual comienza en ${telemetry.rangeCoverage.comfortableRange[0]}. Necesitas desarrollar tu voz de pecho (chest voice).`,

            R8: `${telemetry.earlyNotesCount} de tus entradas fueron anticipadas vs ${telemetry.lateNotesCount} retrasadas. Esto indica ansiedad o falta de control del onset (inicio de la nota).`,
        };

        return templates[issue.rule] || issue.diagnosis;
    }

    /**
     * Diagnóstico para performances excelentes (con variabilidad)
     */
    private static getExcellentDiagnosis(): VocalDiagnosis {
        const excellentMessages = [
            'No se detectaron problemas técnicos significativos. Tu afinación, estabilidad y timing están en niveles profesionales. ¡Sigue así!',
            'Performance impecable. Tus métricas vocales están dentro de los estándares profesionales. Continúa con esta consistencia.',
            'Excelente control técnico. Todos los parámetros vocales están optimizados. Tu técnica es sólida.',
        ];

        const randomIndex = Math.floor(Math.random() * excellentMessages.length);

        return {
            primaryIssue: '¡Performance Excelente!',
            secondaryIssues: [],
            diagnosis: excellentMessages[randomIndex],
            prescription: [
                '🏆 Mantén tu rutina actual de práctica',
                '📈 Considera aumentar la dificultad de las canciones',
                '🎤 Experimenta con diferentes estilos vocales',
                '🎵 Trabaja en interpretación y expresión emocional',
            ],
            severity: 'mild',
            affectedRange: 'full',
        };
    }
}
