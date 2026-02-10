# 🧠 Sistema Experto KOACH - Motor de Inferencia Prolog

## Arquitectura del Sistema Experto

KOACH utiliza un **Motor de Inferencia Formal** basado en **Prolog** (Tau-Prolog) para diagnóstico vocal. Esta arquitectura cumple con los requisitos académicos de un Sistema Experto Basado en Reglas.

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOTOR DE INFERENCIA KOACH                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │  Telemetría DSP  │───▶│  Hechos Dinámicos (assertz)      │  │
│  │  (Frontend)      │    │  pitch_deviation_cents(-15.5)    │  │
│  └──────────────────┘    │  stability_variance(18.2)        │  │
│                          │  rhythm_offset_ms(-75)            │  │
│                          └──────────────┬───────────────────┘  │
│                                         │                       │
│                                         ▼                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           BASE DE CONOCIMIENTOS (vocal_rules.pl)          │  │
│  │  ┌─────────────────┐  ┌────────────────────────────────┐ │  │
│  │  │ Hechos Iniciales │  │ Reglas de Clasificación (13)   │ │  │
│  │  │ (Umbrales)       │  │ es_calado, tiene_tremolo...    │ │  │
│  │  └─────────────────┘  └────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Reglas de Diagnóstico (20) - Nivel 2                │ │  │
│  │  │ diagnostico(hipoafinacion_soporte_respiratorio)     │ │  │
│  │  │ diagnostico(tension_vocal_generalizada)             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                         │                       │
│                                         ▼                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     ENCADENAMIENTO HACIA ATRÁS (Backward Chaining)       │  │
│  │     Consulta: diagnostico(X).                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                         │                       │
│                                         ▼                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               VocalDiagnosis (Respuesta)                  │  │
│  │  { primaryIssue, prescription[], severity, ...}          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Archivos del Sistema

| Archivo | Descripción |
|---------|-------------|
| `src/logic/vocal_rules.pl` | Base de Conocimientos Prolog (71+ reglas formales) |
| `src/services/vocal-diagnosis.service.ts` | Servicio que ejecuta el Motor de Inferencia |
| `src/controllers/performance.controller.ts` | Cálculo de scores y análisis de performance |
| `src/utils/telemetry.utils.ts` | Extracción de métricas DSP desde datos crudos |
| `src/utils/dsp.utils.ts` | Funciones de procesamiento de señales (cents, RMS) |
| `src/types/tau-prolog.d.ts` | Declaraciones de tipos para Tau-Prolog |

## Base de Conocimientos (vocal_rules.pl)

### Sección 1: Hechos Dinámicos
```prolog
:- dynamic(pitch_deviation_cents/1).
:- dynamic(rhythm_offset_ms/1).
:- dynamic(stability_variance/1).
% ... 14 predicados dinámicos
```

### Sección 2: Hechos Iniciales (Umbrales)

**⚠️ AJUSTADOS PARA KARAOKE AMATEUR (v2.1)**

```prolog
% Umbrales de afinación
umbral_desafinacion(100).              % 100 cents RMS = 1 semitono (umbral principal)
umbral_hipoafinacion(-25).            % Tendencia a cantar bajo
umbral_hiperafinacion(25).            % Tendencia a cantar alto

**⚠️ IMPORTANTE:** `pitch_deviation_cents` es RMS (Root Mean Square) - siempre positivo.
Representa el ERROR PROMEDIO absoluto, no la dirección.

```prolog
% R-CLASE-1: Está desafinado (RMS > umbral)
esta_desafinado :-
    pitch_deviation_cents(X),
    umbral_desafinacion(U),
    X > U.

% R-CLASE-2: Tendencia a cantar BAJO (usa flatNotesCount)
es_calado :-
    notas_bajas(N),
    N > 5.

% R-CLASE-3: Tendencia a cantar ALTO (usa sharpNotesCount)
es_sostenido :-
    notas_altas(N),
    N > 5
% Estabilidad y timing
umbral_estabilidad_baja(20).          % Tremolo si varianza > 20 Hz
umbral_timing_offset(80).             % Offset significativo > 80ms
% ... 10+ umbrales de referencia
```

**Valores realistas para karaoke amateur:**
- 0-50 cents RMS: Excelente ⭐
- 50-100 cents RMS: Bueno, afinación aceptable ✅
- 100-150 cents RMS: Regular, necesita práctica ⚠️
- 150-200 cents RMS: Desafinado 🚨
- 200+ cents RMS: Muy desafinado 💀

### Sección 3: Reglas de Clasificación (Nivel 1)
```prolog

**Nuevos diagnósticos principales (v2.1):**

