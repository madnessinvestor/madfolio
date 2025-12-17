import { SnapshotDialog } from "../dashboard/SnapshotDialog";

export default function SnapshotDialogExample() {
  const assets = [
    { id: "1", name: "Bitcoin", symbol: "BTC", category: "crypto" as const, market: "crypto" as const },
    { id: "2", name: "Petrobras", symbol: "PETR4", category: "stocks" as const, market: "traditional" as const },
  ];

  return (
    <SnapshotDialog
      assets={assets}
      onAdd={(snapshot) => console.log("Snapshot added:", snapshot)}
    />
  );
}
