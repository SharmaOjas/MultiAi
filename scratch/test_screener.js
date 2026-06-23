import axios from 'axios';

(async () => {
  const company = 'BEL';
  const url = `https://www.screener.in/company/${company}/consolidated/`;
  
  console.log("Fetching Screener:", url);
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    console.log("Screener HTML length:", res.data.length);
    
    // Look for Annual Reports section
    const idx = res.data.indexOf('Annual Reports');
    if (idx !== -1) {
      console.log("Found 'Annual Reports' at index", idx);
      console.log(res.data.substring(idx - 100, idx + 1000));
    } else {
      console.log("Not found. Dumping start of HTML:");
      console.log(res.data.substring(0, 3000));
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
})();
