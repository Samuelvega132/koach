/**
 * ============================================
 * BASE DE CONOCIMIENTOS - MOTOR DE INFERENCIA KOACH
 * ============================================
 * Sistema Experto para Diagnóstico Vocal
 * Implementación basada en Encadenamiento hacia Atrás (Backward Chaining)
 * 
 * Autor: KOACH Team
 * Versión: 2.0.0 (Prolog Edition)
 * Fecha: Febrero 2026
 * ============================================
 */

/* ============================================
 * SECCIÓN 1: HECHOS DINÁMICOS (Base de Datos Global)
 * ============================================
 * Estos predicados se inyectan en tiempo de ejecución
 * desde la telemetría del usuario mediante assertz/1
 */

:- dynamic(pitch_deviation_cents/1).
:- dynamic(pitch_deviation_stddev/1).
:- dynamic(rhythm_offset_ms/1).
:- dynamic(stability_variance/1).
:- dynamic(vibrato_rate/1).
:- dynamic(vibrato_depth/1).              % Profundidad del vibrato en cents
:- dynamic(notas_altas/1).                % Notas cantadas muy agudas (sharp)
:- dynamic(notas_bajas/1).                % Notas cantadas muy graves (flat)
:- dynamic(early_notes_count/1).          % Notas que entran temprano
:- dynamic(late_notes_count/1).           % Notas que entran tarde
:- dynamic(notes_missed_high/1).          % Notas agudas falladas (rango)
:- dynamic(notes_missed_low/1).           % Notas graves falladas (rango)
% Métricas de duración y participación (usadas en UI y disponibles para reglas)
:- dynamic(total_duration/1).             % Duración total de la sesión (segundos)
:- dynamic(active_singing_time/1).        % Tiempo cantando activamente (segundos)
:- dynamic(silence_time/1).               % Tiempo en silencio (segundos)
:- dynamic(singing_ratio/1).              % Ratio de canto vs silencio (0-1)
:- dynamic(notes_achieved_count/1).       % Número de notas logradas

/* ============================================
 * SECCIÓN 2: HECHOS INICIALES (Umbrales y Constantes)
 * ============================================
 * Valores de referencia basados en estándares de pedagogía vocal
 * Fuentes: Sundberg (1987), Titze (1994), Howard & Angus (2017)
 * 
 * ⚠️ UMBRALES AJUSTADOS PARA KARAOKE AMATEUR (NO PROFESIONAL)
 * 
 * CONTEXTO:
 * - Usuarios promedio tienen error RMS de 30-50 cents (aceptable para amateur)
 * - Profesionales tienen error RMS < 10 cents
 * - Sistema debe distinguir entre "cantaste bien" y "hay problemas serios"
 */

% Umbrales de afinación (en cents, 100 cents = 1 semitono)
umbral_hipoafinacion(-25).          % Canta bajo si promedio < -25 cents
umbral_hiperafinacion(25).          % Canta alto si promedio > 25 cents
umbral_pitch_variance_alta(40).     % Varianza alta = inconsistencia

% Umbrales de estabilidad (en Hz)
umbral_estabilidad_baja(20).        % Tremolo si varianza > 20 Hz
umbral_vibrato_excesivo(7.0).       % Vibrato normal: 4-6 Hz

% Umbrales de timing (en milisegundos)
umbral_timing_offset(80).           % Offset significativo > 80ms
umbral_ratio_anticipacion(1.5).     % Ratio early/late para anticipación

% Umbrales de rango
umbral_cobertura_rango_baja(0.4).   % 40% de notas falladas = problema

% Clasificación de severidad (valor numérico en cents RMS)
% ⚠️ AJUSTADO PARA KARAOKE AMATEUR - valores más permisivos
umbral_severidad_leve(50).          % 50 cents RMS = leve (medio semitono - amateur aceptable)
umbral_severidad_moderada(120).     % 120 cents RMS = moderado (un semitono completo - necesita práctica)
umbral_severidad_severa(200).       % 200 cents RMS = severo (dos semitonos - muy desafinado)

/* ============================================
 * SECCIÓN 3: REGLAS DE CLASIFICACIÓN (Nivel 1 - Heurísticas)
 * ============================================
 * Traducen datos crudos a estados semánticos
 * Estas reglas clasifican la telemetría en categorías interpretables
 * 
 * ⚠️ RMS: pitch_deviation_cents es siempre positivo (Root Mean Square)
 * Representa el ERROR PROMEDIO, no la dirección
 */

