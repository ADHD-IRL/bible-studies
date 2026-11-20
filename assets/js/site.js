(function () {
  var root = document.documentElement;

  // Menu on small screens
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Light and dark
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Random study
  var rnd = document.getElementById('random-study');
  if (rnd && window.STUDY_URLS && window.STUDY_URLS.length) {
    rnd.addEventListener('click', function () {
      window.location.href = window.STUDY_URLS[Math.floor(Math.random() * window.STUDY_URLS.length)];
    });
  }

  // Library filters
  var lib = document.getElementById('library');
  if (lib) {
    var items = Array.prototype.slice.call(lib.querySelectorAll('.card-wrap'));
    var state = { type: '', testament: '' };
    var params = new URLSearchParams(window.location.search);
    if (params.get('type')) state.type = params.get('type');
    var count = document.getElementById('count');

    function setOn(attr, val) {
      document.querySelectorAll('[' + attr + ']').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute(attr) === val);
      });
    }
    function apply() {
      var shown = 0;
      items.forEach(function (el) {
        var ok = (!state.type || el.dataset.type === state.type) &&
                 (!state.testament || el.dataset.testament === state.testament);
        el.hidden = !ok;
        if (ok) shown++;
      });
      setOn('data-filter-type', state.type);
      setOn('data-filter-testament', state.testament);
      if (count) count.textContent = shown + (shown === 1 ? ' study' : ' studies');
    }
    document.querySelectorAll('[data-filter-type]').forEach(function (b) {
      b.addEventListener('click', function () { state.type = b.getAttribute('data-filter-type'); apply(); });
    });
    document.querySelectorAll('[data-filter-testament]').forEach(function (b) {
      b.addEventListener('click', function () { state.testament = b.getAttribute('data-filter-testament'); apply(); });
    });
    var sort = document.getElementById('sort');
    if (sort) sort.addEventListener('change', function () {
      items.sort(function (a, b) {
        if (sort.value === 'new') return (b.dataset.date || '0').localeCompare(a.dataset.date || '0');
        return a.dataset.title.localeCompare(b.dataset.title);
      });
      items.forEach(function (el) { lib.appendChild(el); });
    });
    apply();
  }

  // Topic filter
  var tf = document.getElementById('topic-filter');
  if (tf) {
    tf.addEventListener('input', function () {
      var q = tf.value.trim().toLowerCase();
      document.querySelectorAll('#topic-cloud .topic, .topic-groups .group').forEach(function (el) {
        el.hidden = q && el.dataset.name.indexOf(q) === -1;
      });
    });
  }

  // Search
  var input = document.getElementById('search-input');
  if (input && window.SEARCH_INDEX) {
    var out = document.getElementById('search-results');
    var info = document.getElementById('search-count');
    var data = [];

    function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function norm(s) { return String(s || '').toLowerCase().replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' '); }
    function mark(text, terms) {
      var html = esc(text);
      terms.forEach(function (t) {
        if (t.length < 2) return;
        var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        html = html.replace(re, '<mark>$1</mark>');
      });
      return html;
    }
    function snippet(c, terms) {
      var lc = c.toLowerCase(), at = -1;
      for (var i = 0; i < terms.length && at < 0; i++) at = lc.indexOf(terms[i]);
      if (at < 0) return '';
      var start = Math.max(0, at - 70);
      return (start > 0 ? '... ' : '') + c.slice(start, at + 150) + ' ...';
    }
    function run() {
      var q = norm(input.value).trim();
      var url = new URL(window.location.href);
      if (q) url.searchParams.set('q', input.value); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
      if (!q) { out.innerHTML = ''; info.textContent = data.length ? data.length + ' studies to search' : ''; return; }
      var terms = q.split(' ').filter(Boolean);
      var hits = [];
      data.forEach(function (d) {
        var title = norm(d.t + ' ' + (d.p || '')), refs = norm((d.r || []).join(' | ')), books = norm((d.b || []).join(' | ')),
            topics = norm((d.k || []).join(' | ')), sum = norm(d.s), body = norm(d.c), type = norm(d.y);
        var score = 0, all = true;
        if (refs.indexOf(q) > -1) score += 40;
        if (title.indexOf(q) > -1) score += 30;
        terms.forEach(function (t) {
          var s = 0;
          if (title.indexOf(t) > -1) s += 10;
          if (refs.indexOf(t) > -1) s += 8;
          if (books.indexOf(t) > -1) s += 7;
          if (topics.indexOf(t) > -1) s += 6;
          if (type.indexOf(t) > -1) s += 3;
          if (sum.indexOf(t) > -1) s += 3;
          if (body.indexOf(t) > -1) s += 1;
          if (!s) all = false;
          score += s;
        });
        if (all && score) hits.push({ d: d, score: score });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      info.textContent = hits.length + (hits.length === 1 ? ' study found' : ' studies found');
      out.innerHTML = hits.slice(0, 60).map(function (h) {
        var d = h.d, snip = snippet(d.c || '', terms);
        return '<a class="result" href="' + esc(d.u) + '">' +
          '<span class="card-type">' + esc(d.y) + '</span>' +
          '<h3>' + mark(d.t, terms) + '</h3>' +
          (d.p ? '<p class="card-passage">' + mark(d.p, terms) + '</p>' : '') +
          '<p>' + mark(d.s || '', terms) + '</p>' +
          (snip ? '<p>' + mark(snip, terms) + '</p>' : '') +
          '<p><small>' + esc((d.b || []).slice(0, 4).join(' · ')) + (d.d ? '  ·  ' + esc(d.d) : '') + '</small></p>' +
          '</a>';
      }).join('') || '<p>Nothing matched. Try fewer words or a book name.</p>';
    }
    fetch(window.SEARCH_INDEX).then(function (r) { return r.json(); }).then(function (j) {
      data = j;
      var q = new URLSearchParams(window.location.search).get('q');
      if (q) input.value = q;
      run();
    });
    var timer;
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    input.focus();
  }
})();
