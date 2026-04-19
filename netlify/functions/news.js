export default async (request, context) => {
  try {
    const query = [
      'El Salvador',
      '(tourism OR turismo OR cruise OR crucero OR port OR puerto OR airport OR aeropuerto OR investment OR inversion OR development OR desarrollo OR surf OR "La Libertad")'
    ].join(' ');

    const params = new URLSearchParams({
      query,
      mode: 'ArtList',
      format: 'json',
      maxrecords: '80',
      sort: 'HybridRel',
      timelast: '2592000'
    });

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=900'
        }
      });
    }

    const data = await res.json();
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const keywordBlock = [
      'murder', 'homicid', 'kidnap', 'secuest', 'shoot', 'tirote', 'drug', 'narc', 'gang', 'pandill',
      'politic', 'polític', 'election', 'elecci', 'corruption', 'corrup', 'violence', 'violenc'
    ];

    const containsAny = (haystack, needles) => {
      const h = String(haystack || '').toLowerCase();
      return needles.some(n => h.includes(String(n).toLowerCase()));
    };

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
