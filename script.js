/* =========================================
   MedAid - Custom JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Sticky Navbar & Logo Swap ---
    const navbar = document.getElementById('navbar');
    const navLogoImg = document.getElementById('nav-logo-img');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if (navLogoImg) navLogoImg.src = 'medaid.png';
        } else {
            navbar.classList.remove('scrolled');
            if (navLogoImg) navLogoImg.src = 'medaidd.png';
        }
    });

    // --- Mobile Nav (Hamburger) ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const openMobileMenu = () => {
        mobileNavOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileMenu = () => {
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);

    // Close when any nav link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on backdrop click
    mobileNavOverlay.addEventListener('click', (e) => {
        if (e.target === mobileNavOverlay) closeMobileMenu();
    });

    // --- Dynamic Year for Copyright ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- Stats Ticker Count-Up Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    const countUp = (element) => {
        const target = +element.getAttribute('data-target');
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000; // ms
        const increment = target / (duration / 16); // roughly 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.innerText = Math.ceil(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = target + suffix;
            }
        };
        updateCounter();
    };

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
            hasCounted = true;
            statNumbers.forEach(stat => countUp(stat));
        }
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-ticker');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }



    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Testimonial Carousel Auto-Scroll (Simple) ---
    const carousel = document.querySelector('.testimonial-carousel');
    if (carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            carousel.scrollLeft = scrollLeft - walk;
        });
    }

    // --- Admission Probability Calculator ---
    const calcBtn = document.getElementById('calculate-btn');
    const gradeSelects = document.querySelectorAll('.grade-select');
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeLabel = document.getElementById('gauge-label');
    const calcAggregate = document.getElementById('calc-aggregate');
    const calcMessage = document.getElementById('calc-message');

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            // Sum all 8 subject grades (lower = better in WASSCE)
            let totalAggregate = 0;
            gradeSelects.forEach(select => {
                totalAggregate += parseInt(select.value);
            });

            // WASSCE aggregate for top healthcare programs (best 6 of 8 subjects used by most universities)
            // We'll use all 8 as entered, but note the best 6 would be lower
            // For a realistic feel, we simulate a "best 6" by subtracting worst 2
            const values = Array.from(gradeSelects).map(s => parseInt(s.value)).sort((a, b) => a - b);
            const bestSix = values.slice(0, 6).reduce((sum, v) => sum + v, 0);
            const finalAggregate = bestSix;

            // Medicine at KNUST usually requires aggregate 6-8.
            let probability = 0;
            let message = "";
            let strokeColor = "";

            if (finalAggregate <= 6) {
                probability = 95;
                message = "Excellent chances! You are highly competitive for KNUST Medicine.";
                strokeColor = "#10b981"; // Green
            } else if (finalAggregate <= 8) {
                probability = 75;
                message = "Good chances! You're in the competitive range, but it depends on the year's cutoff.";
                strokeColor = "#f59e0b"; // Yellow/Orange
            } else if (finalAggregate <= 10) {
                probability = 40;
                message = "Borderline. Consider applying for related programs like BDS, PharmD, or BSc Nursing as backups.";
                strokeColor = "#e31837"; // Red
            } else {
                probability = 10;
                message = "Very low chances for Medicine. Explore other excellent science/healthcare programs at KNUST.";
                strokeColor = "#94a3b8"; // Gray
            }

            // Animate Gauge (Circumference of semi-circle is ~125.6)
            // Stroke dasharray is 125.6. Offset = 125.6 - (probability / 100) * 125.6
            const offset = 125.6 - ((probability / 100) * 125.6);
            
            gaugeFill.style.strokeDashoffset = offset;
            gaugeFill.style.stroke = strokeColor;
            
            // Animate Number
            let currentProb = 0;
            const inc = probability / 30;
            const probInterval = setInterval(() => {
                currentProb += inc;
                if (currentProb >= probability) {
                    gaugeLabel.innerText = probability + "%";
                    clearInterval(probInterval);
                } else {
                    gaugeLabel.innerText = Math.floor(currentProb) + "%";
                }
            }, 30);

            calcAggregate.innerText = "Estimated Aggregate: " + finalAggregate;
            calcMessage.innerText = message;
        });
    }

    // --- Mentor Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const teamCards = document.querySelectorAll('.team-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            teamCards.forEach(card => {
                const year = card.getAttribute('data-year');
                const shs = card.getAttribute('data-shs');

                if (filterValue === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else if (filterValue === year || filterValue === shs) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

});
