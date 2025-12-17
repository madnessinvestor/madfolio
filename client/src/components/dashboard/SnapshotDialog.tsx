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
import { Camera } from "lucide-react";
import type { Asset } from "./AddAssetDialog";

export interface Snapshot {
  id: string;
  assetId: string;
  value: number;
  date: string;
  notes?: string;
}

interface SnapshotDialogProps {
  assets: Asset[];
  onAdd: (snapshot: Omit<Snapshot, "id">) => void;
}

export function SnapshotDialog({ assets, onAdd }: SnapshotDialogProps) {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !value || !date) return;

    onAdd({
      assetId,
      value: parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")),
      date,
      notes: notes || undefined,
    });
    setAssetId("");
    setValue("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-add-snapshot">
          <Camera className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançar Valor</DialogTitle>
            <DialogDescription>
              Registre o valor atual de um ativo. Cada lançamento cria um snapshot histórico.
            </DialogDescription>
          </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