% UMBRAL DESAFINACIÓN: 80 cents RMS = casi un semitono de error promedio
% Valores realistas para karaoke amateur:
% - 0-50 cents: Excelente para amateur
% - 50-100 cents: Bueno, afinación aceptable
% - 100-150 cents: Regular, necesita práctica
% - 150+ cents: Desafinado, trabajo urgente
umbral_desafinacion(100).

% R-CLASE-1: Clasificación de Afinación - DESAFINADO (error RMS > umbral)
esta_desafinado :-
    pitch_deviation_cents(X),
    umbral_desafinacion(U),
    X > U.

% R-CLASE-2: Clasificación de Afinación - Tendencia a cantar BAJO (FLAT)
% Usamos notas_bajas (flatNotesCount) como indicador de tendencia
es_calado :-
    notas_bajas(N),
    N > 5.  % Más de 5 notas muy graves

% R-CLASE-3: Clasificación de Afinación - Tendencia a cantar ALTO (SHARP)
% Usamos notas_altas (sharpNotesCount) como indicador de tendencia
es_sostenido :-
    notas_altas(N),
    N > 5.  % Más de 5 notas muy agudas

% R-CLASE-4: Clasificación de Afinación - En Tono (error mínimo)
esta_afinado :-
    pitch_deviation_cents(X),
    umbral_desafinacion(U),
    X =< U.

% R-CLASE-4: Clasificación de Estabilidad - Inestable (Tremolo)
tiene_tremolo :-
    stability_variance(V),
    umbral_estabilidad_baja(U),
    V > U.

% R-CLASE-5: Clasificación de Estabilidad - Estable
es_estable :-
    stability_variance(V),
    umbral_estabilidad_baja(U),
    V =< U.

% R-CLASE-6: Clasificación de Vibrato - Excesivo
vibrato_excesivo :-
    vibrato_rate(R),
    umbral_vibrato_excesivo(U),
    R > U.

% R-CLASE-7: Clasificación de Timing - Desfasado
timing_desfasado :-
    rhythm_offset_ms(X),
    umbral_timing_offset(U),
    abs(X, AbsX),
    AbsX > U.

% R-CLASE-8: Clasificación de Timing - Anticipado
es_anticipado :-
    rhythm_offset_ms(X),
    umbral_timing_offset(U),
    X < 0,
    abs(X, AbsX),
    AbsX > U.

% R-CLASE-9: Clasificación de Timing - Retrasado
es_retrasado :-
    rhythm_offset_ms(X),
    umbral_timing_offset(U),
    X > U.

% R-CLASE-10: Clasificación de Rango - Dificultad en Agudos
dificultad_agudos :-
    notes_missed_high(N),
    N > 0.

% R-CLASE-11: Clasificación de Rango - Dificultad en Graves
dificultad_graves :-
    notes_missed_low(N),
    N > 0.

% R-CLASE-12: Clasificación de Anticipación Excesiva
anticipacion_excesiva :-
    early_notes_count(E),
    late_notes_count(L),
    umbral_ratio_anticipacion(R),
    L > 0,
    Ratio is E / L,
    Ratio > R.

% R-CLASE-13: Clasificación de Anticipación (cuando no hay notas tarde)
anticipacion_excesiva :-
    early_notes_count(E),
    late_notes_count(L),
    L == 0,
    E > 3.

% R-CLASE-14: Clasificación de Participación - Baja participación
% Detecta cuando el usuario cantó muy poco durante la sesión
participacion_baja :-
    singing_ratio(R),
    R < 0.3.  % Menos del 30% del tiempo cantando

% R-CLASE-15: Clasificación de Participación - Sesión muy corta
% Detecta sesiones donde el tiempo activo de canto es insuficiente
sesion_corta :-
    active_singing_time(T),
    T < 15.  % Menos de 15 segundos de canto activo

% R-CLASE-16: Clasificación de Logro - Buen dominio de notas
% El usuario logró la mayoría de las notas de la canción
buen_dominio_notas :-
    notes_achieved_count(A),
    notes_missed_high(MH),
    notes_missed_low(ML),
    Total is A + MH + ML,
    Total > 0,
    Ratio is A / Total,
    Ratio >= 0.7.  % 70%+ de notas logradas

