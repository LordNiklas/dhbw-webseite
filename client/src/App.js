// Funktion zum Anzeigen von Abschnitten
function showSection(sectionId) {
  // Alle Abschnitte ausblenden
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none';
  });

  // Den gewählten Abschnitt anzeigen
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
      selectedSection.style.display = 'block'; // Zeige den gewählten Abschnitt an
  }
}

// Funktion zum Abrufen der Ferienwohnungen
async function fetchProperties() {
  try {
    const response = await fetch('/api/properties');
    if (!response.ok) {
      throw new Error('Netzwerkantwort war nicht ok');
    }
    const properties = await response.json();
    displayProperties(properties);
  } catch (error) {
    console.error('Fehler beim Abrufen der Eigenschaften:', error);
  }
}

// Funktion zum Anzeigen der Wohnungen auf der Seite
function displayProperties(properties) {
  const aboutSection = document.getElementById('about');
  aboutSection.innerHTML = ''; // Leeren, um vorherige Inhalte zu entfernen

  if (properties.length === 0) {
    aboutSection.innerHTML = '<p>Keine Ferienwohnungen verfügbar.</p>';
    return;
  }

  properties.forEach(property => {
    const propertyCard = document.createElement('div');
    propertyCard.classList.add('property-card');
    propertyCard.innerHTML = `
      <h3>${property.name}</h3>
      <img src="${property.image}" alt="${property.name}" style="width: 100%; height: auto; max-width: 300px;">
      <p>${property.description}</p>
      <p>Verfügbarkeit: ${property.availability}</p>
      <p>Preis: ${property.price} €</p>
      <button class="btn btn-primary" onclick="openBookingModal('${property._id}', '${property.name}')">Buchen</button>
    `;
    aboutSection.appendChild(propertyCard);
  });
}

// Funktion, um das Buchungsmodal zu öffnen
async function openBookingModal(propertyId, propertyName) {
  const modalTitle = document.getElementById('bookingModalLabel');
  const modalBody = document.getElementById('bookingModalBody');
  const modal = $('#bookingModal').modal('show');

  modalTitle.textContent = `Buchung für ${propertyName}`;

  // Lade die Details der Ferienwohnung (einschließlich gebuchter Zeiten)
  try {
    const response = await fetch(`/api/properties/${propertyId}`);
    const property = await response.json();

    const bookedDates = property.bookedDates.length > 0
      ? property.bookedDates.join(', ')
      : 'Keine gebuchten Daten';

    modalBody.innerHTML = `
      <p><strong>Bereits gebuchte Zeiten:</strong> ${bookedDates}</p>
      <label for="bookedDates">Bitte geben Sie die gewünschten Buchungsdaten im Format YYYY-MM-DD, getrennt durch Kommas, ein:</label>
      <input type="text" class="form-control" id="bookedDates" placeholder="2024-10-10,2024-10-15">
    `;

    // Klick-Event für die Buchungsbestätigung
    document.getElementById('confirmBooking').onclick = function() {
      bookProperty(propertyId);
      modal.hide();
    };

    modal.show();
  } catch (error) {
    console.error('Fehler beim Abrufen der Ferienwohnung:', error);
    alert('Fehler beim Abrufen der Ferienwohnung.');
  }
}

