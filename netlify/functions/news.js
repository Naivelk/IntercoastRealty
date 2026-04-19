export default async (request, context) => {
  try {
    const keywordBlock = [
      'murder', 'homicid', 'kidnap', 'secuest', 'shoot', 'tirote', 'drug', 'narc', 'gang', 'pandill',
      'politic', 'polític', 'election', 'elecci', 'corruption', 'corrup', 'violence', 'violenc'
    ];

    const containsAny = (haystack, needles) => {
      const h = String(haystack || '').toLowerCase();
      return needles.some(n => h.includes(String(n).toLowerCase()));
    };

    const decodeEntities = (s) => {
      return String(s || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, ' ');
    };

    const stripHtml = (s) => {
      const decoded = decodeEntities(String(s || ''));
      const withoutTags = decoded.replace(/<[^>]*>/g, ' ');
      const cleaned = decodeEntities(withoutTags)
        .replace(/\bhref\s*=\s*"[^"]*"/gi, ' ')
        .replace(/\bhref\s*=\s*'[^']*'/gi, ' ');
      return cleaned.replace(/\s+/g, ' ').trim();
    };

    const truncate = (s, maxLen) => {
      const t = String(s || '').trim();
      if (!t) return '';
      if (t.length <= maxLen) return t;
      return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
    };

    const inferCategory = (text) => {
      const t = String(text || '').toLowerCase();
      const rules = [
        {
          es: 'Turismo',
          en: 'Tourism',
          keys: ['turismo', 'tourism', 'turista', 'turistas', 'crucero', 'cruise', 'playa', 'beach', 'hotel', 'aeropuerto', 'airport', 'surf']
        },
        {
          es: 'Infraestructura',
          en: 'Infrastructure',
          keys: ['infraestructura', 'infrastructure', 'carretera', 'highway', 'puente', 'bridge', 'puerto', 'port', 'conectividad', 'connectivity', 'obra', 'obras']
        },
        {
          es: 'Inversión',
          en: 'Investment',
          keys: ['inversi', 'investment', 'inversion', 'negocio', 'business', 'empresa', 'companies', 'capital', 'financi']
        },
        {
          es: 'Mercado',
          en: 'Market',
          keys: ['mercado', 'market', 'export', 'import', 'comercio', 'trade', 'econom', 'gdp', 'crecimiento', 'growth']
        }
      ];

      for (const r of rules) {
        if (r.keys.some(k => t.includes(k))) return { es: r.es, en: r.en };
      }
      return { es: 'Actualidad', en: 'Update' };
    };

    const normalizeText = (s) => {
      return String(s || '')
        .toLowerCase()
        .replace(/\s*[-–—|•:]\s*/g, ' ')
        .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const removeDiacritics = (s) => {
      return String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const normalizeHint = (s) => {
      return removeDiacritics(String(s || ''))
        .toLowerCase()
        .replace(/[^a-z0-9\s.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const splitTitleAndPublisher = (title) => {
      const raw = String(title || '').trim();
      const parts = raw.split(' - ').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return { baseTitle: parts.slice(0, -1).join(' - '), publisher: parts[parts.length - 1] };
      }
      return { baseTitle: raw, publisher: '' };
    };

    const titleKey = (s) => {
      const n = normalizeText(s);
      return n.split(' ').slice(0, 12).join(' ');
    };

    const getDomainFromUrl = (u) => {
      try {
        return new URL(String(u || '')).hostname.replace(/^www\./, '').toLowerCase();
      } catch {
        return '';
      }
    };

    const tokenScore = (a, b) => {
      const stop = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'a', 'un', 'una', 'con', 'por', 'para', 'al', 'the', 'and', 'of', 'to', 'in', 'on']);
      const ta = removeDiacritics(normalizeText(a)).split(' ').filter(w => w && w.length > 2 && !stop.has(w));
      const tb = new Set(removeDiacritics(normalizeText(b)).split(' ').filter(w => w && w.length > 2 && !stop.has(w)));
      let score = 0;
      for (const w of ta) {
        if (tb.has(w)) score += 1;
      }
      return score;
    };

    const maybeEnrichWithGdeltImages = async (items) => {
      const list = Array.isArray(items) ? items : [];
      if (!list.length) return list;
      if (list.some(i => i.image && String(i.image).trim().length)) return list;

      const query = [
        'El Salvador',
        '(tourism OR turismo OR cruise OR crucero OR port OR puerto OR airport OR aeropuerto OR investment OR inversion OR desarrollo OR development OR surf OR "La Libertad")'
      ].join(' ');

      const params = new URLSearchParams({
        query,
        mode: 'ArtList',
        format: 'json',
        maxrecords: '80',
        sort: 'HybridRel',
        timelast: '1209600'
      });

      const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) return list;
      const data = await res.json();
      const articles = Array.isArray(data?.articles) ? data.articles : [];

      const gdelt = articles
        .map(a => {
          const t = a?.title || '';
          const u = a?.url || '';
          const img = a?.socialimage || '';
          const dom = (a?.domain || getDomainFromUrl(u) || '').toLowerCase();
          return {
            title: t,
            key: titleKey(t),
            domain: dom,
            domainHint: normalizeHint(dom),
            image: img,
            url: u
          };
        })
        .filter(a => Boolean(a.image && String(a.image).trim().length));

      const enriched = list.map(item => {
        if (item.image && String(item.image).trim().length) return item;
        const rawTitle = item.titleEs || item.titleEn;
        const { baseTitle, publisher } = splitTitleAndPublisher(rawTitle);
        const publisherHint = normalizeHint(publisher);

        let candidates = gdelt;
        if (publisherHint) {
          const pubNoSpaces = publisherHint.replace(/\s+/g, '');
          const narrowed = gdelt.filter(g => {
            const d = String(g.domainHint || '').replace(/\s+/g, '');
            return d.includes(pubNoSpaces) || pubNoSpaces.includes(d);
          });
          if (narrowed.length) candidates = narrowed;
        }

        let best = null;
        let bestScore = 0;
        for (const c of candidates) {
          const s = tokenScore(baseTitle, c.title);
          if (s > bestScore) {
            bestScore = s;
            best = c;
          }
        }

        if (best && bestScore >= 3) return { ...item, image: best.image };
        return item;
      });

      return enriched;
    };

    const parseRss = (xml) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let m;
      while ((m = itemRegex.exec(xml)) && items.length < 12) {
        const block = m[1];
        const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1]
          || (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1]
          || '';
        const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
        const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
        const description = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1]
          || (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1]
          || '';
        const mediaContentUrl = (block.match(/<media:content[^>]*?url="([^"]+)"[^>]*?>/i) || [])[1]
          || (block.match(/<media:content[^>]*?url='([^']+)'[^>]*?>/i) || [])[1]
          || '';
        const mediaThumbUrl = (block.match(/<media:thumbnail[^>]*?url="([^"]+)"[^>]*?>/i) || [])[1]
          || (block.match(/<media:thumbnail[^>]*?url='([^']+)'[^>]*?>/i) || [])[1]
          || '';
        const enclosureUrl = (block.match(/<enclosure[^>]*?url="([^"]+)"[^>]*?>/i) || [])[1]
          || (block.match(/<enclosure[^>]*?url='([^']+)'[^>]*?>/i) || [])[1]
          || '';
        const image = mediaContentUrl || mediaThumbUrl || enclosureUrl || '';
        if (!title || !link) continue;
        items.push({
          title: title.trim(),
          link: link.trim(),
          pubDate: pubDate.trim(),
          description: description.trim(),
          image: image.trim()
        });
      }
      return items;
    };

    const toIsoDate = (pubDate) => {
      if (!pubDate) return '';
      const d = new Date(pubDate);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    };

    const fetchGoogleNewsRss = async () => {
      const q = 'El Salvador (turismo OR crucero OR puerto OR aeropuerto OR inversion OR inversión OR desarrollo OR surf OR "La Libertad")';
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es-419&gl=US&ceid=US:es-419`;
      const res = await fetch(rssUrl, {
        headers: { 'user-agent': 'intercoast-advisors/1.0' }
      });
      if (!res.ok) return [];
      const xml = await res.text();
      const rawItems = parseRss(xml);

      const mapped = rawItems.map(it => {
        const date = toIsoDate(it.pubDate);
        const snippet = truncate(stripHtml(it.description), 160);
        const inferred = inferCategory(`${it.title} ${snippet}`);
        return {
          categoryEs: inferred.es,
          categoryEn: inferred.en,
          titleEs: it.title,
          titleEn: it.title,
          summaryEs: snippet,
          summaryEn: snippet,
          date,
          image: it.image || '',
          source: 'Google News',
          url: it.link
        };
      }).filter(item => {
        const blocked = containsAny(`${item.titleEs} ${item.summaryEs}`, keywordBlock);
        return Boolean(item.url) && !blocked;
      });

      const top = mapped.slice(0, 3);
      return await maybeEnrichWithGdeltImages(top);
    };

    const rssItems = await fetchGoogleNewsRss();
    if (rssItems.length) {
      return new Response(JSON.stringify({ items: rssItems }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=900'
        }
      });
    }

    const queryPrimary = [
      'El Salvador',
      '(tourism OR turismo OR cruise OR crucero OR port OR puerto OR airport OR aeropuerto OR investment OR inversion OR development OR desarrollo OR surf OR "La Libertad")'
    ].join(' ');

    const querySecondary = [
      'El Salvador',
      '(tourism OR turismo OR travel OR viaje OR investment OR inversion OR development OR desarrollo OR airport OR aeropuerto OR port OR puerto OR surf)'
    ].join(' ');

    const fetchArticles = async (query, timelast) => {
      const params = new URLSearchParams({
        query,
        mode: 'ArtList',
        format: 'json',
        maxrecords: '120',
        sort: 'HybridRel',
        timelast
      });

      const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.articles) ? data.articles : [];
    };

    let articles = await fetchArticles(queryPrimary, '2592000');

    const mapAndSelect = (articles) => {
      const mapped = articles.map(a => {
      const title = a?.title || '';
      const excerpt = a?.excerpt || a?.summary || a?.description || '';
      const date = a?.seendate ? String(a.seendate).slice(0, 10) : '';
      const image = a?.socialimage || '';
      const urlA = a?.url || '';
      const source = a?.domain || a?.sourceCountry || 'GDELT';

      return {
        categoryEs: 'Actualidad',
        categoryEn: 'Update',
        titleEs: title,
        titleEn: title,
        summaryEs: excerpt,
        summaryEn: excerpt,
        date,
        image,
        source,
        url: urlA
      };
      }).filter(item => {
      const text = `${item.titleEs} ${item.summaryEs}`;
      const blocked = containsAny(text, keywordBlock);
      return Boolean(item.url) && !blocked;
      });

      const withImages = mapped.filter(i => Boolean(i.image && String(i.image).trim().length));
      const withoutImages = mapped.filter(i => !(i.image && String(i.image).trim().length));
      const selected = withImages.slice(0, 3);
      if (selected.length < 3) selected.push(...withoutImages.slice(0, 3 - selected.length));
      return selected;
    };

    let selected = mapAndSelect(articles);
    if (!selected.length) {
      articles = await fetchArticles(querySecondary, '7776000');
      selected = mapAndSelect(articles);
    }

    return new Response(JSON.stringify({ items: selected }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=900'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
};
