/* ==========================================================================
   Main site interactions
   ========================================================================== */

(function () {
    'use strict';

    const BANNER_IMAGES = [
        'images/header/header-image03.png',
        'images/header/header-image04.png',
        'images/header/header-image07.png',
        'images/header/header-image12.png',
        'images/header/header-image14.png',
        'images/header/header-image15.png',
        'images/header/header-image16.png'
    ];

    const COOKIE_NAME = 'melcom_info_banner_dismissed';
    const COOKIE_MAX_AGE_DAYS = 365;
    const BANNER_DISPLAY_DURATION = 10000;
    const BANNER_FADE_DURATION = 1000;

    let backToTopButton = null;

    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop || 0;
    }

    function toggleBackToTopButton() {
        if (!backToTopButton) {
            return;
        }

        backToTopButton.style.display = getScrollTop() > 20 ? 'block' : 'none';
    }

    function scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    function preloadBannerImages() {
        BANNER_IMAGES.forEach(function (src) {
            const image = new Image();
            image.src = src;
        });
    }

    function startBannerRotation() {
        const bannerElement = document.getElementById('header-banner');
        if (!bannerElement || BANNER_IMAGES.length === 0) {
            return;
        }

        let currentIndex = BANNER_IMAGES.findIndex(function (path) {
            return bannerElement.src.includes(path);
        });

        if (currentIndex === -1) {
            currentIndex = 0;
        }

        preloadBannerImages();

        function cycleBanner() {
            bannerElement.style.opacity = '0';

            setTimeout(function () {
                let nextIndex = currentIndex;

                if (BANNER_IMAGES.length > 1) {
                    do {
                        nextIndex = Math.floor(Math.random() * BANNER_IMAGES.length);
                    } while (nextIndex === currentIndex);
                }

                currentIndex = nextIndex;
                bannerElement.src = BANNER_IMAGES[currentIndex];

                setTimeout(function () {
                    bannerElement.style.opacity = '1';
                    setTimeout(cycleBanner, BANNER_DISPLAY_DURATION);
                }, 50);
            }, BANNER_FADE_DURATION);
        }

        setTimeout(cycleBanner, BANNER_DISPLAY_DURATION);
    }

    function openLightbox(modal, modalImage, thumbnails, triggerLink) {
        const image = triggerLink.querySelector('img');
        const parentGroup = triggerLink.closest('.screenshot-grid');

        if (thumbnails) {
            thumbnails.innerHTML = '';
        }

        if (parentGroup && thumbnails) {
            const galleryLinks = parentGroup.querySelectorAll('.track-image-link');

            if (galleryLinks.length > 1) {
                galleryLinks.forEach(function (galleryLink) {
                    const thumbImage = document.createElement('img');
                    const sourceImage = galleryLink.querySelector('img');

                    if (!sourceImage) {
                        return;
                    }

                    thumbImage.src = sourceImage.src;
                    thumbImage.alt = sourceImage.alt;

                    if (galleryLink === triggerLink) {
                        thumbImage.classList.add('active-thumb');
                    }

                    thumbImage.addEventListener('click', function (event) {
                        event.stopPropagation();

                        modalImage.src = galleryLink.href;
                        modalImage.alt = sourceImage.alt;

                        thumbnails.querySelectorAll('img').forEach(function (thumb) {
                            thumb.classList.remove('active-thumb');
                        });
                        thumbImage.classList.add('active-thumb');
                    });

                    thumbnails.appendChild(thumbImage);
                });
            }
        }

        modal.style.display = 'block';
        modalImage.src = triggerLink.href;
        modalImage.alt = image ? image.alt : 'Enlarged image';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function setupLightboxGallery() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeButton = document.querySelector('.modal-close');
        const thumbnails = document.getElementById('modalThumbnails');
        const imageLinks = document.querySelectorAll('.track-image-link');

        if (!modal || !modalImage || !closeButton) {
            return;
        }

        imageLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                openLightbox(modal, modalImage, thumbnails, link);
            });
        });

        closeButton.addEventListener('click', function () {
            closeLightbox(modal);
        });

        modal.addEventListener('click', function (event) {
            if (event.target === modal || event.target === thumbnails) {
                closeLightbox(modal);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                closeLightbox(modal);
            }
        });
    }

    function setupImprintReveal() {
        const requestPanel = document.getElementById('imprint-request');
        const detailsPanel = document.getElementById('imprint-details');
        const requestButton = document.getElementById('imprint-request-btn');

        if (!requestButton) {
            return;
        }

        requestButton.addEventListener('click', function () {
            if (requestPanel) {
                requestPanel.style.display = 'none';
            }

            if (detailsPanel) {
                detailsPanel.style.display = 'block';
            }
        });
    }

    function setCookie(name, value, days) {
        let expires = '';

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }

        document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    }

    function getCookie(name) {
        const key = name + '=';
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i += 1) {
            let cookie = cookies[i];

            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }

            if (cookie.indexOf(key) === 0) {
                return cookie.substring(key.length);
            }
        }

        return null;
    }

    function loadStatcounter() {
        window.sc_project = 13174008;
        window.sc_invisible = 1;
        window.sc_security = 'b2c21c8e';

        const script = document.createElement('script');
        script.src = 'https://www.statcounter.com/counter/counter.js';
        script.async = true;
        document.body.appendChild(script);
    }

    function setupInfoBanner() {
        const infoBanner = document.getElementById('info-banner');
        const dismissButton = document.getElementById('btn-dismiss-banner');
        const bannerText = document.getElementById('info-banner-text');
        const learnMoreLink = document.getElementById('info-banner-learn-more');

        if (!infoBanner || !dismissButton || !bannerText || !learnMoreLink) {
            return;
        }

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

        const isDismissed = getCookie(COOKIE_NAME) === 'true';

        if (!isDismissed) {
            const userLanguage = navigator.language || navigator.userLanguage || 'en';
            const language = userLanguage.toLowerCase().startsWith('de') ? 'de' : 'en';

            bannerText.innerHTML = translations[language].text;
            learnMoreLink.textContent = translations[language].learnMore;
            dismissButton.textContent = translations[language].dismiss;
            infoBanner.style.display = 'block';
        }

        dismissButton.addEventListener('click', function () {
            setCookie(COOKIE_NAME, 'true', COOKIE_MAX_AGE_DAYS);
            infoBanner.style.display = 'none';
        });
    }

    function initialize() {
        backToTopButton = document.getElementById('myBtn');

        toggleBackToTopButton();
        startBannerRotation();
        setupLightboxGallery();
        setupImprintReveal();
        loadStatcounter();
        setupInfoBanner();
    }

    document.addEventListener('DOMContentLoaded', initialize);
    window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
    window.topFunction = scrollToTop;
}());
