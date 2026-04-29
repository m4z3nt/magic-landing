// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Header scrolled state
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

// Cursor glow
(function () {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      glow.style.opacity = '1';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
  });

  function tick() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

// Constellation starfield
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, stars;
  const STAR_COUNT = 140;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
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
        r: (Math.random() * 1.0 + 0.2) * dpr,
        a: Math.random() * 0.6 + 0.15,
        s: Math.random() * 0.012 + 0.003,
        p: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.05 * dpr,
        vy: (Math.random() - 0.5) * 0.05 * dpr,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // Lines between near stars + near cursor
    const linkDist = 110 * dpr;
    const cursorDist = 180 * dpr;
    ctx.lineWidth = 0.5 * dpr;

    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      // Cursor connection
      const dxc = a.x - mouse.x;
      const dyc = a.y - mouse.y;
      const dc = Math.sqrt(dxc * dxc + dyc * dyc);
      if (dc < cursorDist) {
        const op = (1 - dc / cursorDist) * 0.35;
        ctx.strokeStyle = `rgba(201, 169, 106, ${op})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      // Star-to-star (only nearby cursor for perf)
      if (dc < cursorDist * 1.5) {
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const op = (1 - d / linkDist) * 0.18;
            ctx.strokeStyle = `rgba(236, 231, 216, ${op})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = w; else if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h; else if (s.y > h) s.y = 0;

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
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  });
  document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  requestAnimationFrame(draw);
})();

// Sigil parallax
(function () {
  const sigil = document.querySelector('.sigil');
  if (!sigil) return;
  const hero = document.querySelector('.hero');
  let rect = hero.getBoundingClientRect();

  window.addEventListener('resize', () => { rect = hero.getBoundingClientRect(); });

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    sigil.style.transform = `translate(${dx * -14}px, ${dy * -14}px) rotate(${dx * 1.5}deg)`;
  });

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    sigil.style.opacity = Math.max(0.2, 1 - y / 700);
  }, { passive: true });
})();

// Scroll reveal
(function () {
  const targets = document.querySelectorAll(
    '.section h2, .card, .steps li, .prose, .final-card, .hero-sub, .cta-row, .hero-meta, .quote, .marquee, .cards-deck, .draw-note'
  );
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

// Cards interactive flip
(function () {
  const deck = document.getElementById('cardsDeck');
  const note = document.getElementById('drawNote');
  if (!deck || !note) return;

  const cards = deck.querySelectorAll('.tcard');
  let drawn = false;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('flipped')) {
        card.classList.remove('flipped');
        return;
      }
      // Flip selected; subtly fade others
      card.classList.add('flipped');
      cards.forEach((other) => {
        if (other !== card && !other.classList.contains('flipped')) {
          other.style.opacity = '0.55';
          other.style.transform = 'scale(0.97)';
        }
      });
      if (!drawn) {
        note.textContent = 'Это короткое прикосновение к практике. В Telegram — глубже и точнее.';
        drawn = true;
      }
    });

    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('flipped')) {
        cards.forEach((other) => {
          if (other !== card && !other.classList.contains('flipped')) {
            other.style.opacity = '0.85';
          }
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      cards.forEach((other) => {
        if (!other.classList.contains('flipped')) {
          other.style.opacity = '';
          other.style.transform = '';
        }
      });
    });
  });
})();
