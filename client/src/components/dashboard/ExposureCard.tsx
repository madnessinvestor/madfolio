import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Landmark, BarChart3, Building2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ExposureCardProps {
  cryptoValue: number;
  fixedIncomeValue: number;
  variableIncomeValue: number;
  realEstateValue?: number;
  formatCurrency?: (value: number) => string;
}

interface AssetItem {
  name: string;
  value: number;
  percent: number;
  color: string;
  icon: React.ElementType;
}

export function ExposureCard({ cryptoValue, fixedIncomeValue, variableIncomeValue, realEstateValue = 0, formatCurrency: customFormat }: ExposureCardProps) {
  const total = cryptoValue + fixedIncomeValue + variableIncomeValue + realEstateValue;
  
  const formatDefault = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const format = customFormat || formatDefault;

  // Create asset distribution data
  const assets: AssetItem[] = [
    { 
      name: "Mercado Cripto", 
      value: cryptoValue, 
      percent: total > 0 ? (cryptoValue / total) * 100 : 0,
      color: "hsl(var(--chart-1))",
      icon: Bitcoin
    },
    { 
      name: "Renda Fixa", 
      value: fixedIncomeValue, 
      percent: total > 0 ? (fixedIncomeValue / total) * 100 : 0,
      color: "hsl(var(--chart-2))",
      icon: Landmark
    },
    { 
      name: "Renda Variável", 
      value: variableIncomeValue, 
      percent: total > 0 ? (variableIncomeValue / total) * 100 : 0,
      color: "hsl(var(--chart-3))",
      icon: BarChart3
    },
    { 
      name: "Imóveis", 
      value: realEstateValue, 
      percent: total > 0 ? (realEstateValue / total) * 100 : 0,
      color: "hsl(var(--chart-4))",
      icon: Building2
    },
  ].filter(item => item.value > 0);

  const pieData = assets.map(asset => ({
    name: asset.name,
    value: asset.value,
    color: asset.color
  }));

  const renderCustomLabel = ({ percent }: { percent: number }) => {
    if (percent < 0.05) return null;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Distribuição de Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart - Left Side */}
          {pieData.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${format(value as number)} (${((value as number / total) * 100).toFixed(1)}%)`,
                        "Valor"
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Details - Right Side */}
          <div className="space-y-4">
            {assets.map((asset, index) => {
              const Icon = asset.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${asset.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: asset.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {format(asset.value)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold tabular-nums whitespace-nowrap">
                      {asset.percent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={asset.percent} className="h-2" />
                </div>
              );
            })}

            {assets.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Total</span>
                  <span className="text-lg font-bold tabular-nums">{format(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
