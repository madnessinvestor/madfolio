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
import { AlertCircle, Calendar, Loader2, Check, X } from "lucide-react";
import type { Asset } from "@shared/schema";

export default function UpdateInvestmentsPage() {
  const { toast } = useToast();
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [updateDate, setUpdateDate] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [preview, setPreview] = useState<{ price: number; total: number } | null>(null);

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Filter for variable assets only (crypto and variable_income)
  const variableAssets = assets.filter(
    (a) => a.market === "crypto" || a.market === "variable_income"
  );

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssetId || !updateDate) {
        throw new Error("Por favor, selecione um ativo e uma data");
      }

      // This is a preview call - we'll use the same endpoint but just fetch the price
      const response = await apiRequest(
        "POST",
        `/api/investments/${selectedAssetId}/preview-historical`,
        {
          updateDate,
          quantity: quantity ? parseFloat(quantity) : selectedAsset?.quantity,
        }
      );
      return response;
    },
    onSuccess: (data: any) => {
      setPreview(data);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao carregar preview",
        description: error?.message || "Não foi possível carregar dados históricos",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssetId || !updateDate || !preview) {
        throw new Error("Por favor, complete o preview antes de salvar");
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
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/history"] });
      setSelectedAssetId("");
      setUpdateDate("");
      setQuantity("");
      setPreview(null);
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

  const handleClearChanges = () => {
    setPreview(null);
    setSelectedAssetId("");
    setUpdateDate("");
    setQuantity("");
  };

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

              {!preview ? (
                <Button
                  onClick={() => previewMutation.mutate()}
                  disabled={
                    !selectedAssetId ||
                    !updateDate ||
                    previewMutation.isPending ||
                    assetsLoading
                  }
                  className="w-full"
                  data-testid="button-preview-investment"
                >
                  {previewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando préview...
                    </>
                  ) : (
                    "Visualizar Alterações"
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Préview das Alterações
                    </p>
                    <div className="text-sm space-y-1">
                      <p className="text-blue-800 dark:text-blue-200">
                        Ativo: <span className="font-semibold">{selectedAsset?.symbol}</span>
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Data: <span className="font-semibold">{new Date(updateDate).toLocaleDateString("pt-BR")}</span>
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Preço Histórico: <span className="font-semibold">R$ {preview.price.toFixed(2)}</span>
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Valor Total: <span className="font-semibold">R$ {preview.total.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateMutation.mutate()}
                      disabled={updateMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-changes"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearChanges}
                      disabled={updateMutation.isPending}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-cancel-changes"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
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
