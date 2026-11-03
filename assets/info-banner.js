/* Restore the original analytics notice and its dismissal cookie. */
(() => {
  'use strict';

  const cookieName = 'melcom_info_banner_dismissed';
  const cookieMaxAgeDays = 365;

  function isDismissed() {
    try {
      return document.cookie.split(';').some(cookie => cookie.trim() === `${cookieName}=true`);
    } catch {
      return false;
    }
  }

  function loadStatcounter() {
    if (document.getElementById('statcounter-script')) return;
    window.sc_project = 13174008;
    window.sc_invisible = 1;
    window.sc_security = 'b2c21c8e';

    const script = document.createElement('script');
    script.id = 'statcounter-script';
    script.src = 'https://www.statcounter.com/counter/counter.js';
    script.async = true;
    document.body.appendChild(script);
  }

  loadStatcounter();

  const banner = document.getElementById('info-banner');
  const dismissButton = document.getElementById('btn-dismiss-banner');
  const bannerText = document.getElementById('info-banner-text');
  const learnMoreLink = document.getElementById('info-banner-learn-more');
  if (!banner || !dismissButton || !bannerText || !learnMoreLink) return;

  const translations = {
    en: {
      text: 'This website uses an analytics service to understand which content is popular. By continuing to use this site, you agree to this.',
      learnMore: 'Learn More',
      dismiss: 'OK',
      label: 'Analytics notice'
    },
    de: {
      text: 'Diese Webseite nutzt einen Analysedienst, um zu verstehen, welche Inhalte beliebt sind. Durch die weitere Nutzung der Webseite stimmst du dem zu.',
      learnMore: 'Weitere Informationen',
      dismiss: 'OK',
      label: 'Hinweis zur Webanalyse'
    }
  };

  const userLanguage = navigator.language || navigator.userLanguage || 'en-US';
  const language = userLanguage.toLowerCase().startsWith('de') ? 'de' : 'en';
  const translation = translations[language];
  banner.lang = language === 'de' ? 'de' : 'en-US';
  banner.setAttribute('aria-label', translation.label);
  bannerText.textContent = translation.text;
  learnMoreLink.textContent = translation.learnMore;
  dismissButton.textContent = translation.dismiss;
  banner.hidden = isDismissed();

  // Reserve the notice height so the footer and floating control stay reachable.
  function updateBannerHeight() {
    const height = banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--info-banner-height', `${height}px`);
    window.dispatchEvent(new Event('info-banner-change'));
  }

  dismissButton.addEventListener('click', () => {
    const expires = new Date(Date.now() + cookieMaxAgeDays * 24 * 60 * 60 * 1000);
    try {
      document.cookie = `${cookieName}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch {
      // Visitors can still close the notice when browser storage is unavailable.
    }
    banner.hidden = true;
    updateBannerHeight();
  });

  window.addEventListener('resize', updateBannerHeight);
  if ('ResizeObserver' in window) new ResizeObserver(updateBannerHeight).observe(banner);
  updateBannerHeight();
})();
