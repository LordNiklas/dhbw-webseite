const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

// Initialisiere Express
const app = express();

// Middleware für JSON und CORS
app.use(express.json());
app.use(cors());

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
  availability: { type: [String], default: [] }, // Sicherstellen, dass Verfügbarkeiten als Array gespeichert werden
  price: { type: Number, required: true }, // Preis der Ferienwohnung
  bookedDates: { type: [String], default: [] } // Gebuchte Daten
});

const Property = mongoose.model('Property', propertySchema);

// Definiere ein Schema und Modell für die Benutzer
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true } // E-Mail-Feld hinzugefügt
});

const User = mongoose.model('User', userSchema);

// Konfiguration für das Bild-Upload (mit Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// API-Route zum Abrufen aller Ferienwohnungen
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error('Fehler beim Abrufen der Eigenschaften:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// API-Route zum Abrufen einer spezifischen Ferienwohnung anhand ihrer ID
app.get('/api/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Ferienwohnung nicht gefunden' });
    }
    res.json(property);
  } catch (err) {
    console.error('Fehler beim Abrufen der Ferienwohnung:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// POST-Route zum Hinzufügen der Ferienwohnung
app.post('/api/properties', upload.single('image'), async (req, res) => {
  const { name, description, availability, price } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !description || !availability || !price || !image) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }

  try {
    const newProperty = new Property({
      name,
      description,
      availability: availability.split(','), // Sicherstellen, dass Verfügbarkeiten als Array gespeichert werden
      price,
      image
    });

    await newProperty.save();
    res.status(201).json({ message: 'Ferienwohnung erfolgreich hinzugefügt!' });
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Ferienwohnung:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// API-Route zum Buchen einer Ferienwohnung
app.post('/api/properties/:id/book', async (req, res) => {
  const { id } = req.params;
  const { bookedDates } = req.body; // Erwarte ein Array von Datumsangaben zum Buchen

  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Ferienwohnung nicht gefunden' });
    }

    // Überprüfe, ob eines der angegebenen Daten bereits gebucht ist
    const isDateAvailable = bookedDates.every(date => !property.bookedDates.includes(date));
    if (!isDateAvailable) {
      return res.status(400).json({ error: 'Eines oder mehrere der ausgewählten Daten sind bereits gebucht.' });
    }

    // Füge die gebuchten Daten hinzu und speichere die Aktualisierung
    property.bookedDates.push(...bookedDates);
    await property.save();

    res.status(200).json({ message: 'Ferienwohnung erfolgreich gebucht' });
  } catch (err) {
    console.error('Fehler bei der Buchung der Ferienwohnung:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// API-Route zum Anmelden eines Benutzers
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with:', email); // Logge die E-Mail für Debugging

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ist falsch.' });
    }

    // Überprüfe, ob das Passwort übereinstimmt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ist falsch.' });
    }

    // Wenn alles in Ordnung ist, sende eine Erfolgsnachricht
    res.status(200).json({ message: 'Erfolgreich angemeldet!' });
  } catch (err) {
    console.error('Fehler bei der Anmeldung:', err);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// API-Route zur Registrierung eines Benutzers
const saltRounds = 10; // Anzahl der Runden für das Hashing
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Benutzername muss mindestens 3 Zeichen lang sein.'),
  body('email').isEmail().withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen lang sein.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Benutzername oder E-Mail bereits vergeben. Bitte wähle einen anderen.' });
    }

    // Hash das Passwort
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    
    res.status(201).json({ message: 'Registrierung erfolgreich!' });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Fehler bei der Registrierung.' });
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
