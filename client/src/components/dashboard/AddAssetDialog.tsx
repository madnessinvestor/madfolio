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
import { Plus } from "lucide-react";

export type AssetCategory = "crypto" | "stocks" | "fixed_income" | "cash" | "fii" | "etf" | "others";

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  market: "crypto" | "traditional";
}

interface AddAssetDialogProps {
  onAdd: (asset: Omit<Asset, "id">) => void;
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

export function AddAssetDialog({ onAdd, defaultMarket = "crypto" }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [category, setCategory] = useState<AssetCategory>(defaultMarket === "crypto" ? "crypto" : "stocks");
  const [market, setMarket] = useState<"crypto" | "traditional">(defaultMarket);

  const cryptoCategories: AssetCategory[] = ["crypto"];
  const traditionalCategories: AssetCategory[] = ["stocks", "fixed_income", "cash", "fii", "etf", "others"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !category) return;

    onAdd({ name, symbol: symbol.toUpperCase(), category, market });
    setName("");
    setSymbol("");
    setCategory(defaultMarket === "crypto" ? "crypto" : "stocks");
    setOpen(false);
  };

  const availableCategories = market === "crypto" ? cryptoCategories : traditionalCategories;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-asset">
          <Plus className="h-4 w-4 mr-2" />
          Novo Ativo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Ativo</DialogTitle>
            <DialogDescription>
              Cadastre um novo ativo para acompanhar em seu portfólio.
            </DialogDescription>
          </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
