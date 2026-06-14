const fs = require('fs'); 
const files = ['CommodityCard.jsx', 'EquityCard.jsx', 'ForexCard.jsx', 'InterestRateCard.jsx']; 
files.forEach(f => { 
  const path = 'components/' + f; 
  let content = fs.readFileSync(path, 'utf8'); 
  content = content.replace(/margin=\{\{ top: 5, right: 5, left: -25, bottom: 5 \}\}/g, 'margin={{ top: 5, right: 5, left: 0, bottom: 5 }}'); 
  content = content.replace(/tickFormatter=\{\(val\) => val\.toFixed\([0-9]+\)\}/g, "tickFormatter={(val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(1)}"); 
  fs.writeFileSync(path, content); 
}); 
console.log('Fixed margins and formatters');
