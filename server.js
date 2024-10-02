const http = require('http');
const fs = require('fs');
const path = require('path');

// Funktion zum Senden von Dateien
function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error: ${err.code}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

const server = http.createServer((req, res) => {
  // Lege den Pfad zur angeforderten Datei fest
  let filePath = '';

  if (req.url === '/') {
    filePath = path.join(__dirname, 'client', 'src', 'App.html'); // HTML-Datei
  } else if (req.url.endsWith('.css')) {
    filePath = path.join(__dirname, 'client', 'src', req.url); // CSS-Datei
  } else if (req.url.endsWith('.js')) {
    filePath = path.join(__dirname, 'client', 'src', req.url); // JS-Datei
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }

  // Bestimme den Content-Type
  const extname = String(path.extname(filePath)).toLowerCase();
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.html':
      contentType = 'text/html';
      break;
  }

  sendFile(res, filePath, contentType);
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/`);
});
