import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to NSE...");
  await page.goto('https://www.nseindia.com/', { waitUntil: 'networkidle2' });
  
  console.log("Page title:", await page.title());
  
  // Try using the NSE search API
  console.log("Testing NSE search API...");
  const searchResult = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/search/autocomplete?q=BEL');
      return await res.text();
    } catch (e) {
      return e.message;
    }
  });
  console.log("NSE Search Result snippet:\n", searchResult.substring(0, 500));

  await browser.close();
  console.log("Done.");
})();
