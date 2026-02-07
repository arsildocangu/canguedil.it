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

// Contact Form - Mailto Raffinato
// Costruisce un'email precompilata con i dati del form
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Raccoglie i dati dal form
        const nome = document.getElementById('form-nome').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const telefono = document.getElementById('form-telefono').value.trim();
        const tipo = document.getElementById('form-tipo').value;
        const messaggio = document.getElementById('form-messaggio').value.trim();

        // Costruisce il subject
        const subject = `Richiesta Preventivo: ${tipo} - ${nome}`;

        // Costruisce il body dell'email in modo professionale
        const body = `Gentile Cangu Edil,

Vi contatto tramite il vostro sito web per richiedere un preventivo.

═══════════════════════════════════
📋 DETTAGLI RICHIESTA
═══════════════════════════════════

👤 Nome: ${nome}
📧 Email: ${email}
📞 Telefono: ${telefono}
🔧 Tipo Intervento: ${tipo}

═══════════════════════════════════
📝 DESCRIZIONE PROGETTO
═══════════════════════════════════

${messaggio}

═══════════════════════════════════

Resto in attesa di un vostro cortese riscontro.

Cordiali saluti,
${nome}

---
Messaggio inviato dal sito canguedil.it`;

        // Codifica per URL
        const mailtoUrl = `mailto:canguedil@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Apre il client email
        window.location.href = mailtoUrl;
    });
}

