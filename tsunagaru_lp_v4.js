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
      child.style.setProperty('--rd', `${Math.min(i, 8) * 0.08}s`);
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

  // ── スマホ固定CTA：#ctaが見えている間は隠す ──
  const mobileCta = document.getElementById('mobile-cta');
  const ctaSection = document.getElementById('cta');
  if (mobileCta && ctaSection) {
    const mobileCtaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          mobileCta.classList.toggle('is-hidden', entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    mobileCtaObserver.observe(ctaSection);
  }

  // ── ヒーロー背景：スクロールに応じた微細なパララックス ──
  const heroMark = document.querySelector('.hero-mark');
  if (heroMark && !prefersReducedMotion) {
    const hero = document.getElementById('hero');
    let ticking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(Math.max(1 - rect.bottom / (rect.height + window.innerHeight), 0), 1);
      heroMark.style.transform = `translateY(${progress * -24}px)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }
});
