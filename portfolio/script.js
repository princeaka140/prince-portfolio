/* ============================================================
   Portfolio — script.js  |  Prince Uche
   ============================================================ */

/* ================================================================
   BLOCKCHAIN CANVAS ANIMATION
   ================================================================ */
const canvas = document.getElementById('blockchainCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Blockchain nodes and connections
class BlockchainNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.radius = Math.random() * 2.5 + 1.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Keep within bounds
    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99, 102, 241, 0.8)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(34, 211, 238, 0.9)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// Create more organized grid of nodes
const nodes = [];
const nodeCount = Math.min(Math.floor(window.innerWidth / 120), 20);
const colsCount = Math.ceil(Math.sqrt(nodeCount * 1.5));
const rowsCount = Math.ceil(nodeCount / colsCount);

for (let i = 0; i < nodeCount; i++) {
  const col = i % colsCount;
  const row = Math.floor(i / colsCount);
  const baseX = (col + 1) * (canvas.width / (colsCount + 1));
  const baseY = (row + 1) * (canvas.height / (rowsCount + 1));
  
  const node = new BlockchainNode(
    baseX + (Math.random() - 0.5) * 80,
    baseY + (Math.random() - 0.5) * 80
  );
  nodes.push(node);
}

function drawBlockchainLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw nodes
  nodes.forEach(node => {
    node.update();
    node.draw(ctx);
  });

  // Draw connecting lines (blockchain edges) - more organized
  const maxDistance = 300;
  const connectionLimit = 6; // Each node connects to nearby nodes
  
  for (let i = 0; i < nodes.length; i++) {
    // Sort nearby nodes by distance
    const nearby = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        nearby.push({ index: j, distance: distance });
      }
    }
    
    // Sort by distance and take closest N
    nearby.sort((a, b) => a.distance - b.distance);
    nearby.slice(0, connectionLimit).forEach(({ index: j, distance: distance }) => {
      const opacity = (1 - distance / maxDistance) * 0.4;
      
      // Primary line - stronger
      ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();

      // Glow effect on connection - enhanced
      ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.7})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();
      
      // Extra outer glow
      ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.2})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();
    });
  }

  requestAnimationFrame(drawBlockchainLines);
}

drawBlockchainLines();

/* ---------- SVG Ring constants ---------- */
const RING_RADIUS        = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 314.159

/* Initialize all rings: set dasharray and hide (full dashoffset) */
document.querySelectorAll('.ring-fill').forEach(ring => {
  ring.style.strokeDasharray  = RING_CIRCUMFERENCE;
  ring.style.strokeDashoffset = RING_CIRCUMFERENCE;
});

/* ================================================================
   NAVBAR — scroll glass effect + hamburger
   ================================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

/* Close mobile nav when any link inside is clicked */
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ================================================================
   SKILLS — toggle + filter tabs + SVG ring animation
   ================================================================ */
const skillsToggle    = document.getElementById('skillsToggle');
const skillsContainer = document.getElementById('skillsContainer');
const allSkillCards   = Array.from(document.querySelectorAll('.skill-card'));

skillsToggle.addEventListener('click', () => {
  const isOpen = skillsContainer.classList.toggle('open');
  skillsToggle.classList.toggle('active', isOpen);
  skillsToggle.setAttribute('aria-expanded', String(isOpen));
  skillsContainer.setAttribute('aria-hidden', String(!isOpen));

  if (isOpen) {
    skillsToggle.innerHTML = '<span class="toggle-icon" aria-hidden="true">&#9660;</span> Hide Skills';
    setActiveSkillFilter('all');
    applySkillFilter('all');
    showCards(allSkillCards);
    animateRings(allSkillCards);
  } else {
    skillsToggle.innerHTML = '<span class="toggle-icon" aria-hidden="true">&#9660;</span> Show My Skills';
    allSkillCards.forEach(c => {
      c.classList.remove('card-visible', 'card-hidden');
      c.style.order = '';
    });
    resetRings();
    setActiveSkillFilter('all');
  }
});