/* ============================================
 * SECCIÓN 4: REGLAS DE SEVERIDAD (Clasificación de Intensidad)
 * ============================================
 * Determinan la gravedad del problema detectado
 * 
 * ⚠️ CORRECCIÓN: Ahora pitch_deviation_cents es RMS (siempre positivo)
 * No necesitamos abs() porque RMS ya es valor absoluto
 */

% Severidad para afinación (basado en RMS, siempre positivo)
severidad_afinacion(severe) :-
    pitch_deviation_cents(X),
    umbral_severidad_severa(U),
    X >= U.

severidad_afinacion(moderate) :-
    pitch_deviation_cents(X),
    umbral_severidad_moderada(UMod),
    umbral_severidad_severa(USev),
    X >= UMod,
    X < USev.

severidad_afinacion(mild) :-
    pitch_deviation_cents(X),
    umbral_severidad_leve(ULeve),
    umbral_severidad_moderada(UMod),
    X >= ULeve,
    X < UMod.

severidad_afinacion(none) :-
    pitch_deviation_cents(X),
    umbral_severidad_leve(U),
    X < U.

% Severidad para estabilidad
severidad_estabilidad(severe) :-
    stability_variance(V),
    V >= 50.

severidad_estabilidad(moderate) :-
    stability_variance(V),
    V >= 30,
    V < 50.

severidad_estabilidad(mild) :-
    stability_variance(V),
    V < 30.

% Severidad para timing
severidad_timing(severe) :-
    rhythm_offset_ms(X),
    abs(X, AbsX),
    AbsX >= 200.

severidad_timing(moderate) :-
    rhythm_offset_ms(X),
    abs(X, AbsX),
    AbsX >= 100,
    AbsX < 200.

severidad_timing(mild) :-
    rhythm_offset_ms(X),
    abs(X, AbsX),
    AbsX < 100.

/* ============================================
 * SECCIÓN 5: REGLAS DE DIAGNÓSTICO (Nivel 2 - Inferencia)
 * ============================================
 * Reglas complejas que utilizan conjunciones y disyunciones
 * para llegar a conclusiones pedagógicas específicas
 * 
 * ⚠️ NUEVA REGLA: desafinacion_general es la más importante
 * Se activa cuando el RMS supera el umbral de desafinación
 */

% R-DIAG-0: DESAFINACIÓN GENERAL (REGLA PRINCIPAL - RMS > umbral)
% Esta regla se activa siempre que haya error significativo de afinación
% SIMPLIFICADO: Solo verifica que está desafinado (RMS > 5 cents)
diagnostico(desafinacion_general) :-
    esta_desafinado.

% R-DIAG-0.5: DESAFINACIÓN SEVERA (RMS >= 100 cents = 1 semitono completo o más)
% Se activa cuando el error es tan grande que indica problemas serios
diagnostico(desafinacion_severa) :-
    pitch_deviation_cents(X),
    X >= 100.  % 1 semitono completo de error promedio

% R-DIAG-1: Hipoafinación por falta de apoyo respiratorio
diagnostico(hipoafinacion_soporte_respiratorio) :-
    es_calado,
    esta_desafinado.

% R-DIAG-2: Hiperafinación por tensión laríngea
diagnostico(hiperafinacion_tension_laringea) :-
    es_sostenido,
    esta_desafinado.

% R-DIAG-3: Tremolo por control de aire deficiente
diagnostico(tremolo_control_aire) :-
    tiene_tremolo,
    \+ es_estable.

% R-DIAG-4: Vibrato descontrolado
diagnostico(vibrato_descontrolado) :-
    vibrato_excesivo,
    tiene_tremolo.

% R-DIAG-5: Vibrato excesivo aislado
diagnostico(vibrato_excesivo_aislado) :-
    vibrato_excesivo,
    \+ tiene_tremolo.

% R-DIAG-6: Timing anticipado (ansiedad de entrada)
diagnostico(timing_anticipado) :-
    es_anticipado.

% R-DIAG-7: Timing retrasado (reacción lenta)
diagnostico(timing_retrasado) :-
    es_retrasado.

% R-DIAG-8: Dificultad en registro agudo
diagnostico(registro_agudo_debil) :-
    dificultad_agudos,
    \+ dificultad_graves.

