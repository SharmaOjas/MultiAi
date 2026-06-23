import axios from 'axios';

const testBse = async () => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  };

  try {
    console.log("Searching BSE for Reliance...");
    // The search endpoint might vary, let's try a known one or just skip to a known scrip code to test the announcements API
    // RELIANCE INDUSTRIES LTD is 500325
    
    console.log("Fetching announcements for 500325...");
    const url = 'https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=20230101&strToDate=20240101&strScripCode=500325&strSearch=&strValue=500325';
    
    const res = await axios.get(url, { headers, timeout: 10000 });
    console.log("BSE Announcements Data:", JSON.stringify(res.data).substring(0, 500));
    
  } catch (error) {
    console.error("Error scraping BSE:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
    }
  }
};

testBse();