```prolog
% R-DIAG-0: DESAFINACIÓN GENERAL (regla principal - más importante)
% Se activa cuando RMS > 100 cents (un semitono completo)
diagnostico(desafinacion_general) :-
    esta_desafinado.

% R-DIAG-0.5: DESAFINACIÓN SEVERA (error catastrófico)
% RMS >= 200 cents = dos semitonos o más
diagnostico(desafinacion_severa) :-
    pitch_deviation_cents(X),
    X >= 200.
 (v2.1 - Actualizado)

1. **Frontend** captura datos en tiempo real (~60fps)
   - `detectedFrequency`: Frecuencia detectada del usuario (Hz)
   - `targetFrequency`: Frecuencia de la nota objetivo (Hz)
   - `targetNote`: Nombre de la nota (ej: "A3")

2. **Filtro de Rango Vocal** (telemetry.utils.ts)
   ```typescript
   // Ignorar notas fuera del rango vocal humano
   const VOCAL_RANGE_MIN_HZ = 80;   // ~E2
   const VOCAL_RANGE_MAX_HZ = 1000; // ~B5
   
   validPoints = points.filter(p =>
     p.targetFrequency >= 80 && 
     p.targetFrequency <= 1000
   );
   ```

3. **Cálculo de Métricas DSP** (telemetry.utils.ts)
   ```typescript
   // RMS (Root Mean Square) - nunca se cancelan errores
   const sumOfSquares = deviations.reduce((sum, val) => sum + val * val, 0);
   const pitchDeviationRMS = Math.sqrt(sumOfSquares / deviations.length);
   ```

4. **Inyección de Hechos Dinámicos** (vocal-diagnosis.service.ts)
   ```prolog
   pitch_deviation_cents(124.5).    % RMS - siempre positivo
   pitch_deviation_stddev(45.2).
   stability_variance(22.3).
   notas_altas(3).                  % sharpNotesCount
   notas_bajas(8).                  % flatNotesCount
   ```

5. **Motor Prolog** ejecuta consulta `diagnostico(X).`

6. **Backward Chaining** encuentra diagnósticos aplicables

7. **Cálculo de Score** (performance.controller.ts)
   ```typescript
   // Fórmula exponencial: 50 cents → 78%, 100 cents → 61%
   const score = Math.round(100 * Math.exp(-rmsDeviationCents / 200));
   ```

8. **Respuesta final** con `VocalDiagnosis` + análisis
% R-DIAG-22: Performance excelente (RMS <= 100 cents)
diagnostico(excelente) :- (23 diagnósticos totales)

### Diagnósticos de Afinación (Pitch)
| ID | Diagnóstico | Condición |
|----|-------------|-----------|
| `desafinacion_severa` | **⚠️ CRÍTICO** | RMS ≥ 200 cents (dos semitonos) |
| `desafinacion_general` | Error significativo | RMS > 100 cents (un semitono) |
| `hipoafinacion_soporte_respiratorio` | Canta bajo | flatNotesCount > 5 + desafinado |
| `hiperafinacion_tension_laringea` | Canta alto | sharpNotesCount > 5 + desafinado |
| `afinacion_fluctuante` | Inconsistente | StdDev > 40 cents |

### Diagnósticos de Estabilidad (v2.1):
```
¿diagnostico(desafinacion_general)?
    └── esta_desafinado?
        ├── pitch_deviation_cents(X) → X = 124.5 ✓ (RMS calculado)
        ├── umbral_desafinacion(U) → U = 100 ✓
        └── X > U? → 124.5 > 100 = TRUE ✓
    
RESULTADO: diagnostico(desafinacion_general) = TRUE

¿diagnostico(hipoafinacion_soporte_respiratorio)?
    ├── es_calado?
    │   ├── notas_bajas(N) → N = 8 ✓ (flatNotesCount)
    │   └── N > 5? → 8 > 5 = TRUE ✓
    └── esta_desafinado? → TRUE ✓ (ya probado arriba)
    
RESULTADO: diagnostico(hipoafinacion_soporte_respiratorio) = TRUE
```

### Sistema de Priorización

Los diagnósticos se ordenan por **peso de severidad**:

```prolog
severity_weight(desafinacion_severa, 100).        % Máxima prioridad
severity_weight(desafinacion_general, 80).
severity_weight(hipoafinacion_soporte_respiratorio, 70).
severity_weight(participacion_insuficiente, 5).   % Baja prioridad (informativo)
severity_weight(excelente, 0).                    % Sin problemas
```

El diagnóstico con mayor peso se convierte en `primaryIssue`.--|-------------|-------------|
| `timing_anticipado` | Entradas adelantadas | Offset < -80ms |
cd Backend
npm install tau-prolog
npm install --save-dev ts-node-dev typescript @types/node
```

