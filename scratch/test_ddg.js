import axios from 'axios';

(async () => {
  const company = "Bharat Electronics";
  const query = `site:bseindia.com "${company}" "Annual Report" filetype:pdf`;
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  console.log("Fetching DDG:", ddgUrl);
  try {
    const res = await axios.get(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    const html = res.data;
    
    // Extract first search result link
    const linkMatch = html.match(/class="result__url" href="([^"]+)"/);
    if (linkMatch) {
      let pdfUrl = linkMatch[1];
      if (pdfUrl.startsWith('//')) {
        pdfUrl = 'https:' + pdfUrl;
      }
      
      // Sometimes DDG wraps URLs in a redirect like /l/?uddg=...
      if (pdfUrl.includes('uddg=')) {
        const urlParams = new URLSearchParams(pdfUrl.split('?')[1]);
        pdfUrl = decodeURIComponent(urlParams.get('uddg'));
      }
      
      console.log("Found PDF Link via DDG:", pdfUrl);
      
      // Test downloading the PDF directly from BSE
      console.log("Downloading PDF from BSE...");
      const pdfRes = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log("Download Success! Status:", pdfRes.status);
      console.log("Size:", pdfRes.data.length);
      console.log("Is PDF?", pdfRes.data.toString('utf8', 0, 5) === '%PDF-');
    } else {
      console.log("No PDF link found in search results.");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
})();
