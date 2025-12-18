// Serviço para buscar saldo de wallets Jup.Ag
interface JupPortfolioData {
  portfolioId: string;
  netWorthUSD: number;
  netWorthSOL: number;
  totalTokens: number;
}

export async function fetchJupPortfolio(portfolioId: string): Promise<JupPortfolioData | null> {
  try {
    if (!portfolioId) {
      throw new Error("Portfolio ID is required");
    }

    // Jup.Ag uses their own API endpoint for portfolio data
    // Format: https://jup.ag/portfolio/{portfolioId}
    const response = await fetch(`https://jup.ag/api/portfolio/${portfolioId}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Jup.Ag portfolio: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract Net Worth from the response
    // The API returns portfolio data with metrics including Net Worth
    const netWorthUSD = data.netWorthUSD || data.totalValue || 0;
    const netWorthSOL = data.netWorthSOL || 0;

    return {
      portfolioId,
      netWorthUSD,
      netWorthSOL,
      totalTokens: data.tokenCount || 0,
    };
  } catch (error) {
    console.error("Error fetching Jup.Ag portfolio:", error);
    return null;
  }
}
