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
        if (!title || !link) continue;
        items.push({ title: title.trim(), link: link.trim(), pubDate: pubDate.trim() });
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
        return {
          categoryEs: 'Actualidad',
          categoryEn: 'Update',
          titleEs: it.title,
          titleEn: it.title,
          summaryEs: '',
          summaryEn: '',
          date,
          image: '',
          source: 'Google News',
          url: it.link
        };
      }).filter(item => {
        const blocked = containsAny(item.titleEs, keywordBlock);
        return Boolean(item.url) && !blocked;
      });

      return mapped.slice(0, 3);
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