% R-DIAG-9: Dificultad en registro grave
diagnostico(registro_grave_debil) :-
    dificultad_graves,
    \+ dificultad_agudos.

% R-DIAG-10: Rango limitado (ambos extremos)
diagnostico(rango_limitado) :-
    dificultad_agudos,
    dificultad_graves.

% R-DIAG-11: Anticipación excesiva por ansiedad
diagnostico(anticipacion_ansiosa) :-
    anticipacion_excesiva,
    es_anticipado.

% R-DIAG-12: Hipoafinación con inestabilidad (problema compuesto)
diagnostico(hipoafinacion_inestable) :-
    es_calado,
    tiene_tremolo.

% R-DIAG-13: Hiperafinación con inestabilidad
diagnostico(hiperafinacion_inestable) :-
    es_sostenido,
    tiene_tremolo.

% R-DIAG-14: Afinación inestable general (fluctuante)
diagnostico(afinacion_fluctuante) :-
    pitch_deviation_stddev(StdDev),
    umbral_pitch_variance_alta(U),
    StdDev > U,
    \+ es_calado,
    \+ es_sostenido.

% R-DIAG-15: Timing inconsistente con anticipación
diagnostico(timing_inconsistente_anticipado) :-
    timing_desfasado,
    early_notes_count(E),
    late_notes_count(L),
    E > L.

% R-DIAG-16: Timing inconsistente con retraso
diagnostico(timing_inconsistente_retrasado) :-
    timing_desfasado,
    early_notes_count(E),
    late_notes_count(L),
    L >= E.

% R-DIAG-17: Tensión vocal generalizada (múltiples síntomas)
diagnostico(tension_vocal_generalizada) :-
    es_sostenido,
    tiene_tremolo,
    vibrato_excesivo.

% R-DIAG-18: Falta de soporte generalizado
diagnostico(falta_soporte_generalizado) :-
    es_calado,
    tiene_tremolo,
    timing_desfasado.

% R-DIAG-19: Problema de passaggio (transición de registros)
diagnostico(problema_passaggio) :-
    dificultad_agudos,
    pitch_deviation_stddev(StdDev),
    StdDev > 15.

% R-DIAG-20: Participación insuficiente (cantó muy poco)
diagnostico(participacion_insuficiente) :-
    participacion_baja,
    \+ esta_desafinado.  % Solo si no hay problemas técnicos

% R-DIAG-21: Sesión de práctica muy corta
diagnostico(sesion_muy_corta) :-
    sesion_corta,
    \+ esta_desafinado.  % Solo si no hay problemas técnicos

% R-DIAG-22: Performance excelente (calidad técnica sin problemas)
% IMPORTANTE: No incluye duración - la calidad vocal es independiente del tiempo de práctica
diagnostico(excelente) :-
    esta_afinado,
    es_estable,
    \+ vibrato_excesivo,
    \+ timing_desfasado,
    \+ dificultad_agudos,
    \+ dificultad_graves.

% R-DIAG-23: Performance excelente pero sesión corta (informativo)
% Detecta cuando la calidad es excelente pero necesitamos más datos
diagnostico(excelente_sesion_corta) :-
    esta_afinado,
    es_estable,
    \+ vibrato_excesivo,
    \+ timing_desfasado,
    \+ dificultad_agudos,
    \+ dificultad_graves,
    (sesion_corta ; participacion_baja).

/* ============================================
 * SECCIÓN 6: SISTEMA DE PESOS (Priorización de Diagnósticos)
 * ============================================
 * Asigna pesos numéricos para priorizar diagnósticos
 */

severity_weight(hipoafinacion_soporte_respiratorio, 100) :- severidad_afinacion(severe).
severity_weight(hipoafinacion_soporte_respiratorio, 50) :- severidad_afinacion(moderate).
severity_weight(hipoafinacion_soporte_respiratorio, 10) :- severidad_afinacion(mild).

severity_weight(hiperafinacion_tension_laringea, 100) :- severidad_afinacion(severe).
severity_weight(hiperafinacion_tension_laringea, 50) :- severidad_afinacion(moderate).
severity_weight(hiperafinacion_tension_laringea, 10) :- severidad_afinacion(mild).

severity_weight(tremolo_control_aire, 100) :- severidad_estabilidad(severe).
severity_weight(tremolo_control_aire, 50) :- severidad_estabilidad(moderate).
severity_weight(tremolo_control_aire, 10) :- severidad_estabilidad(mild).

