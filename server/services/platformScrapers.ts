// Platform-specific wallet balance scrapers with timeout & fallback logic
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';

puppeteerExtra.use(StealthPlugin());

export interface ScraperResult {
  value: string | null;
  success: boolean;
  platform: string;
  error?: string;
}

// ============================================================================
// HELPER: Extract largest dollar value from text (opportunistic strategy)
// ============================================================================

function extractLargestDollarValue(text: string): string | null {
  const regex = /\$[\d,]+(?:\.\d{2})?/g;
  const matches = text.match(regex);
  
  if (!matches || matches.length === 0) return null;
  
  const values = matches
    .map(m => ({
      str: m,
      num: parseFloat(m.replace(/[$,]/g, ''))
    }))
    .filter(v => v.num >= 10); // Ignore values < $10
  
  if (values.length === 0) return null;
  
  const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
  return maxValue.str;
}

// ============================================================================
// EVM / DEBANK SCRAPER (KEEP AS IS - DO NOT MODIFY)
// ============================================================================

async function extractDebankNetWorthEVM(page: Page): Promise<string | null> {
  console.log('[DeBank] Extracting Net Worth from DOM');
  
  try {
    const netWorth = await page.evaluate(() => {
      try {
        const pageText = document.body.innerText;
        const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Look for pattern: $X,XXX -Y.YY% or $X +Y.YY% (portfolio total with % change)
        for (let i = 0; i < Math.min(lines.length, 30); i++) {
          const line = lines[i];
          const match = line.match(/^\$\s*([\d,]+(?:\.\d{2})?)\s+[-+][\d.]+%/);
          if (match) {
            const value = match[1];
            console.log('[DeBank] Found top-right portfolio value: ' + value);
            return value;
          }
        }
        
        // Fallback: Look for first $ value on a line by itself
        for (let i = 0; i < Math.min(lines.length, 50); i++) {
          const line = lines[i];
          if (line.startsWith('$')) {
            const match = line.match(/^\$\s*([\d,]+\.?\d*)/);
            if (match) {
              const value = match[1];
              const numValue = parseFloat(value.replace(/,/g, ''));
              if (numValue > 0 && numValue < 10000000) {
                console.log('[DeBank] Fallback - found value: ' + value);
                return value;
              }
            }
          }
        }
        
        return null;
      } catch (error) {
        console.log('[DeBank] Extraction error: ' + error);
        return null;
      }
    });

    return netWorth ? `$${netWorth}` : null;
  } catch (error) {
    console.error('[DeBank] Error:', error);
    return null;
  }
}

