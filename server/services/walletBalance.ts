// Serviço para buscar saldo de wallets crypto
// Usa a blockchain API para buscar o saldo em ETH/USD

interface WalletBalanceResult {
  address: string;
  balanceETH: number;
  balanceUSD: number;
  balanceBRL?: number;
}

export async function fetchWalletBalance(address: string): Promise<WalletBalanceResult | null> {
  try {
    // Validar endereço
    if (!address.startsWith("0x") || address.length !== 42) {
      throw new Error("Invalid Ethereum address");
    }

    // Usar QuickNode ou Alchemy RPC público para buscar saldo
    // Alternativa: usar Etherscan API (sem key para uso básico)
    const rpcUrl = "https://rpc.ankr.com/eth";
    
    // Chamar eth_getBalance via JSON-RPC
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    // Converter hex para decimal Wei e depois para ETH (1 ETH = 10^18 Wei)
    const balanceWei = BigInt(data.result || "0");
    const balanceETH = Number(balanceWei) / 1e18;

    // Buscar preço de ETH em USD
    const priceResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    
    if (!priceResponse.ok) {
      throw new Error("Failed to fetch ETH price");
    }

    const priceData = await priceResponse.json();
    const ethPriceUSD = priceData.ethereum.usd || 0;
    const balanceUSD = balanceETH * ethPriceUSD;

    // Buscar taxa USD/BRL
    const exchangeResponse = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!exchangeResponse.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const exchangeData = await exchangeResponse.json();
    const usdToBrl = exchangeData.rates.BRL || 5.51;
    const balanceBRL = balanceUSD * usdToBrl;

    return {
      address,
      balanceETH: Number(balanceETH.toFixed(6)),
      balanceUSD: Number(balanceUSD.toFixed(2)),
      balanceBRL: Number(balanceBRL.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return null;
  }
}