severity_weight(timing_anticipado, 80) :- severidad_timing(severe).
severity_weight(timing_anticipado, 40) :- severidad_timing(moderate).
severity_weight(timing_anticipado, 10) :- severidad_timing(mild).

severity_weight(timing_retrasado, 80) :- severidad_timing(severe).
severity_weight(timing_retrasado, 40) :- severidad_timing(moderate).
severity_weight(timing_retrasado, 10) :- severidad_timing(mild).

severity_weight(registro_agudo_debil, 50).
severity_weight(registro_grave_debil, 50).
severity_weight(rango_limitado, 70).
severity_weight(anticipacion_ansiosa, 30).
severity_weight(vibrato_descontrolado, 40).
severity_weight(vibrato_excesivo_aislado, 20).
severity_weight(hipoafinacion_inestable, 90).
severity_weight(hiperafinacion_inestable, 90).
severity_weight(afinacion_fluctuante, 60).
severity_weight(timing_inconsistente_anticipado, 45).
severity_weight(timing_inconsistente_retrasado, 45).
severity_weight(tension_vocal_generalizada, 95).
severity_weight(falta_soporte_generalizado, 95).
severity_weight(problema_passaggio, 55).
severity_weight(desafinacion_severa, 100).        % 🆕 Máxima prioridad - error catastrófico
severity_weight(desafinacion_general, 80).
severity_weight(hipoafinacion_soporte_respiratorio, 70).
severity_weight(hiperafinacion_tension_laringea, 70).
severity_weight(participacion_insuficiente, 5).   % Muy baja prioridad (informativo)
severity_weight(sesion_muy_corta, 3).             % Muy baja prioridad (informativo)
severity_weight(excelente_sesion_corta, 1).       % Informativo - excelente pero corto
severity_weight(excelente, 0).                    % Sin problemas

/* ============================================
 * SECCIÓN 7: FUNCIONES AUXILIARES
 * ============================================
 */

% Función absoluta (tau-prolog compatible)
abs(X, X) :- X >= 0, !.
abs(X, AbsX) :- AbsX is -X.

% Consulta principal: obtener todos los diagnósticos activos
todos_diagnosticos(Lista) :-
    findall(D, diagnostico(D), Lista).

/* ============================================
 * SECCIÓN 8: REGLAS DE RECOMENDACIÓN TERAPÉUTICA
 * ============================================
 * Mapea cada diagnóstico a prescripciones concretas
 * Estas reglas implementan el conocimiento experto en pedagogía vocal
 * Basadas en técnicas de Linklater, Lessac, y Estill Voice Training
 */

% R-RECOM-0.5: DESAFINACIÓN SEVERA (Error catastrófico >= 50 cents)
recomendacion('🚨 ALERTA: Tu afinación presenta errores MUY significativos (más de medio semitono)') :-
    diagnostico(desafinacion_severa).
recomendacion('🎹 Empieza desde cero: practica escalas simples con un piano o afinador') :-
    diagnostico(desafinacion_severa).
recomendacion('🎧 Usa un afinador visual en tiempo real mientras cantas') :-
    diagnostico(desafinacion_severa).
recomendacion('⏱️ Canta MUY lento - la precisión es más importante que seguir la canción') :-
    diagnostico(desafinacion_severa).
recomendacion('🎯 Practica una sola nota a la vez hasta que esté perfectamente afinada') :-
    diagnostico(desafinacion_severa).

% R-RECOM-0: DESAFINACIÓN GENERAL (Nuevo diagnóstico principal)
recomendacion('🎯 Problema Detectado: Tu afinación presenta errores significativos durante la sesión') :-
    diagnostico(desafinacion_general).
recomendacion('🎹 Ejercicio: Practica intervalos simples (2das, 3ras) con piano de referencia') :-
    diagnostico(desafinacion_general).
recomendacion('🎧 Usa un afinador visual mientras cantas para corregir en tiempo real') :-
    diagnostico(desafinacion_general).
recomendacion('⏱️ Canta más lento: la precisión es más importante que la velocidad') :-
    diagnostico(desafinacion_general).

% R-RECOM-1: Hipoafinación con problema de soporte
recomendacion('🌬️ Ejercicio: Respiración Diafragmática - 4 segundos inhalar, 8 sostener, 8 exhalar') :-
    diagnostico(hipoafinacion_soporte_respiratorio).
