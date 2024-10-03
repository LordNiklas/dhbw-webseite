const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

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
  price: { type: Number, required: true }, // Preis der Ferienwohnung
  bookedDates: { type: [String], default: [] } // Gebuchte Daten
});

const Property = mongoose.model('Property', propertySchema);

// Definiere ein Schema und Modell für die Benutzer
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

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

// API-Route zum Abrufen einer spezifischen Ferienwohnung anhand ihrer ID
app.get('/api/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).send('Ferienwohnung nicht gefunden');
    }
    res.json(property);
  } catch (err) {
    console.error('Fehler beim Abrufen der Ferienwohnung:', err);
    res.status(500).send(err);
  }
});

// API-Route zum Buchen einer Ferienwohnung
app.post('/api/properties/:id/book', async (req, res) => {
  const { id } = req.params;
  const { bookedDates } = req.body; // Erwarte ein Array von Datumsangaben zum Buchen

  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).send('Ferienwohnung nicht gefunden');
    }

    // Überprüfe, ob eines der angegebenen Daten bereits gebucht ist
    const isDateAvailable = bookedDates.every(date => !property.bookedDates.includes(date));
    if (!isDateAvailable) {
      return res.status(400).send('Eines oder mehrere der ausgewählten Daten sind bereits gebucht.');
    }

    // Füge die gebuchten Daten hinzu und speichere die Aktualisierung
    property.bookedDates.push(...bookedDates);
    await property.save();

    res.status(200).send('Ferienwohnung erfolgreich gebucht');
  } catch (err) {
    console.error('Fehler bei der Buchung der Ferienwohnung:', err);
    res.status(500).send(err);
  }
});

// API-Route zum Anmelden eines Benutzers
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Benutzername oder Passwort ist falsch.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Benutzername oder Passwort ist falsch.');
    }

    res.status(200).send('Erfolgreich angemeldet!');
  } catch (err) {
    console.error('Fehler bei der Anmeldung:', err);
    res.status(500).send('Serverfehler.');
  }
});

// API-Route zur Registrierung eines Benutzers
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).send('Benutzer erfolgreich registriert.');
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    res.status(500).send('Serverfehler.');
  }
});

// Route für die Root-URL, die die HTML-Datei zurückgibt
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'src', 'App.html'));
});

// Statische Dateien bereitstellen (CSS, JS)
app.use(express.static(path.join(__dirname, 'client', 'src')));

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
