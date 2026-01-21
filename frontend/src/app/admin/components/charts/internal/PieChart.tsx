"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
}

export default function PieChart({ labels, data: chartData }: PieChartProps) {
  const data = {
    labels,
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          "#34A853", // Green
          "#FBBC05", // Yellow
          "#EA4335", // Red
          "#4285F4", // Blue
          "#8E44AD", // Purple
          "#F39C12", // Orange
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "250px" }}>
      <Pie data={data} options={options} />
    </div>
  );
}
