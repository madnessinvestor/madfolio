import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Save, History } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: string;
  market: string;
  quantity: number;
  acquisitionPrice: number;
  acquisitionDate: string;
  currentPrice: number;
  currency: string;
}

interface Snapshot {
  id: string;
  assetId: string;
  value: number;
  amount: number | null;
  unitPrice: number | null;
  date: string;
  notes: string | null;
  createdAt: string;
}

interface EditInvestmentDialogProps {
  assetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const investmentTypeLabels: Record<string, string> = {
  "caixinha_nubank": "Caixinha Nubank",
  "poupanca": "Poupança",
  "cdb_lci_lca": "CDB | LCI | LCA | CRI | CRA",
  "debentures": "Debêntures",
  "conta_rentavel": "Conta Rentável",
  "outros": "Outros",
};

export function EditInvestmentDialog({ assetId, open, onOpenChange }: EditInvestmentDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("edit");
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [acquisitionPrice, setAcquisitionPrice] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [investmentType, setInvestmentType] = useState("outros");
  
  const [snapshotValue, setSnapshotValue] = useState("");
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split("T")[0]);
  const [snapshotNotes, setSnapshotNotes] = useState("");

  const { data: asset, isLoading: assetLoading } = useQuery<Asset>({
    queryKey: ["/api/assets", assetId],
    enabled: open && !!assetId,
  });

  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery<Snapshot[]>({
    queryKey: ["/api/snapshots", { assetId }],
    enabled: open && !!assetId && activeTab === "history",
  });

  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setSymbol(asset.symbol || "");
      setQuantity(asset.quantity?.toString() || "1");
      setAcquisitionPrice(formatCurrencyInput(asset.acquisitionPrice || 0));
      setAcquisitionDate(asset.acquisitionDate || new Date().toISOString().split("T")[0]);
      setCurrentValue(formatCurrencyInput(asset.currentPrice || asset.acquisitionPrice || 0));
    }
  }, [asset]);

  const updateAssetMutation = useMutation({
    mutationFn: async (data: Partial<Asset>) => {
      return apiRequest("PATCH", `/api/assets/${assetId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      toast({
        title: "Investimento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o investimento.",
        variant: "destructive",
      });
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async (data: { assetId: string; value: number; date: string; notes?: string }) => {
      return apiRequest("POST", `/api/snapshots`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/history"] });
      toast({
        title: "Valor registrado",
        description: "O novo valor foi adicionado ao histórico.",
      });
      setSnapshotValue("");
      setSnapshotNotes("");
      setSnapshotDate(new Date().toISOString().split("T")[0]);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o valor.",
        variant: "destructive",
      });
    },
  });

  const formatCurrencyInput = (value: number): string => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrencyDisplay = (val: string) => {
    const num = val.replace(/[^\d]/g, "");
    if (!num) return "";
    const formatted = (parseInt(num) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  };

  const parseCurrencyValue = (val: string): number => {
    const num = val.replace(/[^\d.,]/g, "");
    return parseFloat(num.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const handleSaveEdit = () => {
    const parsedQuantity = parseFloat(quantity.replace(",", ".")) || 1;
    const parsedAcquisitionPrice = parseCurrencyValue(acquisitionPrice);
    const parsedCurrentValue = parseCurrencyValue(currentValue);

    updateAssetMutation.mutate({
      name,
      symbol: symbol.toUpperCase(),
      quantity: parsedQuantity,
      acquisitionPrice: parsedAcquisitionPrice,
      acquisitionDate,
      currentPrice: parsedCurrentValue,
    });
  };

  const handleAddSnapshot = () => {
    const parsedValue = parseCurrencyValue(snapshotValue);
    if (parsedValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Insira um valor maior que zero.",
        variant: "destructive",
      });
      return;
    }

    createSnapshotMutation.mutate({
      assetId,
      value: parsedValue,
      date: snapshotDate,
      notes: snapshotNotes || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const isFixedIncome = asset?.market === "fixed_income";
  const isSimplified = asset?.quantity === 1;

  if (assetLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Investimento</DialogTitle>
          <DialogDescription>
            {asset?.name} ({asset?.symbol})
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" data-testid="tab-edit">
              <Save className="h-4 w-4 mr-2" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-edit-name"
                />
              </div>

              {!isSimplified && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">Símbolo *</Label>
                    <Input
                      id="edit-symbol"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      data-testid="input-edit-symbol"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">Quantidade *</Label>
                      <Input
                        id="edit-quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        data-testid="input-edit-quantity"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-acquisition-price">Preço de Aquisição *</Label>
                      <Input
                        id="edit-acquisition-price"
                        value={acquisitionPrice}
                        onChange={(e) => setAcquisitionPrice(formatCurrencyDisplay(e.target.value))}
                        data-testid="input-edit-acquisition-price"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-current-value">
                    {isSimplified ? "Valor Atual *" : "Preço Atual *"}
                  </Label>
                  <Input
                    id="edit-current-value"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(formatCurrencyDisplay(e.target.value))}
                    data-testid="input-edit-current-value"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Data</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    data-testid="input-edit-date"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateAssetMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateAssetMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Adicionar ao Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Registre um novo valor sem alterar os dados anteriores. Isso mantém o histórico de evolução do investimento.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="snapshot-value">Valor *</Label>
                    <Input
                      id="snapshot-value"
                      placeholder="R$ 0,00"
                      value={snapshotValue}
                      onChange={(e) => setSnapshotValue(formatCurrencyDisplay(e.target.value))}
                      data-testid="input-snapshot-value"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="snapshot-date">Data *</Label>
                    <Input
                      id="snapshot-date"
                      type="date"
                      value={snapshotDate}
                      onChange={(e) => setSnapshotDate(e.target.value)}
                      data-testid="input-snapshot-date"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="snapshot-notes">Observações (opcional)</Label>
                  <Input
                    id="snapshot-notes"
                    placeholder="Ex: Atualização mensal, rendimento..."
                    value={snapshotNotes}
                    onChange={(e) => setSnapshotNotes(e.target.value)}
                    data-testid="input-snapshot-notes"
                  />
                </div>
                <Button
                  onClick={handleAddSnapshot}
                  disabled={createSnapshotMutation.isPending || !snapshotValue}
                  className="w-full"
                  data-testid="button-add-snapshot"
                >
                  {createSnapshotMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Registrar Valor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Histórico de Valores</CardTitle>
              </CardHeader>
              <CardContent>
                {snapshotsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : snapshots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum histórico registrado ainda.
                  </p>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {snapshots
                        .filter((s) => s.assetId === assetId)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((snapshot, index) => (
                          <div
                            key={snapshot.id}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            data-testid={`snapshot-item-${index}`}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                R$ {snapshot.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(snapshot.date)}
                                {snapshot.notes && ` - ${snapshot.notes}`}
                              </span>
                            </div>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