// Buchungsfunktion
async function bookProperty(propertyId) {
  const bookedDates = document.getElementById('bookedDates').value;

  if (!bookedDates) {
    alert('Keine Buchungsdaten eingegeben!');
    return;
  }

  try {
    const response = await fetch(`/api/properties/${propertyId}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookedDates: bookedDates.split(',')
      })
    });

    if (response.ok) {
      alert('Die Ferienwohnung wurde erfolgreich gebucht!');
    } else {
      const error = await response.text();
      alert('Fehler bei der Buchung: ' + error);
    }
  } catch (error) {
    console.error('Fehler bei der Buchung:', error);
    alert('Es ist ein Fehler bei der Buchung aufgetreten.');
  }
}

// Rufe die fetchProperties-Funktion auf, wenn die Seite geladen wird
window.onload = function() {
  showSection('home'); // Zeige die Startseite
  fetchProperties();   // Lade die Ferienwohnungen
  
  // Überprüfe die Cookie-Einwilligung und zeige ggf. den Cookie-Banner
  if (!checkCookieConsent()) {
    document.getElementById('cookieBanner').style.display = 'block';
  }
};

// Funktion zum Überprüfen, ob Cookies akzeptiert wurden
function checkCookieConsent() {
  return document.cookie.split(';').some((item) => item.trim().startsWith('cookiesAccepted='));
}

// Funktion zum Setzen des Cookies
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Event Listener für die "Akzeptieren"-Schaltfläche
document.getElementById('acceptCookies').addEventListener('click', function () {
  setCookie('cookiesAccepted', 'true', 365);  // Setze Cookie für 1 Jahr
  document.getElementById('cookieBanner').style.display = 'none';
});

// Kontaktformular Absende-Logik
document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (!name || !email || !message) {
    alert('Bitte füllen Sie alle Felder aus.');
    return;
  }

  document.getElementById('formStatus').textContent = 'Nachricht wurde gesendet!';
});

// Definiere die user-Variable am Anfang des Skripts
let user = {
  isProvider: false // Initialisiere isProvider oder andere Eigenschaften, die du brauchst
};

// Anmeldung Absende-Logik
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value; // E-Mail
  const password = document.getElementById('loginPassword').value;
  user.isProvider = document.getElementById('isProvider').checked; // Anbieter-Checkbox aktualisieren

  // Log the values being sent
  console.log('E-Mail:', email, 'Passwort:', password, 'Ist Anbieter:', user.isProvider);

  try {
      const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, isProvider: user.isProvider }) // Sende `isProvider` zusammen mit den anderen Daten
      });

      if (response.ok) {
          const message = await response.text();
          document.getElementById('loginStatus').textContent = message;
          $('#loginModal').modal('hide'); // Schließe das Anmeldefenster
          showUserInterface(email); // Benutzeroberfläche nach dem Login anzeigen
          showSection('home'); // Zeige die Startseite nach der Anmeldung
          
          // Anbieterbereich anzeigen oder ausblenden
          showProviderSection();
      } else {
          const error = await response.text();
          console.error('Login error response:', error);
          document.getElementById('loginStatus').textContent = error;
      }
  } catch (error) {
      console.error('Fehler bei der Anmeldung:', error);
      document.getElementById('loginStatus').textContent = 'Fehler bei der Anmeldung.';
  }
});

// Registrierung Absende-Logik
document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const email = document.getElementById('registerEmail').value; // Füge E-Mail hinzu

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, email }) // Sende die E-Mail mit
    });

    if (response.ok) {
      const message = await response.text();
      document.getElementById('registerStatus').textContent = message;
      $('#registerModal').modal('hide'); // Close register modal
    } else {
      const error = await response.text();
      document.getElementById('registerStatus').textContent = error;
    }
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    document.getElementById('registerStatus').textContent = 'Fehler bei der Registrierung.';
  }
});

// Funktion zur Anzeige des Benutzernamens und Logout-Buttons
// Funktion zur Anzeige des Benutzernamens und Logout-Buttons
function showUserInterface(email) {
  // Hides the login and register links
  document.querySelectorAll('#auth-buttons .btn').forEach(el => el.style.display = 'none');

  // Creates a new user interface section
  const userInterface = document.createElement('div');
  userInterface.className = 'navbar-nav';
  userInterface.innerHTML = `
    <span class="navbar-text">Willkommen, ${email}!</span>
    <button class="btn btn-danger ml-2" id="logoutButton">Logout</button>
  `;

  // Add user interface to the navbar
  const navbar = document.getElementById('navbarNav');
  navbar.appendChild(userInterface);

  // Add logout button functionality
  document.getElementById('logoutButton').addEventListener('click', function() {
    logoutUser();
  });
}

// Funktion zum Abmelden
async function logoutUser() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST'
    });

    if (response.ok) {
      location.reload(); // Reload the page after logout
    } else {
      const error = await response.text();
      console.error('Logout error:', error);
    }
  } catch (error) {
    console.error('Fehler bei der Abmeldung:', error);
  }
}

// Event Listener für das Formular zum Hinzufügen der Ferienwohnung
document.getElementById('addPropertyForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const name = document.getElementById('propertyName').value;
  const description = document.getElementById('propertyDescription').value;
  const availability = document.getElementById('propertyAvailability').value;
  const price = document.getElementById('propertyPrice').value;
  const imageFile = document.getElementById('propertyImage').files[0];

  const formData = new FormData();
  formData.document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value; // E-Mail
    const password = document.getElementById('loginPassword').value;
    const isProvider = document.getElementById('isProvider').checked; // Anbieter-Checkbox

    // Log the values being sent
    console.log('E-Mail:', email, 'Passwort:', password, 'Ist Anbieter:', isProvider);

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, isProvider }) // Sende `isProvider` zusammen mit den anderen Daten
        });

        if (response.ok) {
            const message = await response.text();
            document.getElementById('loginStatus').textContent = message;
            $('#loginModal').modal('hide'); // Schließe das Anmeldefenster
            showUserInterface(email); // Benutzeroberfläche nach dem Login anzeigen
            showSection('home'); // Zeige die Startseite nach der Anmeldung
            
            // Überprüfe, ob der Benutzer ein Anbieter ist
            if (isProvider) {
                document.getElementById('addPropertySection').style.display = 'block'; // Anbieterbereich sichtbar machen
            }
        } else {
            const error = await response.text();
            console.error('Login error response:', error);
            document.getElementById('loginStatus').textContent = error;
        }
    } catch (error) {
        console.error('Fehler bei der Anmeldung:', error);
        document.getElementById('loginStatus').textContent = 'Fehler bei der Anmeldung.';
    }
});
end('name', name);
  formData.append('description', description);
  formData.append('availability', availability);
  formData.append('price', price);
  formData.append('image', imageFile);

  try {
    const response = await fetch('/api/properties', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      document.getElementById('addPropertyStatus').textContent = 'Ferienwohnung erfolgreich hinzugefügt!';
      document.getElementById('addPropertyForm').reset(); // Formulareingaben zurücksetzen
      fetchProperties(); // Aktualisiere die Liste der Ferienwohnungen
    } else {
      const error = await response.text();
      document.getElementById('addPropertyStatus').textContent = 'Fehler: ' + error;
    }
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Ferienwohnung:', error);
    document.getElementById('addPropertyStatus').textContent = 'Ein Fehler ist aufgetreten.';
  }
});

// Funktion, um das Formular anzuzeigen
function showAddPropertyForm() {
  showSection('addPropertySection'); // Zeige den Abschnitt zum Hinzufügen von Ferienwohnungen
}
