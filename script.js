// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Subtle starfield
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars;
  const STAR_COUNT = 110;

  function resize() {
    w = canvas.width = window.innerWidth * window.devicePixelRatio;
    h = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    init();
  }

  function init() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 * window.devicePixelRatio + 0.2,
        a: Math.random() * 0.7 + 0.1,
        s: Math.random() * 0.012 + 0.003,
        p: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const tw = (Math.sin(t * s.s + s.p) + 1) / 2;
      const alpha = s.a * (0.4 + tw * 0.6);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(236, 231, 216, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

// Scroll reveal
(function () {
  const targets = document.querySelectorAll('.section h2, .card, .steps li, .prose, .final-card, .hero-title, .hero-sub, .cta-row, .hero-handle');
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();
