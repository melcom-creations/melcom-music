/* ==========================================================================
   MAIN JAVASCRIPT
   ==========================================================================
   1. Back to Top Button
   2. Header Banner Fader
   3. Image Lightbox & Thumbnail Gallery
   4. Imprint Reveal
   5. Analytics Tracking & Cookie Consent Banner
   ========================================================================== */
/* --- 1. Back to Top Button --- */
var mybutton = document.getElementById("myBtn");

function scrollFunction() {
	if(mybutton) {
		// Display the button after scrolling down 20 pixels
		if(document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			mybutton.style.display = "block";
		} else {
			mybutton.style.display = "none";
		}
	}
}
// Scroll smoothly to the top of the document
function topFunction() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}
window.onscroll = scrollFunction;
/* --- DOMContentLoaded Wrapper --- */
// Ensure all scripts run only after the DOM is fully parsed and loaded
document.addEventListener('DOMContentLoaded', function() {
	/* --- 2. Header Banner Fader --- */
	const banners = ['images/header/header-image03.png', 'images/header/header-image04.png', 'images/header/header-image07.png', 'images/header/header-image12.png', 'images/header/header-image14.png', 'images/header/header-image15.png', 'images/header/header-image16.png', ];
	const displayDuration = 10000;
	const fadeDuration = 1000;
	const bannerElement = document.getElementById('header-banner');
	if(bannerElement) {
		let currentIndex = banners.findIndex(path => bannerElement.src.includes(path));
		if(currentIndex === -1) currentIndex = 0;
		// Preload images to prevent flickering during transitions
		banners.forEach(src => {
			(new Image()).src = src;
		});

		function cycleBanner() {
			// Initiate fade-out by setting opacity to 0
			bannerElement.style.opacity = 0;
			// Wait for the CSS transition to complete before changing the source
			setTimeout(() => {
				let nextIndex;
				// Select a random next banner that is different from the current one
				do {
					nextIndex = Math.floor(Math.random() * banners.length);
				} while (banners.length > 1 && nextIndex === currentIndex);
				currentIndex = nextIndex;
				bannerElement.src = banners[currentIndex];
				// Allow a brief moment for the DOM to update before fading back in
				setTimeout(() => {
					bannerElement.style.opacity = 1;
					setTimeout(cycleBanner, displayDuration);
				}, 50);
			}, fadeDuration);
		}
		// Start the cycle after the initial display duration
		setTimeout(cycleBanner, displayDuration);
	}
	/* --- 3. Image Lightbox & Thumbnail Gallery --- */
	const modal = document.getElementById("imageModal");
	const modalImg = document.getElementById("modalImage");
	const closeBtn = document.querySelector(".modal-close");
	const imageLinks = document.querySelectorAll('.track-image-link');
	const modalThumbnails = document.getElementById("modalThumbnails");
	if(modal && modalImg && closeBtn) {
		imageLinks.forEach(link => {
			link.addEventListener('click', function(event) {
				event.preventDefault();
				// Dynamically build the thumbnail navigation if applicable
				if(modalThumbnails) {
					modalThumbnails.innerHTML = '';
					// Identify the parent container to group related images
					const parentGroup = this.closest('.screenshot-grid');
					if(parentGroup) {
						const galleryLinks = parentGroup.querySelectorAll('.track-image-link');
						// Only display the thumbnail strip if there are multiple images
						if(galleryLinks.length > 1) {
							galleryLinks.forEach(galLink => {
								const thumbImg = document.createElement('img');
								thumbImg.src = galLink.querySelector('img').src;
								thumbImg.alt = galLink.querySelector('img').alt;
								// Highlight the currently selected thumbnail
								if(galLink === this) {
									thumbImg.classList.add('active-thumb');
								}
								// Handle thumbnail clicks to swap the main modal image
								thumbImg.addEventListener('click', function(e) {
									e.stopPropagation();
									modalImg.src = galLink.href;
									modalImg.alt = galLink.querySelector('img').alt;
									// Update active state styling
									modalThumbnails.querySelectorAll('img').forEach(img => img.classList.remove('active-thumb'));
									this.classList.add('active-thumb');
								});
								modalThumbnails.appendChild(thumbImg);
							});
						}
					}
				}
				// Open the modal and set the initial image
				modal.style.display = "block";
				modalImg.src = this.href;
				modalImg.alt = this.querySelector('img').alt;
				// Prevent background scrolling while modal is open
				document.body.style.overflow = "hidden";
			});
		});

		function closeModal() {
			modal.style.display = "none";
			document.body.style.overflow = "auto";
		}
		closeBtn.onclick = closeModal;
		// Close modal when clicking outside the main image (on the backdrop or thumbnail container)
		modal.onclick = function(event) {
			if(event.target === modal || event.target === modalThumbnails) {
				closeModal();
			}
		};
		// Allow closing the modal using the Escape key
		document.addEventListener('keydown', function(event) {
			if(event.key === "Escape" && modal.style.display === "block") {
				closeModal();
			}
		});
	}
	/* --- 4. Imprint Reveal --- */
	const requestDiv = document.getElementById('imprint-request');
	const detailsDiv = document.getElementById('imprint-details');
	const requestBtn = document.getElementById('imprint-request-btn');
	if(requestBtn) {
		// Swap visibility states to reveal detailed imprint information
		requestBtn.addEventListener('click', function() {
			if(requestDiv) {
				requestDiv.style.display = 'none';
			}
			if(detailsDiv) {
				detailsDiv.style.display = 'block';
			}
		});
	}
	/* --- 5. Analytics Tracking & Cookie Consent Banner --- */
	// Asynchronously load the Statcounter tracking script
	function loadStatcounter() {
		window.sc_project = 13174008;
		window.sc_invisible = 1;
		window.sc_security = "b2c21c8e";
		const scScript = document.createElement('script');
		scScript.src = 'https://www.statcounter.com/counter/counter.js';
		scScript.async = true;
		document.body.appendChild(scScript);
	}
	loadStatcounter();
	const BANNER_COOKIE_NAME = 'melcom_info_banner_dismissed';
	const infoBanner = document.getElementById('info-banner');
	const dismissBtn = document.getElementById('btn-dismiss-banner');
	const bannerText = document.getElementById('info-banner-text');
	const learnMoreLink = document.getElementById('info-banner-learn-more');
	if(infoBanner && dismissBtn && bannerText && learnMoreLink) {
		// Define localized texts for the consent banner
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
			if(days) {
				const date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toUTCString();
			}
			document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
		}

		function getCookie(name) {
			const nameEQ = name + "=";
			const ca = document.cookie.split(';');
			for(let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while(c.charAt(0) === ' ') c = c.substring(1, c.length);
				if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		}
		const isDismissed = getCookie(BANNER_COOKIE_NAME) === 'true';
		// Display banner if the user hasn't dismissed it previously
		if(!isDismissed) {
			const userLang = navigator.language || navigator.userLanguage;
			const lang = userLang.startsWith('de') ? 'de' : 'en';
			// Apply translations based on user's browser language
			bannerText.innerHTML = translations[lang].text;
			learnMoreLink.textContent = translations[lang].learnMore;
			dismissBtn.textContent = translations[lang].dismiss;
			infoBanner.style.display = 'block';
		}
		// Handle banner dismissal and set the consent cookie for 1 year
		dismissBtn.addEventListener('click', function() {
			setCookie(BANNER_COOKIE_NAME, 'true', 365);
			infoBanner.style.display = 'none';
		});
	}
});