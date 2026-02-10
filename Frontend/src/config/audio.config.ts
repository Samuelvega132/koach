/**
 * Audio Engine Configuration
 * 
 * Configuración crítica de latencia y smoothing para el motor de audio.
 * Ajusta estos valores según tu hardware/navegador.
 */

export const AUDIO_CONFIG = {
    /**
     * Microphone Latency Compensation (ms)
     * 
     * Latencia típica del pipeline de audio:
     * - Chrome/Edge: 100-150ms
     * - Firefox: 120-180ms
     * - Safari: 80-120ms
     * - Mobile: 150-250ms
     * 
     * Si las notas se marcan como error aunque estés afinado:
     * → INCREMENTA este valor (+20ms cada vez)
     * 
     * Si la retroalimentación llega "antes" de tiempo:
     * → DECREMENTA este valor (-20ms cada vez)
     */
    MICROPHONE_LATENCY_MS: 150,

    /**
     * Pitch Smoothing Factor (0-1)
     * 
     * Controla cuánto suavizado se aplica al pitch detectado:
     * - 0.0: Sin smoothing (muy sensible, mucho jitter)
     * - 0.5: Smoothing moderado
     * - 0.8: Smoothing fuerte (respuesta más lenta pero estable)
     * - 0.95: Smoothing extremo (muy suave pero con delay)
     * 
     * Recomendado: 0.6 - 0.7 para balance entre responsividad y estabilidad
     */
    PITCH_SMOOTHING_FACTOR: 0.7,

    /**
     * Pitch Detection Range (Hz)
     * 
     * Rango de frecuencias válidas para detección de voz:
     * - MIN: 55 Hz (A1) - nota más grave detectable para bajos profundos
     * - MAX: 2000 Hz - rango extendido para voces agudas
     * 
     * Optimizado para interfaces profesionales (Focusrite Scarlett)
     * Con fftSize 8192 @ 48kHz = resolución de ~5.9 Hz
     */
    PITCH_RANGE: {
        MIN: 55,   // Hz - A1 (límite inferior para graves)
        MAX: 2000, // Hz - rango completo para agudos
    },

    /**
     * Piano Roll Visualization
     */
    PIANO_ROLL: {
        PIXELS_PER_SECOND: 100, // Velocidad de scroll (px/s)
        NOTE_HEIGHT: 10,         // Altura de barras de notas (px)
        PLAYHEAD_POSITION: 0.2,  // Posición de línea "ahora" (0-1)
    },

    /**
     * Performance Settings
     */
    PERFORMANCE: {
        MAX_DEVICE_PIXEL_RATIO: 2, // Limitar DPR para móviles
        RAF_UPDATE_INTERVAL: 16.7,  // ~60fps (ms)
        STATE_UPDATE_INTERVAL: 100, // Actualizar React state cada X ms
    },

    /**
     * Accuracy Thresholds (cents)
     * 
     * 1 semitone = 100 cents
     * Rango humano perceptible: ~10 cents
     */
    ACCURACY: {
        PERFECT: 10,  // ±10 cents = perfecto
        GOOD: 25,     // ±25 cents = bien
        OK: 50,       // ±50 cents = aceptable
    },
} as const;

/**
 * Helper: Ajustar latencia en tiempo real
 * 
 * Uso en consola del navegador:
 * ```
 * window.__adjustLatency = (delta) => {
 *   const config = require('./audio.config');
 *   config.AUDIO_CONFIG.MICROPHONE_LATENCY_MS += delta;
 *   console.log('New latency:', config.AUDIO_CONFIG.MICROPHONE_LATENCY_MS);
 * };
 * 
 * // Aumentar latencia en 20ms
 * __adjustLatency(20);
 * ```
 */
if (typeof window !== 'undefined') {
    (window as any).__audioConfig = AUDIO_CONFIG;
}
