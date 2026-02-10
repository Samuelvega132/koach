# 🧪 Guía de Pruebas Finales - Sistema Experto KOACH

## ✅ CORRECCIONES IMPLEMENTADAS

### 1. **Errores de TypeScript en Backend (ARREGLADOS)**
- ✅ Convertido `telemetry` y `diagnosis` a tipo `any` para compatibilidad con Prisma JSON
- ✅ Agregado `include` del `song` en las consultas de sesión
- ✅ Corregido parseo de `feedback` en el endpoint `getById`
- ✅ Backend compila sin errores

### 2. **Integración API en Frontend (ARREGLADOS)**
- ✅ Agregado `API_CONFIG` en `StudioClient.tsx`
- ✅ Corregido fetch para usar URL completa del backend
- ✅ Agregada validación de datos antes de enviar
- ✅ Mejores mensajes de error con detalles
- ✅ Página de resultados usando endpoint correcto

### 3. **Página de Resultados Mejorada (COMPLETA)**
- ✅ Acceso seguro a datos con operador `??` (valores por defecto)
- ✅ Radar Chart con 5 dimensiones
- ✅ Tarjetas de Diagnóstico y Prescripción
- ✅ Métricas detalladas organizadas
- ✅ Validaciones para evitar errores de datos faltantes

---

## 🚀 PASOS PARA PROBAR

### Paso 1: Iniciar Backend
```powershell
cd c:\Users\samue\Documents\GitHub\koach\Backend
npm run dev
```

**Verificar:**
- ✅ Backend corriendo en `http://localhost:3001`
- ✅ Mensaje: "Server running on port 3001"
- ✅ Sin errores de compilación

### Paso 2: Iniciar Frontend
```powershell
cd c:\Users\samue\Documents\GitHub\koach\Frontend
npm run dev
```

**Verificar:**
- ✅ Frontend corriendo en `http://localhost:3000`
- ✅ Sin errores de compilación
- ✅ Console log: "🔧 API Config: http://localhost:3001/api"

### Paso 3: Probar Flujo Completo

#### 3.1 Seleccionar Canción
1. Abrir `http://localhost:3000`
2. Clic en una canción (ej: "Happy Birthday")
3. Verificar que abre el Studio

#### 3.2 Grabar Sesión
1. **Permitir micrófono** cuando lo solicite el navegador
2. Verificar indicador "Live Input" en rojo
3. Presionar **Play** ▶️
4. Cantar durante al menos 10-15 segundos
5. Verificar que el Piano Roll se mueve
6. Verificar que el Tuner Gauge muestra tu pitch

#### 3.3 Finalizar Sesión
1. Presionar **"Finalizar Sesión"** (botón verde)
2. **Abrir Console del navegador** (F12)
3. Verificar logs:
   ```
   📊 Sesión finalizada: {totalPoints: X, validPoints: Y, ...}
   📈 Datos de performance: [{timestamp, detectedFrequency, ...}]
   🚀 Enviando datos a: http://localhost:3001/api/performances
   ✅ Sesión guardada: {sessionId, score, telemetry, diagnosis, ...}
   ```
4. **Verificar redirección** a `/results/[sessionId]`

#### 3.4 Verificar Página de Resultados
La página debe mostrar:

**✅ Header:**
- Título: "Análisis Vocal Completo"
- Nombre de la canción
- Botones: Compartir, Exportar PDF

**✅ Score Overview:**
- Puntuación global (0-100)
- Duración total
- Tiempo activo cantando
- Notas logradas

**✅ Radar Chart:**
- 5 dimensiones: Afinación, Ritmo, Estabilidad, Tono, Rango
- Gráfico morado con bordes brillantes

**✅ Diagnosis Card:**
- Badge de severidad (verde/amarillo/rojo)
- Badge de rango afectado (🎵/🎶/🎼/🎹)
- Problema principal detectado
- Explicación detallada

**✅ Prescription Card:**
- Lista numerada de ejercicios
- Emojis para cada ejercicio
- Consejo final con 💡

**✅ Métricas Detalladas:**
- **Afinación**: Desviación promedio, std dev, notas agudas/graves
- **Ritmo**: Offset promedio, notas tempranas/tardías, precisión
- **Estabilidad**: Varianza, vibrato rate/depth, notas estables
- **Cobertura de Rango**: Rango total y rango cómodo

