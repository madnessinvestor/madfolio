import puppeteer, { Browser } from 'puppeteer';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface WalletConfig {
  id?: string;
  name: string;
  link: string;
}

interface WalletBalance {
  id?: string;
  name: string;
  link: string;
  balance: string;
  lastUpdated: Date;
  error?: string;
}

let WALLETS: WalletConfig[] = [];

export function setWallets(newWallets: WalletConfig[]): void {
  WALLETS = newWallets;
}

const balanceCache = new Map<string, WalletBalance>();
let refreshInterval: NodeJS.Timeout | null = null;
let walletUpdateTimeouts: Map<string, NodeJS.Timeout> = new Map();

async function getChromiumPath(): Promise<string> {
  try {
    const { stdout } = await execAsync('which chromium');
    return stdout.trim();
  } catch (error) {
    console.error('Could not find chromium:', error);
    return '/nix/store/chromium/bin/chromium';
  }
}

async function extractAddressFromLink(link: string): Promise<string | null> {
  // Extract Ethereum address from DeBank URL: https://debank.com/profile/0x...
  // Or Solana address from Step.finance URL
  const ethMatch = link.match(/0x[a-fA-F0-9]{40}/);
  if (ethMatch) return ethMatch[0];
  
  const solanaMatch = link.match(/profile\/([A-Z0-9]{40,})/);
  if (solanaMatch) return solanaMatch[1];
  
  return null;
}

