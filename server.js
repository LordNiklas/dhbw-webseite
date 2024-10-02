const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Initialisiere Express
const app = express();

// Middleware für JSON
app.use(express.json());

// MongoDB-Verbindung
mongoose.connect('mongodb://localhost:27017/heritageHideways')
  .then(() => {
    console.log('Datenbankverbindung erfolgreich!');
  })
  .catch(err => {
    console.error('Datenbankverbindung fehlgeschlagen:', err);
  });

// Definiere ein Schema und Modell für die Ferienwohnungen
const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  availability: { type: String, required: true },
});

const Property = mongoose.model('Property', propertySchema);

// API-Route zum Abrufen aller Ferienwohnungen
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error('Fehler beim Abrufen der Eigenschaften:', err);
    res.status(500).send(err);
  }
});

// Route für die Root-URL, die die HTML-Datei zurückgibt
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'src', 'App.html'));
});

// Statische Dateien (CSS und JS)
app.use(express.static(path.join(__dirname, 'client', 'src')));

// Starte den Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/`);
});
