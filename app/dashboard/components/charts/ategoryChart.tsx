'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart() {
  const data = {
    labels: ['Hair Oils', 'Skincare', 'Makeup', 'Body Care', 'Fragrance'],
    datasets: [
      {
        data: [32, 28, 22, 12, 6],
        backgroundColor: ['#c77d5e', '#8aafb5', '#d4a0a0', '#b5c09a', '#c9b8a8'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 10 } } },
    },
    cutout: '68%',
  };

  return <div className="h-48"><Doughnut data={data} options={options} /></div>;
}