async function scrapeWalletBalance(browser: Browser, wallet: WalletConfig): Promise<WalletBalance> {
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`[Step.finance] Fetching balance for ${wallet.name} from ${wallet.link}`);
    
    // Try API approach first if it's a DeBank link
    if (wallet.link.includes('debank.com')) {
      const address = await extractAddressFromLink(wallet.link);
      if (address) {
        console.log(`[Step.finance] Extracted address from DeBank URL: ${address}`);
        try {
          const apiUrl = `https://api.debank.com/v1/user/total_balance?id=${address}`;
          console.log(`[Step.finance] Calling DeBank API: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            headers: { "Accept": "application/json" }
          });

          console.log(`[Step.finance] API response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json() as any;
            const balanceUSD = data.total_usd_value || 0;
            const formatted = `$${balanceUSD.toFixed(2)}`;
            console.log(`[Step.finance] Found API balance for ${wallet.name}: ${formatted}`);
            return {
              id: wallet.id,
              name: wallet.name,
              link: wallet.link,
              balance: formatted,
              lastUpdated: new Date(),
            };
          } else {
            console.log(`[Step.finance] API returned status ${response.status} for ${wallet.name}`);
          }
        } catch (apiError) {
          console.log(`[Step.finance] API call failed for ${wallet.name}: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }
      }
    }

    // Fallback to browser scraping
    console.log(`[Step.finance] Starting web scraping for ${wallet.name}`);
    
    await page.goto(wallet.link, { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    }).catch((err) => {
      console.log(`[Step.finance] Page load warning for ${wallet.name}: ${err.message}`);
    });

    // For Step.Finance, wait longer and try to find the "Patrimônio Líquido" element
    if (wallet.link.includes('step.finance')) {
      console.log(`[Step.finance] Waiting for Step.Finance page to render for ${wallet.name}`);
      await new Promise(resolve => setTimeout(resolve, 12000)); // Extended wait for better rendering
    } else {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Also increased for DeBank
    }

    // Try to find the balance text on the page
    const balance = await page.evaluate(() => {
      const allText = document.body.innerText;
      const lines = allText.split('\n').map(l => l.trim()).filter(l => l);
      
      // Strategy 1: Look for "Patrimônio Líquido" (Step.Finance) or similar patterns
      for (let i = 0; i < lines.length; i++) {
        // Check for Patrimônio Líquido
        if (/patrimônio\s+líquido|net\s+worth/i.test(lines[i])) {
          // Look in next lines for a number
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const value = lines[j].match(/([\d.,]+)/);
            if (value && !/%/.test(lines[j])) {
              return value[1];
            }
          }
        }
        
        // Check for Total Balance or Balance (DeBank)
        if (/^total\s*balance|^balance\s*:\s*\$|^total\s*:\s*\$/i.test(lines[i])) {
          const value = lines[i].match(/([\d.,]+)/);
          if (value) return value[1];
          // Or look in next line
          if (i + 1 < lines.length) {
            const nextValue = lines[i + 1].match(/([\d.,]+)/);
            if (nextValue) return nextValue[1];
          }
        }
      }
      
      // Strategy 2: Search for large numbers that look like balances
      // (with comma separators or decimal points, indicating currency amounts)
      for (const line of lines) {
        // Skip obvious non-balance lines
        if (/earnings|profit|loss|fee|gain|%|time|date|hour|minute|second|tx|transaction/i.test(line)) continue;
        if (line.length > 100) continue; // Skip long lines
        
        // Look for currency amounts
        const match = line.match(/([\d]{1,3}(?:[,][\d]{3})*(?:[.][\d]{2,})?)/);
        if (match) {
          const amount = match[1];
          // Accept if it has comma separator or decimal
          if (amount.includes(',') || amount.includes('.')) {
            const numValue = parseFloat(amount.replace(/,/g, ''));
            if (numValue > 10) { // Must be reasonable balance
              return amount;
            }
          }
        }
      }

      return null;
    });

    // Clean up the balance - reject if it's empty, just a comma, or just whitespace
    const cleanBalance = balance ? balance.trim() : null;
    const isValidBalance = cleanBalance && cleanBalance !== ',' && cleanBalance.match(/[\d,]/);
    
    if (isValidBalance) {
      console.log(`[Step.finance] Found balance via scraping for ${wallet.name}: ${cleanBalance}`);
    } else {
      console.log(`[Step.finance] No valid balance found via scraping for ${wallet.name}, trying alternative method`);
      
      // Try getting the page title or meta tags
      const alternativeBalance = await page.evaluate(() => {
        const titleText = document.title || '';
        const match = titleText.match(/\$?[\d,]+\.?\d*/);
        return match ? match[0] : null;
      });
      
      if (alternativeBalance) {
        console.log(`[Step.finance] Found balance in title for ${wallet.name}: ${alternativeBalance}`);
        return {
          id: wallet.id,
          name: wallet.name,
          link: wallet.link,
          balance: alternativeBalance,
          lastUpdated: new Date(),
        };
      }
      
      // If still no balance, return "Indisponível" (Unavailable in Portuguese)
      console.log(`[Step.finance] Balance unavailable for ${wallet.name}`);
      return {
        id: wallet.id,
        name: wallet.name,
        link: wallet.link,
        balance: 'Indisponível',
        lastUpdated: new Date(),
      };
    }
    
    // Valid balance found
    await page.close();
    
    return {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: cleanBalance,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`[Step.finance] Error fetching ${wallet.name}:`, error);
    await page.close().catch(() => {});
    
    return {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: 'Erro ao carregar',
      lastUpdated: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function updateWalletBalance(wallet: WalletConfig): Promise<void> {
  let browser: Browser | null = null;

  try {
    const chromiumPath = await getChromiumPath();
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: chromiumPath,
    });

    const balance = await scrapeWalletBalance(browser, wallet);
    balanceCache.set(wallet.name, balance);
    console.log(`[Step.finance] Updated ${wallet.name}: ${balance.balance}`);
  } catch (error) {
    console.error(`[Step.finance] Error updating ${wallet.name}:`, error);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

async function scheduleWalletUpdates(): Promise<void> {
  WALLETS.forEach((wallet, index) => {
    // 5 second interval between each wallet to avoid simultaneous requests
    const delayMs = index * 5 * 1000;
    
    console.log(`[Step.finance] Scheduling ${wallet.name} to update in ${delayMs / 1000} seconds`);
    
    const timeout = setTimeout(async () => {
      await updateWalletBalance(wallet);
    }, delayMs);
    
    walletUpdateTimeouts.set(wallet.name, timeout);
  });
}

export async function forceRefreshAndWait(): Promise<WalletBalance[]> {
  console.log('[Step.finance] Force refresh requested with wait - initial 15 second wait before starting');
  
  // Clear any pending timeouts
  walletUpdateTimeouts.forEach(timeout => clearTimeout(timeout));
  walletUpdateTimeouts.clear();
  
  // Mark all wallets as loading
  for (const wallet of WALLETS) {
    balanceCache.set(wallet.name, {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: 'Carregando...',
      lastUpdated: new Date(),
    });
  }
  
  // Start with 15 second initial wait for proper site loading
  const initialWaitMs = 15 * 1000;
  console.log(`[Step.finance] Waiting ${initialWaitMs / 1000} seconds before starting wallet updates`);
  
  // Start updates with 5 second intervals between each wallet (after initial 15s wait)
  const updatePromises = WALLETS.map((wallet, index) => {
    return new Promise<void>((resolve) => {
      // Initial 15s wait + (index * 5s interval between wallets)
      const delayMs = initialWaitMs + (index * 5 * 1000);
      
      setTimeout(async () => {
        await updateWalletBalance(wallet);
        resolve();
      }, delayMs);
    });
  });
  
  // Calculate total wait time: 15s initial + (number_of_wallets - 1) * 5 seconds
  const totalWaitMs = initialWaitMs + Math.max(0, (WALLETS.length - 1) * 5 * 1000);
  console.log(`[Step.finance] Total wait time: ${totalWaitMs / 1000} seconds (15s initial + ${(WALLETS.length - 1) * 5}s for intervals)`);
  
  // Wait for all updates to complete
  await Promise.all(updatePromises);
  
  // Return updated balances
  return getDetailedBalances();
}

export function getBalances(): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const wallet of WALLETS) {
    const cached = balanceCache.get(wallet.name);
    result[wallet.name] = cached?.balance || 'Loading...';
  }
  
  return result;
}

export function getDetailedBalances(): WalletBalance[] {
  return WALLETS.map(wallet => {
    const cached = balanceCache.get(wallet.name);
    return {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: cached?.balance || 'Loading...',
      lastUpdated: cached?.lastUpdated || new Date(),
      error: cached?.error,
    };
  });
}

export function startStepMonitor(intervalMs: number = 60 * 60 * 1000): void {
  const intervalMinutes = intervalMs / 1000 / 60;
  console.log(`[Step.finance] Starting monitor with ${intervalMinutes} minute interval and 10 second spacing between wallets`);

  for (const wallet of WALLETS) {
    balanceCache.set(wallet.name, {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: 'Loading...',
      lastUpdated: new Date(),
    });
  }

  setTimeout(() => {
    scheduleWalletUpdates();
  }, 5000);

  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    walletUpdateTimeouts.forEach(timeout => clearTimeout(timeout));
    walletUpdateTimeouts.clear();
    
    scheduleWalletUpdates();
  }, intervalMs);
}

export function stopStepMonitor(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  
  walletUpdateTimeouts.forEach(timeout => clearTimeout(timeout));
  walletUpdateTimeouts.clear();
  
  console.log('[Step.finance] Monitor stopped');
}

export async function forceRefresh(): Promise<void> {
  walletUpdateTimeouts.forEach(timeout => clearTimeout(timeout));
  walletUpdateTimeouts.clear();
  
  await scheduleWalletUpdates();
}
