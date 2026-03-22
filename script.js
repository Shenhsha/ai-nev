/* ===== Data & State ===== */
let tools = [];
let activeCategory = 'all';
let searchQuery = '';

const categoryMap = {
  all:     { label: '全部', icon: '✦' },
  chat:    { label: '聊天', icon: '💬' },
  image:   { label: '图像', icon: '🎨' },
  code:    { label: '编程', icon: '💻' },
  video:   { label: '视频', icon: '🎬' },
};

const envMap = {
  domestic: { label: '国内可用', cls: 'domestic', icon: '🇨🇳' },
  abroad:   { label: '需国外环境', cls: 'abroad', icon: '🌐' },
  us:       { label: '需美国环境', cls: 'us', icon: '🇺🇸' },
};

const pricingMap = {
  free:     { label: '免费', cls: 'free', icon: '💚' },
  paid:     { label: '付费', cls: 'paid', icon: '💰' },
  freemium: { label: '部分免费', cls: 'freemium', icon: '🔶' },
};

/* Color palette for card icons */
const palette = [
  '#e8849a','#7c9ae8','#6cc4a1','#d4a26a',
  '#b88ed4','#6abec4','#d47a7a','#8ab46e',
  '#c49a6c','#7ab0d4','#d482a8','#8cc4a8',
];

function hashColor(name) {
  let h = 0;
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return palette[Math.abs(h) % palette.length];
}

/* ===== Load Data ===== */
async function loadData() {
  const res = await fetch('data.json');
  tools = await res.json();
  renderFilters();
  renderCards();
}

/* ===== Render Filters ===== */
function renderFilters() {
  const wrap = document.getElementById('filters');
  wrap.innerHTML = '';
  for (const [key, { label, icon }] of Object.entries(categoryMap)) {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (key === activeCategory ? ' active' : '');
    btn.textContent = `${icon} ${label}`;
    btn.dataset.cat = key;
    btn.addEventListener('click', () => {
      activeCategory = key;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards();
    });
    wrap.appendChild(btn);
  }
}

/* ===== Render Cards ===== */
function renderCards() {
  const grid = document.getElementById('cards-grid');
  const q = searchQuery.toLowerCase().trim();

  const filtered = tools.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🌸</div>
        <p>没有找到匹配的工具，换个关键词试试？</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((t, i) => {
    const env = envMap[t.env] || envMap.domestic;
    const pricing = pricingMap[t.pricing] || pricingMap.freemium;
    const color = hashColor(t.name);
    const initial = t.name.charAt(0).toUpperCase();

    return `
      <div class="card" style="animation-delay:${Math.min(i * 0.04, 0.5)}s">
        <div class="card-icon" style="background:${color}">${initial}</div>
        <div class="card-name">${esc(t.name)}</div>
        <div class="card-desc">${esc(t.desc)}</div>
        <div class="card-tags">
          <span class="tag tag-env ${env.cls}">${env.icon} ${env.label}</span>
          <span class="tag tag-pricing ${pricing.cls}">${pricing.icon} ${pricing.label}</span>
        </div>
        <a class="card-link" href="${esc(t.url)}" target="_blank" rel="noopener">
          访问
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
          </svg>
        </a>
      </div>`;
  }).join('');
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ===== Search ===== */
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderCards();
});

/* ===== Sakura Animation ===== */
(function initSakura() {
  const canvas = document.getElementById('sakura-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const petals = [];
  const PETAL_COUNT = 22;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Petal {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -20;
      this.size = 6 + Math.random() * 10;
      this.speedY = 0.4 + Math.random() * 0.8;
      this.speedX = -0.3 + Math.random() * 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.wobbleAmp = 0.5 + Math.random() * 1;
      this.wobbleFreq = 0.01 + Math.random() * 0.02;
      this.phase = Math.random() * Math.PI * 2;
      this.opacity = 0.35 + Math.random() * 0.35;
      this.color = Math.random() > 0.3
        ? `rgba(255,${175 + Math.random()*40|0},${185 + Math.random()*40|0},`
        : `rgba(255,${200 + Math.random()*30|0},${210 + Math.random()*30|0},`;
    }
    update(t) {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.phase + t * this.wobbleFreq) * this.wobbleAmp;
      this.rotation += this.rotSpeed;
      if (this.y > H + 20 || this.x < -40 || this.x > W + 40) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color + '1)';

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        this.size * 0.4, -this.size * 0.5,
        this.size, -this.size * 0.3,
        this.size * 0.6, this.size * 0.2
      );
      ctx.bezierCurveTo(
        this.size * 0.3, this.size * 0.5,
        this.size * 0.1, this.size * 0.3,
        0, 0
      );
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());

  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const p of petals) {
      p.update(t);
      p.draw();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== Init ===== */
loadData();
