/* ==========================================================================
   MAIN JAVASCRIPT
   ==========================================================================
   1. Back to Top Button
   2. Header Banner Fader
   3. Image Lightbox & Thumbnail Gallery
   4. Imprint Reveal
   5. Analytics Tracking & Cookie Consent Banner
   ========================================================================== */
/* 1. Back to Top Button */
var mybutton = document.getElementById("myBtn");

function scrollFunction() {
	if(mybutton) {
		// Show the button after a small scroll
		if(document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			mybutton.style.display = "block";
		} else {
			mybutton.style.display = "none";
		}
	}
}
// Scroll to the top of the page
function topFunction() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}
window.onscroll = scrollFunction;
/* DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function() {
	/* 2. Header Banner Fader */
	const banners = ['images/header/header-image03.png', 'images/header/header-image04.png', 'images/header/header-image07.png', 'images/header/header-image12.png', 'images/header/header-image14.png', 'images/header/header-image15.png', 'images/header/header-image16.png', ];
	const displayDuration = 10000;
	const fadeDuration = 1000;
	const bannerElement = document.getElementById('header-banner');
	if(bannerElement) {
		let currentIndex = banners.findIndex(path => bannerElement.src.includes(path));
		if(currentIndex === -1) currentIndex = 0;
				banners.forEach(src => {
			(new Image()).src = src;
		});

		function cycleBanner() {
						bannerElement.style.opacity = 0;
						setTimeout(() => {
				let nextIndex;
								do {
					nextIndex = Math.floor(Math.random() * banners.length);
				} while (banners.length > 1 && nextIndex === currentIndex);
				currentIndex = nextIndex;
				bannerElement.src = banners[currentIndex];
								setTimeout(() => {
					bannerElement.style.opacity = 1;
					setTimeout(cycleBanner, displayDuration);
				}, 50);
			}, fadeDuration);
		}
				setTimeout(cycleBanner, displayDuration);
	}
	/* 3. Image Lightbox & Thumbnail Gallery */
	const modal = document.getElementById("imageModal");
	const modalImg = document.getElementById("modalImage");
	const closeBtn = document.querySelector(".modal-close");
	const imageLinks = document.querySelectorAll('.track-image-link');
	const modalThumbnails = document.getElementById("modalThumbnails");
	if(modal && modalImg && closeBtn) {
		imageLinks.forEach(link => {
			link.addEventListener('click', function(event) {
				event.preventDefault();
								if(modalThumbnails) {
					modalThumbnails.innerHTML = '';
										const parentGroup = this.closest('.screenshot-grid');
					if(parentGroup) {
						const galleryLinks = parentGroup.querySelectorAll('.track-image-link');
												if(galleryLinks.length > 1) {
							galleryLinks.forEach(galLink => {
								const thumbImg = document.createElement('img');
								thumbImg.src = galLink.querySelector('img').src;
								thumbImg.alt = galLink.querySelector('img').alt;
																if(galLink === this) {
									thumbImg.classList.add('active-thumb');
								}
																thumbImg.addEventListener('click', function(e) {
									e.stopPropagation();
									modalImg.src = galLink.href;
									modalImg.alt = galLink.querySelector('img').alt;
																		modalThumbnails.querySelectorAll('img').forEach(img => img.classList.remove('active-thumb'));
									this.classList.add('active-thumb');
								});
								modalThumbnails.appendChild(thumbImg);
							});
						}
					}
				}
								modal.style.display = "block";
				modalImg.src = this.href;
				modalImg.alt = this.querySelector('img').alt;
								document.body.style.overflow = "hidden";
			});
		});

		function closeModal() {
			modal.style.display = "none";
			document.body.style.overflow = "auto";
		}
		closeBtn.onclick = closeModal;
				modal.onclick = function(event) {
			if(event.target === modal || event.target === modalThumbnails) {
				closeModal();
			}
		};
				document.addEventListener('keydown', function(event) {
			if(event.key === "Escape" && modal.style.display === "block") {
				closeModal();
			}
		});
	}
	/* 4. Imprint Reveal */
	const requestDiv = document.getElementById('imprint-request');
	const detailsDiv = document.getElementById('imprint-details');
	const requestBtn = document.getElementById('imprint-request-btn');
	if(requestBtn) {
				requestBtn.addEventListener('click', function() {
			if(requestDiv) {
				requestDiv.style.display = 'none';
			}
			if(detailsDiv) {
				detailsDiv.style.display = 'block';
			}
		});
	}
	/* 5. Analytics Tracking & Cookie Consent Banner */
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
				if(!isDismissed) {
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
