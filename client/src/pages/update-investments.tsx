import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import type { Asset } from "@shared/schema";

export default function UpdateInvestmentsPage() {
  const { toast } = useToast();
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [updateDate, setUpdateDate] = useState("");
  const [quantity, setQuantity] = useState<string>("");

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Filter for variable assets only (crypto and variable_income)
  const variableAssets = assets.filter(
    (a) => a.market === "crypto" || a.market === "variable_income"
  );

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssetId || !updateDate) {
        throw new Error("Por favor, selecione um ativo e uma data");
      }

      const payload = {
        updateDate,
        quantity: quantity ? parseFloat(quantity) : selectedAsset?.quantity,
      };

      return apiRequest(
        "POST",
        `/api/investments/${selectedAssetId}/update-historical`,
        payload
      );
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Investimento atualizado com dados históricos",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      setSelectedAssetId("");
      setUpdateDate("");
      setQuantity("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.message || "Falha ao atualizar investimento histórico",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Atualizar Investimentos</h1>
        <p className="text-secondary mt-2">
          Atualize investimentos com cotações históricas de datas anteriores
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Atualizar com Histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {variableAssets.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Nenhum ativo variável disponível
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Apenas ativos de criptomoedas e ações podem ser atualizados
                  com dados históricos.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="asset-select">Selecione o Ativo</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger id="asset-select" data-testid="select-asset">
                    <SelectValue placeholder="Escolha um ativo variável..." />
                  </SelectTrigger>
                  <SelectContent>
                    {variableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.symbol} - {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAsset && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Quantidade atual: {selectedAsset.quantity} {selectedAsset.symbol}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="update-date">Data da Atualização</Label>
                <Input
                  id="update-date"
                  type="date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  data-testid="input-update-date"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="quantity">
                  Quantidade (opcional - usa a atual se vazio)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.00000001"
                  placeholder={selectedAsset?.quantity.toString()}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-quantity"
                />
              </div>

              <Button
                onClick={() => updateMutation.mutate()}
                disabled={
                  !selectedAssetId ||
                  !updateDate ||
                  updateMutation.isPending ||
                  assetsLoading
                }
                className="w-full"
                data-testid="button-update-investment"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando histórico...
                  </>
                ) : (
                  "Atualizar Investimento"
                )}
              </Button>
            </>
          )}

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-md border border-slate-200 dark:border-slate-800">
            <h3 className="font-medium text-sm mb-2">Informações Importantes:</h3>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Apenas ativos de criptomoedas possuem dados históricos</li>
              <li>• Ativos estáveis (USDC, stablecoins) mantêm valor fixo</li>
              <li>
                • A cotação histórica é buscada do CoinGecko para a data
                especificada
              </li>
              <li>
                • Se não houver dados para a data, tente uma data próxima
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