recomendacion('🎯 Ejercicio: Glissando Ascendente - Desliza desde nota cómoda hacia arriba') :-
    diagnostico(hipoafinacion_soporte_respiratorio).
recomendacion('🎹 Practica con referencia de piano: escucha la nota y luego cántala') :-
    diagnostico(hipoafinacion_soporte_respiratorio).

% R-RECOM-2: Hiperafinación con tensión laríngea
recomendacion('😌 Ejercicio: SOVT (Semi-Occluded Vocal Tract) - Usa pajilla o labios en vibración') :-
    diagnostico(hiperafinacion_tension_laringea).
recomendacion('🎯 Ejercicio: Descenso Controlado - Practica bajar medio tono conscientemente') :-
    diagnostico(hiperafinacion_tension_laringea).
recomendacion('🧘 Practica relajación de cuello y hombros antes de cantar') :-
    diagnostico(hiperafinacion_tension_laringea).

% R-RECOM-3: Trémolo por control de aire
recomendacion('🌬️ Ejercicio: Columna de Aire - Practica frases largas con flujo continuo') :-
    diagnostico(tremolo_control_aire).
recomendacion('🎯 Ejercicio: Nota Plana - Sostén una nota sin ninguna oscilación') :-
    diagnostico(tremolo_control_aire).
recomendacion('💪 Fortalece el apoyo diafragmático con ejercicios de respiración') :-
    diagnostico(tremolo_control_aire).

% R-RECOM-4: Timing anticipado
recomendacion('⏱️ Ejercicio: Pausa Consciente - Cuenta internamente antes de cada frase') :-
    diagnostico(timing_anticipado).
recomendacion('😌 Practica respirar en el silencio antes de cada entrada') :-
    diagnostico(timing_anticipado).
recomendacion('🎧 Escucha más atentamente la guía instrumental') :-
    diagnostico(timing_anticipado).

% R-RECOM-5: Timing retrasado
recomendacion('🥁 Ejercicio: Metrónomo Activo - Practica con metrónomo a tempo lento') :-
    diagnostico(timing_retrasado).
recomendacion('🎯 Anticipa mentalmente cada nota antes del tiempo') :-
    diagnostico(timing_retrasado).
recomendacion('👂 Escucha la pista 2-3 veces antes de cantar para interiorizar el timing') :-
    diagnostico(timing_retrasado).

% R-RECOM-6: Registro agudo débil
recomendacion('🎵 Ejercicio: Head Voice Training - Practica "oo" suave en notas altas') :-
    diagnostico(registro_agudo_debil).
recomendacion('🌬️ Usa menos aire pero más presión subglótica controlada') :-
    diagnostico(registro_agudo_debil).
recomendacion('😌 Evita empujar - las notas altas requieren relajación, no fuerza') :-
    diagnostico(registro_agudo_debil).

% R-RECOM-7: Registro grave débil
recomendacion('🎵 Ejercicio: Chest Voice Slides - Desliza desde notas medias hacia graves') :-
    diagnostico(registro_grave_debil).
recomendacion('🔊 Practica proyectar desde el pecho, no desde la garganta') :-
    diagnostico(registro_grave_debil).
recomendacion('📊 Identifica tu nota grave más cómoda y expándela gradualmente') :-
    diagnostico(registro_grave_debil).

% R-RECOM-8: Rango limitado
recomendacion('🎵 Ejercicio: Sirena Vocal - Desliza suavemente por todo tu rango') :-
    diagnostico(rango_limitado).
recomendacion('🎯 Practica escalas completas lentamente, sin forzar extremos') :-
    diagnostico(rango_limitado).
recomendacion('📈 Expande gradualmente: agrega 1 semitono por semana') :-
    diagnostico(rango_limitado).

% R-RECOM-9: Anticipación ansiosa
recomendacion('🧘 Ejercicio: Mindfulness Pre-Canto - 3 respiraciones profundas antes de empezar') :-
    diagnostico(anticipacion_ansiosa).
recomendacion('⏱️ Practica contar en voz alta los tiempos antes de cantar') :-
    diagnostico(anticipacion_ansiosa).
recomendacion('😌 Reduce la ansiedad: enfócate en el disfrute, no en la perfección') :-
    diagnostico(anticipacion_ansiosa).

