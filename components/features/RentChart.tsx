'use client'

import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface RentChartProps {
    data: {
        labels: string[]
        datasets: Array<{
            label: string
            data: number[]
        }>
    }
}

export default function RentChart({ data }: RentChartProps) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}円`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return value.toLocaleString() + '円'
                    }
                }
            }
        }
    }

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: 'rgba(14, 165, 233, 0.5)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 2,
        })),
    }

    return (
        <div className="w-full h-[400px]">
            <Bar options={options} data={chartData} />
        </div>
    )
}
