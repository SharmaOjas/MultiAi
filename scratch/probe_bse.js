// Quick probe script — run with: node scratch/probe_bse.js
const scripCode = 500103; // BHEL

const today = new Date().toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
const prev1Y = new Date(Date.now() - 365*86400000).toISOString().slice(0,10).replace(/-/g, '');

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.bseindia.com',
  'Referer': 'https://www.bseindia.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
};

async function probe() {
  // Test 1: AnnGetData with strCat=-1 (all categories), YYYYMMDD dates
  console.log('\n=== Test 1: AnnGetData strCat=-1, dates YYYYMMDD ===');
  const url1 = `https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=${prev1Y}&strScrip=${scripCode}&strSearch=P&strToDate=${today}&strType=C&subcategory=-1`;
  console.log('URL:', url1);
  try {
    const r = await fetch(url1, { headers: HEADERS });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response (first 600):', text.slice(0, 600));
  } catch(e) { console.log('Error:', e.message); }

  // Test 2: AnnSubCategoryGetData (alternative endpoint)
  console.log('\n=== Test 2: AnnSubCategoryGetData ===');
  const url2 = `https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?strCat=-1&strPrevDate=${prev1Y}&strScrip=${scripCode}&strSearch=P&strToDate=${today}&strType=C&subcategory=-1`;
  console.log('URL:', url2);
  try {
    const r = await fetch(url2, { headers: HEADERS });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response (first 600):', text.slice(0, 600));
  } catch(e) { console.log('Error:', e.message); }

  // Test 3: Check if the field ATTACHMENTNAME exists in the response
  // Also test with DD/MM/YYYY date format (used by BSE's own site)
  const ddmmyyyy_today = `${today.slice(6)}/${today.slice(4,6)}/${today.slice(0,4)}`;
  const ddmmyyyy_prev = `${prev1Y.slice(6)}/${prev1Y.slice(4,6)}/${prev1Y.slice(0,4)}`;
  console.log('\n=== Test 3: AnnGetData with DD/MM/YYYY dates ===');
  const url3 = `https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=${encodeURIComponent(ddmmyyyy_prev)}&strScrip=${scripCode}&strSearch=P&strToDate=${encodeURIComponent(ddmmyyyy_today)}&strType=C&subcategory=-1`;
  console.log('URL:', url3);
  try {
    const r = await fetch(url3, { headers: HEADERS });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response (first 600):', text.slice(0, 600));
  } catch(e) { console.log('Error:', e.message); }
}

probe().catch(console.error);
