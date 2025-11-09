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

    /* === 5. COOKIELESS TRACKING & INFO BANNER === */
    
    // Defines the function to load the tracking scripts in cookieless mode.
    function loadTrackingScripts() {
        // Statcounter
        window.sc_project=13174008; 
        window.sc_invisible=1; 
        window.sc_security="b2c21c8e";
        window.sc_statcounter_cookie_storage = 'disabled'; // This enables cookieless mode
        const scScript = document.createElement('script');
        scScript.src = 'https://www.statcounter.com/counter/counter.js';
        scScript.async = true;
        document.body.appendChild(scScript);
    }

    // Start tracking immediately on every page load.
    loadTrackingScripts();


    // The rest of the script now only manages the info banner's visibility.
    const BANNER_COOKIE_NAME = 'melcom_info_banner_dismissed';
    const banner = document.getElementById('info-banner');
    const dismissBtn = document.getElementById('btn-dismiss-banner');
    const bannerText = document.getElementById('info-banner-text');
    const learnMoreLink = document.getElementById('info-banner-learn-more');

    if (banner && dismissBtn && bannerText && learnMoreLink) {

        const translations = {
            en: {
                text: 'This website uses Statcounter for anonymous traffic analysis to improve the site. No cookies are used for this purpose.',
                learnMore: 'Learn More',
                dismiss: 'Got it!'
            },
            de: {
                text: 'Diese Webseite nutzt Statcounter zur anonymen Analyse der Zugriffe, um die Seite zu verbessern. Hierfür werden keine Cookies verwendet.',
                learnMore: 'Weitere Informationen',
                dismiss: 'Verstanden'
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
        
        const isDismissed = getCookie(BANNER_COOKIE_NAME) === 'true';

        if (!isDismissed) {
            const userLang = navigator.language || navigator.userLanguage; 
            const lang = userLang.startsWith('de') ? 'de' : 'en';

            bannerText.innerHTML = translations[lang].text;
            learnMoreLink.textContent = translations[lang].learnMore;
            dismissBtn.textContent = translations[lang].dismiss;

            banner.style.display = 'block';
        }
        
        dismissBtn.addEventListener('click', function() {
            setCookie(BANNER_COOKIE_NAME, 'true', 365);
            banner.style.display = 'none';
        });
    }
});