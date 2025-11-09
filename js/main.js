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
// Global functions that can be called by the onclick="" attribute in the HTML.
var mybutton = document.getElementById("myBtn");

// Shows the button when the user scrolls down.
function scrollFunction() {
  if (mybutton) { // Check if the button exists on the page.
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
  }
}

// Scrolls to the top of the page when the button is clicked.
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Assign the scroll event listener.
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
    const displayDuration = 10000; // Time in ms
    const fadeDuration = 1000;    // Time in ms
    const bannerElement = document.getElementById('header-banner');
    
    if (bannerElement) {
      // Find the starting index of the current banner or default to 0.
      let currentIndex = banners.findIndex(path => bannerElement.src.includes(path));
      if (currentIndex === -1) currentIndex = 0;

      // Preload all banner images to prevent flickering.
      banners.forEach(src => { (new Image()).src = src; });

      function changeBanner() {
        // Fade out the current image.
        bannerElement.style.opacity = 0;
        
        // After the fade, change the image source.
        setTimeout(() => {
          let nextIndex;
          do {
            // Select a new random image that is not the current one.
            nextIndex = Math.floor(Math.random() * banners.length);
          } while (banners.length > 1 && nextIndex === currentIndex);
          
          currentIndex = nextIndex;
          bannerElement.src = banners[currentIndex];
          
          // Fade in the new image.
          bannerElement.style.opacity = 1;
        }, fadeDuration);
      }
      // Start the banner rotation at a regular interval.
      setInterval(changeBanner, displayDuration);
    }

    /* === 3. IMAGE LIGHTBOX / MODAL === */
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const imageLinks = document.querySelectorAll('.track-image-link');

    if (modal && modalImg && closeBtn) {
        // Add a click listener to each image link.
        imageLinks.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default action of opening the image link.
            modal.style.display = "block";
            modalImg.src = this.href;
            modalImg.alt = this.querySelector('img').alt; // Set alt text for accessibility.
          });
        });

        // Function to close the modal.
        function closeModal() {
          modal.style.display = "none";
        }

        // Close the modal when the close button is clicked.
        closeBtn.onclick = closeModal;

        // Close the modal when clicking outside the image.
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
        // On button click, hide the request text and show the imprint details.
        requestBtn.addEventListener('click', function() {
            if(requestDiv) { requestDiv.style.display = 'none'; }
            if(detailsDiv) { detailsDiv.style.display = 'block'; }
        });
    }

    /* === 5. COOKIE CONSENT BANNER === */
    const COOKIE_NAME = 'melcom_cookie_consent_dismissed';
    const banner = document.getElementById('cookie-consent-banner');
    // The overlay is no longer needed and thus not referenced here.
    const okBtn = document.getElementById('btn-accept-cookies'); // Adjusted ID for clarity
    const learnMoreLink = document.getElementById('cookie-learn-more');
    const consentText = document.getElementById('cookie-consent-text');

    // Only run the script if all necessary banner elements exist.
    if (banner && okBtn && learnMoreLink && consentText) {

        // Defines the function to load the tracking scripts.
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

        // English and German text for the banner.
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

        // Helper function to set a cookie.
        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
        }

        // Helper function to get a cookie.
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
        
        // Main logic for controlling the banner and tracking.
        const hasConsent = getCookie(COOKIE_NAME) === 'true';
        const urlParams = new URLSearchParams(window.location.search);
        const isViewingImprintFromBanner = urlParams.get('source') === 'cookie-banner';

        if (hasConsent) {
            // Case 1: User has already given consent -> load tracking immediately.
            loadTrackingScripts();
        } else if (isViewingImprintFromBanner) {
            // Case 2: User is on the imprint page via the "Learn More" link.
            // Do not show the banner for this specific page view.
        } else {
            // Case 3: No consent, no special case -> show the banner.
            const userLang = navigator.language || navigator.userLanguage; 
            const lang = userLang.startsWith('de') ? 'de' : 'en';

            // Set the texts based on browser language.
            consentText.innerHTML = translations[lang].text;
            learnMoreLink.textContent = translations[lang].learnMore;
            okBtn.textContent = translations[lang].ok;

            banner.style.display = 'block';
            // The overlay is removed, so no 'overlay.style.display = 'block';' here.
        }
        
        // Add an event listener to the OK button.
        okBtn.addEventListener('click', function() {
            // Load tracking scripts only after the click.
            loadTrackingScripts();
            // Set a cookie to remember consent for 365 days.
            setCookie(COOKIE_NAME, 'true', 365);
            // Hide the banner.
            banner.style.display = 'none';
        });
    }
});