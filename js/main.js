/* ==========================================================================
   TABLE OF CONTENTS
   ==========================================================================
   1. "BACK TO TOP" BUTTON
   2. HEADER BANNER FADER
   3. IMAGE LIGHTBOX / MODAL
   4. IMPRINT REVEAL
   5. COOKIE CONSENT BANNER
   ========================================================================== */


/* === 1. "BACK TO TOP" BUTTON === */
// Note: These functions need to be global for the onclick="" attribute in the HTML to work.
var mybutton = document.getElementById("myBtn");

function scrollFunction() {
  if (mybutton) { // Check if the button exists on the page
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Assign the scroll event listener once the window loads
window.onscroll = scrollFunction;


/* 
   The following scripts are wrapped in a DOMContentLoaded event listener.
   This ensures they only run after the entire HTML document has been loaded and parsed.
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
    const displayDuration = 10000;
    const fadeDuration = 1000;
    const bannerElement = document.getElementById('header-banner');
    
    if (bannerElement) {
      let currentIndex = banners.findIndex(path => bannerElement.src.includes(path));
      if (currentIndex === -1) currentIndex = 0;

      // Preload images to prevent flickering
      banners.forEach(src => { (new Image()).src = src; });

      function changeBanner() {
        bannerElement.style.opacity = 0;
        setTimeout(() => {
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * banners.length);
          } while (banners.length > 1 && nextIndex === currentIndex);
          currentIndex = nextIndex;
          bannerElement.src = banners[currentIndex];
          bannerElement.style.opacity = 1;
        }, fadeDuration);
      }
      setInterval(changeBanner, displayDuration);
    }

    /* === 3. IMAGE LIGHTBOX / MODAL === */
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const imageLinks = document.querySelectorAll('.track-image-link');

    if (modal && modalImg && closeBtn) {
        imageLinks.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault();
            modal.style.display = "block";
            modalImg.src = this.href;
            modalImg.alt = this.querySelector('img').alt; // Dynamically set the alt text
          });
        });

        function closeModal() {
          modal.style.display = "none";
        }

        closeBtn.onclick = closeModal;

        // Close modal if user clicks on the background overlay
        modal.onclick = function(event) {
          if (event.target === modal) {
            closeModal();
          }
        }
    }
    
    /* === 4. IMPRINT REVEAL === */
    const requestDiv = document.getElementById('imprint-request');
    const detailsDiv = document.getElementById('imprint-details');
    const requestBtn = document.getElementById('imprint-request-btn');

    if(requestBtn) {
        requestBtn.addEventListener('click', function() {
            if(requestDiv) { requestDiv.style.display = 'none'; }
            if(detailsDiv) { detailsDiv.style.display = 'block'; }
        });
    }

    /* === 5. COOKIE CONSENT BANNER === */
    const COOKIE_NAME = 'melcom_cookie_consent';
    const banner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('btn-accept-cookies');
    const declineBtn = document.getElementById('btn-decline-cookies');
    const consentText = document.getElementById('cookie-consent-text');

    // Check if the banner elements exist before proceeding
    if (banner && acceptBtn && declineBtn && consentText) {
        const translations = {
            en: {
                text: 'This website uses Google Analytics and Statcounter to analyze traffic and improve the user experience. Your IP address and user agent are shared with these services for performance and security metrics. By clicking "Accept", you consent to the use of these services. For more information, please see the <a href="imprint.html">Imprint & Disclaimer</a>.',
                accept: 'Accept',
                decline: 'Decline'
            },
            de: {
                text: 'Diese Website verwendet Google Analytics und Statcounter, um Zugriffe zu analysieren und die Nutzererfahrung zu verbessern. Deine IP-Adresse und dein User-Agent werden zu Leistungs- und Sicherheitszwecken an diese Dienste weitergegeben. Mit einem Klick auf "Akzeptieren" stimmst du der Verwendung dieser Dienste zu. Weitere Informationen findest du im <a href="imprint.html">Impressum / Disclaimer</a>.',
                accept: 'Akzeptieren',
                decline: 'Ablehnen'
            }
        };

        function loadTrackingScripts() {
            // Google Analytics
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-R4HCR49RRY';
            document.head.appendChild(gaScript);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R4HCR49RRY');

            // Statcounter
            window.sc_project=13174008; 
            window.sc_invisible=1; 
            window.sc_security="b2c21c8e"; 
            const scScript = document.createElement('script');
            scScript.src = 'https://www.statcounter.com/counter/counter.js';
            scScript.async = true;
            document.body.appendChild(scScript);
        }

        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
        }

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

        const consent = getCookie(COOKIE_NAME);

        if (consent === 'true') {
            loadTrackingScripts();
        } else if (consent === null) {
            const userLang = navigator.language || navigator.userLanguage; 
            const lang = userLang.startsWith('de') ? 'de' : 'en';

            consentText.innerHTML = translations[lang].text;
            acceptBtn.textContent = translations[lang].accept;
            declineBtn.textContent = translations[lang].decline;

            banner.style.display = 'block';
        }
        
        acceptBtn.addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'true', 365);
            banner.style.display = 'none';
            loadTrackingScripts();
        });

        declineBtn.addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'false', 365);
            banner.style.display = 'none';
        });
    }
});