const http = require('http');
const appContent = require('./client/src/App.js'); // Stelle sicher, dass der Pfad korrekt ist

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html'); // Ändere den Content-Type zu HTML
  res.end(appContent); // Sende den Inhalt aus App.js zurück
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/`);
});
