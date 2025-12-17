import { useState } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExposureCard } from "@/components/dashboard/ExposureCard";
import { AddAssetDialog, type Asset } from "@/components/dashboard/AddAssetDialog";
import { SnapshotDialog, type Snapshot } from "@/components/dashboard/SnapshotDialog";
import { Wallet, TrendingUp, PiggyBank, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockAssets: Asset[] = [
  { id: "1", name: "Bitcoin", symbol: "BTC", category: "crypto", market: "crypto" },
  { id: "2", name: "Ethereum", symbol: "ETH", category: "crypto", market: "crypto" },
  { id: "3", name: "Solana", symbol: "SOL", category: "crypto", market: "crypto" },
  { id: "4", name: "Petrobras", symbol: "PETR4", category: "stocks", market: "traditional" },
  { id: "5", name: "Vale", symbol: "VALE3", category: "stocks", market: "traditional" },
  { id: "6", name: "Tesouro Selic", symbol: "SELIC", category: "fixed_income", market: "traditional" },
];

// todo: remove mock functionality
const mockPerformanceData = [
  { month: "Jul", value: 85000 },
  { month: "Ago", value: 88000 },
  { month: "Set", value: 92000 },
  { month: "Out", value: 95000 },
  { month: "Nov", value: 100000 },
  { month: "Dez", value: 112500 },
];

// todo: remove mock functionality
const mockCategoryData = [
  { name: "Cripto", value: 75000, color: "hsl(var(--chart-1))" },
  { name: "Ações", value: 25000, color: "hsl(var(--chart-2))" },
  { name: "Renda Fixa", value: 10000, color: "hsl(var(--chart-3))" },
  { name: "Caixa", value: 2500, color: "hsl(var(--chart-4))" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  const handleAddAsset = (asset: Omit<Asset, "id">) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
    };
    setAssets((prev) => [...prev, newAsset]);
    toast({
      title: "Ativo adicionado",
      description: `${asset.symbol} foi cadastrado com sucesso.`,
    });
  };

  const handleAddSnapshot = (snapshot: Omit<Snapshot, "id">) => {
    const asset = assets.find((a) => a.id === snapshot.assetId);
    toast({
      title: "Lançamento registrado",
      description: `Valor de ${asset?.symbol || "ativo"} atualizado para R$ ${snapshot.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
    });
  };

  // todo: remove mock functionality
  const totalPortfolio = 112500;
  const monthlyChange = 12.5;
  const cryptoValue = 75000;
  const traditionalValue = 37500;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu portfólio</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SnapshotDialog assets={assets} onAdd={handleAddSnapshot} />
          <AddAssetDialog onAdd={handleAddAsset} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total do Portfólio"
          value={`R$ ${totalPortfolio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={monthlyChange}
          changeLabel="vs mês anterior"
          icon={Wallet}
        />
        <MetricCard
          title="Cripto"
          value={`R$ ${cryptoValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={15.2}
          changeLabel="vs mês anterior"
          icon={TrendingUp}
        />
        <MetricCard
          title="Tradicional"
          value={`R$ ${traditionalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={5.3}
          changeLabel="vs mês anterior"
          icon={PiggyBank}
        />
        <MetricCard
          title="Exposição Cripto"
          value={`${((cryptoValue / totalPortfolio) * 100).toFixed(1)}%`}
          icon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={mockPerformanceData} />
        </div>
        <ExposureCard cryptoValue={cryptoValue} traditionalValue={traditionalValue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart title="Distribuição por Categoria" data={mockCategoryData} />
        <CategoryChart
          title="Ativos por Mercado"
          data={[
            { name: "Mercado Cripto", value: cryptoValue, color: "hsl(var(--chart-1))" },
            { name: "Mercado Tradicional", value: traditionalValue, color: "hsl(var(--chart-2))" },
          ]}
        />
      </div>
    </div>
  );
}