---

## 🧪 CASOS DE PRUEBA ESPECÍFICOS

### Caso 1: Cantar Bajo (Hipoafinación)
**Objetivo:** Activar Regla R1 del Sistema Experto

1. Cantar intencionalmente **medio tono bajo** (flat)
2. Finalizar sesión
3. **Esperar diagnóstico:**
   - Problema: "Hipoafinación por falta de presión subglótica"
   - Severidad: Moderado/Severo
   - Prescripción: "Respiración Diafragmática", "Lip Trills"

### Caso 2: Cantar Alto (Hiperafinación)
**Objetivo:** Activar Regla R2 del Sistema Experto

1. Cantar intencionalmente **medio tono alto** (sharp)
2. Finalizar sesión
3. **Esperar diagnóstico:**
   - Problema: "Hiperafinación por tensión laríngea"
   - Prescripción: "Masaje laríngeo", "Vocalización 'M'"

### Caso 3: Voz Inestable (Tremolo)
**Objetivo:** Activar Regla R3 del Sistema Experto

1. Cantar con **vibrato exagerado** o voz temblorosa
2. Finalizar sesión
3. **Esperar diagnóstico:**
   - Problema: "Tremolo por falta de control del flujo de aire"
   - Prescripción: "Long Tones sin vibrato"

### Caso 4: Sin Datos (Edge Case)
**Objetivo:** Probar manejo de errores

1. Presionar Play pero **NO cantar**
2. Esperar 5 segundos
3. Presionar "Finalizar Sesión"
4. **Esperar alerta:** "No hay datos suficientes para analizar"

---

## 🐛 TROUBLESHOOTING

### Problema: "Finalizar Sesión" no hace nada

**Causas posibles:**
1. Backend no está corriendo
2. Error de CORS
3. No hay datos de performance

**Solución:**
1. Abrir Console (F12) → buscar errores
2. Verificar que backend esté en puerto 3001
3. Verificar que se permitió el micrófono
4. Verificar que se presionó Play antes de finalizar

### Problema: "Session not found" en resultados

**Causas posibles:**
1. La sesión no se guardó en la BD
2. ID de sesión incorrecto
3. Error en backend

**Solución:**
1. Verificar en backend: `npx prisma studio`
2. Abrir tabla `sessions` → buscar última sesión
3. Verificar que tiene `telemetry` y `diagnosis`

### Problema: Página de resultados en blanco

**Causas posibles:**
1. Datos de sesión con formato incorrecto
2. Telemetry o diagnosis es `null`

**Solución:**
1. Abrir Console → buscar errores de React
2. Verificar respuesta del API:
   ```javascript
   // En console:
   fetch('http://localhost:3001/api/performances/SESSION_ID')
     .then(r => r.json())
     .then(console.log)
   ```

---

## 📊 VALIDACIÓN DE DATOS

### Verificar en Prisma Studio
```powershell
cd Backend
npx prisma studio
```

1. Abrir tabla `sessions`
2. Buscar última sesión creada
3. **Verificar campos:**
   - ✅ `score`: Número entre 0-100
   - ✅ `feedback`: JSON string con array de strings
   - ✅ `telemetry`: JSON con 15+ métricas
   - ✅ `diagnosis`: JSON con problema, prescripción, severidad

### Estructura Esperada de `telemetry`:
```json
{
  "pitchDeviationAverage": -22.5,
  "pitchDeviationStdDev": 15.3,
  "sharpNotesCount": 5,
  "flatNotesCount": 12,
  "rhythmicOffsetAverage": 0,
  "earlyNotesCount": 0,
  "lateNotesCount": 0,
  "stabilityVariance": 12.4,
  "vibratoRate": 5.2,
  "vibratoDepth": 18.7,
  "rangeCoverage": {
    "notesMissed": ["C5", "D5"],
    "notesAchieved": ["C4", "D4", "E4"],
    "lowestNote": "C4",
    "highestNote": "E4",
    "comfortableRange": ["C4", "D4"]
  },
  "totalDuration": 45.2,
  "activeSingingTime": 38.5,
  "silenceTime": 6.7
}
```

