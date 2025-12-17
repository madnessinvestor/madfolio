import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export type AssetCategory = "crypto" | "stocks" | "fixed_income" | "cash" | "fii" | "etf" | "others";

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  market: "crypto" | "traditional";
}

export interface Snapshot {
  id: string;
  assetId: string;
  value: number;
  date: string;
  notes?: string;
}

interface AddAssetDialogProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, "id">) => void;
  onAddSnapshot: (snapshot: Omit<Snapshot, "id">) => void;
  defaultMarket?: "crypto" | "traditional";
}

const categoryLabels: Record<AssetCategory, string> = {
  crypto: "Criptomoeda",
  stocks: "Ações",
  fixed_income: "Renda Fixa",
  cash: "Caixa",
  fii: "Fundos Imobiliários",
  etf: "ETF",
  others: "Outros",
};

export function AddAssetDialog({ assets, onAddAsset, onAddSnapshot, defaultMarket = "crypto" }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"asset" | "snapshot">("asset");
  
  // Asset form state
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [category, setCategory] = useState<AssetCategory>(defaultMarket === "crypto" ? "crypto" : "stocks");
  const [market, setMarket] = useState<"crypto" | "traditional">(defaultMarket);

  // Snapshot form state
  const [assetId, setAssetId] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const cryptoCategories: AssetCategory[] = ["crypto"];
  const traditionalCategories: AssetCategory[] = ["stocks", "fixed_income", "cash", "fii", "etf", "others"];

  const resetAssetForm = () => {
    setName("");
    setSymbol("");
    setCategory(defaultMarket === "crypto" ? "crypto" : "stocks");
    setMarket(defaultMarket);
  };

  const resetSnapshotForm = () => {
    setAssetId("");
    setValue("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !category) return;

    onAddAsset({ name, symbol: symbol.toUpperCase(), category, market });
    resetAssetForm();
    setOpen(false);
  };

  const handleSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !value || !date) return;

    onAddSnapshot({
      assetId,
      value: parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")),
      date,
      notes: notes || undefined,
    });
    resetSnapshotForm();
    setOpen(false);
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/[^\d]/g, "");
    if (!num) return "";
    const formatted = (parseInt(num) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  };

  const availableCategories = market === "crypto" ? cryptoCategories : traditionalCategories;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetAssetForm();
      resetSnapshotForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-asset">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Ativo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Ativo</DialogTitle>
          <DialogDescription>
            Cadastre um novo ativo ou registre um valor para um ativo existente.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "asset" | "snapshot")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="asset" data-testid="tab-new-asset">Novo Ativo</TabsTrigger>
            <TabsTrigger value="snapshot" data-testid="tab-new-snapshot">Novo Lançamento</TabsTrigger>
          </TabsList>

          <TabsContent value="asset">
            <form onSubmit={handleAssetSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="market">Mercado</Label>
                  <Select
                    value={market}
                    onValueChange={(value: "crypto" | "traditional") => {
                      setMarket(value);
                      setCategory(value === "crypto" ? "crypto" : "stocks");
                    }}
                  >
                    <SelectTrigger data-testid="select-market">
                      <SelectValue placeholder="Selecione o mercado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Mercado Cripto</SelectItem>
                      <SelectItem value="traditional">Mercado Tradicional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Símbolo</Label>
                  <Input
                    id="symbol"
                    placeholder="Ex: BTC, PETR4, TESOURO"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    data-testid="input-symbol"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Bitcoin, Petrobras, Tesouro Selic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(value: AssetCategory) => setCategory(value)}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-submit-asset">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="snapshot">
            <form onSubmit={handleSnapshotSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="asset">Ativo</Label>
                  <Select value={assetId} onValueChange={setAssetId}>
                    <SelectTrigger data-testid="select-asset">
                      <SelectValue placeholder="Selecione o ativo" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.symbol} - {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor Atual</Label>
                  <Input
                    id="value"
                    placeholder="R$ 0,00"
                    value={value}
                    onChange={(e) => setValue(formatCurrency(e.target.value))}
                    data-testid="input-value"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Aporte mensal"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="input-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-submit-snapshot">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
