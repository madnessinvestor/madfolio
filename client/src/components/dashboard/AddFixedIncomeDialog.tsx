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
import { Plus, Loader2 } from "lucide-react";

export interface FixedIncomeInvestment {
  id?: string;
  name: string;
  value: number;
}

interface AddFixedIncomeDialogProps {
  onAdd: (investment: FixedIncomeInvestment) => void;
  isLoading?: boolean;
}

export function AddFixedIncomeDialog({ onAdd, isLoading }: AddFixedIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    const valueString = value.replace(/[^\d.,]/g, "");
    const parsedValue = parseFloat(valueString.replace(/\./g, "").replace(",", "."));

    if (isNaN(parsedValue)) return;

    onAdd({
      name,
      value: parsedValue,
    });

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName("");
    setValue("");
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-fixed-income">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Renda Fixa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Renda Fixa</DialogTitle>
          <DialogDescription>
            Registre um novo aporte em renda fixa com banco/instituição e valor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bank">Banco/Instituição Financeira</Label>
              <Input
                id="bank"
                placeholder="Ex: Nubank, Banco do Brasil, etc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-bank-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Valor Aportado</Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                value={value}
                onChange={(e) => setValue(formatCurrency(e.target.value))}
                data-testid="input-fixed-income-value"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Os valores são armazenados em Reais (BRL).
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-submit-fixed-income">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
