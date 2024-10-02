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
      <img src="${property.image}" alt="${property.name}">
      <p>${property.description}</p>
      <p>Verfügbarkeit: ${property.availability}</p>
    `;
    aboutSection.appendChild(propertyCard);
  });
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

  if (name && email && message) {
    document.getElementById('formStatus').textContent = 'Ihre Nachricht wurde erfolgreich gesendet!';
    document.getElementById('contactForm').reset();
  } else {
    document.getElementById('formStatus').textContent = 'Bitte füllen Sie alle Felder aus.';
    document.getElementById('formStatus').style.color = 'red';
  }
});
