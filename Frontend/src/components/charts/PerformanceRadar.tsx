"use client";

import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface PerformanceRadarProps {
    pitchScore: number;
    rhythmScore: number;
    stabilityScore: number;
    toneScore: number;
    rangeScore: number;
}

export function PerformanceRadar({
    pitchScore,
    rhythmScore,
    stabilityScore,
    toneScore,
    rangeScore,
}: PerformanceRadarProps) {
    const data = {
        labels: ['Afinación', 'Ritmo', 'Estabilidad', 'Tono', 'Rango'],
        datasets: [
            {
                label: 'Tu Performance',
                data: [pitchScore, rhythmScore, stabilityScore, toneScore, rangeScore],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
            },
        ],
    };

    const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    color: 'rgba(255, 255, 255, 0.5)',
                    backdropColor: 'transparent',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        return `${context.label}: ${context.parsed.r}/100`;
                    },
                },
            },
        },
    };

    return (
        <div className="w-full h-[400px] flex items-center justify-center">
            <Radar data={data} options={options} />
        </div>
    );
}
