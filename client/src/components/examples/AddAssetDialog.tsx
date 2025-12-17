import { AddAssetDialog } from "../dashboard/AddAssetDialog";

export default function AddAssetDialogExample() {
  return (
    <AddAssetDialog
      onAdd={(asset) => console.log("Asset added:", asset)}
      defaultMarket="crypto"
    />
  );
}
