/* =========================================================================
   REFERRAL HUB — Core JavaScript
   Vanilla JS, ES6+, Hardware Accelerated Animations, Intersection Observers
   ========================================================================= */

(() => {
  'use strict';

  // --- Utility Selectors ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================================================================
     1. PRELOADER & INITIAL REVEALS
     ========================================================================= */
  const preloader = $('#preloader');
  const barFill = $('#preloader-bar-fill');
  const barCount = $('#preloader-count');
  let progress = 0;

  const tick = () => {
    // Randomize progress increments for a natural loading feel
    progress = Math.min(100, progress + Math.random() * 15 + 5);
    
    if (barFill) barFill.style.width = progress + '%';
    if (barCount) barCount.textContent = Math.floor(progress) + '%';
    
    if (progress < 100) {
      setTimeout(tick, 60);
    } else {
      setTimeout(() => {
        if (preloader) preloader.classList.add('hide');
        
        // Trigger Hero Animations
        const heroTitle = $('.hero-title');
        const heroSub = $('.hero-sub');
        if (heroTitle) heroTitle.classList.add('reveal');
        if (heroSub) heroSub.classList.add('in');
      }, 400);
    }
  };
  
  // Start preloader once DOM is interactable
  window.addEventListener('DOMContentLoaded', () => setTimeout(tick, 50));

  /* =========================================================================
     2. LENIS SMOOTH SCROLL
     ========================================================================= */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth Scroll for Anchor Links (Intercepts Lenis)
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 100;
      
      if (lenis) {
        lenis.scrollTo(offset, { duration: 1.5 });
      } else {
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  // To Top Button
  const toTopBtn = $('#to-top');
  toTopBtn?.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.5 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =========================================================================
     3. HEADER, PROGRESS BAR & SCROLL STATES
     ========================================================================= */
  const nav = $('#nav');
  const progressBar = $('#scroll-progress');
  
  const handleScroll = () => {
    const y = window.scrollY;
    
    // Header Glassmorphism Toggle
    if (nav) nav.classList.toggle('scrolled', y > 50);
    
    // To-Top Button Visibility
    if (toTopBtn) {
      y > 700 ? toTopBtn.classList.add('visible') : toTopBtn.classList.remove('visible');
    }
    
    // Page Scroll Progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (y / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = scrollPercent + '%';
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* =========================================================================
     4. INTERSECTION OBSERVERS (Animations & Counters)
     ========================================================================= */
  // Counters Animation
  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const targetVal = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      
      const animate = (now) => {
        const t = Math.min(1, (now - start) / 2000); // 2 second duration
        const eased = 1 - Math.pow(1 - t, 4); // Quartic ease out
        const current = Math.floor(targetVal * eased);
        
        el.textContent = current.toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
      counterIo.unobserve(el);
    });
  }, { threshold: 0.5 });
  
  $$('[data-count]').forEach(el => counterIo.observe(el));

  // Fade-up Reveal Animation
  const revealIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  
  $$('.reveal-up').forEach(el => revealIo.observe(el));

  /* =========================================================================
     5. CUSTOM HARDWARE-ACCELERATED CURSOR
     ========================================================================= */
  const cursor = $('#cursor');
  const cursorDot = $('#cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; 
    my = e.clientY;
    // Dot follows instantly
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(calc(${mx}px - 50%), calc(${my}px - 50%), 0)`;
    }
  });

  // Ring trails behind using lerp (Linear Interpolation)
  const renderCursor = () => {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    if (cursor) {
      cursor.style.transform = `translate3d(calc(${cx}px - 50%), calc(${cy}px - 50%), 0)`;
    }
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  // Grow cursor on interactive elements
  const bindCursorHovers = () => {
    $$('a, button, input, summary, .chip, .job-card, .community-card, .stat-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor?.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor?.classList.remove('grow'));
    });
  };
  bindCursorHovers(); // Initial bind

  /* =========================================================================
     6. TOAST NOTIFICATION SYSTEM
     ========================================================================= */
  const toast = $('#toast');
  let toastTimeout;

  const showToast = (message, isError = false) => {
    if (!toast) return;
    clearTimeout(toastTimeout);
    
    toast.textContent = message;
    toast.style.borderColor = isError ? '#ef4444' : '#10b981';
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // Bind to Newsletter Form
  const newsletterForm = $('#newsletter-form');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#email-input').value;
    if(email) {
      showToast('Successfully subscribed to referral drops!');
      newsletterForm.reset();
    }
  });

  /* =========================================================================
     7. KEYBOARD SHORTCUTS & ACCESSIBILITY
     ========================================================================= */
  const searchInput = $('#search-input');
  window.addEventListener('keydown', (e) => {
    // Press '/' to focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      searchInput?.focus();
    }
    // Press 'Escape' to blur search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  /* =========================================================================
     8. DYNAMIC JOB BOARD ENGINE (Fetches jobs.json)
     ========================================================================= */
  const jobState = { jobs: [], query: '', filter: 'all' };
  
  // Random gradients for fallback company avatars
  const gradients = ['bg-gradient-purple', 'bg-gradient-blue', 'bg-gradient-red', 'bg-orange', 'bg-green'];
  
  const getInitials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  
  const buildJobCard = (job, index) => {
    const avatarClass = gradients[index % gradients.length];
    
    return `
      <article class="job-card glass-card reveal-up">
        <div class="job-card-header">
          <div class="company-info">
            <div class="company-avatar ${avatarClass}">${getInitials(job.company)}</div>
            <div>
              <h4 class="company-name">${job.company}</h4>
              <p class="job-location">${job.location}</p>
            </div>
          </div>
          ${job.featured ? `<span class="badge badge-featured">Featured</span>` : ''}
        </div>
        <h3 class="job-role">${job.role}</h3>
        <div class="job-meta">
          <span class="meta-item">🎓 ${job.batch}</span>
          <span class="meta-item">💰 ${job.salary}</span>
        </div>
        <div class="job-skills">
          ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        <div class="job-actions">
          <a href="${job.applyLink || '#'}" class="btn-apply" target="_blank" rel="noopener">
            Request Referral <svg width="14" height="14"><use href="#icon-arrow-right"></use></svg>
          </a>
        </div>
      </article>
    `;
  };

  const isMatch = (job) => {
    const searchQ = jobState.query.toLowerCase();
    const filterF = jobState.filter.toLowerCase();
    
    const stringifiedJob = [
      job.company, job.role, job.location, job.batch, (job.skills || []).join(' ')
    ].join(' ').toLowerCase();
    
    const matchesSearch = !searchQ || stringifiedJob.includes(searchQ);
    const matchesFilter = filterF === 'all' || stringifiedJob.includes(filterF);
    
    return matchesSearch && matchesFilter;
  };

  const renderJobs = () => {
    const grid = $('#jobs-grid');
    if (!grid) return;
    
    const filteredJobs = jobState.jobs.filter(isMatch);
    
    if (filteredJobs.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">
          No matching referrals found. Try adjusting your search or filter.
        </div>
      `;
    } else {
      grid.innerHTML = filteredJobs.map((job, i) => buildJobCard(job, i)).join('');
    }
    
    // Bind observers and cursor hover to newly generated cards
    $$('.job-card').forEach(el => revealIo.observe(el));
    bindCursorHovers();
  };

  // Search Input Listener
  searchInput?.addEventListener('input', (e) => {
    jobState.query = e.target.value;
    renderJobs();
  });

  // Filter Chips Listener
  $$('.filter-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      jobState.filter = chip.dataset.filter;
      renderJobs();
    });
  });

  // Fetch JSON and initialize board
  fetch('jobs.json')
    .then(res => {
      if(!res.ok) throw new Error("JSON not found");
      return res.json();
    })
    .then(data => {
      jobState.jobs = Array.isArray(data) ? data : [];
      renderJobs();
    })
    .catch(err => {
      console.warn("Could not load jobs.json. Using static fallback cards.", err);
      // Leaves the static HTML cards inside #jobs-grid intact
      bindCursorHovers(); 
    });

  // Initial trigger for scroll states
  handleScroll();
  
})();
