import { useState } from "react";
import { HoldingsTable, type Holding } from "@/components/dashboard/HoldingsTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { AddAssetDialog, type Asset } from "@/components/dashboard/AddAssetDialog";
import { SnapshotDialog, type Snapshot } from "@/components/dashboard/SnapshotDialog";
import { Bitcoin, TrendingUp, Coins } from "lucide-react";
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
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.25,
    avgPrice: 180000,
    currentPrice: 210000,
    change24h: 2.5,
    type: "crypto",
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.5,
    avgPrice: 9500,
    currentPrice: 11200,
    change24h: -1.2,
    type: "crypto",
  },
  {
    id: "3",
    symbol: "SOL",
    name: "Solana",
    amount: 15,
    avgPrice: 450,
    currentPrice: 520,
    change24h: 4.8,
    type: "crypto",
  },
  {
    id: "4",
    symbol: "ADA",
    name: "Cardano",
    amount: 500,
    avgPrice: 2.5,
    currentPrice: 2.8,
    change24h: -0.5,
    type: "crypto",
  },
];

// todo: remove mock functionality
const mockAssets: Asset[] = [
  { id: "1", name: "Bitcoin", symbol: "BTC", category: "crypto", market: "crypto" },
  { id: "2", name: "Ethereum", symbol: "ETH", category: "crypto", market: "crypto" },
  { id: "3", name: "Solana", symbol: "SOL", category: "crypto", market: "crypto" },
  { id: "4", name: "Cardano", symbol: "ADA", category: "crypto", market: "crypto" },
];

export default function CryptoPage() {
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

  const chartData = holdings.map((h, index) => ({
    name: h.symbol,
    value: h.amount * h.currentPrice,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mercado Cripto</h1>
          <p className="text-muted-foreground">Seus investimentos em criptomoedas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SnapshotDialog assets={assets} onAdd={handleAddSnapshot} />
          <AddAssetDialog onAdd={handleAddAsset} defaultMarket="crypto" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Valor Total Cripto"
          value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={15.2}
          changeLabel="vs mês anterior"
          icon={Bitcoin}
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
          icon={Coins}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HoldingsTable
            title="Holdings Cripto"
            holdings={holdings}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        <PortfolioChart title="Distribuição Cripto" data={chartData} />
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
