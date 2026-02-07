// DOM Elements
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTopBtn = document.querySelector('.back-to-top');

const setMenuState = (isOpen) => {
    if (!menuToggle || !navLinks) {
        return;
    }

    menuToggle.classList.toggle('active', isOpen);
    navLinks.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione');
};

const closeMenu = () => {
    setMenuState(false);
};

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = !menuToggle.classList.contains('active');
        setMenuState(isOpen);
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    }, { passive: true });

    document.addEventListener('click', (event) => {
        const clickedInsideMenu = navLinks.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);
        if (!clickedInsideMenu && !clickedToggle) {
            closeMenu();
        }
    });
}

const onScroll = () => {
    const scrollPosition = window.scrollY || window.pageYOffset;

    if (header) {
        header.classList.toggle('scrolled', scrollPosition > 40);
    }

    if (backToTopBtn) {
        backToTopBtn.classList.toggle('show', scrollPosition > 500);
    }
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId.length < 2) {
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (!targetElement) {
            return;
        }

        event.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = Math.max(
            0,
            targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight
        );

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// Reveal animations on scroll
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });
} else {
    revealItems.forEach(item => {
        item.classList.add('active');
    });
}

// Auto-elevate service cards on scroll
const serviceCards = document.querySelectorAll('.service-card');
if ('IntersectionObserver' in window && serviceCards.length > 0) {
    const serviceCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('active', entry.isIntersecting);
        });
    }, {
        threshold: 0.55,
        rootMargin: '0px'
    });

    serviceCards.forEach(card => {
        serviceCardObserver.observe(card);
    });
} else {
    serviceCards.forEach(card => {
        card.classList.add('active');
    });
}

// Contact Form Handling with Web3Forms
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');

// Check for success parameter in URL (redirect from Web3Forms)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true' && contactForm && formSuccess) {
    contactForm.style.display = 'none';
    formSuccess.style.display = 'block';
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Handle form submission via AJAX (no page reload)
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';

                // Scroll to show success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error(result.message || 'Errore durante l\'invio');
            }
        } catch (error) {
            console.error('Form error:', error);
            alert('Si è verificato un errore. Per favore riprova o contattaci telefonicamente.');

            // Reset button state
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
