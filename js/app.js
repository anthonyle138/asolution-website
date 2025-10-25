/**
 * A's Solution - Main Application JavaScript
 * Handles animations, interactions, and terminal simulation
 */

(function() {
    'use strict';

    // ============================================
    // Terminal Typing Animation
    // ============================================

    const terminalLines = [
        { text: '$ a-solution start', delay: 500, color: 'info' },
        { text: '[Task 1] Starting task...', delay: 800, color: 'default' },
        { text: '[Task 1] Logging into Lazada...', delay: 1200, color: 'default' },
        { text: '[Task 1] ✓ Login successful', delay: 1600, color: 'success' },
        { text: '[Task 1] Monitoring product...', delay: 2000, color: 'default' },
        { text: '[Task 1] ✓ Product available!', delay: 2400, color: 'success' },
        { text: '[Task 1] Adding to cart...', delay: 2800, color: 'default' },
        { text: '[Task 1] ✓ Checkout complete!', delay: 3200, color: 'success' }
    ];

    let currentLineIndex = 0;
    let isTyping = false;
    let hasStartedTerminal = false;

    function typeText(element, text, color, callback) {
        isTyping = true;
        let charIndex = 0;

        // Create line element
        const lineElement = document.createElement('div');
        lineElement.className = color === 'success' ? 'terminal-success' :
                               color === 'info' ? 'terminal-info' : '';
        element.appendChild(lineElement);

        function typeChar() {
            if (charIndex < text.length) {
                lineElement.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 50); // 50ms per character
            } else {
                isTyping = false;
                if (callback) callback();
            }
        }

        typeChar();
    }

    function typeNextLine() {
        if (currentLineIndex >= terminalLines.length) {
            // All lines typed, pause and restart
            setTimeout(() => {
                currentLineIndex = 0;
                const terminalOutput = document.getElementById('terminal-output');
                if (terminalOutput) {
                    terminalOutput.innerHTML = '';
                    setTimeout(typeNextLine, 1000);
                }
            }, 3000);
            return;
        }

        const line = terminalLines[currentLineIndex];
        const terminalOutput = document.getElementById('terminal-output');

        if (terminalOutput && !isTyping) {
            setTimeout(() => {
                typeText(terminalOutput, line.text, line.color, () => {
                    currentLineIndex++;
                    typeNextLine();
                });
            }, line.delay - (currentLineIndex > 0 ? terminalLines[currentLineIndex - 1].delay : 0));
        }
    }

    function startTerminal() {
        if (hasStartedTerminal) return;
        hasStartedTerminal = true;
        typeNextLine();
    }

    // ============================================
    // Scroll Reveal Animation
    // ============================================

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for children
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);

                // Start terminal animation when visible
                if (entry.target.classList.contains('terminal-window')) {
                    startTerminal();
                }

                // Animate stats counters when visible
                if (entry.target.classList.contains('stats-column')) {
                    animateCounters();
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Counter Animation
    // ============================================

    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        const counters = document.querySelectorAll('[data-target]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const start = 0;
            const increment = target / (duration / 16); // 60fps
            let current = start;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }

    // ============================================
    // FAQ Accordion
    // ============================================

    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const answer = faqItem.querySelector('.faq-answer');
                const isActive = faqItem.classList.contains('active');

                // Close all other FAQs
                document.querySelectorAll('.faq-item').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        const ans = item.querySelector('.faq-answer');
                        ans.style.maxHeight = null;
                    }
                });

                // Toggle current FAQ
                if (isActive) {
                    faqItem.classList.remove('active');
                    question.setAttribute('aria-expanded', 'false');
                    answer.style.maxHeight = null;
                } else {
                    faqItem.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });

            // Keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }

    // ============================================
    // Smooth Scroll
    // ============================================

    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Header Scroll Effect
    // ============================================

    function initHeaderScroll() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.background = 'rgba(24, 23, 29, 0.95)';
                header.style.boxShadow = '0 4px 16px rgba(184, 41, 248, 0.2)';
            } else {
                header.style.background = 'rgba(24, 23, 29, 0.8)';
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }

    // ============================================
    // Performance: Defer non-critical animations
    // ============================================

    function checkPerformance() {
        // Disable complex animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--timing-standard', '150ms');
            document.documentElement.style.setProperty('--timing-slow', '250ms');
        }
    }

    // ============================================
    // Easter Egg: Konami Code
    // ============================================

    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    function initKonamiCode() {
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.key);
            konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

            if (konamiCode.join('') === konamiSequence.join('')) {
                activateEasterEgg();
            }
        });
    }

    function activateEasterEgg() {
        // Change color scheme to rainbow
        document.documentElement.style.setProperty('--color-neon-purple', '#00FF85');

        // Add shake animation
        document.body.style.animation = 'shake 0.5s';

        setTimeout(() => {
            document.body.style.animation = '';
            document.documentElement.style.setProperty('--color-neon-purple', '#b829f8');
        }, 2000);

        console.log('🎮 Shadow Monarch Mode Activated!');
    }

    // ============================================
    // Analytics: Track CTA Clicks
    // ============================================

    function trackCTAClicks() {
        const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

        ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.trim();
                console.log(`CTA Clicked: ${text}`);

                // Add your analytics tracking here
                // Example: gtag('event', 'cta_click', { button_text: text });
            });
        });
    }

    // ============================================
    // Initialize Everything
    // ============================================

    function init() {
        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Disable animations
            document.documentElement.style.setProperty('--timing-standard', '0ms');
            document.documentElement.style.setProperty('--timing-slow', '0ms');
        }

        // Initialize components
        initScrollReveal();
        initFAQ();
        initSmoothScroll();
        initHeaderScroll();
        initKonamiCode();
        checkPerformance();
        trackCTAClicks();

        console.log('🚀 A\'s Solution initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // Utility: Console Message
    // ============================================

    console.log(
        '%c⚡ A\'s Solution - Lazada Bot ⚡',
        'color: #b829f8; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(184, 41, 248, 0.5);'
    );
    console.log(
        '%cDominate Every Checkout 🔥',
        'color: #EBBAF2; font-size: 14px;'
    );
    console.log(
        '%cWebsite by Solo Leveling Design System',
        'color: #463671; font-size: 12px; font-style: italic;'
    );

})();
