const fs = require('fs');

fs.readFile('IMF_Commitments_1952-2025.csv', 'utf8', (err, data) => {
  if (err) throw err;

  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');

  const json = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim();
    });
    return obj;
  });

  fs.writeFile('output.json', JSON.stringify(json, null, 2), err => {
    if (err) throw err;
    console.log('CSV has been converted to JSON!');
  });
});
