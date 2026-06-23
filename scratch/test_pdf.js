import axios from 'axios';

(async () => {
  // Found a sample BSE PDF link from a random announcement
  // Normally we would scrape this link from Screener
  const pdfUrl = 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/716b11bc-7126-4b8c-b03a-33ce9bc0ecf2.pdf';
  
  console.log("Downloading PDF:", pdfUrl);
  try {
    const res = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36',
        'Referer': 'https://www.bseindia.com/'
      }
    });
    console.log("Success! Status:", res.status);
    console.log("Data length:", res.data.length);
    console.log("Is PDF?", res.data.toString('utf8', 0, 5) === '%PDF-');
  } catch (e) {
    console.log("Error:", e.message);
    if (e.response) {
      console.log("Status:", e.response.status);
      console.log("Data:", e.response.data.toString('utf8').substring(0, 200));
    }
  }
})();
