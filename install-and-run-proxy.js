const { execSync } = require('child_process');
const fs = require('fs');

// Install necessary Node.js packages
console.log('Installing packages...');
execSync('npm install express node-fetch');

// Create the proxy server script
const proxyScript = `
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/proxy', async (req, res) => {
  try {
    const response = await fetch('https://data.worldpop.org/GIS/Population_Density/Global_2000_2020_1km/2020/NLD/nld_pd_2020_1km_ASCII_XYZ.txt');
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(\`Proxy server is running on http://localhost:\${PORT}\`);
});
`;

// Write the proxy server script to a file
fs.writeFileSync('proxy.js', proxyScript);

console.log('Proxy server script created.');

// Run the proxy server
console.log('Running proxy server...');
execSync('node proxy.js');
