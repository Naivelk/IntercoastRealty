/* ============================================================
   InterCoast Realty — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── NAV SCROLL EFFECT ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── MOBILE MENU TOGGLE ──
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Close menu when clicking a nav link (mobile)
  document.querySelectorAll('nav .nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      if (nav) nav.classList.remove('open');
    });
  });

  // ── LANGUAGE TOGGLE ──
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      document.body.classList.toggle('en');
      langBtn.textContent = document.body.classList.contains('en') ? 'ES' : 'EN';
    });
  }

  // ── FADE-UP ON SCROLL ──
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target); // only trigger once
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── STAGGERED FADE FOR CARD GRIDS ──
  document.querySelectorAll('.props-grid .fade-up, .why-cards .fade-up').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

});
