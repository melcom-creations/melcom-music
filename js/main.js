/* ==========================================================================
   TABLE OF CONTENTS
   ==========================================================================
   1. "BACK TO TOP" BUTTON
   2. HEADER BANNER FADER
   3. IMAGE LIGHTBOX / MODAL
   4. IMPRINT REVEAL
   5. COOKIE CONSENT BANNER (NOTIFICATION STYLE)
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

    /* === 5. COOKIE CONSENT BANNER (NOTIFICATION STYLE) === */
    // --- KEY CHANGE: This section is completely refactored. ---
    
    const COOKIE_NAME = 'melcom_cookie_consent_dismissed'; // Renamed for clarity
    const banner = document.getElementById('cookie-consent-banner');
    const overlay = document.getElementById('cookie-consent-overlay');
    const okBtn = document.getElementById('btn-ok-cookies');
    const learnMoreLink = document.getElementById('cookie-learn-more');
    const consentText = document.getElementById('cookie-consent-text');

    // Check if all banner elements exist before proceeding
    if (banner && overlay && okBtn && learnMoreLink && consentText) {

        // --- CHANGE 1: Tracking scripts are loaded immediately on every page visit. ---
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
        loadTrackingScripts(); // Call it right away.

        // --- CHANGE 2: Simplified translations for the new banner style. ---
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
        
        // --- CHANGE 3: The logic now only checks if the banner was dismissed. ---
        const isDismissed = getCookie(COOKIE_NAME);

        if (isDismissed === null) { // Only show the banner if the cookie is not set.
            const userLang = navigator.language || navigator.userLanguage; 
            const lang = userLang.startsWith('de') ? 'de' : 'en';

            consentText.innerHTML = translations[lang].text;
            learnMoreLink.textContent = translations[lang].learnMore;
            okBtn.textContent = translations[lang].ok;

            banner.style.display = 'block';
            overlay.style.display = 'block';
        }
        
        // --- CHANGE 4: The OK button just sets a cookie and hides the banner. ---
        okBtn.addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'true', 365);
            banner.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
});