### Desarrollo (con recarga automática)
```bash
npm run dev
# Usa ts-node-dev - NO necesitas compilar manualmente
# Recarga automática cuando editas archivos .ts
```

### Verificación
El log debería mostrar:
```
📚 Knowledge Base loaded from: C:\...\src\logic\vocal_rules.pl
🎤 ==========================================
   KOACH BACKEND - API REST
   ==========================================
   🚀 Server running on port 3001
```

### Logs de Diagnóstico
Cuando procesas una sesión, verás:
```
🔍 [TELEMETRY] Cálculo de telemetría:
   totalPoints: 1247
   validPoints: 623
   pointsOutOfVocalRange: 412   ← Notas instrumentales ignoradas
   validityRate: 49.9%

🎵 [PITCH METRICS DEBUG]:
   rms: 124.50 cents (error absoluto)
   bias: -12.30 cents (tendencia direccional)
   
🎯 [PITCH SCORE] RMS: 124.5 cents → Score: 530 |
| `rango_limitado` | Ambos extremos débiles | Ambos problemas |
| `problema_passaggio` | Transición difícil | Agudos + StdDev > 15 |

### Diagnósticos Compuestos
| ID | Diagnóstico | Descripción |
|----|-------------|-------------|
| `tension_vocal_generalizada` | **⚠️ Múltiples síntomas** | Sostenido + tremolo + vibrato |
| `falta_soporte_generalizado` | **⚠️ Soporte débil** | Calado + tremolo + timing |
| `hipoafinacion_inestable` | Bajo + inestable | Calado + tremolo |
| `hiperafinacion_inestable` | Alto + inestable | Sostenido + tremolo |

### Diagnósticos de Participación
| ID | Diagnóstico | Descripción |
|----|-------------|-------------|
| `participacion_insuficiente` | Cantó muy poco | singingRatio < 30% |
| `sesion_muy_corta` | Sesión breve | activeSingingTime < 15s |

### Diagnóstico Positivo
| ID | Diagnóstico | Condición |
|----|-------------|-----------|
| `excelente` | ⭐ Performance impecable | RMS ≤ 100 cents + estable + timing correcto |
| `excelente_sesion_corta` | ⭐ Perfecto pero breve | Excelente técnica + sesión < 15somas)
diagnostico(tension_vocal_generalizada) :-
    es_sostenido,
    tiene_tremolo, v2.1) |
|---------|-----------------|---------------------|
| Paradigma | Imperativo | Declarativo |
| Base de conocimientos | Hardcoded en TS | Archivo `.pl` externo (71 reglas) |
| Extensibilidad | Modificar código TS | Añadir reglas Prolog |
| Transparencia | Difícil auditar | Reglas legibles y trazables |
| Cálculo de RMS | Promedio simple ❌ | Root Mean Square ✅ |
| Filtro de datos | Ninguno | Ignora notas fuera de rango vocal |
| Score | Lineal (100 - cents*2) | Exponencial e^(-cents/200) |
| Umbrales | Profesionales (5 cents) | Amateurs realistas (100 cents) |
| Recarga de código | Compilación manual | ts-node-dev automático |
| Cumplimiento académico | ❌ | ✅ Sistema Experto Formal |

## Mejoras Clave de v2.1

## Troubleshooting

### Problema: "Knowledge Base not found"
```
❌ Knowledge Base not found at: C:\...\dist\logic\vocal_rules.pl
```
**Solución:** Usa `npm run dev` (ts-node-dev) en lugar de compilar manualmente.

### Problema: RMS siempre muy alto (2000+ cents)
**Causa:** MIDI tiene notas instrumentales fuera de rango vocal  
**Verificación:** Busca en logs `pointsOutOfVocalRange`  
**Solución:** Ya implementado - se ignoran notas < 80 Hz o > 1000 Hz

### Problema: Score siempre 0-20%
**Causa:** Fórmula lineal vieja  
**Solución:** Ya actualizado a fórmula exponencial

### Problema: Diagnóstico siempre "desafinacion_severa"
**Causa:** Umbral muy estricto (50 cents)  
**Solución:** Ya ajustado a 100 cents para amateur

---

**Versión:** 2.1.0 (Prolog Edition - Karaoke Optimizado)  
**Autor:** KOACH Team  
**Fecha:** Febrero 2026  
**Última actualización:** Febrero 10,edio Simple
**Problema:** Errores se cancelaban: (+20) + (-20) / 2 = 0 → "Perfecto" ❌  
**Solución:** RMS = sqrt(mean(x²)) → nunca se cancelan ✅

### 3. Fórmula de Score Exponencial
**Problema:** Score lineal daba 0% con 50 cents (aceptable para amateur)  
**Solución:** `score = 100 * e^(-cents/200)` → curva realista

### 4. Umbrales Ajustados para Karaoke
**Problema:** Umbrales profesionales (5 cents) → todos "desafinados"  
**Solución:** Umbrales amateurs (100 cents) → clasificación correcta

### 5. Nuevo Diagnóstico Principal
**`desafinacion_general`** ahora es el diagnóstico más común y útil para amateur con RMS > 100 cents
2. **DSP Utils** calcula métricas (pitch deviation, stability variance, etc.)
3. **VocalDiagnosisService** inyecta hechos dinámicos:
   ```prolog
   :- assertz(pitch_deviation_cents(-15.5)).
   :- assertz(stability_variance(22.3)).
   ```
4. **Motor Prolog** ejecuta consulta `diagnostico(X).`
5. **Backward Chaining** encuentra diagnósticos aplicables
6. **Servicio** mapea resultados a `VocalDiagnosis`

## Mecanismo de Inferencia: Encadenamiento hacia Atrás

El sistema utiliza **Backward Chaining** (Encadenamiento hacia Atrás):

1. Se plantea el objetivo: `diagnostico(X).`
2. El motor busca reglas cuya cabeza unifique con `diagnostico(X)`
3. Para cada regla, intenta probar recursivamente el cuerpo
4. Si todas las condiciones del cuerpo se satisfacen, el diagnóstico es válido

### Ejemplo de Cadena de Inferencia:
```
diagnostico(hipoafinacion_soporte_respiratorio)
    ├── es_calado?
    │   ├── pitch_deviation_cents(X) → X = -15.5 ✓
    │   └── X < umbral_hipoafinacion(-10) → -15.5 < -10 ✓
    └── severity_weight(..., W), W > 0 ✓
    
