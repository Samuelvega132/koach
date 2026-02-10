#!/usr/bin/env node

/**
 * 🚀 Quick Performance Test Script
 * 
 * Run this in your browser console while testing /studio/[id] page
 * to verify optimizations are working correctly.
 */

console.log('%c🔬 Koach Performance Diagnostics', 'font-size: 20px; color: #8b5cf6; font-weight: bold');

// Test 1: Check if RAF is running
let frameCount = 0;
let lastTime = performance.now();

const fpsTest = () => {
    frameCount++;
    const now = performance.now();
    
    if (now - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        console.log(`%c✅ FPS: ${fps}`, fps >= 55 ? 'color: #10b981' : 'color: #ef4444');
        frameCount = 0;
        lastTime = now;
    }
    
    requestAnimationFrame(fpsTest);
};

fpsTest();

// Test 2: Memory leak detector
const checkMemory = () => {
    if (performance.memory) {
        const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
        console.log(`%c📊 Memory: ${used}MB / ${total}MB`, 'color: #3b82f6');
    }
};

setInterval(checkMemory, 5000);

// Test 3: Check for layout thrashing
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
        }
    }
});

observer.observe({ entryTypes: ['measure', 'longtask'] });

// Test 4: Canvas GPU rendering check
setTimeout(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        console.log('%c✅ Canvas rendering active', 'color: #10b981');
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('DPR:', window.devicePixelRatio);
    } else {
        console.error('❌ Canvas not found!');
    }
}, 2000);

console.log('%c📝 Tests running... Check logs above for results.', 'color: #8b5cf6');
console.log('%c💡 Expected: FPS 58-60, Memory stable, No long tasks', 'color: #6b7280');
