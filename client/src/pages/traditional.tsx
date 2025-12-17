import { useState } from "react";
import { HoldingsTable, type Holding } from "@/components/dashboard/HoldingsTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { AddAssetDialog, type Asset } from "@/components/dashboard/AddAssetDialog";
import { SnapshotDialog, type Snapshot } from "@/components/dashboard/SnapshotDialog";
import { Landmark, TrendingUp, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// todo: remove mock functionality
const mockHoldings: Holding[] = [
  {
    id: "1",
    symbol: "PETR4",
    name: "Petrobras",
    amount: 100,
    avgPrice: 32.5,
    currentPrice: 38.2,
    change24h: 1.2,
    type: "stock",
  },
  {
    id: "2",
    symbol: "VALE3",
    name: "Vale",
    amount: 50,
    avgPrice: 68.0,
    currentPrice: 72.5,
    change24h: -0.8,
    type: "stock",
  },
  {
    id: "3",
    symbol: "SELIC",
    name: "Tesouro Selic 2029",
    amount: 1,
    avgPrice: 14500,
    currentPrice: 15200,
    change24h: 0.02,
    type: "etf",
  },
  {
    id: "4",
    symbol: "HGLG11",
    name: "CSHG Logística",
    amount: 20,
    avgPrice: 155.0,
    currentPrice: 162.0,
    change24h: 0.5,
    type: "fii",
  },
  {
    id: "5",
    symbol: "CAIXA",
    name: "Reserva de Emergência",
    amount: 1,
    avgPrice: 5000,
    currentPrice: 5000,
    change24h: 0,
    type: "etf",
  },
];

// todo: remove mock functionality
const mockAssets: Asset[] = [
  { id: "1", name: "Petrobras", symbol: "PETR4", category: "stocks", market: "traditional" },
  { id: "2", name: "Vale", symbol: "VALE3", category: "stocks", market: "traditional" },
  { id: "3", name: "Tesouro Selic 2029", symbol: "SELIC", category: "fixed_income", market: "traditional" },
  { id: "4", name: "CSHG Logística", symbol: "HGLG11", category: "fii", market: "traditional" },
  { id: "5", name: "Reserva de Emergência", symbol: "CAIXA", category: "cash", market: "traditional" },
];

export default function TraditionalPage() {
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>(mockHoldings);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null);

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
      description: `Valor de ${asset?.symbol || "ativo"} atualizado.`,
    });
  };

  const handleEdit = (holding: Holding) => {
    toast({
      title: "Editar ativo",
      description: `Editando ${holding.symbol}...`,
    });
  };

  const handleDelete = (holding: Holding) => {
    setHoldingToDelete(holding);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (holdingToDelete) {
      setHoldings((prev) => prev.filter((h) => h.id !== holdingToDelete.id));
      toast({
        title: "Ativo removido",
        description: `${holdingToDelete.symbol} foi removido do portfólio.`,
      });
    }
    setDeleteDialogOpen(false);
    setHoldingToDelete(null);
  };

  // todo: remove mock functionality - calculate from real data
  const totalValue = holdings.reduce((sum, h) => sum + h.amount * h.currentPrice, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.amount * h.avgPrice, 0);
  const profitLoss = totalValue - totalCost;
  const profitLossPercent = totalCost > 0 ? ((profitLoss / totalCost) * 100) : 0;

  // Group by category
  const categoryTotals = holdings.reduce((acc, h) => {
    const category = h.type === "stock" ? "Ações" : h.type === "fii" ? "FIIs" : h.type === "etf" ? "Renda Fixa" : "Outros";
    acc[category] = (acc[category] || 0) + h.amount * h.currentPrice;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mercado Tradicional</h1>
          <p className="text-muted-foreground">Ações, FIIs, Renda Fixa e Caixa</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SnapshotDialog assets={assets} onAdd={handleAddSnapshot} />
          <AddAssetDialog onAdd={handleAddAsset} defaultMarket="traditional" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Valor Total"
          value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={5.3}
          changeLabel="vs mês anterior"
          icon={Landmark}
        />
        <MetricCard
          title="Lucro/Prejuízo"
          value={`R$ ${profitLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={profitLossPercent}
          icon={TrendingUp}
        />
        <MetricCard
          title="Ativos"
          value={holdings.length.toString()}
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HoldingsTable
            title="Holdings Tradicional"
            holdings={holdings}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        <CategoryChart title="Por Categoria" data={categoryData} />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {holdingToDelete?.symbol} do seu portfólio?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
