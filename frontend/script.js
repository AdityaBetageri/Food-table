// ==================== TABLETAP LANDING PAGE SCRIPT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => preloader.classList.add('hidden'), 800);
        });
        // Fallback
        setTimeout(() => preloader.classList.add('hidden'), 3000);
    }

    // ==================== NAVBAR SCROLL ====================
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (navbar) {
            navbar.classList.toggle('scrolled', currentScroll > 50);
        }
        if (backToTop) {
            backToTop.classList.toggle('visible', currentScroll > 400);
        }
        lastScroll = currentScroll;
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== HAMBURGER MENU ====================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ==================== ACTIVE NAV LINK ON SCROLL ====================
    const sections = document.querySelectorAll('section[id]');
    const navLinkAll = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinkAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);

    // ==================== HERO COUNTER ANIMATION ====================
    const counters = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }

    // Start counters when hero is visible
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const heroObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) animateCounters();
        }, { threshold: 0.3 });
        heroObserver.observe(heroSection);
    }

    // ==================== HERO PARTICLES ====================
    function createParticles(containerId, count = 30) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position:absolute;
                width:${Math.random() * 4 + 1}px;
                height:${Math.random() * 4 + 1}px;
                background:rgba(255,255,255,${Math.random() * 0.3 + 0.1});
                border-radius:50%;
                top:${Math.random() * 100}%;
                left:${Math.random() * 100}%;
                animation:particleFloat ${Math.random() * 10 + 8}s ease-in-out ${Math.random() * 5}s infinite;
            `;
            container.appendChild(particle);
        }
    }

    // Add particle animation style
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes particleFloat {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            25% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.2); opacity: 0.8; }
            50% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(0.8); opacity: 0.3; }
            75% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.1); opacity: 0.6; }
        }
    `;
    document.head.appendChild(particleStyle);

    createParticles('hero-particles', 40);
    createParticles('cta-particles', 25);

    // ==================== DASHBOARD TABS ====================
    const dashTabs = document.querySelectorAll('.dash-tab');
    const dashPanels = document.querySelectorAll('.dash-content');

    dashTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            dashTabs.forEach(t => t.classList.remove('active'));
            dashPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById(`panel-${target}`);
            if (panel) panel.classList.add('active');
        });
    });

    // ==================== TESTIMONIAL SLIDER ====================
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.getElementById('test-dots');
    const prevBtn = document.getElementById('test-prev');
    const nextBtn = document.getElementById('test-next');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.testimonial-card');
        let currentSlide = 0;
        const totalSlides = cards.length;

        // Create dots
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `test-dot${i === 0 ? ' active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dotsContainer.querySelectorAll('.test-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
        });

        // Auto slide
        setInterval(() => {
            goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
        }, 5000);
    }

    // ==================== PRICING TOGGLE ====================
    const pricingSwitch = document.getElementById('pricing-switch');
    const toggleMonthly = document.getElementById('toggle-monthly');
    const toggleAnnual = document.getElementById('toggle-annual');
    const priceElements = document.querySelectorAll('.price[data-monthly]');

    if (pricingSwitch) {
        let isAnnual = false;
        pricingSwitch.addEventListener('click', () => {
            isAnnual = !isAnnual;
            pricingSwitch.classList.toggle('active', isAnnual);
            if (toggleMonthly) toggleMonthly.classList.toggle('active', !isAnnual);
            if (toggleAnnual) toggleAnnual.classList.toggle('active', isAnnual);

            priceElements.forEach(el => {
                const monthly = el.getAttribute('data-monthly');
                const annual = el.getAttribute('data-annual');
                const targetPrice = isAnnual ? annual : monthly;
                // Animate price change
                el.style.transform = 'scale(0.8)';
                el.style.opacity = '0';
                setTimeout(() => {
                    el.textContent = targetPrice;
                    el.style.transform = 'scale(1)';
                    el.style.opacity = '1';
                }, 200);
            });
        });
    }

    // ==================== SCROLL REVEAL ANIMATIONS ====================
    const revealElements = document.querySelectorAll(
        '.feature-card, .step-card, .pricing-card, .benefit-item, .onb-step, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==================== FEATURE CARD TILT EFFECT ====================
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==================== FORM SUBMISSION ====================
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Creating Restaurant...</span> <div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;"></div>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<span>✓ Restaurant Created!</span>';
                btn.style.background = 'linear-gradient(135deg, #1E8449, #27AE60)';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    registerForm.reset();
                }, 2500);
            }, 2000);
        });
    }

    // ==================== SMOOTH SCROLL FOR NAV LINKS ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==================== TYPED TEXT EFFECT FOR HERO ====================
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const words = ['Done.', 'Easy.', 'Fast.', 'Smart.'];
        let wordIndex = 0;

        setInterval(() => {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(10px)';
            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;
                heroTitle.textContent = words[wordIndex];
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 300);
        }, 3000);

        heroTitle.style.transition = 'all 0.3s ease';
    }

    // ==================== COOKIE UTILS ====================
    function setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function removeCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;path=/;';
    }

    // ==================== AUTO REDIRECT ====================
    // If user is already logged in (has token) and has accepted cookies, redirect to app
    const authToken = getCookie('tabletap_token') || localStorage.getItem('tabletap_token');
    const cookiesAccepted = getCookie('tabletap_cookies_accepted') === 'true' || localStorage.getItem('cookiesAccepted') === 'true';

    if (authToken && cookiesAccepted) {
        console.log('🚀 Authenticated user detected. Redirecting to dashboard...');
        // Small delay to let preloader show or just redirect
        window.location.href = '/dashboard';
        return; // Stop further execution
    }

    // ==================== COOKIE BANNER ====================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('btn-accept-cookies');
    const declineCookiesBtn = document.getElementById('btn-decline-cookies');

    if (cookieBanner && acceptCookiesBtn) {
        const hasConsent = getCookie('tabletap_cookies_accepted');
        const hasDeclined = getCookie('tabletap_cookies_declined');

        if (!hasConsent && !hasDeclined && !localStorage.getItem('cookiesAccepted') && !localStorage.getItem('cookiesDeclined')) {
            cookieBanner.style.display = 'block';
        }

        acceptCookiesBtn.addEventListener('click', () => {
            setCookie('tabletap_cookies_accepted', 'true', 30);
            localStorage.setItem('cookiesAccepted', 'true'); // Fallback
            removeCookie('tabletap_cookies_declined');
            localStorage.removeItem('cookiesDeclined');
            cookieBanner.style.display = 'none';
            
            // Check for auto-redirect after acceptance
            const currentToken = getCookie('tabletap_token') || localStorage.getItem('tabletap_token');
            if (currentToken) {
                window.location.href = '/dashboard';
            }
        });

        if (declineCookiesBtn) {
            declineCookiesBtn.addEventListener('click', () => {
                setCookie('tabletap_cookies_declined', 'true', 30);
                localStorage.setItem('cookiesDeclined', 'true');
                removeCookie('tabletap_cookies_accepted');
                localStorage.removeItem('cookiesAccepted');
                cookieBanner.style.display = 'none';
            });
        }
    }

    console.log('🍽️ TableTap Landing Page Loaded Successfully!');
});
