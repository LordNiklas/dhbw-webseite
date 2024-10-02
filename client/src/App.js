function showSection(section) {
  // Alle Abschnitte verstecken
  document.querySelectorAll('.content-section').forEach(function(sec) {
    sec.style.display = 'none';
  });

  // Den gewünschten Abschnitt anzeigen
  document.getElementById(section).style.display = 'block';
}

// Standardmäßig den Home-Abschnitt anzeigen
window.onload = function() {
  showSection('home');
};

// Kontaktformular Absende-Logik
document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Hier kannst du Logik für die Validierung oder das Senden des Formulars einfügen
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (name && email && message) {
    // Simuliere das Absenden des Formulars
    document.getElementById('formStatus').textContent = 'Ihre Nachricht wurde erfolgreich gesendet!';
    document.getElementById('contactForm').reset();
  } else {
    document.getElementById('formStatus').textContent = 'Bitte füllen Sie alle Felder aus.';
    document.getElementById('formStatus').style.color = 'red';
  }
});
