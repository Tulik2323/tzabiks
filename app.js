(() => {
  const STRINGS = {
    he: {
      'nav.products': 'מוצרים', 'nav.about': 'אודות', 'nav.contact': 'צור קשר',
      'hero.eyebrow': 'אפליקציות · כלים · אוטומציה',
      'hero.title': 'כלים חכמים שבניתי, במקום אחד',
      'hero.lead': 'כאן תמצאו את האפליקציות והכלים שאני מפתח: מה כל אחד עושה, איפה הוא עומד, ואיך מתחילים להשתמש בו.',
      'hero.cta': 'לכל המוצרים', 'hero.cta2': 'דברו איתי',
      'products.title': 'המוצרים',
      'about.title': 'אודות',
      'about.body': 'אני טוליק. אני בונה כלים שחוסכים זמן ופותרים בעיות אמיתיות, בעיקר עם בינה מלאכותית ואוטומציה. כל מוצר כאן התחיל מצורך שלי או של מישהו שאני מכיר.',
      'contact.title': 'צור קשר',
      'contact.lead': 'רוצים להשתמש באחד הכלים, או שיש לכם רעיון לכלי חדש? כתבו לי.',
      'contact.name': 'שם', 'contact.email': 'אימייל',
      'contact.product': 'על איזה מוצר? (לא חובה)', 'contact.general': 'פנייה כללית',
      'contact.message': 'הודעה', 'contact.send': 'שליחה',
      'contact.sending': 'שולח…',
      'contact.ok': 'ההודעה התקבלה. אחזור אליך בהקדם.',
      'contact.fail': 'השליחה נכשלה. בדקו את החיבור ונסו שוב.',
      'filter.all': 'הכל',
      'cat.app': 'אפליקציות', 'cat.tool': 'כלים', 'cat.automation': 'אוטומציה', 'cat.ai': 'בינה מלאכותית',
      'status.live': 'פעיל', 'status.beta': 'בטא', 'status.soon': 'בקרוב',
      'link.open': 'פתיחה', 'link.details': 'לפרטים',
      'example': 'כרטיס לדוגמה',
      'empty': 'אין עדיין מוצרים בקטגוריה הזו.',
      'loadFail': 'לא הצלחתי לטעון את רשימת המוצרים.',
      'page.back': 'כל המוצרים',
      'page.notFound': 'המוצר הזה לא נמצא.'
    },
    en: {
      'nav.products': 'Products', 'nav.about': 'About', 'nav.contact': 'Contact',
      'hero.eyebrow': 'Apps · Tools · Automation',
      'hero.title': 'Smart tools I built, in one place',
      'hero.lead': 'The apps and tools I develop: what each one does, where it stands, and how to start using it.',
      'hero.cta': 'See all products', 'hero.cta2': 'Talk to me',
      'products.title': 'Products',
      'about.title': 'About',
      'about.body': "I'm Tulik. I build tools that save time and solve real problems, mostly with AI and automation. Every product here started from a need I had, or someone I know had.",
      'contact.title': 'Contact',
      'contact.lead': 'Want to use one of the tools, or have an idea for a new one? Write to me.',
      'contact.name': 'Name', 'contact.email': 'Email',
      'contact.product': 'Which product? (optional)', 'contact.general': 'General inquiry',
      'contact.message': 'Message', 'contact.send': 'Send',
      'contact.sending': 'Sending…',
      'contact.ok': "Message received. I'll get back to you soon.",
      'contact.fail': 'Sending failed. Check your connection and try again.',
      'filter.all': 'All',
      'cat.app': 'Apps', 'cat.tool': 'Tools', 'cat.automation': 'Automation', 'cat.ai': 'AI',
      'status.live': 'Live', 'status.beta': 'Beta', 'status.soon': 'Coming soon',
      'link.open': 'Open', 'link.details': 'Details',
      'example': 'Example card',
      'empty': 'No products in this category yet.',
      'loadFail': "Couldn't load the product list.",
      'page.back': 'All products',
      'page.notFound': "This product wasn't found."
    }
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  let lang = store.get('lang') === 'en' ? 'en' : 'he';
  let products = [];
  let filter = 'all';
  let loadError = false;
  let loaded = false;

  const $ = (id) => document.getElementById(id);
  const t = (key) => STRINGS[lang][key] ?? key;
  const pick = (v) => (v && typeof v === 'object') ? (v[lang] || v.he || v.en || '') : (v || '');
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? u : '';
  const asset = (p) => !p ? '' : /^https?:\/\//i.test(p) || p.startsWith('/') ? p : '/' + p;
  const productHref = (p) => '/product/' + encodeURIComponent(p.id);
  const list = (v) => Array.isArray(v) ? v : [];

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    $('lang').textContent = lang === 'he' ? 'EN' : 'עב';
    render();
  }

  function render() {
    if ($('grid')) { renderFilters(); renderGrid(); }
    if ($('f-product')) renderProductOptions();
    if ($('product')) renderProductPage();
  }

  function renderFilters() {
    const box = $('filters');
    box.replaceChildren();
    const cats = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];
    if (cats.length < 3) return;
    cats.forEach((c) => {
      const b = el('button', { type: 'button', class: 'chip', role: 'tab', 'aria-selected': String(c === filter) },
        c === 'all' ? t('filter.all') : (STRINGS[lang]['cat.' + c] || c));
      b.addEventListener('click', () => { filter = c; renderFilters(); renderGrid(); });
      box.appendChild(b);
    });
  }

  function statusBadge(p) {
    return p.status ? el('span', { class: 'status ' + p.status }, t('status.' + p.status)) : null;
  }

  function tagRow(p) {
    if (!list(p.tags).length) return null;
    const tags = el('div', { class: 'tags' });
    p.tags.forEach((tg) => tags.appendChild(el('span', { class: 'tag' }, tg)));
    return tags;
  }

  function renderGrid() {
    const grid = $('grid');
    grid.replaceChildren();
    if (loadError) { grid.appendChild(el('p', { class: 'empty' }, t('loadFail'))); return; }
    if (!loaded) return;
    const shown = products.filter((p) => filter === 'all' || p.category === filter);
    if (!shown.length) { grid.appendChild(el('p', { class: 'empty' }, t('empty'))); return; }

    shown.forEach((p) => {
      const card = el('article', { class: 'card' });
      const media = el('a', { class: 'card-media', href: productHref(p), tabindex: '-1', 'aria-hidden': 'true' });
      if (p.image) media.appendChild(el('img', { src: asset(p.image), alt: '', loading: 'lazy' }));
      else media.appendChild(el('img', { src: asset(p.logo) || '/assets/tk-logo.png', alt: '', class: 'ph' }));
      card.appendChild(media);

      const body = el('div', { class: 'card-body' });
      const top = el('div', { class: 'card-top' });
      const h = el('h3');
      h.appendChild(el('a', { href: productHref(p), class: 'card-title' }, pick(p.name)));
      top.appendChild(h);
      const badge = statusBadge(p); if (badge) top.appendChild(badge);
      body.appendChild(top);
      if (p.example) body.appendChild(el('span', { class: 'example-flag' }, t('example')));
      if (p.tagline) body.appendChild(el('p', { class: 'tagline' }, pick(p.tagline)));
      if (p.description) body.appendChild(el('p', { class: 'desc' }, pick(p.description)));
      const tags = tagRow(p); if (tags) body.appendChild(tags);

      const links = el('div', { class: 'card-links' });
      links.appendChild(el('a', { href: productHref(p) }, t('link.details') + (lang === 'he' ? ' ←' : ' →')));
      const url = safeUrl(p.url);
      if (url) links.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener' }, t('link.open') + ' ↗'));
      body.appendChild(links);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function renderProductOptions() {
    const sel = $('f-product');
    const wanted = sel.value || new URLSearchParams(location.search).get('product') || '';
    sel.replaceChildren(el('option', { value: '' }, t('contact.general')));
    products.filter((p) => !p.example).forEach((p) => {
      sel.appendChild(el('option', { value: p.id }, pick(p.name)));
    });
    sel.value = [...sel.options].some((o) => o.value === wanted) ? wanted : '';
  }

  const PP = {
    he: {
      download: 'הורדת המתקין', downloadNow: 'הורדה מיידית', demo: 'בקשת הדגמה', step: 'שלב',
      version: 'גרסה', date: 'תאריך', changes: 'עיקרי השינויים',
      historyEyebrow: 'היסטוריית גרסאות', historyTitle: 'התפתחות המערכת', showAll: 'הצגת כל הגרסאות',
      footer: 'מתעניינים ב-{name}? כתבו לי ונתאם הדגמה.',
      featuresTitle: 'מה זה עושה', stepsTitle: 'איך זה עובד', problemTitle: 'הבעיה',
      screens: 'צילומי מסך', audience: 'למי זה מתאים', requirements: 'מה צריך כדי להתחיל', faq: 'שאלות נפוצות',
      downloadTitle: 'הורדה והתקנה', latest: 'LATEST RELEASE', preview: 'PREVIEW'
    },
    en: {
      download: 'Download the installer', downloadNow: 'Download now', demo: 'Request a demo', step: 'STAGE',
      version: 'Version', date: 'Date', changes: 'What changed',
      historyEyebrow: 'Version history', historyTitle: 'How it has evolved', showAll: 'Show all versions',
      footer: "Interested in {name}? Write to me and we'll set up a demo.",
      featuresTitle: 'What it does', stepsTitle: 'How it works', problemTitle: 'The problem',
      screens: 'Screenshots', audience: "Who it's for", requirements: 'What you need to start', faq: 'FAQ',
      downloadTitle: 'Download & install', latest: 'LATEST RELEASE', preview: 'PREVIEW'
    }
  };
  const pp = (k) => PP[lang][k];
  const pad = (n) => String(n).padStart(2, '0');

  function ppHead(eyebrow, title, intro) {
    const h = el('div', { class: 'pp-head' });
    if (eyebrow) h.appendChild(el('p', { class: 'pp-eyebrow' }, eyebrow));
    if (title) h.appendChild(el('h2', {}, title));
    if (intro) h.appendChild(el('p', { class: 'pp-intro' }, intro));
    return h;
  }

  function ppSection(id, head, ...children) {
    const s = el('section', { class: 'pp-section', id });
    if (head) s.appendChild(head);
    children.filter(Boolean).forEach((c) => s.appendChild(c));
    return s;
  }

  function ppPanel(label, meta, body) {
    const panel = el('div', { class: 'pp-panel' });
    const bar = el('div', { class: 'pp-bar mono' });
    bar.appendChild(el('span', {}, label));
    bar.appendChild(el('span', {}, meta || '●●●'));
    panel.appendChild(bar);
    panel.appendChild(body);
    return panel;
  }

  function ppRow(state, name, meta, spark) {
    const r = el('div', { class: 'pp-row ' + (state || 'ok') });
    r.appendChild(el('span', { class: 'pp-dot ' + (state || 'ok') }));
    const txt = el('div');
    txt.appendChild(el('div', { class: 'pp-row-name' }, name));
    if (meta) txt.appendChild(el('div', { class: 'pp-row-meta mono' }, meta));
    r.appendChild(txt);
    const sp = el('div', { class: 'pp-spark' });
    list(spark).forEach((h) => { const i = el('i'); i.style.height = Math.max(5, Math.min(100, +h || 0)) + '%'; sp.appendChild(i); });
    r.appendChild(sp);
    return r;
  }

  function heroVisual(p, pg) {
    const wrap = el('div', { class: 'pp-visual' });
    const badge = el('div', { class: 'pp-badge', 'aria-hidden': 'true' });
    const inner = el('div', { class: 'pp-badge-inner' });
    const front = el('div', { class: 'pp-badge-face front' });
    front.appendChild(el('img', { src: asset(p.logo) || '/assets/tk-logo.png', alt: '' }));
    inner.appendChild(front);
    inner.appendChild(el('div', { class: 'pp-badge-face back' }));
    badge.appendChild(inner);
    wrap.appendChild(badge);

    const body = el('div', { class: 'pp-panel-body' });
    if (p.image) {
      body.classList.add('img');
      body.appendChild(el('img', { src: asset(p.image), alt: pick(p.name) }));
      wrap.appendChild(ppPanel(pick(p.name).toUpperCase() + ' · ' + pp('preview'), '', body));
    } else if (pg.preview && list(pg.preview.rows).length) {
      pg.preview.rows.forEach((r) => body.appendChild(ppRow(r.state, pick(r.name), pick(r.meta), r.spark)));
      const panel = ppPanel(pick(pg.preview.label) || pp('preview'), pick(pg.preview.meta), body);
      if (pg.preview.note) panel.appendChild(el('div', { class: 'pp-note mono' }, '* ' + pick(pg.preview.note)));
      wrap.appendChild(panel);
    } else {
      const feats = list(pg.features && pg.features.groups).flatMap((g) => list(g.items)).slice(0, 4);
      const fallback = feats.length ? feats.map((f) => pick(f.title)) : list(p.tags);
      fallback.forEach((name, i) => body.appendChild(ppRow('ok', name, '', [30 + i * 10, 50, 40 + i * 5, 60, 45])));
      if (!fallback.length) body.appendChild(ppRow('ok', pick(p.tagline), '', []));
      wrap.appendChild(ppPanel(pick(p.name).toUpperCase(), '', body));
    }
    return wrap;
  }

  function renderProductPage() {
    const root = $('product');
    root.replaceChildren();
    if (loadError) { root.appendChild(el('p', { class: 'empty' }, t('loadFail'))); return; }
    if (!loaded) return;

    const id = decodeURIComponent(location.pathname.split('/product/')[1] || '').replace(/\/$/, '')
      || new URLSearchParams(location.search).get('id') || '';
    const p = products.find((x) => x.id === id);

    const wrap = el('div', { class: 'pp' });
    root.appendChild(wrap);
    wrap.appendChild(el('a', { class: 'back', href: '/#products' }, (lang === 'he' ? '→ ' : '← ') + t('page.back')));

    if (!p) {
      wrap.appendChild(el('p', { class: 'empty' }, t('page.notFound')));
      document.title = 'TULIK';
      return;
    }
    document.title = pick(p.name) + ' · TULIK';
    const pg = p.page || {};
    const contactHref = '/?product=' + encodeURIComponent(p.id) + '#contact';
    const dl = pg.download && safeUrl(pg.download.url) ? pg.download : null;
    const url = safeUrl(p.url);

    const hero = el('section', { class: 'pp-hero' });
    const text = el('div');
    const meta = el('div', { class: 'p-meta' });
    if (pg.eyebrow) meta.appendChild(el('p', { class: 'pp-eyebrow' }, pick(pg.eyebrow)));
    else if (p.category) meta.appendChild(el('p', { class: 'pp-eyebrow' }, STRINGS[lang]['cat.' + p.category] || p.category));
    const badge = statusBadge(p); if (badge) meta.appendChild(badge);
    text.appendChild(meta);

    const h1 = el('h1', { class: 'pp-title' });
    const headline = pick(pg.headline) || pick(p.tagline) || pick(p.name);
    const emph = pick(pg.emphasis);
    const at = emph ? headline.indexOf(emph) : -1;
    if (at >= 0) {
      h1.append(headline.slice(0, at));
      h1.appendChild(el('em', {}, emph));
      h1.append(headline.slice(at + emph.length));
    } else h1.textContent = headline;
    text.appendChild(h1);
    if (pg.headline && p.name) text.appendChild(el('p', { class: 'pp-product mono' }, pick(p.name)));
    text.appendChild(el('p', { class: 'pp-lede' }, pick(pg.lede) || pick(p.description)));

    const ctas = el('div', { class: 'cta-row' });
    if (dl) ctas.appendChild(el('a', { class: 'btn primary', href: '#download' }, pp('download')));
    else if (url) ctas.appendChild(el('a', { class: 'btn primary', href: url, target: '_blank', rel: 'noopener' }, t('link.open') + ' ↗'));
    ctas.appendChild(el('a', { class: 'btn ' + (dl || url ? 'ghost' : 'primary'), href: contactHref }, pp('demo')));
    text.appendChild(ctas);
    if (pg.microcopy) text.appendChild(el('p', { class: 'pp-micro mono' }, pick(pg.microcopy)));
    else if (list(p.tags).length) text.appendChild(el('p', { class: 'pp-micro mono' }, p.tags.join(' · ').toUpperCase()));
    hero.appendChild(text);
    hero.appendChild(heroVisual(p, pg));
    wrap.appendChild(hero);

    const pr = pg.problem;
    if (pr && (pr.title || list(pr.paragraphs).length || typeof pr.he === 'string')) {
      const grid = el('div', { class: 'pp-problem' });
      const left = el('div');
      left.appendChild(ppHead(pick(pr.eyebrow), pick(pr.title) || pp('problemTitle')));
      const paras = typeof pr.he === 'string' ? [pr] : list(pr.paragraphs);
      paras.forEach((x) => left.appendChild(el('p', {}, pick(x))));
      grid.appendChild(left);
      if (list(pr.points).length) {
        const ul = el('ul', { class: 'pp-stakes' });
        pr.points.forEach((pt) => {
          const li = el('li');
          li.appendChild(el('b', {}, pick(pt.title)));
          if (pt.text) li.appendChild(el('span', {}, pick(pt.text)));
          ul.appendChild(li);
        });
        grid.appendChild(ul);
      }
      wrap.appendChild(ppSection('problem', null, grid));
    }

    const fx = pg.features;
    const groups = Array.isArray(fx) ? [{ items: fx }] : list(fx && fx.groups);
    if (groups.some((g) => list(g.items).length)) {
      const box = el('div');
      groups.forEach((g) => {
        const grp = el('div', { class: 'pp-feat-group' });
        if (g.code || g.name) grp.appendChild(el('div', { class: 'pp-feat-cat mono' }, [g.code, pick(g.name)].filter(Boolean).join(' · ')));
        list(g.items).forEach((f, i) => {
          const row = el('div', { class: 'pp-feat-row' });
          row.appendChild(el('div', { class: 'pp-feat-code mono' }, (g.code ? g.code + '-' : '') + pad(i + 1)));
          const d = el('div');
          d.appendChild(el('p', { class: 'pp-feat-name' }, pick(f.title)));
          if (f.text) d.appendChild(el('p', { class: 'pp-feat-desc' }, pick(f.text)));
          row.appendChild(d);
          grp.appendChild(row);
        });
        box.appendChild(grp);
      });
      wrap.appendChild(ppSection('features',
        ppHead(pick(fx && fx.eyebrow), pick(fx && fx.title) || pp('featuresTitle'), pick(fx && fx.intro)), box));
    }

    const st = pg.steps;
    const steps = Array.isArray(st) ? st : list(st && st.items);
    if (steps.length) {
      const flow = el('div', { class: 'pp-flow' });
      flow.style.setProperty('--cols', Math.min(steps.length, 4));
      steps.forEach((s, i) => {
        const c = el('div', { class: 'pp-flow-step' });
        c.appendChild(el('div', { class: 'pp-flow-code mono' }, pp('step') + ' ' + pad(i + 1)));
        if (s.title) {
          c.appendChild(el('h3', {}, pick(s.title)));
          if (s.text) c.appendChild(el('p', {}, pick(s.text)));
        } else c.appendChild(el('h3', {}, pick(s)));
        flow.appendChild(c);
      });
      wrap.appendChild(ppSection('how',
        ppHead(pick(st && st.eyebrow), pick(st && st.title) || pp('stepsTitle'), pick(st && st.intro)), flow));
    }

    if (list(pg.screenshots).length) {
      const shots = el('div', { class: 'pp-shots' });
      pg.screenshots.forEach((s) => {
        const fig = el('figure');
        fig.appendChild(el('img', { src: asset(s.src || s), alt: pick(s.caption) || pick(p.name), loading: 'lazy' }));
        if (s.caption) fig.appendChild(el('figcaption', {}, pick(s.caption)));
        shots.appendChild(fig);
      });
      wrap.appendChild(ppSection('screens', ppHead('', pp('screens')), shots));
    }

    const stats = pg.stats;
    if (stats && list(stats.items).length) {
      const g = el('div', { class: 'pp-stats' });
      stats.items.forEach((s) => {
        const c = el('div', { class: 'pp-stat' });
        c.appendChild(el('span', { class: 'pp-stat-num' }, pick(s.value)));
        c.appendChild(el('span', { class: 'pp-stat-label' }, pick(s.label)));
        g.appendChild(c);
      });
      wrap.appendChild(ppSection('stats', ppHead(pick(stats.eyebrow), pick(stats.title)), g));
    }

    if (pg.audience || list(pg.requirements).length) {
      const two = el('div', { class: 'pp-two' });
      if (pg.audience) {
        const a = el('div');
        a.appendChild(ppHead('', pp('audience')));
        a.appendChild(el('p', { class: 'pp-intro' }, pick(pg.audience)));
        two.appendChild(a);
      }
      if (list(pg.requirements).length) {
        const r = el('div');
        r.appendChild(ppHead('', pp('requirements')));
        const ul = el('ul', { class: 'pp-reqs' });
        pg.requirements.forEach((x) => ul.appendChild(el('li', {}, pick(x))));
        r.appendChild(ul);
        two.appendChild(r);
      }
      wrap.appendChild(ppSection('fit', null, two));
    }

    if (dl) {
      const body = el('div', { class: 'pp-dl' });
      const info = el('div');
      if (dl.version) {
        const tag = el('span', { class: 'pp-dl-tag mono' }, 'VERSION ');
        tag.appendChild(el('b', {}, dl.version));
        info.appendChild(tag);
      }
      if (dl.platforms) info.appendChild(el('div', { class: 'pp-dl-os' }, pick(dl.platforms)));
      body.appendChild(info);
      body.appendChild(el('a', { class: 'btn primary', href: dl.url, rel: 'noopener' }, pp('downloadNow')));
      const panel = ppPanel(pp('latest'), '', body);
      if (dl.sha256) panel.appendChild(el('div', { class: 'pp-note mono pp-sha' }, 'SHA256: ' + dl.sha256));
      wrap.appendChild(ppSection('download',
        ppHead(pick(dl.eyebrow) || pp('downloadTitle'), pick(dl.title), pick(dl.intro)), panel));
    }

    if (list(pg.faq).length) {
      const box = el('div', { class: 'faq' });
      pg.faq.forEach((f) => {
        const d = el('details');
        d.appendChild(el('summary', {}, pick(f.q)));
        d.appendChild(el('p', {}, pick(f.a)));
        box.appendChild(d);
      });
      wrap.appendChild(ppSection('faq', ppHead('', pp('faq')), box));
    }

    if (list(pg.changelog).length) {
      const mkTable = (rows) => {
        const tw = el('div', { class: 'pp-table-wrap' });
        const tb = el('table', { class: 'pp-rev' });
        const hasDate = rows.some((r) => r.date);
        const head = el('tr');
        head.appendChild(el('th', {}, pp('version')));
        if (hasDate) head.appendChild(el('th', {}, pp('date')));
        head.appendChild(el('th', {}, pp('changes')));
        const thead = el('thead'); thead.appendChild(head); tb.appendChild(thead);
        const body = el('tbody');
        rows.forEach((r) => {
          const tr = el('tr');
          tr.appendChild(el('td', { class: 'rev mono' }, r.version));
          if (hasDate) tr.appendChild(el('td', { class: 'when' }, pick(r.date)));
          tr.appendChild(el('td', { class: 'desc' }, pick(r.text)));
          body.appendChild(tr);
        });
        tb.appendChild(body); tw.appendChild(tb);
        return tw;
      };
      const all = pg.changelog;
      const sec = ppSection('history', ppHead(pp('historyEyebrow'), pp('historyTitle')), mkTable(all.slice(0, 5)));
      if (all.length > 5) {
        const more = el('details', { class: 'pp-more' });
        more.appendChild(el('summary', {}, pp('showAll') + ' (' + all.length + ')'));
        more.appendChild(mkTable(all.slice(5)));
        sec.appendChild(more);
      }
      wrap.appendChild(sec);
    }

    const foot = el('div', { class: 'pp-footer-cta' });
    const fp = el('p');
    const [before, after] = pp('footer').split('{name}');
    fp.append(before);
    fp.appendChild(el('bdi', {}, pick(p.name)));
    fp.append(after);
    foot.appendChild(fp);
    foot.appendChild(el('a', { class: 'btn primary', href: contactHref }, pp('demo')));
    wrap.appendChild(foot);
  }

  async function loadProducts() {
    try {
      const res = await fetch('/products/products.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      products = await res.json();
    } catch {
      loadError = true;
    }
    loaded = true;
    render();
  }

  function setupForm() {
    const form = $('contact-form');
    if (!form) return;
    const status = $('form-status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = t('contact.sending');
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = t('contact.ok');
      } catch {
        status.className = 'form-status error';
        status.textContent = t('contact.fail');
      }
    });
  }

  function setupCube() {
    const cube = $('cube');
    const stage = $('stage');
    if (!cube) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseX = -18, autoVy = reduce ? 0 : 0.3;
    let rx = baseX, ry = 30, vx = 0, vy = autoVy;
    let dragging = false, lx = 0, ly = 0, idleSince = 0, visible = true;

    const draw = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };

    stage.addEventListener('pointerdown', (e) => {
      dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      vy = dx * 0.4; vx = -dy * 0.4;
      ry += vy; rx += vx;
      draw();
    });
    const end = () => { dragging = false; idleSince = performance.now(); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);

    const tick = (now) => {
      if (!dragging && visible) {
        vx *= 0.95; vy *= 0.95;
        if (now - idleSince > 1200) {
          vy += (autoVy - vy) * 0.02;
          rx += (baseX - rx) * 0.02;
        }
        ry += vy; rx += vx;
        draw();
      }
      requestAnimationFrame(tick);
    };
    draw();
    requestAnimationFrame(tick);
  }

  $('lang').addEventListener('click', () => {
    lang = lang === 'he' ? 'en' : 'he';
    store.set('lang', lang);
    applyLang();
  });
  $('year').textContent = new Date().getFullYear();

  applyLang();
  setupCube();
  setupForm();
  loadProducts();
})();
