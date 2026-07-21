/* =========================================================
   REFERRAL HUB — script.js
   ========================================================= */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* PRELOADER + HERO REVEAL */
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
        preloader && preloader.classList.add('hide');
        const heroTitle = $('.hero-title');
        heroTitle && heroTitle.classList.add('reveal');
        const heroSub = $('.hero-sub');
        heroSub && heroSub.classList.add('in');
      }, 400);
    }
  };
  window.addEventListener('load', () => setTimeout(tick, 80));

  /* LENIS SMOOTH SCROLL */
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

  /* NAVBAR + PROGRESS */
  const nav = $('#nav');
  const progressBar = $('#scroll-progress');
  
  const onScroll = () => {
    const y = window.scrollY;
    nav && nav.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (y / h) * 100 : 0;
    if (progressBar) progressBar.style.width = p + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ANIMATED COUNTERS */
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

  /* REVEAL ON SCROLL (THIS WAS THE MISSING FIX) */
  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  $$('.reveal-up').forEach(el => revealIo.observe(el));

  /* CUSTOM CURSOR */
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

  /* LOAD JOBS */
  const state = { jobs: [] };
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

  const render = () => {
    const jobsGrid = $('#jobs-grid');
    if (jobsGrid) jobsGrid.innerHTML = state.jobs.map(j => jobCard(j)).join('');
    // Ensure new job cards fade in correctly
    $$('.job-card').forEach(el => revealIo.observe(el));
  };

  fetch('jobs.json')
    .then((r) => r.json())
    .then((data) => {
      state.jobs = data;
      render();
    });
})();
