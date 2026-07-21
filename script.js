/* =========================================================
   REFERRAL HUB — script.js
   Vanilla JS. Lenis smooth scroll + IO + micro-interactions.
   ========================================================= */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================================================
     PRELOADER + HERO REVEAL
     ========================================================= */
  const preloader = $('#preloader');
  const barFill = $('#preloader-bar-fill');
  const barCount = $('#preloader-count');
  let progress = 0;

  const tick = () => {
    progress = Math.min(100, progress + Math.random() * 12 + 4);
    if (barFill) barFill.style.width = progress + '%';
    if (barCount) barCount.textContent = Math.floor(progress) + '%';
    
    if (progress < 100) {
      setTimeout(tick, 90);
    } else {
      setTimeout(() => {
        if (preloader) preloader.classList.add('hide');
        const heroTitle = $('.hero-title');
        if (heroTitle) heroTitle.classList.add('reveal');
        const heroSub = $('.hero-sub');
        if (heroSub) heroSub.classList.add('in');
      }, 400);
    }
  };
  window.addEventListener('load', () => setTimeout(tick, 80));

  /* =========================================================
     LENIS SMOOTH SCROLL
     ========================================================= */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* Smooth scroll for anchor links */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      if (lenis) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* To Top Button */
  const toTop = $('#to-top');
  toTop?.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =========================================================
     NAVBAR + SCROLL PROGRESS
     ========================================================= */
  const nav = $('#nav');
  const progressBar = $('#scroll-progress');
  
  const onScroll = () => {
    const y = window.scrollY;
    
    // Toggle Nav blur/bg
    if (nav) nav.classList.toggle('scrolled', y > 40);
    
    // Toggle To-Top button visibility
    if (toTop) {
      if (y > 600) {
        toTop.style.opacity = '1';
        toTop.style.pointerEvents = 'auto';
      } else {
        toTop.style.opacity = '0';
        toTop.style.pointerEvents = 'none';
      }
    }
    
    // Scroll progress bar math
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (y / h) * 100 : 0;
    if (progressBar) progressBar.style.width = p + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =========================================================
     ANIMATED COUNTERS (Numbers go up)
     ========================================================= */
  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const animate = (now) => {
        const t = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach((el) => counterIo.observe(el));

  /* =========================================================
     REVEAL ON SCROLL (Fades in elements as you scroll down)
     ========================================================= */
  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  $$('.reveal-up').forEach(el => revealIo.observe(el));

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  const cursor = $('#cursor');
  const cursorDot = $('#cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
  });

  const loop = () => {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    if (cursor) { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Helper function to re-bind hover effects to dynamically added elements
  const addCursorGrow = () => {
    $$('a, button, input, summary, .chip, .job-card, .text-card, .contact-pill, .stat-card').forEach((el) => {
      // Remove old listeners first to avoid duplicates (optional safety)
      const growIn = () => cursor?.classList.add('grow');
      const growOut = () => cursor?.classList.remove('grow');
      el.addEventListener('mouseenter', growIn);
      el.addEventListener('mouseleave', growOut);
    });
  };
  addCursorGrow();

  /* =========================================================
     KEYBOARD SHORTCUT ("/" to search)
     ========================================================= */
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      $('#search-input')?.focus();
    }
  });

  /* =========================================================
     DYNAMIC JOB SEARCH & FILTERING (via jobs.json)
     ========================================================= */
  const state = { jobs: [], query: '', filter: 'all' };
  
  // Creates a 1 or 2 letter logo avatar from the company name
  const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  
  const jobCard = (job) => `
    <article class="job-card reveal-up">
      <div class="job-company">
        <div class="job-avatar">${initials(job.company)}</div>
        <div>
          <h4>${job.company}</h4>
          <p>${job.location}</p>
        </div>
      </div>
      <div class="job-role">${job.role}</div>
      <div class="job-meta">
        <span>🎓 ${job.batch}</span>
        <span>💰 ${job.salary}</span>
      </div>
      <div class="job-skills">${job.skills.map(s => `<span class="job-skill">${s}</span>`).join('')}</div>
      <a href="${job.applyLink}" target="_blank" class="job-apply">Apply ↗</a>
    </article>
  `;

  // Search logic
  const matches = (job) => {
    const q = state.query.trim().toLowerCase();
    const f = state.filter;
    const hay = [
      job.company, job.role, job.location, job.batch, (job.skills || []).join(' ')
    ].join(' ').toLowerCase();
    
    const okQ = !q || hay.includes(q);
    const okF = f === 'all' || hay.includes(f.toLowerCase());
    return okQ && okF;
  };

  const render = () => {
    const jobsGrid = $('#jobs-grid');
    const latest = state.jobs.filter(matches);
    
    if (jobsGrid) {
      if (latest.length === 0) {
        jobsGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">No matches found for that search or filter.</p>';
      } else {
        jobsGrid.innerHTML = latest.map(j => jobCard(j)).join('');
      }
    }
    
    // Observe the newly created job cards so they fade in
    $$('.job-card').forEach(el => revealIo.observe(el));
    // Make sure the custom cursor grows when hovering over new cards
    addCursorGrow();
  };

  // Search Input Event
  const searchInput = $('#search-input');
  searchInput?.addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });

  // Filter Chips Event
  $$('.filter-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.filter-chips .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      render();
    });
  });

  // Fetch the data and kick off render
  fetch('jobs.json')
    .then((r) => r.json())
    .then((data) => {
      state.jobs = Array.isArray(data) ? data : [];
      render();
    })
    .catch(err => {
      console.error('Jobs load failed', err);
      const jobsGrid = $('#jobs-grid');
      if(jobsGrid) jobsGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">Failed to load jobs. Make sure jobs.json exists in your repository.</p>';
    });
    
  // Run scroll check once on load in case user is not at top
  onScroll();
})();
