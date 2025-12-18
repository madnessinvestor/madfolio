// Serviço para buscar saldo de wallets Jup.Ag via scraping
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

interface JupPortfolioData {
  portfolioId: string;
  netWorthUSD: number;
  netWorthSOL: number;
  totalTokens: number;
}

// Scrape Jup.Ag portfolio page to extract Net Worth value
export async function fetchJupPortfolio(portfolioId: string): Promise<JupPortfolioData | null> {
  let browser = null;
  
  try {
    if (!portfolioId) {
      throw new Error("Portfolio ID is required");
    }

    console.log(`[Jup.Ag] Starting portfolio scrape for ${portfolioId}`);

    // Launch Puppeteer browser
    browser = await puppeteerExtra.launch({
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
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://jup.ag/portfolio/${portfolioId}`;
    console.log(`[Jup.Ag] Navigating to ${url}`);

    // Navigate to portfolio page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 120000
    }).catch((err) => {
      console.log(`[Jup.Ag] Page load warning: ${err.message}`);
    });

    // Wait for JS rendering
    console.log(`[Jup.Ag] Waiting 15 seconds for JS rendering`);
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Extract portfolio data - looking for Net Worth value (largest value > 1000)
    const portfolioData = await page.evaluate(() => {
      const pageText = document.body.innerText;
      
      // Find all dollar amounts
      const matches = pageText.match(/\$\s*([\d,.]+)/g);
      
      if (!matches) {
        return null;
      }
      
      let largestValue = 0;
      let largestValueStr = '';
      const allValues: number[] = [];
      
      for (const match of matches) {
        const value = match.replace('$', '').trim();
        let numValue: number;
        
        // Parse: handle "2.031,91" (European) or "2,031.91" (US)
        if (value.includes('.') && value.includes(',')) {
          if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
            numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
          } else {
            numValue = parseFloat(value.replace(/,/g, ''));
          }
        } else if (value.includes(',')) {
          numValue = parseFloat(value.replace(',', '.'));
        } else {
          numValue = parseFloat(value);
        }
        
        allValues.push(numValue);
        
        // Keep track of the largest value > 1000 (Net Worth is typically thousands of dollars)
        if (numValue > 1000 && numValue < 100000000 && numValue > largestValue) {
          largestValue = numValue;
          largestValueStr = value;
        }
      }
      
      return {
        netWorthUSD: largestValue,
        netWorthStr: largestValueStr,
        allValues
      };
    });

    await page.close();

    if (portfolioData && portfolioData.netWorthUSD > 0) {
      console.log(`[Jup.Ag] Found Net Worth: $${portfolioData.netWorthStr} (${portfolioData.netWorthUSD})`);
      
      return {
        portfolioId,
        netWorthUSD: portfolioData.netWorthUSD,
        netWorthSOL: 0, // Not extracted, but can be added if needed
        totalTokens: 0  // Not extracted, but can be added if needed
      };
    } else {
      console.log(`[Jup.Ag] Could not find Net Worth value on portfolio page`);
      return null;
    }
    
  } catch (error) {
    console.error(`[Jup.Ag] Error fetching portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
