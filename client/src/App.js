// Funktion zum Anzeigen von Abschnitten
function showSection(section) {
  // Alle Abschnitte verstecken
  document.querySelectorAll('.content-section').forEach(function(sec) {
    sec.style.display = 'none';
  });
  // Den gewünschten Abschnitt anzeigen
  document.getElementById(section).style.display = 'block';
}

// Füge diese Funktion in deine App.js ein, um die Wohnungen anzuzeigen
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

// Funktion, um das Buchungsmodal zu öffnen und die gebuchten Zeiten anzuzeigen
async function openBookingModal(propertyId, propertyName) {
  const modalTitle = document.getElementById('bookingModalLabel');
  const modalBody = document.getElementById('bookingModalBody');
  const modal = new bootstrap.Modal(document.getElementById('bookingModal'));

  modalTitle.textContent = `Buchung für ${propertyName}`;

  // Lade die Details der Ferienwohnung (einschließlich gebuchter Zeiten)
  try {
    const response = await fetch(`/api/properties/${propertyId}`);
    const property = await response.json();

    // Gebuchte Zeiten anzeigen
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
};

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