RESULTADO: diagnostico(hipoafinacion_soporte_respiratorio) = TRUE
```

## Diagnósticos Disponibles

| ID | Diagnóstico | Descripción |
|----|-------------|-------------|
| `hipoafinacion_soporte_respiratorio` | Canta bajo | Falta de apoyo diafragmático |
| `hiperafinacion_tension_laringea` | Canta alto | Tensión en garganta |
| `tremolo_control_aire` | Voz inestable | Control de aire deficiente |
| `vibrato_descontrolado` | Vibrato irregular | Vibrato + inestabilidad |
| `timing_anticipado` | Entradas adelantadas | Ansiedad rítmica |
| `timing_retrasado` | Entradas tardías | Reacción lenta |
| `registro_agudo_debil` | Dificultad en agudos | Head voice débil |
| `registro_grave_debil` | Dificultad en graves | Chest voice débil |
| `rango_limitado` | Rango vocal corto | Ambos extremos |
| `tension_vocal_generalizada` | Tensión múltiple | Problema compuesto |
| `falta_soporte_generalizado` | Soporte débil | Problema compuesto |
| `problema_passaggio` | Transición difícil | Cambio de registro |
| `excelente` | Sin problemas | Performance profesional |

## Instalación y Configuración

### Dependencias
```bash
npm install tau-prolog
```

### Verificación
```bash
npm run dev
# El log debería mostrar:
# ✅ Motor de Inferencia: Base de Conocimientos cargada exitosamente
```

## Sistema de Fallback

Si el Motor de Inferencia Prolog falla, el sistema activa un **fallback imperativo** que replica la lógica de las reglas en TypeScript:

```typescript
// Sistema de fallback imperativo (backup si Prolog falla)
private static imperativeFallback(telemetry: SessionTelemetry): VocalDiagnosis {
    if (telemetry.pitchDeviationAverage < -10) {
        issues.push({ id: 'hipoafinacion_soporte_respiratorio', weight: 80 });
    }
    // ...
}
```

## Diferencias vs Sistema Anterior

| Aspecto | Antes (if/else) | Ahora (Prolog) |
|---------|-----------------|----------------|
| Paradigma | Imperativo | Declarativo |
| Base de conocimientos | Hardcoded | Archivo `.pl` externo |
| Extensibilidad | Modificar código TS | Añadir reglas Prolog |
| Transparencia | Difícil auditar | Reglas legibles |
| Cumplimiento académico | ❌ | ✅ Sistema Experto Formal |

## Referencias Bibliográficas

- Sundberg, J. (1987). *The Science of the Singing Voice*
- Titze, I. R. (1994). *Principles of Voice Production*
- Howard, D. M., & Angus, J. A. S. (2017). *Acoustics and Psychoacoustics*
- Giarratano, J., & Riley, G. (2005). *Expert Systems: Principles and Programming*

---

**Versión:** 2.0.0 (Prolog Edition)  
**Autor:** KOACH Team  
**Fecha:** Febrero 2026
