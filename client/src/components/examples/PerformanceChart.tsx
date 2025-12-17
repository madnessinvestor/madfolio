import { PerformanceChart } from "../dashboard/PerformanceChart";

export default function PerformanceChartExample() {
  const data = [
    { month: "Jul", value: 85000 },
    { month: "Ago", value: 88000 },
    { month: "Set", value: 92000 },
    { month: "Out", value: 95000 },
    { month: "Nov", value: 100000 },
    { month: "Dez", value: 112500 },
  ];

  return <PerformanceChart data={data} />;
}
