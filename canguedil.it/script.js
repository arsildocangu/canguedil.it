// DOM Elements
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTopBtn = document.querySelector('.back-to-top');
const materialIcons = document.querySelectorAll('.material-icon-hero');
const materialIconsAbout = document.querySelectorAll('.material-icon-about');

// Menu Toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Sticky Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Back to Top Button
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Enhanced hover effect for hero icons
materialIcons.forEach(icon => {
    icon.addEventListener('mouseover', () => {
        // Stop animation during hover
        icon.style.animationPlayState = 'paused';
        icon.style.zIndex = '10';
        icon.style.color = 'var(--accent)';
        icon.style.transform = 'scale(1.2)';
    });
    
    icon.addEventListener('mouseout', () => {
        // Reset to original state
        icon.style.animationPlayState = 'running';
        icon.style.zIndex = '';
        icon.style.color = '';
        icon.style.transform = '';
    });
});

// Material Icons About Section Animation
materialIconsAbout.forEach(icon => {
    icon.addEventListener('mouseover', () => {
        materialIconsAbout.forEach(i => {
            i.style.opacity = '0.6';
        });
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1.2)';
        icon.style.zIndex = '10';
        icon.style.color = 'var(--accent)';
    });
    
    icon.addEventListener('mouseout', () => {
        materialIconsAbout.forEach(i => {
            i.style.opacity = '';
            i.style.transform = '';
            i.style.zIndex = '';
            i.style.color = '';
        });
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Reveal animations on scroll
const revealElements = document.querySelectorAll('.service-card, .about-content, .material-icons-container, .instagram-container, .maps-container');

function checkReveal() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - revealPoint) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Set initial styles for reveal elements
revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.8s ease';
});

// Check on load and scroll
window.addEventListener('load', checkReveal);
window.addEventListener('scroll', checkReveal);