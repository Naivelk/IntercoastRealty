/* ============================================================
   InterCoast Realty — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  let currentNewsItems = [];

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

      if (Array.isArray(currentNewsItems) && currentNewsItems.length) {
        renderNews(currentNewsItems);
      }
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

  // ── EL SALVADOR EN MOVIMIENTO (NEWS) ──
  const newsGrid = document.getElementById('news-grid');
  const useLiveNews = true;

  const curatedNews = [
    {
      categoryEs: 'Turismo',
      categoryEn: 'Tourism',
      titleEs: 'Un crucero internacional llega al puerto y activa el turismo local',
      titleEn: 'An international cruise arrives, boosting local tourism',
      summaryEs: 'Visitantes internacionales, cultura y comercio en movimiento: señales pequeñas que muestran una nueva energía y oportunidad.',
      summaryEn: 'International visitors, culture, and commerce in motion: small signals that reflect new energy and opportunity.',
      date: '2026-04-10',
      image: '',
      source: 'Actualización curada',
      url: 'https://news.google.com/search?q=crucero%20El%20Salvador%20turismo'
    },
    {
      categoryEs: 'Infraestructura',
      categoryEn: 'Infrastructure',
      titleEs: 'Más conectividad: proyectos que mejoran acceso y tiempos de viaje',
      titleEn: 'More connectivity: projects improving access and travel times',
      summaryEs: 'Nuevas obras y mejoras viales cambian la experiencia de moverse por zonas clave. Menos fricción para vivir, visitar e invertir.',
      summaryEn: 'New public works and road improvements are changing mobility in key areas—less friction to live, visit, and invest.',
      date: '2026-03-28',
      image: '',
      source: 'Actualización curada',
      url: 'https://news.google.com/search?q=infraestructura%20El%20Salvador%20conectividad'
    },
    {
      categoryEs: 'Mercado',
      categoryEn: 'Market',
      titleEs: 'Interés creciente por destinos de playa y zonas con plusvalía',
      titleEn: 'Growing interest in beach destinations and high-upside areas',
      summaryEs: 'La demanda por zonas turísticas impulsa movimiento económico. La clave es elegir con criterio y validar cada oportunidad.',
      summaryEn: 'Demand around tourism zones supports economic activity. The key is choosing with judgment and validating each opportunity.',
      date: '2026-03-12',
      image: '',
      source: 'Actualización curada',
      url: 'https://news.google.com/search?q=inversi%C3%B3n%20turismo%20El%20Salvador%20La%20Libertad'
    }
  ];

  const keywordAllow = [
    'cruise', 'crucero', 'port', 'puerto', 'tourism', 'turismo', 'visitor', 'visitantes',
    'airport', 'aeropuerto', 'investment', 'inversi', 'development', 'desarrollo',
    'la libertad', 'surf', 'hotel', 'hospitality', 'travel', 'viaje', 'arrivals', 'llegada'
  ];
  const keywordBlock = [
    'murder', 'homicid', 'kidnap', 'secuest', 'shoot', 'tirote', 'drug', 'narc', 'gang', 'pandill',
    'politic', 'polític', 'election', 'elecci', 'corruption', 'corrup', 'violence', 'violenc'
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function truncate(text, maxLen) {
    const t = String(text || '').trim();
    if (!t) return '';
    if (t.length <= maxLen) return t;
    return `${t.slice(0, maxLen).trim()}…`;
  }

  function getUnsplashFallback(category) {
    const c = String(category || '').toLowerCase();
    let query = 'el salvador,travel';
    if (c.includes('tour') || c.includes('turis') || c.includes('cruise') || c.includes('cruc')) query = 'el salvador,port,tourism,culture';
    else if (c.includes('infra') || c.includes('airport') || c.includes('road') || c.includes('connect')) query = 'el salvador,city,infrastructure,road';
    else if (c.includes('market') || c.includes('merc') || c.includes('investment') || c.includes('invers')) query = 'el salvador,city,investment,growth';
    return `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
  }

  function getPicsumFallback(seed) {
    const s = String(seed || 'el-salvador').trim() || 'el-salvador';
    return `https://picsum.photos/seed/${encodeURIComponent(s)}/1200/800`;
  }

  function getCardContent(item) {
    const isEn = document.body.classList.contains('en');
    return {
      category: isEn ? item.categoryEn : item.categoryEs,
      title: isEn ? item.titleEn : item.titleEs,
      summary: isEn ? item.summaryEn : item.summaryEs,
      cta: isEn ? 'Read more' : 'Ver noticia',
      sourceLabel: item.source || (isEn ? 'Update' : 'Actualización')
    };
  }

  function renderNews(items) {
    if (!newsGrid) return;
    const safeItems = Array.isArray(items) ? items.slice(0, 3) : [];
    currentNewsItems = safeItems;

    newsGrid.innerHTML = safeItems.map((item, idx) => {
      const c = getCardContent(item);
      const link = item.url && String(item.url).trim().length > 0 ? String(item.url).trim() : '';
      const href = link || `https://news.google.com/search?q=${encodeURIComponent(c.title)}`;
      const img = item.image && String(item.image).trim().length > 0 ? String(item.image).trim() : '';
      const categoryForImage = (c.category && c.category.toLowerCase() !== 'actualidad' && c.category.toLowerCase() !== 'update') ? c.category : (item.categoryEs || item.categoryEn || c.category);
      const fallbackImg = getUnsplashFallback(categoryForImage);
      const fallbackImg2 = getPicsumFallback(c.title);
      const dateLabel = formatDate(item.date);
      const summary = truncate(c.summary, 160);

      return `
        <article class="news-card fade-up" style="transition-delay:${idx * 0.1}s">
          <div class="news-media">
            <span class="news-tag">${escapeHtml(c.category)}</span>
            <span class="news-date">${escapeHtml(dateLabel)}</span>
            <img
              src="${escapeHtml(img || fallbackImg)}"
              alt=""
              loading="lazy"
              decoding="async"
              onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${escapeHtml(fallbackImg)}';}else if(!this.dataset.fallback2){this.dataset.fallback2='1';this.src='${escapeHtml(fallbackImg2)}';}else{this.style.display='none';}"
            />
          </div>
          <div class="news-content">
            <h3 class="news-title">${escapeHtml(c.title)}</h3>
            <p class="news-desc">${escapeHtml(summary)}</p>
            <div class="news-actions">
              <a class="news-link" href="${escapeHtml(href)}" target="_blank" rel="noopener">
                <span>${escapeHtml(c.cta)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
              <div class="news-source">${escapeHtml(c.sourceLabel)}</div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (typeof observer !== 'undefined') {
      newsGrid.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    }
  }

  function containsAny(haystack, needles) {
    const h = String(haystack || '').toLowerCase();
    return needles.some(n => h.includes(String(n).toLowerCase()));
  }

  async function fetchGdeltNews() {
    const query = [
      'El Salvador',
      '(tourism OR turismo OR cruise OR crucero OR port OR puerto OR airport OR aeropuerto OR investment OR inversion OR development OR desarrollo OR surf OR "La Libertad")'
    ].join(' ');

    const params = new URLSearchParams({
      query,
      mode: 'ArtList',
      format: 'json',
      maxrecords: '20',
      sort: 'HybridRel',
      timelast: '2592000'
    });

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`GDELT error: ${res.status}`);

    const data = await res.json();
    const articles = (data && data.articles) ? data.articles : [];

    const mapped = articles.map(a => {
      const title = a.title || '';
      const urlA = a.url || '';
      const source = a.sourceCountry || a.domain || 'GDELT';
      const date = a.seendate ? String(a.seendate).slice(0, 10) : '';
      const excerpt = a.excerpt || a.summary || a.description || '';

      return {
        categoryEs: 'Actualidad',
        categoryEn: 'Update',
        titleEs: title,
        titleEn: title,
        summaryEs: excerpt,
        summaryEn: excerpt,
        date,
        image: a.socialimage || '',
        source: source === 'GDELT' ? 'GDELT' : source,
        url: urlA
      };
    }).filter(item => {
      const text = `${item.titleEs} ${item.summaryEs}`;
      const allowed = containsAny(text, keywordAllow);
      const blocked = containsAny(text, keywordBlock);
      return allowed && !blocked;
    }).slice(0, 3);

    return mapped;
  }

  async function initNews() {
    if (!newsGrid) return;
    renderNews(curatedNews);

    if (!useLiveNews) return;

    try {
      let live = [];
      try {
        const proxyRes = await fetch('/.netlify/functions/news', { method: 'GET' });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData && Array.isArray(proxyData.items)) live = proxyData.items;
        }
      } catch (e) {
        // ignore and fall back to direct client fetch
      }

      if (!live.length) live = await fetchGdeltNews();
      if (live && live.length) renderNews(live);
    } catch (e) {
      // Keep curated fallback
    }
  }

  initNews();

});
