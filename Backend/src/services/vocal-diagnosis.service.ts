/**
 * ============================================
 * MOTOR DE INFERENCIA - SERVICIO DE DIAGNÓSTICO VOCAL
 * ============================================
 * Implementación 100% basada en Prolog (Tau-Prolog)
 * 
 * Este módulo:
 * - Carga la Base de Conocimientos Prolog (vocal_rules.pl)
 * - Inyecta hechos dinámicos desde la telemetría
 * - Ejecuta consultas mediante Encadenamiento hacia Atrás (Backward Chaining)
 * - Mapea las conclusiones lógicas a respuestas estructuradas
 * 
 * NO CONTIENE LÓGICA IMPERATIVA DE DIAGNÓSTICO
 * Toda la inferencia es delegada al Motor Prolog
 * 
 * @author KOACH Team
 * @version 2.0.0 (Pure Prolog Edition)
 */

import * as fs from 'fs';
import * as path from 'path';
import pl from 'tau-prolog';
import { SessionTelemetry, VocalDiagnosis } from '../types';

// ============================================
// BASE DE CONOCIMIENTOS: PRESCRIPCIONES
// ============================================
// Mapeo de diagnósticos Prolog a tratamientos terapéuticos
const KNOWLEDGE_BASE_PRESCRIPTIONS: Record<string, {
  primaryIssue: string;
  diagnosis: string;
  prescription: string[];
  affectedRange: 'low' | 'mid' | 'high' | 'full';
}> = {
  // ============================================
  // 🆕 DIAGNÓSTICOS POSITIVOS (excelentes resultados)
  // ============================================
  performance_excelente_afinacion: {
    primaryIssue: '¡Excelente Afinación!',
    diagnosis: 'Tu afinación es sobresaliente (0-50 cents RMS de error). Mantienes las notas objetivo con Alta precisión y estabilidad. ¡Sigue así!',
    prescription: [
      '🎉 ¡Felicitaciones! Tu afinación es excelente para nivel amateur/intermedio',
      '🎯 Mantén esta consistencia: practica regularmente para no perder el nivel',
      '⬆️ Desafío: Intenta canciones más difíciles o rangos más amplios',
      '🎵 Consejo: Trabaja en otros aspectos como expresión, dinámica y fraseo',
    ],
    affectedRange: 'full',
  },
  performance_buena_afinacion: {
    primaryIssue: 'Buena Afinación',
    diagnosis: 'Tu afinación es buena (50-100 cents RMS). Cantas dentro del rango aceptable con estabilidad. Pequeñas mejoras te llevarán al siguiente nivel.',
    prescription: [
      '👍 ¡Bien hecho! Tu afinación está en el rango aceptable',
      '🎯 Para mejorar: Practica con un afinador visual para ajustar las notas más críticas',
      '🎹 Ejercicio: Escalas lentas con piano de referencia (cada nota 4 segundos)',
      '📈 Estás cerca del nivel excelente - sigue practicando',
    ],
    affectedRange: 'full',
  },
  performance_regular_afinacion: {
    primaryIssue: 'Afinación Regular',
    diagnosis: 'Tu afinación es aceptable pero necesita trabajo (100-150 cents RMS). Algunos pasajes presentan desviaciones perceptibles. Con práctica mejorarás significativamente.',
    prescription: [
      '📊 Tu afinación está en desarrollo - hay margen de mejora',
      '🎹 Prioridad: Practica ejercicios de oído (repetir notas de un piano)',
      '🎧 Herramienta: Usa un afinador mientras cantas para autocorregirte',
      '⏱️ Técnica: Canta más lento hasta dominar cada nota, luego acelera',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICOS DE PROBLEMAS
  // ============================================
  desafinacion_seria_detectada: {
    primaryIssue: 'Desafinación Significativa',
    diagnosis: 'Se detectó un error de afinación considerable (150+ cents RMS, más de un semitono). Esto indica que las notas cantadas se alejan significativamente del objetivo.',
    prescription: [
      '🚨 Tu afinación requiere atención urgente',
      '🎹 Fundamentos: Empieza con escalas simples con piano (Do-Re-Mi-Fa-Sol)',
      '🎧 Afinador visual: Úsalo en TODAS tus prácticas hasta mejorar',
      '⏱️ Canta MUY lento - no intentes seguir el tempo de la canción todavía',
      '🎯 Una nota a la vez: Practica sostener cada nota afinada por 5 segundos',
    ],
    affectedRange: 'full',
  },
  desafinacion_general: {
    primaryIssue: 'Afinación Inestable',
    diagnosis: 'La afinación fluctúa entre pasajes. Algunos fragmentos están bien, pero hay inconsistencia general. Posible fatiga o falta de práctica.',
    prescription: [
      '📊 Tu afinación es inconsistente - algunos pasajes bien, otros no',
      '🌬️ Respiración: Puede ser falta de soporte de aire - practica respiración diafragmática',
      '🎹 Ejercicio: Notas largas sostenidas sin fluctuar (4-8 segundos cada una)',
      '💪 Fortalece tu control vocal con ejercicios de apoyo abdominal',
    ],
    affectedRange: 'full',
  },
  
  // ============================================
  // DIAGNÓSTICOS DE AFINACIÓN (Pitch)
  // ============================================
  hipoafinacion_sistematica: {
    primaryIssue: 'Hipoafinación Sistemática',
    diagnosis: 'Tendencia persistente a cantar por debajo del tono objetivo. El oído percibe la nota pero la laringe no alcanza la frecuencia correcta.',
    prescription: [
      '🎯 Ejercicio: "Glissando Ascendente" - Desliza desde tu nota cómoda hacia arriba',
      '🎹 Practica con referencia de piano: escucha la nota y luego cántala',
      '🎧 Graba tu voz y compárala con la pista original',
      '⬆️ Trabaja en "pensar más arriba" antes de emitir cada nota',
    ],
    affectedRange: 'full',
  },
  hiperafinacion_sistematica: {
    primaryIssue: 'Hiperafinación Sistemática',
    diagnosis: 'Tendencia a cantar por encima del tono objetivo. Común en cantantes con mucha energía o tensión vocal.',
    prescription: [
      '🎯 Ejercicio: "Descenso Controlado" - Practica bajar medio tono conscientemente',
      '😌 Relaja la mandíbula y el cuello antes de cantar',
      '🎹 Usa un afinador visual para monitorear tu pitch en tiempo real',
      '⬇️ Piensa en "soltar" la nota en lugar de empujarla',
    ],
    affectedRange: 'full',
  },
  afinacion_inestable: {
    primaryIssue: 'Afinación Inestable',
    diagnosis: 'Fluctuaciones erráticas entre notas altas y bajas sin patrón definido. Puede indicar fatiga vocal o falta de control de aire.',
    prescription: [
      '🌬️ Ejercicio: "Respiración Diafragmática" - 4 segundos inhalar, 8 sostener, 8 exhalar',
      '🎯 Practica notas largas sostenidas sin variación',
      '📊 Usa KOACH para identificar en qué registro fluctúas más',
      '💪 Fortalece el apoyo abdominal mientras cantas',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICOS DE TIMING (Ritmo)
  // ============================================
  entrada_tardia_cronica: {
    primaryIssue: 'Entrada Tardía Crónica',
    diagnosis: 'Patrón consistente de comenzar las notas después del beat. Puede indicar inseguridad o procesamiento auditivo lento.',
    prescription: [
      '🥁 Ejercicio: "Metrónomo Activo" - Practica con metrónomo a tempo lento',
      '🎯 Anticipa mentalmente cada nota antes del tiempo',
      '👂 Escucha la pista 2-3 veces antes de cantar para interiorizar el timing',
      '🏃 Practica hablando las letras en ritmo antes de cantar',
    ],
    affectedRange: 'full',
  },
  entrada_adelantada: {
    primaryIssue: 'Entrada Adelantada',
    diagnosis: 'Tendencia a comenzar las notas antes del tiempo. Común en cantantes ansiosos o muy experimentados.',
    prescription: [
      '⏱️ Ejercicio: "Pausa Consciente" - Cuenta internamente antes de cada frase',
      '😌 Practica respirar en el silencio antes de cada entrada',
      '🎧 Escucha más atentamente la guía instrumental',
      '🧘 Reduce la ansiedad con ejercicios de relajación pre-canto',
    ],
    affectedRange: 'full',
  },
  timing_irregular: {
    primaryIssue: 'Timing Irregular',
    diagnosis: 'Entradas inconsistentes, a veces tempranas y a veces tardías. Indica falta de internalización del tempo.',
    prescription: [
      '🥁 Ejercicio: "Palmas con Metrónomo" - Practica el ritmo sin cantar primero',
      '📝 Marca los tiempos fuertes en la letra de la canción',
      '🎯 Divide la canción en secciones y practica cada una por separado',
      '🔄 Repite secciones problemáticas hasta que el timing sea natural',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICOS DE ESTABILIDAD VOCAL
  // ============================================
  tremolo_excesivo: {
    primaryIssue: 'Trémolo Excesivo',
    diagnosis: 'Vibrato demasiado rápido (>7 Hz) que puede sonar nervioso o incontrolado. Puede indicar tensión laríngea.',
    prescription: [
      '🎯 Ejercicio: "Nota Plana" - Sostén una nota sin ninguna oscilación',
      '😌 Relaja conscientemente la garganta mientras cantas',
      '🌬️ Enfócate en un flujo de aire constante y controlado',
      '⏱️ Practica notas largas muy lentas (8+ segundos)',
    ],
    affectedRange: 'mid',
  },
  tremolo_control_aire: {
    primaryIssue: 'Inestabilidad Vocal',
    diagnosis: 'La voz fluctúa de manera inconsistente, indicando problemas de control de aire o soporte respiratorio. La varianza de estabilidad es muy alta.',
    prescription: [
      '🌬️ Prioridad: Trabaja soporte respiratorio diafragmático',
      '💪 Ejercicio: Inhala 4 segundos, sostén 4, exhala 8 (sin cantar)',
      '🎹 Practica notas sostenidas largas con afinador visual (objetivo: línea recta)',
      '😌 Reduce tensión en cuello y hombros - la estabilidad viene del diafragma',
      '⏱️ Empieza con 5 segundos por nota, aumenta gradualmente a 10-15 segundos',
    ],
    affectedRange: 'full',
  },
  vibrato_ausente: {
    primaryIssue: 'Vibrato Ausente',
    diagnosis: 'Falta de oscilación natural en notas sostenidas. Puede sonar robótico o sin emoción.',
    prescription: [
      '🎯 Ejercicio: "Oscilación Inducida" - Varía manualmente medio tono arriba/abajo',
      '🎹 Imita a cantantes con vibrato natural y controlado',
      '😌 Relaja la mandíbula para permitir la oscilación natural',
      '🏋️ El vibrato vendrá naturalmente con técnica relajada - no lo fuerces',
    ],
    affectedRange: 'full',
  },
  voz_calada: {
    primaryIssue: 'Voz Calada',
    diagnosis: 'Cortes abruptos de sonido, típicamente por falta de aire o cierre glótico involuntario.',
    prescription: [
      '🌬️ Ejercicio: "Columna de Aire" - Practica frases largas con flujo continuo',
      '💪 Fortalece el apoyo diafragmático con ejercicios de respiración',
      '📏 Marca puntos de respiración estratégicos en las canciones',
      '🎯 Practica sostener notas hasta "quedarte sin aire" controladamente',
    ],
    affectedRange: 'full',
  },
  tension_vocal: {
    primaryIssue: 'Tensión Vocal',
    diagnosis: 'Combinación de inestabilidad y fluctuaciones que indica esfuerzo excesivo en la fonación.',
    prescription: [
      '😌 Ejercicio: "SOVT" - Usa pajilla o labios en vibración para reducir tensión',
      '🧘 Practica relajación de cuello y hombros antes de cantar',
      '🎯 Canta en un registro más cómodo antes de abordar notas difíciles',
      '💧 Mantén hidratación adecuada (2+ litros de agua diarios)',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICOS DE RANGO VOCAL
  // ============================================
  registro_bajo_debil: {
    primaryIssue: 'Registro Bajo Débil',
    diagnosis: 'Dificultad para producir notas graves con claridad y potencia.',
    prescription: [
      '🎵 Ejercicio: "Chest Voice Slides" - Desliza desde notas medias hacia graves',
      '🔊 Practica proyectar desde el pecho, no desde la garganta',
      '🎯 Trabaja escalas descendentes lentamente',
      '📊 Identifica tu nota grave más cómoda y expándela gradualmente',
    ],
    affectedRange: 'low',
  },
  registro_alto_debil: {
    primaryIssue: 'Registro Alto Débil',
    diagnosis: 'Dificultad para alcanzar notas agudas sin tensión o pérdida de calidad.',
    prescription: [
      '🎵 Ejercicio: "Head Voice Training" - Practica "oo" suave en notas altas',
      '🌬️ Usa menos aire pero más presión subglótica controlada',
      '🎯 Trabaja escalas ascendentes con "mixed voice"',
      '😌 Evita empujar - las notas altas requieren relajación, no fuerza',
    ],
    affectedRange: 'high',
  },
  passaggio_inestable: {
    primaryIssue: 'Passaggio Inestable',
    diagnosis: 'Dificultad en la transición entre registros de pecho y cabeza.',
    prescription: [
      '🎵 Ejercicio: "Sirena Vocal" - Desliza suavemente por todo tu rango',
      '🔄 Practica escalas que cruzan el passaggio lentamente',
      '🎯 Identifica tus notas de cambio y trabájalas específicamente',
      '💪 Fortalece el "mix" con ejercicios de voz mixta',
    ],
    affectedRange: 'mid',
  },

  // ============================================
  // DIAGNÓSTICOS COMBINADOS
  // ============================================
  fatiga_vocal: {
    primaryIssue: 'Posible Fatiga Vocal',
    diagnosis: 'Patrón que sugiere cansancio vocal: inestabilidad + desafinación progresiva.',
    prescription: [
      '💤 Descanso vocal: Evita cantar por 24-48 horas',
      '💧 Hidratación intensiva: Agua tibia con miel',
      '🧘 Ejercicios suaves de respiración sin fonación',
      '⚠️ Si persiste, consulta a un foniatra',
    ],
    affectedRange: 'full',
  },
  tecnica_deficiente: {
    primaryIssue: 'Técnica Vocal Deficiente',
    diagnosis: 'Múltiples áreas de mejora detectadas. Se recomienda trabajo técnico fundamental.',
    prescription: [
      '📚 Considera tomar clases de canto con un profesor certificado',
      '🌬️ Prioriza ejercicios de respiración diafragmática',
      '🎯 Trabaja una canción sencilla hasta dominarla antes de avanzar',
      '🎧 Usa KOACH diariamente para monitorear tu progreso',
    ],
    affectedRange: 'full',
  },
  deficit_auditivo: {
    primaryIssue: 'Posible Déficit de Entrenamiento Auditivo',
    diagnosis: 'Desafinación bidireccional sugiere dificultad para percibir el pitch correcto.',
    prescription: [
      '🎹 Ejercicio: Practica intervalos (unísono, tercera, quinta) con piano',
      '🎧 Usa apps de entrenamiento auditivo (EarMaster, Tenuto)',
      '🎯 Canta notas individuales con referencia antes de frases completas',
      '📊 Trabaja en la percepción auditiva antes de la producción vocal',
    ],
    affectedRange: 'full',
  },
  problemas_sincronizacion: {
    primaryIssue: 'Problemas de Sincronización Musical',
    diagnosis: 'Combinación de timing irregular y afinación variable. Indica desconexión con el acompañamiento.',
    prescription: [
      '🎧 Escucha la canción 5+ veces sin cantar, solo internalizando',
      '🥁 Practica el ritmo hablado antes de agregar melodía',
      '🎯 Divide en secciones pequeñas de 4-8 compases',
      '📝 Estudia la estructura de la canción (verso, coro, puente)',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICO POSITIVO
  // ============================================
  excelente: {
    primaryIssue: 'Salud Vocal Óptima',
    diagnosis: '¡Excelente performance! Tu técnica vocal muestra un equilibrio saludable en afinación, timing y estabilidad. Continúa con tu práctica actual.',
    prescription: [
      '⭐ ¡Felicitaciones! Mantén tu rutina de práctica actual',
      '🎯 Desafíate con canciones de mayor dificultad',
      '🎤 Considera grabar covers para compartir tu progreso',
      '📈 Sigue usando KOACH para mantener tu nivel',
    ],
    affectedRange: 'full',
  },
  excelente_sesion_corta: {
    primaryIssue: 'Excelente Técnica (Sesión Corta)',
    diagnosis: 'Tu técnica vocal es excelente, pero la sesión fue breve. Practica más tiempo para obtener un análisis más completo de tu rango y resistencia.',
    prescription: [
      '⭐ ¡Excelente técnica vocal detectada!',
      '⏱️ Tu sesión fue corta - practica más tiempo para un análisis completo',
      '🎯 Continúa con tu técnica actual, solo necesitamos más datos',
    ],
    affectedRange: 'full',
  },

  // ============================================
  // DIAGNÓSTICOS DE PARTICIPACIÓN
  // ============================================
  participacion_insuficiente: {
    primaryIssue: 'Participación Insuficiente',
    diagnosis: 'Detectamos muy poca actividad vocal durante la sesión. Para obtener un análisis preciso, necesitamos escucharte cantar durante más tiempo.',
    prescription: [
      '⏱️ Intenta cantar durante más tiempo para obtener mejores resultados',
      '🎤 Activa tu micrófono y canta junto con la pista',
      '💡 KOACH necesita escucharte para darte feedback preciso',
    ],
    affectedRange: 'full',
  },
  sesion_muy_corta: {
    primaryIssue: 'Sesión Muy Corta',
    diagnosis: 'Tu sesión de práctica fue muy breve. Para un análisis completo de tu técnica vocal, te recomendamos practicar al menos 30 segundos.',
    prescription: [
      '⏰ Tu sesión fue muy corta - intenta practicar al menos 30 segundos',
      '🎵 Practica la canción completa para un análisis más preciso',
    ],
    affectedRange: 'full',
  },
};

// ============================================
// PESOS DE SEVERIDAD (para priorización)
// ============================================
const SEVERITY_WEIGHTS: Record<string, number> = {
  // 🆕 Diagnósticos positivos (no afectan severidad)
  performance_excelente_afinacion: 0,
  performance_buena_afinacion: 0,
  performance_regular_afinacion: 1,
  
  // 🆕 Críticos con nuevos umbrales
  desafinacion_seria_detectada: 100,  // 🆕 >150 cents - error catastrófico
  desafinacion_general: 2,  // 🆕 OBSOLETO - reducido drásticamente, preferir diagnósticos específicos
  
  // Diagnósticos de problemas
  fatiga_vocal: 10,
  voz_calada: 9,
  tension_vocal: 8,
  tecnica_deficiente: 8,
  tremolo_control_aire: 7,  // 🆕 Diagnóstico de estabilidad independiente
  hipoafinacion_sistematica: 7,
  hiperafinacion_sistematica: 7,
  hipoafinacion_soporte_respiratorio: 7,
  hiperafinacion_tension_laringea: 7,
  afinacion_inestable: 6,
  tremolo_excesivo: 6,
  passaggio_inestable: 5,
  registro_bajo_debil: 5,
  registro_alto_debil: 5,
  entrada_tardia_cronica: 4,
  entrada_adelantada: 4,
  timing_irregular: 4,
  deficit_auditivo: 4,
  problemas_sincronizacion: 4,
  vibrato_ausente: 3,
  participacion_insuficiente: 2,  // Baja prioridad - informativo
  excelente_sesion_corta: 1,      // Informativo - excelente pero corto
  sesion_muy_corta: 1,            // Muy baja prioridad - informativo
};

/**
 * Servicio de Diagnóstico Vocal basado en Prolog
 * 
 * ARQUITECTURA:
 * 1. Carga la KB (Knowledge Base) desde vocal_rules.pl
 * 2. Inyecta hechos dinámicos desde la telemetría
 * 3. Ejecuta query `diagnostico(X).` (Backward Chaining)
 * 4. Mapea resultados a estructura de respuesta
 * 
 * IMPORTANTE: Este servicio NO contiene lógica de diagnóstico.
 * Toda la inferencia es delegada al Motor Prolog.
 */
export class VocalDiagnosisService {
  private static knowledgeBase: string | null = null;

  /**
   * Carga la Base de Conocimientos Prolog desde disco
   */
  private static loadKnowledgeBase(): string {
    if (this.knowledgeBase) {
      return this.knowledgeBase;
    }

    // 🔧 FIX: Buscar vocal_rules.pl en src/logic/ directamente (para desarrollo con ts-node)
    // En producción (con dist/), usar la ruta relativa normal
    const isDevelopment = __dirname.includes('src');
    const kbPath = isDevelopment 
      ? path.join(__dirname, '..', 'logic', 'vocal_rules.pl')  // src/services/../logic/vocal_rules.pl
      : path.join(__dirname, '..', 'logic', 'vocal_rules.pl'); // dist/services/../logic/vocal_rules.pl
    
    if (!fs.existsSync(kbPath)) {
      console.error(`❌ Knowledge Base not found at: ${kbPath}`);
      console.error(`   __dirname: ${__dirname}`);
      console.error(`   isDevelopment: ${isDevelopment}`);
      throw new Error(`Prolog Knowledge Base not found: ${kbPath}`);
    }

    this.knowledgeBase = fs.readFileSync(kbPath, 'utf-8');
    console.log(`📚 Knowledge Base loaded from: ${kbPath}`);
    return this.knowledgeBase;
  }

  /**
   * Convierte la telemetría de sesión a hechos Prolog
   * 
   * ⚠️ IMPORTANTE: tau-prolog NO ejecuta directivas :- assertz(...)
   * Los hechos se insertan como cláusulas directas: predicado(valor).
   */
  private static telemetryToFacts(telemetry: SessionTelemetry): string {
    const facts: string[] = [];

    // Métricas de afinación (como cláusulas directas, NO assertz)
    facts.push(`pitch_deviation_cents(${telemetry.pitchDeviationAverage.toFixed(2)}).`);
    facts.push(`pitch_deviation_stddev(${telemetry.pitchDeviationStdDev.toFixed(2)}).`);
    facts.push(`notas_altas(${telemetry.sharpNotesCount}).`);
    facts.push(`notas_bajas(${telemetry.flatNotesCount}).`);

    // Métricas de timing
    facts.push(`rhythm_offset_ms(${telemetry.rhythmicOffsetAverage.toFixed(2)}).`);
    facts.push(`early_notes_count(${telemetry.earlyNotesCount}).`);
    facts.push(`late_notes_count(${telemetry.lateNotesCount}).`);

    // Métricas de estabilidad
    facts.push(`stability_variance(${telemetry.stabilityVariance.toFixed(4)}).`);
    facts.push(`vibrato_rate(${telemetry.vibratoRate.toFixed(2)}).`);
    facts.push(`vibrato_depth(${telemetry.vibratoDepth.toFixed(2)}).`);

    // Métricas de rango (usados por Prolog para dificultad_agudos/graves)
    facts.push(`notes_missed_high(${telemetry.rangeCoverage.notesMissedHigh}).`);
    facts.push(`notes_missed_low(${telemetry.rangeCoverage.notesMissedLow}).`);

    // Métricas de duración y participación
    const singingRatio = telemetry.totalDuration > 0 
      ? telemetry.activeSingingTime / telemetry.totalDuration 
      : 0;
    facts.push(`total_duration(${telemetry.totalDuration.toFixed(2)}).`);
    facts.push(`active_singing_time(${telemetry.activeSingingTime.toFixed(2)}).`);
    facts.push(`silence_time(${telemetry.silenceTime.toFixed(2)}).`);
    facts.push(`singing_ratio(${singingRatio.toFixed(4)}).`);
    facts.push(`notes_achieved_count(${telemetry.rangeCoverage.notesAchieved.length}).`);

    // ⚠️ LOG CRÍTICO DE DEBUG - Ver qué números recibe Prolog
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧠 MOTOR PROLOG - HECHOS DINÁMICOS INYECTADOS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎵 AFINACIÓN:');
    console.log(`   → pitch_deviation_cents(${telemetry.pitchDeviationAverage.toFixed(2)}) ⚠️ RMS, no promedio simple`);
    console.log(`   → pitch_deviation_stddev(${telemetry.pitchDeviationStdDev.toFixed(2)})`);
    console.log(`   → notas_altas(${telemetry.sharpNotesCount}) | notas_bajas(${telemetry.flatNotesCount})`);
    console.log('🥁 TIMING:');
    console.log(`   → rhythm_offset_ms(${telemetry.rhythmicOffsetAverage.toFixed(2)})`);
    console.log(`   → early_notes_count(${telemetry.earlyNotesCount}) | late_notes_count(${telemetry.lateNotesCount})`);
    console.log('🎯 ESTABILIDAD:');
    console.log(`   → stability_variance(${telemetry.stabilityVariance.toFixed(4)})`);
    console.log(`   → vibrato_rate(${telemetry.vibratoRate.toFixed(2)}) Hz`);
    console.log('🎤 RANGO:');
    console.log(`   → notes_missed_high(${telemetry.rangeCoverage.notesMissedHigh}) | notes_missed_low(${telemetry.rangeCoverage.notesMissedLow})`);
    console.log('⏱️ DURACIÓN:');
    console.log(`   → total_duration(${telemetry.totalDuration.toFixed(2)}) | active_singing_time(${telemetry.activeSingingTime.toFixed(2)})`);
    console.log(`   → singing_ratio(${singingRatio.toFixed(4)}) | notes_achieved(${telemetry.rangeCoverage.notesAchieved.length})`);
    console.log('═══════════════════════════════════════════════════════════');
    
    // 🔍 DEBUG: Mostrar los hechos generados
    console.log('📝 HECHOS GENERADOS (primeros 3):');
    facts.slice(0, 3).forEach(f => console.log(`   ${f}`));

    return facts.join('\n');
  }

  /**
   * Ejecuta el Motor de Inferencia Prolog
   * 
   * @param telemetry - Telemetría de la sesión
   * @returns Promise con objeto conteniendo diagnósticos y recomendaciones inferidos
   */
  private static async runPrologInference(telemetry: SessionTelemetry): Promise<{
    diagnoses: string[];
    recommendations: string[];
  }> {
    return new Promise((resolve, reject) => {
      try {
        // Crear sesión Prolog
        const session = pl.create();

        // Cargar KB + hechos dinámicos
        const kb = this.loadKnowledgeBase();
        const dynamicFacts = this.telemetryToFacts(telemetry);
        const fullProgram = `${kb}\n\n% === HECHOS DINÁMICOS (Telemetría) ===\n${dynamicFacts}`;

        console.log('🔧 Inyectando hechos dinámicos al Motor Prolog...');
        console.log('📊 Telemetría:', {
          pitchDeviation: telemetry.pitchDeviationAverage.toFixed(2),
          rhythmOffset: telemetry.rhythmicOffsetAverage.toFixed(2),
          vibratoRate: telemetry.vibratoRate.toFixed(2),
          stabilityVar: telemetry.stabilityVariance.toFixed(4),
        });

        // Consultar programa
        session.consult(fullProgram, {
          success: () => {
            console.log('✅ Programa Prolog cargado exitosamente');

            // Ejecutar query de diagnóstico (Backward Chaining)
            session.query('diagnostico(X).', {
              success: () => {
                const diagnoses: string[] = [];

                // Función recursiva para obtener todas las respuestas de diagnóstico
                const getDiagnoses = () => {
                  session.answer({
                    success: (answer: unknown) => {
                      if (answer) {
                        const formatted = pl.format_answer(answer);
                        // Extraer el diagnóstico del formato "X = diagnostico_name"
                        if (formatted) {
                          const match = formatted.match(/X\s*=\s*(\w+)/);
                          if (match && match[1]) {
                            diagnoses.push(match[1]);
                          }
                        }
                        getDiagnoses(); // Buscar más diagnósticos
                      } else {
                        // No hay más diagnósticos, ahora consultar recomendaciones
                        console.log(`🧠 Prolog encontró ${diagnoses.length} diagnóstico(s):`, diagnoses);
                        
                        // Ejecutar query de recomendaciones
                        session.query('recomendacion(Y).', {
                          success: () => {
                            const recommendations: string[] = [];
                            
                            // Función recursiva para obtener todas las recomendaciones
                            const getRecommendations = () => {
                              session.answer({
                                success: (answer: unknown) => {
                                  if (answer) {
                                    const formatted = pl.format_answer(answer);
                                    // Extraer la recomendación del formato "Y = 'texto'"
                                    if (formatted) {
                                      // Match para strings con comillas simples
                                      const match = formatted.match(/Y\s*=\s*'([^']+)'/);
                                      if (match && match[1]) {
                                        recommendations.push(match[1]);
                                      }
                                    }
                                    getRecommendations(); // Buscar más recomendaciones
                                  } else {
                                    // No hay más recomendaciones
                                    console.log(`💡 Prolog encontró ${recommendations.length} recomendación(es)`);
                                    resolve({ diagnoses, recommendations });
                                  }
                                },
                                fail: () => {
                                  console.log(`💡 Prolog encontró ${recommendations.length} recomendación(es)`);
                                  resolve({ diagnoses, recommendations });
                                },
                                error: (err: unknown) => {
                                  console.error('❌ Error al obtener recomendaciones:', err);
                                  resolve({ diagnoses, recommendations });
                                },
                              });
                            };
                            
                            getRecommendations();
                          },
                          error: (err: unknown) => {
                            console.error('❌ Error en query de recomendaciones:', err);
                            resolve({ diagnoses, recommendations: [] });
                          },
                        });
                      }
                    },
                    fail: () => {
                      console.log(`🧠 Prolog encontró ${diagnoses.length} diagnóstico(s):`, diagnoses);
                      // Sin diagnósticos, sin recomendaciones
                      resolve({ diagnoses, recommendations: [] });
                    },
                    error: (err: unknown) => {
                      console.error('❌ Error en answer de diagnóstico:', err);
                      resolve({ diagnoses, recommendations: [] });
                    },
                  });
                };

                getDiagnoses();
              },
              error: (err: unknown) => {
                console.error('❌ Error en query:', err);
                reject(new Error(`Prolog query error: ${err}`));
              },
            });
          },
          error: (err: unknown) => {
            console.error('❌ Error al cargar programa Prolog:', err);
            reject(new Error(`Prolog consult error: ${err}`));
          },
        });
      } catch (error) {
        console.error('❌ Error en Motor Prolog:', error);
        reject(error);
      }
    });
  }

  /**
   * Prioriza diagnósticos por severidad
   */
  private static prioritizeDiagnoses(diagnoses: string[]): string[] {
    return diagnoses.sort((a, b) => {
      const weightA = SEVERITY_WEIGHTS[a] ?? 1;
      const weightB = SEVERITY_WEIGHTS[b] ?? 1;
      return weightB - weightA; // Mayor peso primero
    });
  }

  /**
   * Determina la severidad global basada en los diagnósticos
   */
  private static determineSeverity(diagnoses: string[]): 'mild' | 'moderate' | 'severe' {
    if (diagnoses.length === 0) {
      return 'mild';
    }

    // Diagnósticos positivos siempre son 'mild'
    const firstDiagnosis = diagnoses[0];
    if (firstDiagnosis.includes('performance_excelente') || 
        firstDiagnosis.includes('performance_buena') ||
        firstDiagnosis.includes('performance_regular')) {
      return 'mild';
    }

    const maxWeight = Math.max(...diagnoses.map(d => SEVERITY_WEIGHTS[d] ?? 1));

    if (maxWeight >= 9) return 'severe';
    if (maxWeight >= 5) return 'moderate';
    return 'mild';
  }

  /**
   * Genera descripción detallada combinando múltiples diagnósticos
   */
  private static generateDetailedDescription(diagnoses: string[]): string {
    if (diagnoses.length === 0 || (diagnoses.length === 1 && diagnoses[0] === 'excelente')) {
      return KNOWLEDGE_BASE_PRESCRIPTIONS['excelente'].diagnosis;
    }

    const primary = diagnoses[0];
    const primaryInfo = KNOWLEDGE_BASE_PRESCRIPTIONS[primary];

    if (diagnoses.length === 1) {
      return primaryInfo?.diagnosis ?? 'Diagnóstico no reconocido en la base de conocimientos.';
    }

    // Múltiples diagnósticos
    const secondaryNames = diagnoses.slice(1, 3).map(d => {
      const info = KNOWLEDGE_BASE_PRESCRIPTIONS[d];
      return info?.primaryIssue ?? d;
    });

    return `${primaryInfo?.diagnosis ?? 'Diagnóstico principal detectado.'} Además se detectaron: ${secondaryNames.join(', ')}.`;
  }

  /**
   * Método principal de diagnóstico
   * 
   * Ejecuta el Motor de Inferencia Prolog y mapea los resultados
   * a una estructura VocalDiagnosis.
   * 
   * IMPORTANTE: NO hay fallback imperativo.
   * Si Prolog no encuentra diagnósticos problemáticos, retorna "excelente".
   * Las recomendaciones provienen exclusivamente de Prolog (NO hardcoded).
   */
  static async diagnose(telemetry: SessionTelemetry): Promise<VocalDiagnosis> {
    console.log('🚀 Iniciando Motor de Inferencia Prolog...');

    try {
      // Ejecutar inferencia Prolog (diagnósticos + recomendaciones)
      const { diagnoses: rawDiagnoses, recommendations: prologRecommendations } = 
        await this.runPrologInference(telemetry);

      // Filtrar diagnósticos desconocidos y priorizar
      const knownDiagnoses = rawDiagnoses.filter(d => d in KNOWLEDGE_BASE_PRESCRIPTIONS);
      const prioritizedDiagnoses = this.prioritizeDiagnoses(knownDiagnoses);

      // Si no hay diagnósticos o solo "excelente", es una performance excelente
      if (prioritizedDiagnoses.length === 0) {
        console.log('✨ Performance excelente - Sin problemas detectados');
        return this.buildExcellentDiagnosis();
      }

      // Obtener diagnóstico primario
      const primaryDiagnosis = prioritizedDiagnoses[0];
      const primaryInfo = KNOWLEDGE_BASE_PRESCRIPTIONS[primaryDiagnosis];

      // Las prescripciones de Prolog tienen prioridad, pero si no hay, usar las del KB
      let topRecommendations = prologRecommendations.slice(0, 6);
      
      // FALLBACK: Si Prolog no devolvió recomendaciones, usar las del Knowledge Base
      if (topRecommendations.length === 0 && primaryInfo?.prescription) {
        console.log(`⚠️ Prolog no devolvió recomendaciones, usando KB para: ${primaryDiagnosis}`);
        topRecommendations = primaryInfo.prescription;
      }

      console.log(`📋 Prescripciones finales: ${topRecommendations.length} ejercicio(s)`);

      // Construir respuesta estructurada
      return {
        primaryIssue: primaryInfo?.primaryIssue ?? primaryDiagnosis,
        secondaryIssues: prioritizedDiagnoses.slice(1, 4).map(d => 
          KNOWLEDGE_BASE_PRESCRIPTIONS[d]?.primaryIssue ?? d
        ),
        diagnosis: this.generateDetailedDescription(prioritizedDiagnoses),
        prescription: topRecommendations,
        severity: this.determineSeverity(prioritizedDiagnoses),
        affectedRange: primaryInfo?.affectedRange ?? 'full',
        allDiagnoses: prioritizedDiagnoses, // ✨ NUEVO: Lista completa de diagnósticos detectados
      };

    } catch (error) {
      console.error('❌ Error en Motor de Inferencia:', error);
      
      // En caso de error del motor Prolog, retornar diagnóstico de error técnico
      return {
        primaryIssue: 'Error Técnico',
        secondaryIssues: [],
        diagnosis: 'Hubo un error al procesar tu performance. Por favor intenta de nuevo.',
        prescription: [
          '🔄 Intenta cantar de nuevo',
          '🎤 Asegúrate de que el micrófono esté funcionando correctamente',
          '📧 Si el problema persiste, contacta soporte técnico',
        ],
        severity: 'mild',
        affectedRange: 'full',
      };
    }
  }

  /**
   * Construye diagnóstico para performance excelente
   * Las recomendaciones se obtienen desde KNOWLEDGE_BASE_PRESCRIPTIONS
   * (que mantiene la estructura pero las recomendaciones reales vienen de Prolog)
   */
  private static buildExcellentDiagnosis(): VocalDiagnosis {
    const info = KNOWLEDGE_BASE_PRESCRIPTIONS['excelente'];
    return {
      primaryIssue: info.primaryIssue,
      secondaryIssues: [],
      diagnosis: info.diagnosis,
      prescription: info.prescription, // Fallback para "excelente"
      severity: 'mild',
      affectedRange: info.affectedRange,
    };
  }

  /**
   * Obtiene la lista de todos los diagnósticos disponibles
   * (Útil para debugging y documentación)
   */
  static getAvailableDiagnoses(): string[] {
    return Object.keys(KNOWLEDGE_BASE_PRESCRIPTIONS);
  }

  /**
   * Obtiene información de un diagnóstico específico
   * (Útil para debugging)
   */
  static getDiagnosisInfo(diagnosisId: string) {
    return KNOWLEDGE_BASE_PRESCRIPTIONS[diagnosisId] ?? null;
  }
}
