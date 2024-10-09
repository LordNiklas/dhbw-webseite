const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

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

// Erstelle eine Instanz von MongoDBStore
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/heritageHideways',
  collection: 'sessions', // Name der Kollektion, in der die Sessions gespeichert werden
});

// Fehlerbehandlung für den Store
store.on('error', (error) => {
  console.error('MongoDBStore error:', error);
});

// Session Middleware hinzufügen
app.use(session({
  secret: 'dein_geheimer_schlüssel', // Setze einen geheimen Schlüssel
  resave: false, // Wenn false, wird die Session nicht immer gespeichert, auch wenn sie nicht verändert wurde
  saveUninitialized: false, // Wenn false, wird die Session nicht gespeichert, wenn sie noch nicht initialisiert wurde
  store: store, // Verwende MongoDBStore als Speichermedium
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Session-Cookie läuft nach 24 Stunden ab
  }
}));

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

const userSchema = new mongoose.Schema({
  username: {
      type: String,
      required: true,
      unique: true // Hinzufügen, um sicherzustellen, dass jeder Benutzername einzigartig ist
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  password: {
      type: String,
      required: true
  },
  isProvider: {
      type: Boolean,
      default: false
  }
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

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Benutzer nicht gefunden:', email);
      return res.status(401).send('Benutzer nicht gefunden.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Falsches Passwort für Benutzer:', email);
      return res.status(401).send('Falsches Passwort.');
    }

    // Setze die userId in der Session
    req.session.userId = user._id;
    res.send('Erfolgreich angemeldet.');
  } catch (error) {
    console.error('Fehler bei der Anmeldung:', error);
    res.status(500).send('Interner Serverfehler.');
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
  console.log("Benutzername:", username);

  // Protokolliere den Request-Body zur Überprüfung
  console.log("Registrierungsdaten:", req.body);

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
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Benutzername oder E-Mail bereits vergeben.' });
    }
    res.status(500).json({ error: 'Fehler bei der Registrierung.' });
  }
});

// API-Route zum Abmelden des Benutzers (Logout)
app.post('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Fehler beim Zerstören der Session:', err);
        return res.status(500).send('Fehler beim Abmelden.');
      }
      res.clearCookie('connect.sid'); // Session-Cookie löschen
      res.send('Erfolgreich abgemeldet.');
    });
  } else {
    res.status(400).send('Keine aktive Session gefunden.');
  }
});

// API-Route zum Abrufen des Benutzerprofils
app.get('/api/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Nicht eingeloggt.');
  }

  res.send(`Willkommen zurück, Benutzer ID: ${req.session.userId}`);
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
