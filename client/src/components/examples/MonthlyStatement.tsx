import { MonthlyStatement, type MonthlyStatementData } from "../dashboard/MonthlyStatement";

export default function MonthlyStatementExample() {
  const statements: MonthlyStatementData[] = [
    {
      id: "1",
      month: 12,
      year: 2024,
      startValue: 100000,
      endValue: 112500,
      transactions: [
        { date: "2024-12-05", assetSymbol: "BTC", value: 50000, type: "snapshot" },
        { date: "2024-12-10", assetSymbol: "ETH", value: 25000, type: "snapshot" },
        { date: "2024-12-15", assetSymbol: "PETR4", value: 37500, type: "snapshot" },
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
        { date: "2024-11-20", assetSymbol: "VALE3", value: 22000, type: "snapshot" },
      ],
    },
  ];

  return <MonthlyStatement statements={statements} />;
}
