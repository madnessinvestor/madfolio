import { CategoryChart } from "../dashboard/CategoryChart";

export default function CategoryChartExample() {
  const data = [
    { name: "Cripto", value: 75000, color: "hsl(var(--chart-1))" },
    { name: "Ações", value: 25000, color: "hsl(var(--chart-2))" },
    { name: "Renda Fixa", value: 10000, color: "hsl(var(--chart-3))" },
    { name: "Caixa", value: 2500, color: "hsl(var(--chart-4))" },
  ];

  return <CategoryChart title="Distribuição por Categoria" data={data} />;
}
