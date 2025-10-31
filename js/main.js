/* ==========================================================================
   INHALTSVERZEICHNIS
   ==========================================================================
   1. "NACH OBEN"-BUTTON
   2. HEADER BANNER FADER
   3. BILD-LIGHTBOX / MODAL
   4. IMPRESSUM ANZEIGEN
   5. COOKIE-ZUSTIMMUNGSBANNER
   ========================================================================== */


/* === 1. "NACH OBEN"-BUTTON === */
// Globale Funktionen, die direkt im HTML via onclick="" aufgerufen werden.
var mybutton = document.getElementById("myBtn");

// Zeigt den Button an, wenn der Benutzer nach unten scrollt.
function scrollFunction() {
  if (mybutton) { // Prüft, ob der Button auf der Seite existiert.
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
  }
}

// Scrollt zum Anfang der Seite, wenn der Button geklickt wird.
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Event-Listener für das Scroll-Ereignis.
window.onscroll = scrollFunction;


/* 
   Die folgenden Skripte werden erst ausgeführt, nachdem das gesamte HTML-Dokument geladen wurde.
   Dies verhindert Fehler, falls Skripte auf Elemente zugreifen, die noch nicht existieren.
*/
document.addEventListener('DOMContentLoaded', function() {

    /* === 2. HEADER BANNER FADER === */
    const banners = [
      'images/header/header-image03.png',
      'images/header/header-image04.png',
      'images/header/header-image07.png',
      'images/header/header-image12.png',
      'images/header/header-image14.png',
    ];
    const displayDuration = 10000; // Anzeigedauer in ms
    const fadeDuration = 1000;    // Überblenddauer in ms
    const bannerElement = document.getElementById('header-banner');
    
    if (bannerElement) {
      // Findet den Startindex des aktuellen Banners oder startet bei 0.
      let currentIndex = banners.findIndex(path => bannerElement.src.includes(path));
      if (currentIndex === -1) currentIndex = 0;

      // Lädt alle Banner-Bilder im Voraus, um ein Flackern zu vermeiden.
      banners.forEach(src => { (new Image()).src = src; });

      function changeBanner() {
        // Blendet das aktuelle Bild aus.
        bannerElement.style.opacity = 0;
        
        // Wechselt das Bild nach der Überblendung.
        setTimeout(() => {
          let nextIndex;
          do {
            // Wählt ein zufälliges neues Bild, das nicht das aktuelle ist.
            nextIndex = Math.floor(Math.random() * banners.length);
          } while (banners.length > 1 && nextIndex === currentIndex);
          
          currentIndex = nextIndex;
          bannerElement.src = banners[currentIndex];
          
          // Blendet das neue Bild ein.
          bannerElement.style.opacity = 1;
        }, fadeDuration);
      }
      // Startet den Banner-Wechsel in einem regelmäßigen Intervall.
      setInterval(changeBanner, displayDuration);
    }

    /* === 3. BILD-LIGHTBOX / MODAL === */
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const imageLinks = document.querySelectorAll('.track-image-link');

    if (modal && modalImg && closeBtn) {
        // Fügt jedem Bild-Link einen Klick-Listener hinzu.
        imageLinks.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault(); // Verhindert das Öffnen des Bildes in einem neuen Tab.
            modal.style.display = "block";
            modalImg.src = this.href;
            modalImg.alt = this.querySelector('img').alt; // Setzt den Alt-Text für Barrierefreiheit.
          });
        });

        // Funktion zum Schließen des Modals.
        function closeModal() {
          modal.style.display = "none";
        }

        // Schließt das Modal beim Klick auf den Schließen-Button.
        closeBtn.onclick = closeModal;

        // Schließt das Modal bei einem Klick neben das Bild.
        modal.onclick = function(event) {
          if (event.target === modal) {
            closeModal();
          }
        }
    }
    
    /* === 4. IMPRESSUM ANZEIGEN === */
    const requestDiv = document.getElementById('imprint-request');
    const detailsDiv = document.getElementById('imprint-details');
    const requestBtn = document.getElementById('imprint-request-btn');

    if(requestBtn) {
        // Bei Klick auf den Button wird der Anforderungstext ausgeblendet und das Impressum eingeblendet.
        requestBtn.addEventListener('click', function() {
            if(requestDiv) { requestDiv.style.display = 'none'; }
            if(detailsDiv) { detailsDiv.style.display = 'block'; }
        });
    }

    /* === 5. COOKIE-ZUSTIMMUNGSBANNER === */
    const COOKIE_NAME = 'melcom_cookie_consent_dismissed';
    const banner = document.getElementById('cookie-consent-banner');
    const overlay = document.getElementById('cookie-consent-overlay');
    const okBtn = document.getElementById('btn-ok-cookies');
    const learnMoreLink = document.getElementById('cookie-learn-more');
    const consentText = document.getElementById('cookie-consent-text');

    // Das Skript wird nur ausgeführt, wenn alle notwendigen Elemente vorhanden sind.
    if (banner && overlay && okBtn && learnMoreLink && consentText) {

        // Definiert die Funktion zum Laden der Tracking-Skripte.
        function loadTrackingScripts() {
            // Statcounter
            window.sc_project=13174008; 
            window.sc_invisible=1; 
            window.sc_security="b2c21c8e"; 
            const scScript = document.createElement('script');
            scScript.src = 'https://www.statcounter.com/counter/counter.js';
            scScript.async = true;
            document.body.appendChild(scScript);
        }

        // Deutsche und englische Texte für den Banner.
        const translations = {
            en: {
                text: 'This website uses Statcounter to analyze traffic and improve the site. By using this site, you consent to this tracking.',
                learnMore: 'Learn More',
                ok: 'OK'
            },
            de: {
                text: 'Diese Webseite nutzt Statcounter, um Zugriffe zu analysieren und die Seite zu verbessern. Durch die Nutzung der Seite stimmst du diesem Tracking zu.',
                learnMore: 'Weitere Informationen',
                ok: 'OK'
            }
        };

        // Hilfsfunktion zum Setzen eines Cookies.
        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
        }

        // Hilfsfunktion zum Lesen eines Cookies.
        function getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for(let i=0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }
        
        // Prüft, ob der Zustimmungs-Cookie bereits existiert.
        if (getCookie(COOKIE_NAME) === 'true') {
            // Wenn ja, lade die Tracking-Skripte sofort.
            loadTrackingScripts();
        } else {
            // Wenn nein, zeige den Banner an.
            const userLang = navigator.language || navigator.userLanguage; 
            const lang = userLang.startsWith('de') ? 'de' : 'en';

            // Setzt die Texte basierend auf der Browsersprache.
            consentText.innerHTML = translations[lang].text;
            learnMoreLink.textContent = translations[lang].learnMore;
            okBtn.textContent = translations[lang].ok;

            banner.style.display = 'block';
            overlay.style.display = 'block';
        }
        
        // Fügt dem OK-Button einen Event-Listener hinzu.
        okBtn.addEventListener('click', function() {
            // Lade die Tracking-Skripte erst nach dem Klick.
            loadTrackingScripts();
            // Setze den Cookie, um die Zustimmung für 365 Tage zu speichern.
            setCookie(COOKIE_NAME, 'true', 365);
            // Blende den Banner und das Overlay aus.
            banner.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
});