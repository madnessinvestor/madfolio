import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { History, Search, Filter, Calendar } from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

interface HistoryEntry {
  id: string;
  date: string;
  assetSymbol: string;
  assetName: string;
  market: "crypto" | "traditional";
  value: number;
  previousValue?: number;
  notes?: string;
}

// todo: remove mock functionality
const mockHistory: HistoryEntry[] = [
  { id: "1", date: "2024-12-15", assetSymbol: "BTC", assetName: "Bitcoin", market: "crypto", value: 52500, previousValue: 50000, notes: "Aporte mensal" },
  { id: "2", date: "2024-12-14", assetSymbol: "PETR4", assetName: "Petrobras", market: "traditional", value: 3820, previousValue: 3650 },
  { id: "3", date: "2024-12-10", assetSymbol: "ETH", assetName: "Ethereum", market: "crypto", value: 28000, previousValue: 27500 },
  { id: "4", date: "2024-12-08", assetSymbol: "VALE3", assetName: "Vale", market: "traditional", value: 3625, previousValue: 3600 },
  { id: "5", date: "2024-12-05", assetSymbol: "SOL", assetName: "Solana", market: "crypto", value: 7800, previousValue: 7200, notes: "Compra nova" },
  { id: "6", date: "2024-12-01", assetSymbol: "SELIC", assetName: "Tesouro Selic", market: "traditional", value: 15200, previousValue: 15100 },
  { id: "7", date: "2024-11-28", assetSymbol: "BTC", assetName: "Bitcoin", market: "crypto", value: 50000, previousValue: 48000 },
  { id: "8", date: "2024-11-25", assetSymbol: "HGLG11", assetName: "CSHG Logística", market: "traditional", value: 3240, previousValue: 3200 },
];

// todo: remove mock functionality
const mockPortfolioHistory = [
  { month: "Jul", value: 85000 },
  { month: "Ago", value: 88000 },
  { month: "Set", value: 92000 },
  { month: "Out", value: 95000 },
  { month: "Nov", value: 100000 },
  { month: "Dez", value: 112500 },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "crypto" | "traditional">("all");
  const [search, setSearch] = useState("");

  const filteredHistory = mockHistory.filter((entry) => {
    const matchesFilter = filter === "all" || entry.market === filter;
    const matchesSearch =
      search === "" ||
      entry.assetSymbol.toLowerCase().includes(search.toLowerCase()) ||
      entry.assetName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">Todos os lançamentos e snapshots</p>
        </div>
      </div>

      <PerformanceChart data={mockPortfolioHistory} title="Evolução do Patrimônio Total" />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Lançamentos
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ativo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-48"
                data-testid="input-search-history"
              />
            </div>
            <Select value={filter} onValueChange={(v: "all" | "crypto" | "traditional") => setFilter(v)}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-market">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="crypto">Cripto</SelectItem>
                <SelectItem value="traditional">Tradicional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Mercado</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry) => {
                  const variation = entry.previousValue
                    ? ((entry.value - entry.previousValue) / entry.previousValue) * 100
                    : 0;
                  const isPositive = variation >= 0;

                  return (
                    <TableRow key={entry.id} data-testid={`row-history-${entry.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(entry.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.assetSymbol}</p>
                          <p className="text-xs text-muted-foreground">{entry.assetName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.market === "crypto" ? "default" : "secondary"}>
                          {entry.market === "crypto" ? "Cripto" : "Tradicional"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(entry.value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.previousValue && (
                          <span
                            className={`tabular-nums text-sm ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}{variation.toFixed(2)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.notes || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
