const fs = require('fs');

fs.readFile('../source-data/IMF_Commitments_1952-2025.csv', 'utf8', (err, data) => {
  if (err) throw err;

  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');

  const json = lines.slice(1).map(line => {

    // if (line)
    const values = line.match(/"[^"]*"|[^,]+/g).map(p => p.replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim();
    });
    return obj;
  });


  fs.writeFile('../public/commitments.json', JSON.stringify(json, null, 2), err => {
    if (err) throw err;
    console.log('CSV has been converted to JSON!');
  });
});
