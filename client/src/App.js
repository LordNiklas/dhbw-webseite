const content = `
  <h1>Willkommen auf The Heritage Hideaways!</h1>
  
  <nav>
    <ul>
      <li><a href="#home" onclick="showSection('home')">Home</a></li>
      <li><a href="#about" onclick="showSection('about')">Wohnungen</a></li>
      <li><a href="#contact" onclick="showSection('contact')">Kontakt</a></li>
    </ul>
  </nav>
  
  <main>
    <!-- Home Section -->
    <section id="home" class="content-section">
      <h2>Willkommen bei The Heritage Hideaways</h2>
      <p>Willkommen bei The Heritage Hideaways, wo Luxus und Tradition aufeinandertreffen. Unsere erlesenen Ferienhäuser im Old Money-Stil bieten Ihnen die perfekte Kombination aus Eleganz, Diskretion und zeitlosem Charme. Jedes unserer exklusiven Anwesen wurde sorgfältig ausgewählt, um Ihnen ein einzigartiges Urlaubserlebnis zu bieten – geprägt von Raffinesse, Geschichte und höchsten Standards.</p>
      <p>Ob Sie die Ruhe eines ländlichen Herrenhauses oder die klassische Eleganz einer Villa am Meer suchen, unsere Residenzen verkörpern die Werte von Beständigkeit, Qualität und Klasse. Jedes Haus ist eine Hommage an vergangene Epochen und bietet zugleich moderne Annehmlichkeiten für Ihren Komfort.</p>
      <p>Bei uns geht es nicht nur um das Buchen eines Ferienhauses – es geht darum, in eine Welt einzutauchen, in der Luxus und Tradition noch zählen. Buchen Sie Ihr privates Refugium und erleben Sie das zeitlose Lebensgefühl, das unsere Auswahl so besonders macht.</p>
    </section>

    <!-- Wohnungen Section -->
    <section id="about" class="content-section" style="display: none;">
      <h2>Unsere Ferienwohnungen</h2>
      
      <div class="property-card">
        <img src="https://example.com/wohnung1.jpg" alt="Ferienwohnung Am See" />
        <h3>Ferienwohnung Am See</h3>
        <p>Eine schöne Wohnung direkt am See mit atemberaubendem Ausblick.</p>
        <p class="availability">Verfügbar</p>
        <a href="#book" class="book-button">Jetzt Buchen</a>
      </div>
      
      <div class="property-card">
        <img src="https://example.com/wohnung2.jpg" alt="Stadtwohnung im Zentrum" />
        <h3>Stadtwohnung im Zentrum</h3>
        <p>Perfekt für Städtereisen, in der Nähe von Sehenswürdigkeiten und Restaurants.</p>
        <p class="availability not-available">Nicht Verfügbar</p>
        <a href="#book" class="book-button disabled">Belegt</a>
      </div>
      
      <div class="property-card">
        <img src="https://example.com/wohnung3.jpg" alt="Bergchalet in den Alpen" />
        <h3>Bergchalet in den Alpen</h3>
        <p>Ein gemütliches Chalet mit Blick auf die majestätischen Alpen.</p>
        <p class="availability">Verfügbar</p>
        <a href="#book" class="book-button">Jetzt Buchen</a>
      </div>
    </section>

    <!-- Kontakt Section -->
    <section id="contact" class="content-section" style="display: none;">
      <h2>Kontaktieren Sie uns</h2>
      <form id="contactForm">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div>
          <label for="email">E-Mail:</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div>
          <label for="message">Nachricht:</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <div>
          <button type="submit">Absenden</button>
        </div>
      </form>
      <p id="formStatus" style="color:green;"></p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 The Heritage Hideaways</p>
  </footer>

  <script>
    function showSection(section) {
      // Alle Abschnitte verstecken
      document.querySelectorAll('.content-section').forEach(function(sec) {
        sec.style.display = 'none';
      });

      // Den gewünschten Abschnitt anzeigen
      document.getElementById(section).style.display = 'block';
    }
    
    // Standardmäßig den Home-Abschnitt anzeigen
    showSection('home');

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
  </script>
`;

module.exports = content;
