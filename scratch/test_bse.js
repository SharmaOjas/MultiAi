import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to BSE...");
  await page.goto('https://www.bseindia.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log("Page title:", await page.title());
  
  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 2000));
  
  await page.waitForSelector('#scripsearchtxtbx', { timeout: 10000 });
  await page.type('#scripsearchtxtbx', 'BEL', { delay: 100 });
  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.evaluate(() => {
    const ul = document.querySelector('#ulSearchQuote2');
    return ul ? ul.outerHTML : 'UL NOT FOUND';
  });
  fs.writeFileSync('bse_dropdown.html', html);
  
  console.log("Clicking first result...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('Navigation timeout or error:', e)),
    page.click('ul#ulSearchQuote2 > li.quotemenu:not(.extradownlist) > a')
  ]);
  
  console.log("Navigated to:", await page.url());
  
  console.log("Saved bse_dump.html");

  await browser.close();
  console.log("Done.");
})();
