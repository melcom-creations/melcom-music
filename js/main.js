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

    const RANDOM_TRACK_LINKS = [
        'music-2019.html#amartiansong',
        'music-2019.html#desolaterunner3',
        'music-2019.html#oblivion',
        'music-2019.html#remainsoftheday',
        'music-2020.html#mechlovesong',
        'music-2020.html#methmad',
        'music-2020.html#thespaceweare',
        'music-2021.html#haunted',
        'music-2021.html#headlock',
        'music-2021.html#nightair',
        'music-2022.html#fernweh2',
        'music-2022.html#stroke',
        'music-2023.html#pyramidsong',
        'music-2023.html#rotten',
        'music-2024.html#crumble',
        'music-2024.html#pixelmoves',
        'music-2025.html#fernweh_3_echofall',
        'music-2025.html#monsters',
        'music-2025.html#pixelvielfalt',
        'music-2025.html#silk_and_sax',
        'music-2025.html#splintered_mindscape'
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

    function setupNavigation() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        const siteNavigation = document.querySelector('.site-navigation');
        const navToggle = siteNavigation ? siteNavigation.querySelector('.nav-toggle') : null;
        const navMenu = siteNavigation ? siteNavigation.querySelector('.nav-container') : null;
        const activeItem = siteNavigation ? siteNavigation.querySelector('.nav-active') : null;

        if (activeItem) {
            activeItem.setAttribute('aria-current', 'page');
        }

        function setNavigationExpanded(willExpand) {
            if (!siteNavigation || !navToggle) {
                return;
            }

            siteNavigation.classList.toggle('is-expanded', willExpand);
            navToggle.setAttribute('aria-expanded', String(willExpand));
        }

        if (siteNavigation && navToggle && navMenu) {
            siteNavigation.classList.add('is-enhanced');

            navToggle.addEventListener('click', function () {
                const willExpand = navToggle.getAttribute('aria-expanded') !== 'true';
                setNavigationExpanded(willExpand);
            });

            navMenu.addEventListener('click', function (event) {
                if (event.target.closest('a') && window.matchMedia('(max-width: 700px)').matches) {
                    setNavigationExpanded(false);
                }
            });

            siteNavigation.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && window.matchMedia('(max-width: 700px)').matches) {
                    setNavigationExpanded(false);
                    navToggle.focus();
                }
            });
        }

        function closeDropdown(dropdown, returnFocus) {
            const button = dropdown.querySelector('.nav-dropbtn, .page-dropdown-btn');

            if (!button) {
                return;
            }

            dropdown.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');

            if (returnFocus) {
                button.focus();
            }
        }

        function closeOtherDropdowns(currentDropdown) {
            dropdowns.forEach(function (dropdown) {
                if (dropdown !== currentDropdown) {
                    closeDropdown(dropdown, false);
                }
            });
        }

        dropdowns.forEach(function (dropdown) {
            const button = dropdown.querySelector('.nav-dropbtn, .page-dropdown-btn');
            const menu = dropdown.querySelector('.nav-dropdown-content, .page-year-menu');

            if (!button || !menu) {
                return;
            }

            button.addEventListener('click', function () {
                const willOpen = button.getAttribute('aria-expanded') !== 'true';
                closeOtherDropdowns(dropdown);
                dropdown.classList.toggle('is-open', willOpen);
                button.setAttribute('aria-expanded', String(willOpen));

                if (willOpen) {
                    const firstLink = menu.querySelector('a');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            });

            dropdown.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeDropdown(dropdown, true);
                }
            });

            dropdown.addEventListener('focusout', function (event) {
                if (!dropdown.contains(event.relatedTarget)) {
                    closeDropdown(dropdown, false);
                }
            });
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.nav-dropdown')) {
                dropdowns.forEach(function (dropdown) {
                    closeDropdown(dropdown, false);
                });
            }
        });
    }
    function startBannerRotation() {
        const bannerElement = document.getElementById('header-banner');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!bannerElement || BANNER_IMAGES.length < 2 || reduceMotion) {
            return;
        }

        let currentIndex = BANNER_IMAGES.findIndex(function (path) {
            return bannerElement.src.includes(path);
        });

        if (currentIndex === -1) {
            currentIndex = 0;
        }

        function cycleBanner() {
            let nextIndex = currentIndex;

            do {
                nextIndex = Math.floor(Math.random() * BANNER_IMAGES.length);
            } while (nextIndex === currentIndex);

            const nextImage = new Image();

            nextImage.addEventListener('load', function () {
                bannerElement.style.opacity = '0';

                setTimeout(function () {
                    currentIndex = nextIndex;
                    bannerElement.src = BANNER_IMAGES[currentIndex];
                    bannerElement.style.opacity = '1';
                    setTimeout(cycleBanner, BANNER_DISPLAY_DURATION);
                }, BANNER_FADE_DURATION);
            }, { once: true });

            nextImage.addEventListener('error', function () {
                setTimeout(cycleBanner, BANNER_DISPLAY_DURATION);
            }, { once: true });

            nextImage.src = BANNER_IMAGES[nextIndex];
        }

        setTimeout(cycleBanner, BANNER_DISPLAY_DURATION);
    }

    function openLightbox(modal, modalImage, thumbnails, closeButton, triggerLink) {
        const image = triggerLink.querySelector('img');
        const parentGroup = triggerLink.closest('.screenshot-grid');

        if (thumbnails) {
            thumbnails.innerHTML = '';
        }

        if (parentGroup && thumbnails) {
            const galleryLinks = parentGroup.querySelectorAll('.track-image-link');

            if (galleryLinks.length > 1) {
                galleryLinks.forEach(function (galleryLink) {
                    const thumbButton = document.createElement('button');
                    const thumbImage = document.createElement('img');
                    const sourceImage = galleryLink.querySelector('img');

                    if (!sourceImage) {
                        return;
                    }

                    thumbButton.type = 'button';
                    thumbButton.className = 'modal-thumbnail-button';
                    thumbButton.setAttribute('aria-label', 'View ' + sourceImage.alt);
                    thumbImage.src = sourceImage.src;
                    thumbImage.alt = '';

                    if (galleryLink === triggerLink) {
                        thumbButton.classList.add('active-thumb');
                        thumbButton.setAttribute('aria-current', 'true');
                    }

                    thumbButton.addEventListener('click', function () {
                        modalImage.src = galleryLink.href;
                        modalImage.alt = sourceImage.alt;

                        thumbnails.querySelectorAll('.modal-thumbnail-button').forEach(function (button) {
                            button.classList.remove('active-thumb');
                            button.removeAttribute('aria-current');
                        });

                        thumbButton.classList.add('active-thumb');
                        thumbButton.setAttribute('aria-current', 'true');
                    });

                    thumbButton.appendChild(thumbImage);
                    thumbnails.appendChild(thumbButton);
                });
            }
        }

        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modalImage.src = triggerLink.href;
        modalImage.alt = image ? image.alt : 'Enlarged image';
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    }

    function closeLightbox(modal, restoreTarget) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';

        if (restoreTarget && document.contains(restoreTarget)) {
            restoreTarget.focus();
        }
    }

    function setupLightboxGallery() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeButton = document.querySelector('.modal-close');
        const thumbnails = document.getElementById('modalThumbnails');
        const imageLinks = document.querySelectorAll('.track-image-link');
        let restoreTarget = null;

        if (!modal || !modalImage || !closeButton) {
            return;
        }

        imageLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                restoreTarget = link;
                openLightbox(modal, modalImage, thumbnails, closeButton, link);
            });
        });

        closeButton.addEventListener('click', function () {
            closeLightbox(modal, restoreTarget);
        });

        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeLightbox(modal, restoreTarget);
            }
        });

        modal.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeLightbox(modal, restoreTarget);
                return;
            }

            if (event.key === 'Tab') {
                const focusable = Array.from(modal.querySelectorAll('button:not([disabled])'));

                if (focusable.length === 0) {
                    event.preventDefault();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
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

    function setupArchiveYears() {
        const toggles = document.querySelectorAll('[data-archive-year-toggle]');
        const yearLinks = document.querySelectorAll('.page-year-menu a[href^="#"]');
        const allYearLinks = document.querySelectorAll('.page-year-menu a');

        function updateYearIndicator(link, currentValue) {
            if (!link) {
                return;
            }

            const dropdown = link.closest('.page-year-dropdown');
            const label = dropdown ? dropdown.querySelector('.page-dropdown-label') : null;

            if (label) {
                label.textContent = 'Year: ' + link.textContent.trim();
            }

            link.setAttribute('aria-current', currentValue);
        }

        const presetActiveYear = document.querySelector('.page-year-menu a.nav-active');

        if (presetActiveYear) {
            updateYearIndicator(presetActiveYear, 'true');
        }

        function setArchiveYearState(toggle, willExpand) {
            const targetId = toggle.getAttribute('aria-controls');
            const target = document.getElementById(targetId);
            const icon = toggle.querySelector('.archive-year-icon');
            const note = toggle.querySelector('.archive-year-note');
            const collapsedNote = toggle.dataset.collapsedNote || '';
            const expandedNote = toggle.dataset.expandedNote || collapsedNote;

            if (!target) {
                return;
            }

            toggle.setAttribute('aria-expanded', String(willExpand));
            target.hidden = !willExpand;

            if (icon) {
                icon.textContent = willExpand ? '▼' : '▶';
            }

            if (note) {
                note.textContent = willExpand ? expandedNote : collapsedNote;
            }
        }

        toggles.forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                const willExpand = toggle.getAttribute('aria-expanded') !== 'true';
                setArchiveYearState(toggle, willExpand);
            });
        });

        function openArchiveYear(hash, shouldScroll) {
            if (!hash || hash.charAt(0) !== '#') {
                return false;
            }

            const yearCell = document.getElementById(decodeURIComponent(hash.slice(1)));
            const toggle = yearCell
                ? yearCell.querySelector('[data-archive-year-toggle]')
                : null;

            if (!toggle) {
                return false;
            }

            setArchiveYearState(toggle, true);

            const selectedLink = Array.from(yearLinks).find(function (link) {
                return link.getAttribute('href') === hash;
            });

            if (selectedLink) {
                allYearLinks.forEach(function (link) {
                    link.classList.remove('nav-active');
                    link.removeAttribute('aria-current');
                });
                selectedLink.classList.add('nav-active');
                updateYearIndicator(selectedLink, 'location');
            }

            if (shouldScroll) {
                yearCell.scrollIntoView({ block: 'start' });
            }

            return true;
        }

        yearLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                const hash = link.getAttribute('href');

                if (!openArchiveYear(hash, true)) {
                    return;
                }

                event.preventDefault();

                const dropdown = link.closest('.page-year-dropdown');
                const dropdownButton = dropdown
                    ? dropdown.querySelector('.page-dropdown-btn')
                    : null;

                if (dropdown) {
                    dropdown.classList.remove('is-open');
                }

                if (dropdownButton) {
                    dropdownButton.setAttribute('aria-expanded', 'false');
                }

                if (window.location.hash !== hash) {
                    window.history.pushState(null, '', hash);
                }
            });
        });

        openArchiveYear(window.location.hash, false);

        window.addEventListener('hashchange', function () {
            openArchiveYear(window.location.hash, true);
        });

        document.querySelectorAll('[data-archive-expand-all]').forEach(function (button) {
            button.addEventListener('click', function () {
                const archive = button.closest('.content-box');
                const archiveToggles = archive
                    ? archive.querySelectorAll('[data-archive-year-toggle]')
                    : toggles;

                archiveToggles.forEach(function (toggle) {
                    if (!toggle.hasAttribute('data-archive-spoiler')) {
                        setArchiveYearState(toggle, true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-archive-collapse-all]').forEach(function (button) {
            button.addEventListener('click', function () {
                const archive = button.closest('.content-box');
                const archiveToggles = archive
                    ? archive.querySelectorAll('[data-archive-year-toggle]')
                    : toggles;

                archiveToggles.forEach(function (toggle) {
                    setArchiveYearState(toggle, false);
                });
            });
        });
    }
    function setupLinkExplorer() {
        const input = document.getElementById('link-search-input');
        const clearButton = document.querySelector('[data-clear-link-search]');
        const status = document.getElementById('link-search-status');
        const categories = Array.from(document.querySelectorAll('.link-category'));
        const items = Array.from(document.querySelectorAll('.link-category .link-list li'));

        if (!input || !clearButton || !status || categories.length === 0) {
            return;
        }

        function applyFilter() {
            const query = input.value.trim().toLocaleLowerCase();
            let visibleItems = 0;

            categories.forEach(function (category) {
                const categoryItems = Array.from(category.querySelectorAll('.link-list li'));
                let visibleInCategory = 0;

                categoryItems.forEach(function (item) {
                    const isVisible = query === '' || item.textContent.toLocaleLowerCase().includes(query);
                    item.hidden = !isVisible;

                    if (isVisible) {
                        visibleItems += 1;
                        visibleInCategory += 1;
                    }
                });

                category.hidden = query !== '' && visibleInCategory === 0;
            });

            clearButton.hidden = query === '';

            if (query === '') {
                status.textContent = items.length + ' curated links across ' + categories.length + ' categories.';
            } else if (visibleItems === 1) {
                status.textContent = '1 matching link.';
            } else {
                status.textContent = visibleItems + ' matching links.';
            }
        }

        function clearFilter() {
            input.value = '';
            applyFilter();
        }

        input.addEventListener('input', applyFilter);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && input.value !== '') {
                clearFilter();
            }
        });

        clearButton.addEventListener('click', function () {
            clearFilter();
            input.focus();
        });

        document.querySelectorAll('.link-category-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (input.value !== '') {
                    clearFilter();
                }
            });
        });

        applyFilter();
    }
    function setupRandomTrack() {
        const button = document.querySelector('[data-random-track]');

        if (!button || RANDOM_TRACK_LINKS.length === 0) {
            return;
        }

        button.addEventListener('click', function () {
            const targetIndex = Math.floor(Math.random() * RANDOM_TRACK_LINKS.length);
            window.location.href = RANDOM_TRACK_LINKS[targetIndex];
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
        setupNavigation();
        startBannerRotation();
        setupLightboxGallery();
        setupImprintReveal();
        setupArchiveYears();
        setupLinkExplorer();
        setupRandomTrack();
        loadStatcounter();
        setupInfoBanner();
    }

    document.addEventListener('DOMContentLoaded', initialize);
    window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
    window.topFunction = scrollToTop;
}());
