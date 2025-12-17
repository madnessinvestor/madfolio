import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthlyStatement, type MonthlyStatementData } from "@/components/dashboard/MonthlyStatement";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockStatements: MonthlyStatementData[] = [
  {
    id: "1",
    month: 12,
    year: 2024,
    startValue: 100000,
    endValue: 112500,
    transactions: [
      { date: "2024-12-05", assetSymbol: "BTC", value: 52500, type: "snapshot" },
      { date: "2024-12-10", assetSymbol: "ETH", value: 28000, type: "snapshot" },
      { date: "2024-12-14", assetSymbol: "PETR4", value: 3820, type: "snapshot" },
      { date: "2024-12-15", assetSymbol: "SOL", value: 7800, type: "snapshot" },
    ],
  },
  {
    id: "2",
    month: 11,
    year: 2024,
    startValue: 95000,
    endValue: 100000,
    transactions: [
      { date: "2024-11-01", assetSymbol: "BTC", value: 48000, type: "snapshot" },
      { date: "2024-11-15", assetSymbol: "VALE3", value: 3600, type: "snapshot" },
      { date: "2024-11-28", assetSymbol: "HGLG11", value: 3240, type: "snapshot" },
    ],
  },
  {
    id: "3",
    month: 10,
    year: 2024,
    startValue: 92000,
    endValue: 95000,
    transactions: [
      { date: "2024-10-05", assetSymbol: "BTC", value: 45000, type: "snapshot" },
      { date: "2024-10-20", assetSymbol: "ETH", value: 26000, type: "snapshot" },
    ],
  },
  {
    id: "4",
    month: 9,
    year: 2024,
    startValue: 88000,
    endValue: 92000,
    transactions: [
      { date: "2024-09-10", assetSymbol: "PETR4", value: 3500, type: "snapshot" },
      { date: "2024-09-25", assetSymbol: "SELIC", value: 15000, type: "snapshot" },
    ],
  },
  {
    id: "5",
    month: 8,
    year: 2024,
    startValue: 85000,
    endValue: 88000,
    transactions: [
      { date: "2024-08-15", assetSymbol: "BTC", value: 42000, type: "snapshot" },
    ],
  },
];

// todo: remove mock functionality
const mockMonthlyData = [
  { month: "Jul", value: 85000, variation: 0 },
  { month: "Ago", value: 88000, variation: 3.5 },
  { month: "Set", value: 92000, variation: 4.5 },
  { month: "Out", value: 95000, variation: 3.3 },
  { month: "Nov", value: 100000, variation: 5.3 },
  { month: "Dez", value: 112500, variation: 12.5 },
];

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function StatementsPage() {
  const { toast } = useToast();
  const [yearFilter, setYearFilter] = useState("2024");

  const filteredStatements = mockStatements.filter(
    (s) => s.year.toString() === yearFilter
  );

  const handleExport = (format: "csv" | "pdf") => {
    toast({
      title: "Exportando...",
      description: `Gerando arquivo ${format.toUpperCase()} do extrato.`,
    });
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Calculate summary
  const totalVariation = filteredStatements.length > 0
    ? filteredStatements[0].endValue - filteredStatements[filteredStatements.length - 1].startValue
    : 0;
  const totalVariationPercent = filteredStatements.length > 0 && filteredStatements[filteredStatements.length - 1].startValue > 0
    ? ((totalVariation / filteredStatements[filteredStatements.length - 1].startValue) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Extratos Mensais</h1>
          <p className="text-muted-foreground">Acompanhe a evolução do seu patrimônio mês a mês</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28" data-testid="select-year">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("csv")} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} data-testid="button-export-pdf">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meses Registrados</p>
                <p className="text-2xl font-bold">{filteredStatements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${totalVariation >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
                {totalVariation >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação no Ano</p>
                <p className={`text-2xl font-bold tabular-nums ${totalVariation >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {totalVariation >= 0 ? "+" : ""}{formatCurrency(totalVariation)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${totalVariationPercent >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
                {totalVariationPercent >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rentabilidade</p>
                <p className={`text-2xl font-bold tabular-nums ${totalVariationPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {totalVariationPercent >= 0 ? "+" : ""}{totalVariationPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PerformanceChart data={mockMonthlyData} title="Evolução Mensal" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyStatement statements={filteredStatements} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Comparativo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStatements.map((statement) => {
                const variation = statement.endValue - statement.startValue;
                const variationPercent = statement.startValue > 0
                  ? ((variation / statement.startValue) * 100)
                  : 0;
                const isPositive = variation >= 0;

                return (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`comparison-${statement.year}-${statement.month}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPositive ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{monthNames[statement.month - 1]}</p>
                        <p className="text-xs text-muted-foreground">
                          {statement.transactions.length} lançamento(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">{formatCurrency(statement.endValue)}</p>
                      <p className={`text-sm tabular-nums ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {isPositive ? "+" : ""}{variationPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
