"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  labels: string[];
  data: number[];
  label?: string;
}

export default function LineChart({
  labels,
  data: chartData,
  label = "Value",
}: LineChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: chartData,
        borderColor: "#13b6ec",
        backgroundColor: "rgba(19, 182, 236, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  return (
    <div style={{ height: "250px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
