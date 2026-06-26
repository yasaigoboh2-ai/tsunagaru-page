const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const planTabs = document.querySelectorAll('.plan-tab');
  const planPanels = document.querySelectorAll('.plan-panel');
  planTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      planTabs.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      planPanels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
        if (!panel.hidden) {
          panel.querySelectorAll('.reveal, .reveal-child').forEach((el) => el.classList.add('is-in'));
        }
      });
    });
  });

  // ── ナビ：スクロールで透明 → 半透明+blur ──
  const nav = document.querySelector('nav');
  if (nav) {
    const onNavScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 100);
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });
  }

  // ── ヒーローテキストの段階フェードイン ──
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.hero-fade').forEach((el) => el.classList.add('is-in'));
    });
  });

  // ── スクロールfade-up（IntersectionObserver） ──
  const staggerGroups = document.querySelectorAll('.js-stagger');
  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal-child');
      child.style.setProperty('--rd', `${Math.min(i, 6) * 0.1}s`);
    });
  });

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-child').forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.classList.contains('js-stagger')) {
            Array.from(entry.target.children).forEach((child) => child.classList.add('is-in'));
          } else {
            entry.target.classList.add('is-in');
          }
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal, .js-stagger').forEach((el) => revealObserver.observe(el));
  }

  // ── カスタムカーソル（デスクトップのみ） ──
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isDesktopPointer && !prefersReducedMotion) {
    document.body.classList.add('has-custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button, summary, .plan-tab').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
    });
  }

  // ── ヒーロー背景：ネットワークアニメーション ──
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('hero');
    let nodes = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let running = !prefersReducedMotion;
    let rafId = null;

    const NODE_COLOR = '240,234,216';
    const LINK_DIST = 150;

    const nodeCount = () => (window.innerWidth <= 768 ? 18 : 55);

    const createNodes = () => {
      const count = nodeCount();
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 2 + Math.random() * 2,
        a: 0.2 + Math.random() * 0.2,
      }));
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createNodes();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const lineAlpha = 0.08 + (1 - dist / LINK_DIST) * 0.07;
            ctx.strokeStyle = `rgba(${NODE_COLOR},${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${NODE_COLOR},${n.a})`;
        ctx.fill();
      });

      if (running) rafId = requestAnimationFrame(step);
    };

    resize();
    if (running) {
      rafId = requestAnimationFrame(step);
    } else {
      step();
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (prefersReducedMotion) return;
          if (entry.isIntersecting && !running) {
            running = true;
            rafId = requestAnimationFrame(step);
          } else if (!entry.isIntersecting && running) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
          }
        });
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);
  }
});