export async function scrapeDebankEVM(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 60000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[DeBank] Starting EVM scraper');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Try API first
    const addressMatch = walletLink.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      const address = addressMatch[0];
      try {
        console.log('[DeBank] Trying API endpoint');
        const apiResponse = await fetch(`https://api.debank.com/v1/user/total_balance?id=${address}`, {
          headers: { "Accept": "application/json" }
        });
        
        if (apiResponse.ok) {
          const data = await apiResponse.json() as any;
          const balanceUSD = data.total_usd_value || 0;
          const formatted = `$${balanceUSD.toFixed(2)}`;
          console.log('[DeBank] API success: ' + formatted);
          return { value: formatted, success: true, platform: 'debank' };
        }
      } catch (apiError) {
        console.log('[DeBank] API failed, trying DOM scraping');
      }
    }
    
    // DOM scraping fallback
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 45000 }).catch(e => 
      console.log('[DeBank] Navigation warning: ' + e.message)
    );
    
    // Wait for JS rendering
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const value = await extractDebankNetWorthEVM(page);
    
    if (value) {
      return { value, success: true, platform: 'debank' };
    }
    
    return { value: null, success: false, platform: 'debank', error: 'Net Worth not found in DOM' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DeBank] Error:', msg);
    return { value: null, success: false, platform: 'debank', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// HELPER: Normalize European format currency for Jupiter ($1.911,36 → 1911.36)
// ============================================================================

function normalizeJupiterValue(rawValue: string): string {
  console.log('[JupiterPortfolio] Raw value before normalization: ' + rawValue);
  
  // Remove $ and whitespace
  let normalized = rawValue.replace(/[\$\s]/g, '');
  console.log('[JupiterPortfolio] After removing $: ' + normalized);
  
  // Remove dots (European thousand separator)
  normalized = normalized.replace(/\./g, '');
  console.log('[JupiterPortfolio] After removing dots: ' + normalized);
  
  // Replace comma with dot (European decimal separator → standard decimal)
  normalized = normalized.replace(/,/g, '.');
  console.log('[JupiterPortfolio] After replacing comma: ' + normalized);
  
  return normalized;
}

// ============================================================================
// JUPITER PORTFOLIO SCRAPER (jup.ag/portfolio - Net Worth Specific)
// ============================================================================

async function scrapeJupiterPortfolioNetWorth(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 30000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[JupiterPortfolio] Starting opportunistic scraper for jup.ag/portfolio');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 25000 }).catch(e => 
      console.log('[JupiterPortfolio] Navigation warning: ' + e.message)
    );
    
    // Wait for JS to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('[JupiterPortfolio] Extracting monetary values with semantic filtering');
    
    // Extract monetary values with context for semantic filtering
    const filteredValues = await page.evaluate(() => {
      const fullText = document.body.innerText;
      
      // Keywords to ignore (case insensitive)
      const blacklistKeywords = ['pnl', 'holdings', 'claimable'];
      
      // Match both European format ($1.911,36) and US format ($1,911.36)
      const regex = /\$[\d.,]+/g;
      let match;
      const valueContexts = [];
      
      while ((match = regex.exec(fullText)) !== null) {
        const valueString = match[0];
        const matchIndex = match.index;
        
        // Get context around the value (100 chars before and after)
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(fullText.length, matchIndex + valueString.length + 100);
        const context = fullText.substring(contextStart, contextEnd).toLowerCase();
        
        // Check if context contains blacklisted keywords
        const hasBlacklistKeyword = blacklistKeywords.some(keyword => context.includes(keyword));
        
        // Check if value has negative sign nearby
        const hasNegativeSign = context.includes('-');
        
        // Only include if no blacklist keywords and no negative sign
        if (!hasBlacklistKeyword && !hasNegativeSign) {
          valueContexts.push({
            value: valueString,
            context: context
          });
        }
      }
      
      if (valueContexts.length === 0) {
        console.log('[JupiterPortfolio] No values passed semantic filter');
        return null;
      }
      
      console.log('[JupiterPortfolio] Found ' + valueContexts.length + ' values after semantic filtering');
      return valueContexts.map(vc => vc.value);
    });
    
    if (filteredValues && filteredValues.length > 0) {
      console.log('[JupiterPortfolio] Filtered values: ' + filteredValues.join(', '));
      
      // Normalize and find the largest value
      let maxValue = 0;
      let maxFormattedValue = '';
      
      for (const rawValue of filteredValues) {
        // Normalize format
        const normalizedValue = normalizeJupiterValue(rawValue);
        const numericValue = parseFloat(normalizedValue);
        
        console.log('[JupiterPortfolio] Evaluated ' + rawValue + ' → ' + numericValue);
        
        // Only consider positive, valid values
        if (!isNaN(numericValue) && numericValue > 0 && numericValue > maxValue) {
          maxValue = numericValue;
          maxFormattedValue = normalizedValue;
        }
      }
      
      if (maxValue > 0 && maxFormattedValue !== '') {
        const finalValue = '$' + maxFormattedValue;
        console.log('[JupiterPortfolio] VALIDATION PASSED - Largest valid value found: ' + finalValue);
        return { value: finalValue, success: true, platform: 'jupiter' };
      }
    }
    
    console.log('[JupiterPortfolio] Could not find valid positive monetary values');
    return { value: null, success: false, platform: 'jupiter', error: 'No valid portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JupiterPortfolio] Error:', msg);
    return { value: null, success: false, platform: 'jupiter', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// SOLANA / JUPITER SCRAPER (Opportunistic - Largest Value Strategy)
// ============================================================================

export async function scrapeJupiterSolana(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 45000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[Jupiter] Starting Solana scraper (opportunistic)');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 40000 }).catch(e => 
      console.log('[Jupiter] Navigation warning: ' + e.message)
    );
    
    // Quick wait for initial rendering
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract ALL text and find largest value
    const value = await page.evaluate(() => {
      const fullText = document.body.innerText;
      const regex = /\$[\d,]+(?:\.\d{2})?/g;
      const matches = fullText.match(regex);
      
      if (!matches || matches.length === 0) return null;
      
      const values = matches
        .map(m => ({
          str: m,
          num: parseFloat(m.replace(/[$,]/g, ''))
        }))
        .filter(v => v.num >= 10); // Ignore < $10
      
      if (values.length === 0) return null;
      
      const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
      return maxValue.str;
    });
    
    if (value) {
      console.log('[Jupiter] Extracted largest value: ' + value);
      return { value, success: true, platform: 'jupiter' };
    }
    
    return { value: null, success: false, platform: 'jupiter', error: 'No portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Jupiter] Error:', msg);
    return { value: null, success: false, platform: 'jupiter', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// STARKNET / READY SCRAPER (Opportunistic - Largest Value Strategy)
// ============================================================================

export async function scrapeReadyStarknet(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 45000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[Ready] Starting Starknet scraper (opportunistic)');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 40000 }).catch(e => 
      console.log('[Ready] Navigation warning: ' + e.message)
    );
    
    // Quick wait for rendering
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract ALL text and find largest value
    const value = await page.evaluate(() => {
      const fullText = document.body.innerText;
      const regex = /\$[\d,]+(?:\.\d{2})?/g;
      const matches = fullText.match(regex);
      
      if (!matches || matches.length === 0) return null;
      
      const values = matches
        .map(m => ({
          str: m,
          num: parseFloat(m.replace(/[$,]/g, ''))
        }))
        .filter(v => v.num >= 10); // Ignore < $10
      
      if (values.length === 0) return null;
      
      const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
      return maxValue.str;
    });
    
    if (value) {
      console.log('[Ready] Extracted largest value: ' + value);
      return { value, success: true, platform: 'ready' };
    }
    
    return { value: null, success: false, platform: 'ready', error: 'No portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Ready] Error:', msg);
    return { value: null, success: false, platform: 'ready', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// APTOS / APTOSCAN SCRAPER (Opportunistic - Largest Value Strategy)
// ============================================================================

export async function scrapeAptoscanAptos(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 30000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[Aptoscan] Starting Aptos scraper (opportunistic)');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 25000 }).catch(e => 
      console.log('[Aptoscan] Navigation warning: ' + e.message)
    );
    
    // Quick wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract ALL text and find largest value
    const value = await page.evaluate(() => {
      const fullText = document.body.innerText;
      const regex = /\$[\d,]+(?:\.\d{2})?/g;
      const matches = fullText.match(regex);
      
      if (!matches || matches.length === 0) return null;
      
      const values = matches
        .map(m => ({
          str: m,
          num: parseFloat(m.replace(/[$,]/g, ''))
        }))
        .filter(v => v.num >= 10); // Ignore < $10
      
      if (values.length === 0) return null;
      
      const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
      return maxValue.str;
    });
    
    if (value) {
      console.log('[Aptoscan] Extracted largest value: ' + value);
      return { value, success: true, platform: 'aptoscan' };
    }
    
    return { value: null, success: false, platform: 'aptoscan', error: 'No portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Aptoscan] Error:', msg);
    return { value: null, success: false, platform: 'aptoscan', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// SEI / SEISCAN SCRAPER (Opportunistic - Largest Value Strategy)
// ============================================================================

export async function scrapeSeiscanSei(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 30000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[Seiscan] Starting Sei scraper (opportunistic)');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: 25000 }).catch(e => 
      console.log('[Seiscan] Navigation warning: ' + e.message)
    );
    
    // Quick wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract ALL text and find largest value
    const value = await page.evaluate(() => {
      const fullText = document.body.innerText;
      const regex = /\$[\d,]+(?:\.\d{2})?/g;
      const matches = fullText.match(regex);
      
      if (!matches || matches.length === 0) return null;
      
      const values = matches
        .map(m => ({
          str: m,
          num: parseFloat(m.replace(/[$,]/g, ''))
        }))
        .filter(v => v.num >= 10); // Ignore < $10
      
      if (values.length === 0) return null;
      
      const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
      return maxValue.str;
    });
    
    if (value) {
      console.log('[Seiscan] Extracted largest value: ' + value);
      return { value, success: true, platform: 'seiscan' };
    }
    
    return { value: null, success: false, platform: 'seiscan', error: 'No portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Seiscan] Error:', msg);
    return { value: null, success: false, platform: 'seiscan', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// GENERIC OPPORTUNISTIC SCRAPER (Fallback for all platforms)
// ============================================================================

export async function scrapeGenericOpportunistic(
  browser: Browser,
  walletLink: string,
  timeoutMs: number = 30000
): Promise<ScraperResult> {
  const page = await browser.newPage();
  const timeoutId = setTimeout(() => {
    page.close().catch(() => {});
  }, timeoutMs);
  
  try {
    console.log('[Generic] Starting opportunistic DOM scraper');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for initial load
    await page.goto(walletLink, { waitUntil: 'networkidle2', timeout: timeoutMs - 5000 }).catch(e => 
      console.log('[Generic] Navigation warning: ' + e.message)
    );
    
    // Quick wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract ALL text and find largest value
    const value = await page.evaluate(() => {
      const fullText = document.body.innerText;
      const regex = /\$[\d,]+(?:\.\d{2})?/g;
      const matches = fullText.match(regex);
      
      if (!matches || matches.length === 0) return null;
      
      const values = matches
        .map(m => ({
          str: m,
          num: parseFloat(m.replace(/[$,]/g, ''))
        }))
        .filter(v => v.num >= 10); // Ignore < $10
      
      if (values.length === 0) return null;
      
      const maxValue = values.reduce((a, b) => a.num > b.num ? a : b);
      return maxValue.str;
    });
    
    if (value) {
      console.log('[Generic] Extracted largest value: ' + value);
      return { value, success: true, platform: 'generic' };
    }
    
    return { value: null, success: false, platform: 'generic', error: 'No portfolio value found' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Generic] Error:', msg);
    return { value: null, success: false, platform: 'generic', error: msg };
  } finally {
    clearTimeout(timeoutId);
    await page.close().catch(() => {});
  }
}

// ============================================================================
// SELECTOR FUNCTION (Always returns functional scraper, NEVER null)
// ============================================================================

export async function selectAndScrapePlatform(
  browser: Browser | null,
  walletLink: string,
  walletName: string
): Promise<ScraperResult> {
  console.log(`[Platform] Selecting scraper for: ${walletName} (${walletLink})`);
  
  try {
    // ==================== DEBANK (Special case - fixed)
    if (walletLink.includes('debank.com')) {
      if (!browser) {
        return { value: null, success: false, platform: 'debank', error: 'Browser not available' };
      }
      return await scrapeDebankEVM(browser, walletLink, 60000);
    }
    
    // ==================== RECOGNIZED PLATFORMS (with specific timeouts)
    // SPECIAL CASE: jup.ag/portfolio - Use Net Worth specific scraper
    if (walletLink.includes('jup.ag/portfolio')) {
      if (!browser) return { value: null, success: false, platform: 'jupiter', error: 'Browser not available' };
      console.log('[Platform] Jupiter Portfolio detected - using Net Worth specific scraper');
      return await scrapeJupiterPortfolioNetWorth(browser, walletLink, 30000);
    }
    
    // Generic Jupiter scraper for other jup.ag links
    if (walletLink.includes('jup.ag')) {
      if (!browser) return { value: null, success: false, platform: 'jupiter', error: 'Browser not available' };
      return await scrapeJupiterSolana(browser, walletLink, 45000);
    }
    
    if (walletLink.includes('portfolio.ready.co')) {
      if (!browser) return { value: null, success: false, platform: 'ready', error: 'Browser not available' };
      return await scrapeReadyStarknet(browser, walletLink, 45000);
    }
    
    if (walletLink.includes('aptoscan.com')) {
      if (!browser) return { value: null, success: false, platform: 'aptoscan', error: 'Browser not available' };
      return await scrapeAptoscanAptos(browser, walletLink, 30000);
    }
    
    if (walletLink.includes('seiscan.io')) {
      if (!browser) return { value: null, success: false, platform: 'seiscan', error: 'Browser not available' };
      return await scrapeSeiscanSei(browser, walletLink, 30000);
    }
    
    // ==================== FALLBACK: Generic opportunistic scraper for ANY other platform
    console.log(`[Platform] Platform not recognized, using generic opportunistic scraper`);
    if (!browser) {
      return { value: null, success: false, platform: 'generic', error: 'Browser not available' };
    }
    return await scrapeGenericOpportunistic(browser, walletLink, 30000);
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Platform] Unhandled error:`, msg);
    return { value: null, success: false, platform: 'generic', error: msg };
  }
}
