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
      'link.open': 'פתיחה', 'link.repo': 'קוד',
      'example': 'כרטיס לדוגמה',
      'empty': 'אין עדיין מוצרים בקטגוריה הזו.',
      'loadFail': 'לא הצלחתי לטעון את רשימת המוצרים.'
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
      'link.open': 'Open', 'link.repo': 'Code',
      'example': 'Example card',
      'empty': 'No products in this category yet.',
      'loadFail': "Couldn't load the product list."
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

  const t = (key) => STRINGS[lang][key] ?? key;
  const pick = (v) => (v && typeof v === 'object') ? (v[lang] || v.he || v.en || '') : (v || '');
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? u : '';

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.getElementById('lang').textContent = lang === 'he' ? 'EN' : 'עב';
    renderFilters();
    renderGrid();
    renderProductOptions();
  }

  function renderFilters() {
    const box = document.getElementById('filters');
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

  function renderGrid() {
    const grid = document.getElementById('grid');
    grid.replaceChildren();
    if (loadError) { grid.appendChild(el('p', { class: 'empty' }, t('loadFail'))); return; }
    const list = products.filter((p) => filter === 'all' || p.category === filter);
    if (!list.length) { grid.appendChild(el('p', { class: 'empty' }, t('empty'))); return; }

    list.forEach((p) => {
      const card = el('article', { class: 'card' });
      const media = el('div', { class: 'card-media' });
      if (p.image) media.appendChild(el('img', { src: p.image, alt: pick(p.name), loading: 'lazy' }));
      else media.appendChild(el('img', { src: 'assets/tk-logo.png', alt: '', class: 'ph' }));
      card.appendChild(media);

      const body = el('div', { class: 'card-body' });
      const top = el('div', { class: 'card-top' });
      top.appendChild(el('h3', {}, pick(p.name)));
      if (p.status) top.appendChild(el('span', { class: 'status ' + p.status }, t('status.' + p.status)));
      body.appendChild(top);
      if (p.example) body.appendChild(el('span', { class: 'example-flag' }, t('example')));
      if (p.tagline) body.appendChild(el('p', { class: 'tagline' }, pick(p.tagline)));
      if (p.description) body.appendChild(el('p', { class: 'desc' }, pick(p.description)));

      if (Array.isArray(p.tags) && p.tags.length) {
        const tags = el('div', { class: 'tags' });
        p.tags.forEach((tg) => tags.appendChild(el('span', { class: 'tag' }, tg)));
        body.appendChild(tags);
      }

      const links = el('div', { class: 'card-links' });
      const url = safeUrl(p.url), repo = safeUrl(p.repo);
      if (url) links.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener' }, t('link.open') + ' ↗'));
      if (repo) links.appendChild(el('a', { href: repo, target: '_blank', rel: 'noopener' }, t('link.repo') + ' ↗'));
      if (links.children.length) body.appendChild(links);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function renderProductOptions() {
    const sel = document.getElementById('f-product');
    const current = sel.value;
    sel.replaceChildren(el('option', { value: '' }, t('contact.general')));
    products.filter((p) => !p.example).forEach((p) => {
      sel.appendChild(el('option', { value: p.id }, pick(p.name)));
    });
    sel.value = current;
  }

  async function loadProducts() {
    try {
      const res = await fetch('products/products.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      products = await res.json();
    } catch {
      loadError = true;
    }
    renderFilters();
    renderGrid();
    renderProductOptions();
  }

  function setupForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
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
    const cube = document.getElementById('cube');
    const stage = document.getElementById('stage');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseX = -18, autoVy = reduce ? 0 : 0.3;
    let rx = baseX, ry = 30, vx = 0, vy = autoVy;
    let dragging = false, lx = 0, ly = 0, idleSince = 0, visible = true;

    const render = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };

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
      render();
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
        render();
      }
      requestAnimationFrame(tick);
    };
    render();
    requestAnimationFrame(tick);
  }

  document.getElementById('lang').addEventListener('click', () => {
    lang = lang === 'he' ? 'en' : 'he';
    store.set('lang', lang);
    applyLang();
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  applyLang();
  setupCube();
  setupForm();
  loadProducts();
})();
