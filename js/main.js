/* ==========================================================================
   TABLE OF CONTENTS
   ==========================================================================
   1. "BACK TO TOP" BUTTON
   2. HEADER BANNER FADER
   3. IMAGE LIGHTBOX / MODAL
   4. IMPRINT REVEAL
   5. STATCOUNTER TRACKING & INFO BANNER
   ========================================================================== */


/* === 1. "BACK TO TOP" BUTTON === */
var mybutton = document.getElementById("myBtn");

function scrollFunction() {
    if (mybutton) {
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
            modalImg.alt = this.querySelector('img').alt;
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

    /* === 5. STATCOUNTER TRACKING & INFO BANNER === */
    
    // Function to load the standard Statcounter script.
    function loadStatcounter() {
        window.sc_project = 13174008;
        window.sc_invisible = 1;
        window.sc_security = "b2c21c8e";
        const scScript = document.createElement('script');
        scScript.src = 'https://www.statcounter.com/counter/counter.js';
        scScript.async = true;
        document.body.appendChild(scScript);
    }

    // Start tracking immediately on page load.
    loadStatcounter();

    // The rest of the script manages the info banner's visibility.
    const BANNER_COOKIE_NAME = 'melcom_info_banner_dismissed';
    const infoBanner = document.getElementById('info-banner');
    const dismissBtn = document.getElementById('btn-dismiss-banner');
    const bannerText = document.getElementById('info-banner-text');
    const learnMoreLink = document.getElementById('info-banner-learn-more');

    if (infoBanner && dismissBtn && bannerText && learnMoreLink) {
        const translations = {
            en: {
                text: 'This website uses an analytics service to understand which content is popular. By continuing to use this site, you agree to this.',
                learnMore: 'Learn More',
                dismiss: 'OK'
            },
            de: {
                text: 'Diese Webseite nutzt einen Analysedienst, um zu verstehen, welche Inhalte beliebt sind. Durch die weitere Nutzung der Webseite stimmst du dem zu.',
                learnMore: 'Weitere Informationen',
                dismiss: 'OK'
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

            infoBanner.style.display = 'block';
        }
        
        dismissBtn.addEventListener('click', function() {
            setCookie(BANNER_COOKIE_NAME, 'true', 365);
            infoBanner.style.display = 'none';
        });
    }
});