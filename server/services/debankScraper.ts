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
  
  const solanaMatch = link.match(/wallet=([A-Za-z0-9]+)/);
  if (solanaMatch) return solanaMatch[1];
  
  return null;
}

// Function to wait for value stabilization
async function waitForValueStabilization(
  page: any,
  selector: string,
  maxWaitMs: number = 60000
): Promise<string | null> {
  const startTime = Date.now();
  let previousValue: string | null = null;
  let stabilityCount = 0;
  const requiredStabilityChecks = 3; // 5 seconds without change = stable

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const currentValue = await page.evaluate((sel: string) => {
        const element = document.querySelector(sel);
        return element?.textContent?.trim() || null;
      }, selector);

      if (currentValue === previousValue && currentValue !== null) {
        stabilityCount++;
        console.log(`[Step.finance] Stability check ${stabilityCount}/${requiredStabilityChecks}: value ${currentValue}`);
        
        if (stabilityCount >= requiredStabilityChecks) {
          console.log(`[Step.finance] Value stabilized: ${currentValue}`);
          return currentValue;
        }
      } else {
        stabilityCount = 0;
        previousValue = currentValue;
        console.log(`[Step.finance] Value changed to: ${currentValue}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.log(`[Step.finance] Error during stabilization check: ${error}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return previousValue;
}

// Extract net worth specifically for DeBank (EVM)
async function extractDebankNetWorth(page: any): Promise<string | null> {
  console.log('[Step.finance] Attempting to extract DeBank Net Worth');
  
  try {
    // Try to find the Net Worth value on DeBank
    const netWorth = await page.evaluate(() => {
      // Look for text containing "Net Worth" or similar patterns
      const elements = Array.from(document.querySelectorAll('*'));
      
      for (const el of elements) {
        const text = el.textContent || '';
        
        // Look for "Net Worth" label and get the value
        if (text.toLowerCase().includes('net worth') || text.toLowerCase().includes('patrimônio')) {
          const parent = el.closest('[class*="flex"], [class*="grid"], [class*="stack"]');
          if (parent) {
            const allText = (parent as HTMLElement).textContent || '';
            // Extract currency value ($ followed by numbers and commas/dots)
            const match = allText.match(/\$\s*([\d,]+\.?\d*)/);
            if (match) return match[1];
          }
        }
      }
      
      // Alternative: look for large numbers in the page
      const pageText = document.body.innerText;
      const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);
      
      for (const line of lines) {
        if (/net\s+worth|patrimônio\s+líquido/i.test(line)) {
          // Look in next few lines for a number
          const idx = lines.indexOf(line);
          for (let i = idx + 1; i < Math.min(idx + 5, lines.length); i++) {
            const match = lines[i].match(/\$?\s*([\d,]+\.?\d*)/);
            if (match && !/%/.test(lines[i])) {
              return match[1];
            }
          }
        }
      }
      
      return null;
    });

    if (netWorth) {
      console.log(`[Step.finance] Extracted DeBank Net Worth: $${netWorth}`);
      return `$${netWorth}`;
    }
  } catch (error) {
    console.log(`[Step.finance] Error extracting DeBank Net Worth: ${error}`);
  }
  
  return null;
}

// Extract portfolio value specifically for Step.Finance (Solana)
async function extractStepFinancePortfolioValue(page: any): Promise<string | null> {
  console.log('[Step.finance] Attempting to extract Step.Finance Portfolio Value');
  
  try {
    // Try to find the Portfolio Value
    const portfolioValue = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      
      // Look for portfolio/patrimônio value
      for (const el of elements) {
        const text = el.textContent || '';
        
        if (text.toLowerCase().includes('portfolio') || 
            text.toLowerCase().includes('patrimônio') ||
            text.toLowerCase().includes('total value')) {
          const parent = el.closest('[class*="flex"], [class*="grid"], [class*="stack"], [class*="card"]');
          if (parent) {
            const allText = (parent as HTMLElement).textContent || '';
            // Extract currency value
            const match = allText.match(/\$?\s*([\d,]+\.?\d*)/);
            if (match) return match[1];
          }
        }
      }
      
      // Alternative: search page text
      const pageText = document.body.innerText;
      const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);
      
      for (const line of lines) {
        if (/portfolio|patrimônio|total\s+value/i.test(line)) {
          const idx = lines.indexOf(line);
          for (let i = idx + 1; i < Math.min(idx + 5, lines.length); i++) {
            const match = lines[i].match(/\$?\s*([\d,]+\.?\d*)/);
            if (match && !/%/.test(lines[i])) {
              return match[1];
            }
          }
        }
      }
      
      return null;
    });

    if (portfolioValue) {
      console.log(`[Step.finance] Extracted Step.Finance Portfolio Value: $${portfolioValue}`);
      return `$${portfolioValue}`;
    }
  } catch (error) {
    console.log(`[Step.finance] Error extracting Step.Finance Portfolio Value: ${error}`);
  }
  
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
    
    // MANDATORY: Initial delay of 15 seconds after page.goto
    console.log(`[Step.finance] Loading page for ${wallet.name}...`);
    await page.goto(wallet.link, { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    }).catch((err) => {
      console.log(`[Step.finance] Page load warning for ${wallet.name}: ${err.message}`);
    });

    console.log(`[Step.finance] Mandatory 15-second wait for ${wallet.name} to fully load...`);
    await new Promise(resolve => setTimeout(resolve, 15000));

    let balance: string | null = null;

    // For Step.Finance (Solana wallets)
    if (wallet.link.includes('step.finance')) {
      console.log(`[Step.finance] Detecting Step.Finance portfolio for ${wallet.name}`);
      balance = await extractStepFinancePortfolioValue(page);
    }
    // For DeBank (EVM wallets)
    else if (wallet.link.includes('debank.com')) {
      console.log(`[Step.finance] Detecting DeBank Net Worth for ${wallet.name}`);
      balance = await extractDebankNetWorth(page);
    }

    // If specific extraction didn't work, try generic extraction
    if (!balance) {
      console.log(`[Step.finance] Using generic extraction for ${wallet.name}`);
      balance = await page.evaluate(() => {
        const allText = document.body.innerText;
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l);
        
        // Look for currency patterns
        for (const line of lines) {
          // Skip obvious non-balance lines
          if (/earnings|profit|loss|fee|gain|%|time|date|hour|minute|second|tx|transaction|volume|change/i.test(line)) continue;
          if (line.length > 100) continue; // Skip long lines
          
          // Look for currency amounts
          const match = line.match(/\$?\s*([\d]{1,3}(?:[,][\d]{3})*(?:[.][\d]{2,})?)/);
          if (match) {
            const amount = match[1];
            // Accept if it has comma separator or decimal
            if (amount.includes(',') || amount.includes('.')) {
              const numValue = parseFloat(amount.replace(/,/g, ''));
              if (numValue > 10) { // Must be reasonable balance
                return `$${amount}`;
              }
            }
          }
        }

        return null;
      });
    }

    // Clean up the balance
    const cleanBalance = balance ? balance.trim() : null;
    const isValidBalance = cleanBalance && cleanBalance !== ',' && cleanBalance !== '$' && cleanBalance.match(/[\d,]/);
    
    if (isValidBalance) {
      console.log(`[Step.finance] Found balance for ${wallet.name}: ${cleanBalance}`);
      await page.close();
      
      return {
        id: wallet.id,
        name: wallet.name,
        link: wallet.link,
        balance: cleanBalance,
        lastUpdated: new Date(),
      };
    } else {
      console.log(`[Step.finance] No valid balance found for ${wallet.name}`);
      await page.close();
      
      return {
        id: wallet.id,
        name: wallet.name,
        link: wallet.link,
        balance: 'Indisponível',
        lastUpdated: new Date(),
      };
    }
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

