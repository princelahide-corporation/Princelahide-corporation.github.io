/* ============================================================
   PLCORP — main.js  v2.0
   Animations, interactions, cursor, counter, canvas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- CUSTOM CURSOR ---------- */
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot && ring) {
        let mx = 0,
            my = 0,
            rx = 0,
            ry = 0;
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        });
        (function track() {
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
            rx += (mx - rx) * 0.14;
            ry += (my - ry) * 0.14;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(track);
        })();
    }

    /* ---------- NAVBAR SCROLL ---------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        });
    }

    /* ---------- BURGER MENU ---------- */
    const burger = document.querySelector('.burger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileClose = document.querySelector('.mobile-nav-close');
    if (burger && mobileNav) {
        burger.addEventListener('click', () => mobileNav.classList.add('open'));
    }
    if (mobileClose && mobileNav) {
        mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
    }
    if (mobileNav) {
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => mobileNav.classList.remove('open'));
        });
    }

    /* ---------- SCROLL REVEAL ---------- */
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObserver.observe(el));

    /* ---------- ANIMATED COUNTERS ---------- */
    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const isFloat = el.getAttribute('data-float') === 'true';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = target * ease;
            el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCounter(e.target);
                counterObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

    /* ---------- HERO CANVAS (Animated Grid + Particles) ---------- */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [],
            animId;

        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
                this.color = Math.random() > 0.5 ? '#F0A500' : '#06B6D4';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.round(this.alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }
        }
        for (let i = 0; i < 80; i++) particles.push(new Particle());

        let t = 0;

        function draw() {
            ctx.clearRect(0, 0, W, H);
            t += 0.006;

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.025)';
            ctx.lineWidth = 1;
            const gSize = 70;
            const offsetX = (t * 12) % gSize;
            const offsetY = (t * 6) % gSize;
            for (let x = -gSize + offsetX; x < W + gSize; x += gSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = -gSize + offsetY; y < H + gSize; y += gSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }

            // Glow pulses
            const cx1 = W * 0.25,
                cy1 = H * 0.45;
            const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 300 + Math.sin(t) * 50);
            g1.addColorStop(0, 'rgba(6,182,212,0.07)');
            g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, W, H);

            const cx2 = W * 0.75,
                cy2 = H * 0.55;
            const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 250 + Math.cos(t * 0.7) * 40);
            g2.addColorStop(0, 'rgba(240,165,0,0.06)');
            g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, W, H);

            // Particles & connections
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(240,165,0,${0.12 * (1 - dist/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animId = requestAnimationFrame(draw);
        }
        draw();
    }

    /* ---------- PAGE TRANSITIONS ---------- */
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href.startsWith('#') && href.endsWith('.html') && !link.hasAttribute('target')) {
            link.addEventListener('click', e => {
                e.preventDefault();
                const overlay = document.getElementById('page-transition');
                if (overlay) {
                    overlay.style.transition = 'transform 0.4s cubic-bezier(0.7,0,0.3,1)';
                    overlay.classList.add('active');
                    setTimeout(() => { window.location.href = href; }, 380);
                } else {
                    window.location.href = href;
                }
            });
        }
    });
    // Reveal page on load
    window.addEventListener('load', () => {
        const overlay = document.getElementById('page-transition');
        if (overlay) {
            overlay.style.transition = 'transform 0.6s cubic-bezier(0.7,0,0.3,1)';
            overlay.style.transform = 'translateY(-100%)';
        }
    });

    /* ---------- ACTIVE NAV LINK ---------- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
        const lhref = link.getAttribute('href');
        if (lhref && lhref.includes(currentPage)) link.classList.add('active');
    });

    /* ---------- CONTACT FORM ---------- */
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit');
            const originalText = btn.innerHTML;

            btn.textContent = 'Envoi...';
            btn.disabled = true;

            const formData = new FormData(form);

            fetch('send_mail.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        form.style.display = 'none';
                        const success = document.getElementById('form-success');
                        if (success) success.classList.add('show');
                    } else {
                        alert('Erreur : ' + data.message);
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Une erreur est survenue. Veuillez réessayer.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }

    /* ---------- FAQ ACCORDION (Contact Page) ---------- */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    /* ---------- POLE CARD TILT ---------- */
    document.querySelectorAll('.pole-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `translateY(-8px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg)`;
            card.style.perspective = '800px';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ---------- STAGGER HERO ANIMATION ---------- */
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-desc, .hero-actions');
    heroElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.7s ${0.2 + i*0.12}s, transform 0.7s ${0.2 + i*0.12}s cubic-bezier(0.16,1,0.3,1)`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    });

});