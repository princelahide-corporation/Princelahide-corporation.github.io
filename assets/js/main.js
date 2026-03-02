/* ============================================================
   PLCORP — Scripts partagés
   ============================================================ */

(function () {
  'use strict';

  /* ── THEME ── */
  const html = document.documentElement;
  const STORAGE_KEY = 'plcorp-theme';
  let currentTheme = localStorage.getItem(STORAGE_KEY) || 'light';

  function applyTheme(theme, animate) {
    html.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    // Sync all toggles on page
    document.querySelectorAll('.tt-input').forEach(el => {
      el.checked = theme === 'light';
    });
  }

  // Apply immediately to avoid flash
  applyTheme(currentTheme, false);

  function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
  }

  /* ── INIT TOGGLE ── */
  function initToggles() {
    document.querySelectorAll('.tt-input').forEach(el => {
      el.checked = currentTheme === 'light';
      el.addEventListener('change', toggleTheme);
    });
    document.querySelectorAll('.theme-toggle').forEach(el => {
      el.addEventListener('click', function (e) {
        if (e.target.tagName !== 'INPUT') toggleTheme();
      });
    });
  }

  /* ── NAVIGATION ── */
  function initNav() {
    //const navbar = document.getElementById('navbar');
    const burger = document.querySelector('.burger');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav-close');

    // Navbar scroll behavior
    /*if (navbar) {
      let lastScrollY = "0";
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) {
          navbar.style.background = currentTheme === 'dark'
            ? 'rgba(10,14,26,0.97)' : 'rgba(240,244,255,0.97)';
        } else {
          navbar.style.background = '';
        }
        lastScrollY = y;
      }, { passive: true });
    }*/

    // Burger
    if (burger && mobileNav) {
      const open = () => {
        mobileNav.classList.add('open');
        burger.classList.add('open');
        document.body.style.overflow = 'hidden';
      };
      const close = () => {
        mobileNav.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      };
      burger.addEventListener('click', () => {
        mobileNav.classList.contains('open') ? close() : open();
      });
      if (closeBtn) closeBtn.addEventListener('click', close);
      mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }
  }

  /* ── REVEAL ON SCROLL ── */
  function initReveal() {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ── COUNTER ANIMATION ── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;
        const suffix = el.dataset.suffix || '';
        const isFloat = el.dataset.float === 'true';
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
          if (!now) now = performance.now();
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const value = target * ease;
          el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => obs.observe(el));
  }

  /* ── HERO CANVAS ── */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isVisible = true;
    let W, H, particles = [], animId;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((W * H) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.5 + 0.3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.4 + 0.1),
          alpha: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * Math.PI * 2,
          blue: Math.random() > 0.6,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const isDark = html.getAttribute('data-theme') !== 'light';
      particles.forEach(p => {
        p.pulse += 0.02;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        const color = p.blue
          ? (isDark ? `rgba(41,121,255,${alpha})` : `rgba(0,85,255,${alpha * 0.5})`)
          : (isDark ? `rgba(123,47,190,${alpha})` : `rgba(123,47,190,${alpha * 0.4})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      if (isVisible) animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    const ro = new ResizeObserver(() => { resize(); createParticles(); });
    ro.observe(canvas.parentElement);

    // Optimization: Pause animation when off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) draw();
      else cancelAnimationFrame(animId);
    });
    observer.observe(canvas);
  }

  /* ── FAQ ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-question');
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── POLE NAV PILLS (services page) ── */
  function initPoleNav() {
    const pills = document.querySelectorAll('.pole-nav-pill[data-target]');
    if (!pills.length) return;

    const sections = {};
    pills.forEach(pill => {
      const id = pill.dataset.target;
      const sec = document.getElementById(id);
      if (sec) sections[id] = sec;
    });

    const scrollPillIntoView = (pill) => {
      if (!pill) return;
      // scrollIntoView est une API native qui amène l'élément dans la zone visible de son parent scrollable.
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    // Au scroll, met à jour la pilule active et s'assure qu'elle est visible
    window.addEventListener('scroll', () => {
      let activeTarget = null;
      // Le seuil est la position haute de la barre (72px) + sa hauteur (env. 54px) + une marge
      const threshold = 160;

      Object.entries(sections).forEach(([id, sec]) => {
        if (sec.getBoundingClientRect().top <= threshold) {
          activeTarget = id;
        }
      });

      pills.forEach(p => {
        const shouldBeActive = p.dataset.target === activeTarget;
        const isCurrentlyActive = p.classList.contains('active');

        if (shouldBeActive && !isCurrentlyActive) {
          p.classList.add('active');
          scrollPillIntoView(p); // Scrolle quand l'élément devient actif
        } else if (!shouldBeActive && isCurrentlyActive) {
          p.classList.remove('active');
        }
      });
    }, { passive: true });

    // Pour l'accessibilité, scrolle aussi au focus clavier
    pills.forEach(pill => {
      pill.addEventListener('focus', () => {
        scrollPillIntoView(pill);
      });
    });
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  function initSmoothAnchor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── BOOT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initToggles();
    initNav();
    initReveal();
    initCounters();
    initHeroCanvas();
    initFAQ();
    initPoleNav();
    initSmoothAnchor();
  });

})();