// MANDATORY: Sequential wallet processing with 5-second delay between each
async function updateWalletBalanceSequential(wallets: WalletConfig[]): Promise<void> {
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

    // Process wallets sequentially (not in parallel)
    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];
      console.log(`[Step.finance] Processing wallet ${i + 1}/${wallets.length}: ${wallet.name}`);
      
      const balance = await scrapeWalletBalance(browser, wallet);
      balanceCache.set(wallet.name, balance);
      console.log(`[Step.finance] Updated ${wallet.name}: ${balance.balance}`);

      // 5-second delay between wallets (except after the last one)
      if (i < wallets.length - 1) {
        console.log(`[Step.finance] Waiting 5 seconds before next wallet...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error(`[Step.finance] Error in sequential wallet update:`, error);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

async function scheduleWalletUpdates(): Promise<void> {
  console.log(`[Step.finance] Scheduling ${WALLETS.length} wallets for sequential update`);
  
  // Process all wallets sequentially
  await updateWalletBalanceSequential(WALLETS);
}

export async function forceRefreshAndWait(): Promise<WalletBalance[]> {
  console.log('[Step.finance] Force refresh requested - starting sequential wallet updates');
  
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
  
  // Process wallets sequentially
  await updateWalletBalanceSequential(WALLETS);
  
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
  console.log(`[Step.finance] Starting monitor with ${intervalMinutes} minute interval - wallets processed sequentially`);

  for (const wallet of WALLETS) {
    balanceCache.set(wallet.name, {
      id: wallet.id,
      name: wallet.name,
      link: wallet.link,
      balance: 'Loading...',
      lastUpdated: new Date(),
    });
  }

  // First update after 5 seconds
  setTimeout(async () => {
    await scheduleWalletUpdates();
  }, 5000);

  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Recurring updates at specified interval
  refreshInterval = setInterval(async () => {
    walletUpdateTimeouts.forEach(timeout => clearTimeout(timeout));
    walletUpdateTimeouts.clear();
    
    await scheduleWalletUpdates();
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
