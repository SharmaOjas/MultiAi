const fs = require('fs'); 
const files = ['CommodityCard.jsx', 'EquityCard.jsx', 'ForexCard.jsx', 'InterestRateCard.jsx']; 
files.forEach(f => { 
  const path = 'components/' + f; 
  let content = fs.readFileSync(path, 'utf8'); 
  content = content.replace(/margin=\{\{ top: [0-9]+, right: 5, left: -25, bottom: 5 \}\}/g, 'margin={{ top: 10, right: 5, left: 0, bottom: 5 }}'); 
  fs.writeFileSync(path, content); 
}); 
console.log('Fixed ComposedChart margins');
