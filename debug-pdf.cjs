const fs = require('fs');
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');

const downloadsDir = path.join(os.homedir(), 'Downloads');

fs.readdir(downloadsDir, (err, files) => {
  if (err) throw err;
  
  const pdfs = files
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
    
  if (pdfs.length === 0) {
    console.log("No PDFs found in Downloads.");
    return;
  }
  
  const latestPdf = path.join(downloadsDir, pdfs[0].name);
  console.log("Analyzing PDF:", latestPdf);
  
  let dataBuffer = fs.readFileSync(latestPdf);
  
  pdfParse(dataBuffer).then(function(data) {
    console.log("========== RAW TEXT ==========");
    console.log(data.text.substring(0, 3000));
  }).catch(function(error) {
    console.log(error);
  });
});