### Estructura Esperada de `diagnosis`:
```json
{
  "primaryIssue": "Hipoafinación por falta de presión subglótica",
  "secondaryIssues": ["Vibrato excesivo"],
  "diagnosis": "Se detectó una desviación promedio de 22.5 cents por debajo...",
  "prescription": [
    "🫁 Respiración Diafragmática: Inhala profundamente...",
    "💋 Lip Trills (Trinos labiales): Exhala haciendo vibrar..."
  ],
  "severity": "moderate",
  "affectedRange": "full"
}
```

---

## ✅ CHECKLIST FINAL

### Backend
- [ ] Backend compila sin errores (`npm run build`)
- [ ] Prisma client generado (`npx prisma generate`)
- [ ] Base de datos conectada
- [ ] Seed ejecutado (al menos 1 canción)
- [ ] Servidor corriendo en puerto 3001

### Frontend
- [ ] Frontend compila sin errores
- [ ] Chart.js instalado (v4.5.1)
- [ ] react-chartjs-2 instalado (v5.3.1)
- [ ] API_CONFIG apuntando a `http://localhost:3001/api`

### Flujo E2E
- [ ] Página principal muestra canciones
- [ ] StudioClient abre correctamente
- [ ] Micrófono se activa
- [ ] Piano Roll se visualiza
- [ ] Tuner Gauge funciona
- [ ] Botón "Finalizar Sesión" aparece
- [ ] Fetch a API exitoso (console log)
- [ ] Redirección a `/results/[id]`
- [ ] Página de resultados carga completamente
- [ ] Radar Chart renderiza
- [ ] Diagnosis Card muestra problema
- [ ] Prescription Card muestra ejercicios
- [ ] Métricas detalladas visibles

---

## 🎯 PRÓXIMOS PASOS (Opcional)

### Mejoras de Producción
1. **Autenticación:**
   - Implementar sistema de usuarios
   - Reemplazar "Usuario Demo"
   - Historial personal de sesiones

2. **Exportar PDF:**
   - Instalar `jspdf` y `html2canvas`
   - Implementar generación de PDF
   - Incluir gráficos y métricas

3. **Compartir Resultados:**
   - Generar link público
   - Preview en redes sociales
   - Imagen de resumen (Open Graph)

4. **Dashboard de Progreso:**
   - Gráfico de evolución temporal
   - Comparación entre sesiones
   - Identificación de tendencias

5. **Análisis de Ritmo Real:**
   - Comparar timestamps con `melodyData.notes`
   - Detección de onset/offset
   - Métricas de sincronización precisas

---

## 📚 DOCUMENTACIÓN PARA DEFENSA

### Arquitectura del Sistema Experto
```
Usuario canta
    ↓
[useSessionTelemetry] → Recolecta datos a 60 FPS
    ↓
[handleFinishSession] → Envía a backend
    ↓
[PerformanceController.create]
    ↓
[ExpertSystem.analyzePerformance]
    ├─ [calculateSessionTelemetry] → 15+ métricas
    └─ [VocalDiagnosisService.diagnose] → 8 reglas (R1-R8)
        └─ Genera diagnóstico + prescripción
    ↓
Guardar en BD (Prisma)
    ↓
Retornar telemetry + diagnosis
    ↓
[ResultsPage] → Visualizar con Radar Chart
```

### Reglas del Sistema Experto
1. **R1:** Hipoafinación (canta bajo)
2. **R2:** Hiperafinación (canta alto)
3. **R3:** Tremolo (inestabilidad)
4. **R4:** Vibrato excesivo
5. **R5:** Dificultad en agudos
6. **R6:** Dificultad en graves
7. **R7:** Timing inconsistente
8. **R8:** Anticipación excesiva

---

## 🎉 RESULTADO ESPERADO

Al finalizar las pruebas, deberías tener:

1. ✅ Sistema completo funcionando end-to-end
2. ✅ Backend generando diagnósticos correctos
3. ✅ Frontend mostrando resultados visuales
4. ✅ Base de datos con sesiones guardadas
5. ✅ Radar Chart renderizando correctamente
6. ✅ Sistema Experto aplicando reglas heurísticas
7. ✅ 0 errores de compilación
8. ✅ Proyecto listo para defensa

---

**Fecha:** 3 de febrero de 2026  
**Estado:** ✅ LISTO PARA PRUEBAS FINALES  
**Última actualización:** Correcciones de API y validaciones de datos
