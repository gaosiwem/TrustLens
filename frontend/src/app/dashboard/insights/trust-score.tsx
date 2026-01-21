"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TrustScore({ score = 85 }: { score?: number }) {
  const data = {
    labels: ["Trust Score"],
    datasets: [
      {
        label: "Score",
        data: [score],
        backgroundColor: "#13b6ec",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { min: 0, max: 100 },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card text-card-foreground h-[120px]">
      <h3 className="font-semibold text-sm mb-2">Trust Score</h3>
      <div className="h-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