/* Skill filter buttons */
document.querySelectorAll('.skill-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;
    const filter = btn.dataset.filter;
    setActiveSkillFilter(filter);
    applySkillFilter(filter);

    const visible       = getSkillCards(filter);
    const notYetVisible = visible.filter(c => !c.classList.contains('card-visible'));
    if (notYetVisible.length) {
      showCards(notYetVisible);
      animateRings(notYetVisible);
    }
  });
});

function setActiveSkillFilter(filter) {
  document.querySelectorAll('.skill-filter').forEach(b => {
    const a = b.dataset.filter === filter;
    b.classList.toggle('active', a);
    b.setAttribute('aria-selected', String(a));
  });
}

function getSkillCards(filter) {
  return filter === 'all' ? allSkillCards
    : allSkillCards.filter(c => c.dataset.category === filter);
}

/**
 * Reorder grid: visible cards appear first using CSS `order`,
 * then mark the rest hidden — prevents empty layout gaps.
 */
function applySkillFilter(filter) {
  const visible = getSkillCards(filter);
  const hidden  = allSkillCards.filter(c => !visible.includes(c));
  visible.forEach((c, i) => { c.style.order = i; c.classList.remove('card-hidden'); });
  hidden.forEach((c, i)  => { c.style.order = visible.length + i; c.classList.add('card-hidden'); });
}

/** Staggered fade-in for a set of skill cards. */
function showCards(cards) {
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('card-visible'), i * 80);
  });
}

/** Staggered SVG ring animation, offset-matched to showCards. */
function animateRings(cards) {
  setTimeout(() => {
    cards.forEach((card, i) => {
      const ring = card.querySelector('.ring-fill');
      if (!ring) return;
      const pct = parseInt(ring.dataset.percent, 10) || 0;
      setTimeout(() => {
        ring.style.strokeDashoffset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
      }, i * 80);
    });
  }, 200);
}

function resetRings() {
  document.querySelectorAll('.ring-fill').forEach(r => {
    r.style.strokeDashoffset = RING_CIRCUMFERENCE;
  });
}

/* ================================================================
   PROJECTS — category filter tabs
   ================================================================ */
const allProjectCards = Array.from(document.querySelectorAll('.project-card'));

document.querySelectorAll('.project-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;

    /* Update active state */
    document.querySelectorAll('.project-filter').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });

    const filter  = btn.dataset.filter;
    const visible = filter === 'all'
      ? allProjectCards
      : allProjectCards.filter(c => c.dataset.category === filter);
    const hidden  = allProjectCards.filter(c => !visible.includes(c));

    /* Reorder and toggle visibility (same CSS-order trick as skills) */
    visible.forEach((c, i) => { c.style.order = i; c.classList.remove('proj-hidden'); });
    hidden.forEach((c, i)  => { c.style.order = visible.length + i; c.classList.add('proj-hidden'); });
  });
});

/* ================================================================
   SCROLL REVEAL — IntersectionObserver
   ================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ================================================================
   CONTACT FORM — FormSubmit AJAX → akansoprince@gmail.com
   ================================================================ */
const contactForm = document.getElementById('contactForm');
const submitBtn   = contactForm.querySelector('button[type="submit"]');
const toast       = document.getElementById('toast');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = contactForm.querySelector('#name').value.trim();
  const email   = contactForm.querySelector('#email').value.trim();
  const message = contactForm.querySelector('#message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all fields.', false);
    return;
  }

  /* Loading state */
  submitBtn.disabled     = true;
  submitBtn.textContent  = 'Sending…';

  try {
    const res = await fetch('https://formsubmit.co/ajax/akansoprince@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `Portfolio contact from ${name}`,
        _template: 'table'
      })
    });

    const data = await res.json();

    if (data.success === 'true' || data.success === true) {
      showToast("Message sent! I'll be in touch soon. ✓", true);
      contactForm.reset();
    } else {
      showToast('Something went wrong. Please try again.', false);
    }
  } catch {
    showToast('Network error. Please check your connection.', false);
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send Message';
  }
});

function showToast(msg, success = true) {
  toast.textContent = msg;
  toast.className   = `toast ${success ? 'toast-success' : 'toast-error'}`;
  void toast.offsetWidth; /* force reflow for re-trigger */
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}