% R-RECOM-10: Vibrato descontrolado
recomendacion('🎯 Ejercicio: Control de Vibrato - Alterna notas con/sin vibrato') :-
    diagnostico(vibrato_descontrolado).
recomendacion('😌 Relaja conscientemente la garganta mientras cantas') :-
    diagnostico(vibrato_descontrolado).
recomendacion('🌬️ Enfócate en un flujo de aire constante y controlado') :-
    diagnostico(vibrato_descontrolado).

% R-RECOM-11: Vibrato excesivo aislado
recomendacion('⏱️ Ejercicio: Notas Largas sin Oscilación - 8+ segundos cada una') :-
    diagnostico(vibrato_excesivo_aislado).
recomendacion('🎯 Practica sostener notas planas antes de agregar vibrato') :-
    diagnostico(vibrato_excesivo_aislado).
recomendacion('😌 El vibrato debe ser opcional, no automático') :-
    diagnostico(vibrato_excesivo_aislado).

% R-RECOM-12: Hipoafinación inestable
recomendacion('🌬️ PRIORITARIO: Trabajo de soporte respiratorio - sesiones diarias de 10 min') :-
    diagnostico(hipoafinacion_inestable).
recomendacion('🎯 Ejercicio: Notas Largas Sostenidas - Mantén afinación constante') :-
    diagnostico(hipoafinacion_inestable).
recomendacion('📊 Monitorea con afinador visual mientras practicas') :-
    diagnostico(hipoafinacion_inestable).

% R-RECOM-13: Hiperafinación inestable
recomendacion('😌 PRIORITARIO: Reducción de tensión - masajes de cuello y laringe') :-
    diagnostico(hiperafinacion_inestable).
recomendacion('🎯 Ejercicio: Humming Relajado - Canturrear sin esfuerzo') :-
    diagnostico(hiperafinacion_inestable).
recomendacion('🎹 Practica escalas descendentes para relajar la laringe') :-
    diagnostico(hiperafinacion_inestable).

% R-RECOM-14: Afinación fluctuante
recomendacion('🎯 Ejercicio: Entrenamiento Auditivo - Practica intervalos con piano') :-
    diagnostico(afinacion_fluctuante).
recomendacion('🎧 Usa apps de ear training (EarMaster, Tenuto)') :-
    diagnostico(afinacion_fluctuante).
recomendacion('🎹 Canta notas individuales con referencia antes de frases completas') :-
    diagnostico(afinacion_fluctuante).

% R-RECOM-15: Timing inconsistente anticipado
recomendacion('🥁 Ejercicio: Palmas con Metrónomo - Practica el ritmo sin cantar primero') :-
    diagnostico(timing_inconsistente_anticipado).
recomendacion('📝 Marca los tiempos fuertes en la letra de la canción') :-
    diagnostico(timing_inconsistente_anticipado).
recomendacion('😌 Relaja: la precisión viene de la calma, no de la urgencia') :-
    diagnostico(timing_inconsistente_anticipado).

% R-RECOM-16: Timing inconsistente retrasado
recomendacion('🎧 Ejercicio: Escucha Activa - Reproduce la canción 5+ veces sin cantar') :-
    diagnostico(timing_inconsistente_retrasado).
recomendacion('🎯 Practica hablando las letras en ritmo antes de cantar') :-
    diagnostico(timing_inconsistente_retrasado).
recomendacion('🏃 Internaliza el tempo: camina al ritmo de la canción') :-
    diagnostico(timing_inconsistente_retrasado).

% R-RECOM-17: Tensión vocal generalizada
recomendacion('⚠️ CRÍTICO: Descanso vocal - Evita cantar por 24-48 horas') :-
    diagnostico(tension_vocal_generalizada).
recomendacion('💧 Hidratación intensiva: Agua tibia con miel') :-
    diagnostico(tension_vocal_generalizada).
recomendacion('😌 Ejercicios suaves de respiración sin fonación') :-
    diagnostico(tension_vocal_generalizada).
recomendacion('⚠️ Si persiste, consulta a un foniatra') :-
    diagnostico(tension_vocal_generalizada).

% R-RECOM-18: Falta de soporte generalizado
recomendacion('🌬️ CRÍTICO: Respiración Diafragmática - Sesiones de 15 min 2x/día') :-
    diagnostico(falta_soporte_generalizado).
recomendacion('💪 Ejercicio: Plancha Respiratoria - Sostén aire mientras haces plancha') :-
    diagnostico(falta_soporte_generalizado).
recomendacion('📚 Considera tomar clases de canto con un profesor certificado') :-
    diagnostico(falta_soporte_generalizado).

% R-RECOM-19: Problema de passaggio
recomendacion('🎵 Ejercicio: Sirena Vocal - Desliza suavemente por todo tu rango') :-
    diagnostico(problema_passaggio).
recomendacion('🔄 Practica escalas que cruzan el passaggio lentamente') :-
    diagnostico(problema_passaggio).
recomendacion('💪 Fortalece el "mix" con ejercicios de voz mixta') :-
    diagnostico(problema_passaggio).

% R-RECOM-20: Performance excelente
recomendacion('⭐ ¡Felicitaciones! Mantén tu rutina de práctica actual') :-
    diagnostico(excelente).
recomendacion('🎯 Desafíate con canciones de mayor dificultad') :-
    diagnostico(excelente).
recomendacion('🎤 Considera grabar covers para compartir tu progreso') :-
    diagnostico(excelente).
recomendacion('📈 Sigue usando KOACH para mantener tu nivel') :-
    diagnostico(excelente).

% R-RECOM-20b: Performance excelente en sesión corta
recomendacion('⭐ ¡Excelente técnica vocal detectada!') :-
    diagnostico(excelente_sesion_corta).
recomendacion('⏱️ Tu sesión fue corta - practica más tiempo para un análisis completo') :-
    diagnostico(excelente_sesion_corta).
recomendacion('🎯 Continúa con tu técnica actual, solo necesitamos más datos') :-
    diagnostico(excelente_sesion_corta).

% R-RECOM-21: Participación insuficiente
recomendacion('⏱️ Intenta cantar durante más tiempo para obtener mejores resultados') :-
    diagnostico(participacion_insuficiente).
recomendacion('🎤 Activa tu micrófono y canta junto con la pista') :-
    diagnostico(participacion_insuficiente).
recomendacion('💡 KOACH necesita escucharte para darte feedback preciso') :-
    diagnostico(participacion_insuficiente).

% R-RECOM-22: Sesión muy corta
recomendacion('⏰ Tu sesión fue muy corta - intenta practicar al menos 30 segundos') :-
    diagnostico(sesion_muy_corta).
recomendacion('🎵 Practica la canción completa para un análisis más preciso') :-
    diagnostico(sesion_muy_corta).

/* ============================================
 * FIN DE LA BASE DE CONOCIMIENTOS
 * ============================================
 * ARQUITECTURA DEL SISTEMA EXPERTO:
 * 
 * 1. HECHOS (Facts):
 *    - Hechos dinámicos: Telemetría inyectada en runtime (17 predicados)
 *    - Hechos estáticos: Umbrales y constantes basadas en investigación (10+ hechos)
 * 
 * 2. REGLAS (Rules):
 *    - Reglas de clasificación: 16 reglas de nivel 1 (heurísticas)
 *    - Reglas de diagnóstico: 23 reglas de nivel 2 (inferencia compleja)
 *    - Reglas de severidad: 9 reglas de clasificación de gravedad
 *    - Reglas de recomendación: 23 reglas de prescripción terapéutica
 *    TOTAL: 71 reglas formales
 * 
 * 3. MOTOR DE INFERENCIA:
 *    - Encadenamiento hacia Atrás (Backward Chaining)
 *    - Consultas principales: diagnostico(X), recomendacion(Y)
 *    - Priorización mediante pesos de severidad
 * 
 * 4. PRINCIPIOS:
 *    - Separación de conocimiento y control
 *    - Reglas declarativas (no procedurales)
 *    - Inferencia lógica pura (no imperativa)
 *    - Explicabilidad: cada conclusión es trazable a reglas específicas
 * 
 * 5. MEJORAS IMPLEMENTADAS (Auditoría v2.1):
 *    - Eliminada dependencia circular en hipoafinacion/hiperafinacion
 *    - Separada calidad técnica de duración de sesión en diagnóstico "excelente"
 *    - Diagnósticos informativos solo se activan si no hay problemas técnicos
 *    - Nuevo diagnóstico: excelente_sesion_corta (técnica perfecta, más datos needed)
 * 
 * Total de reglas: 71 reglas formales
 * ============================================
 */
