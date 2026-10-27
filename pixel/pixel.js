/* Game Work Hub – bản "Cream pixel".
 * Dùng chung dữ liệu mã hoá (../data.enc.json) và cách lưu với bản thường (../index.html),
 * chỉ khác giao diện: thanh tab có nhân vật đi bộ, bong bóng thoại, thẻ sticker.
 */
(function () {
  'use strict';
  var C = window.WH_CRYPTO;
  var root = document.getElementById('root');
  var SPR = 'assets/';

  /* ================= Hằng số ================= */
  var TEAMS = {
    NovaS: { solid: '#6D3FC8', tint: '#EFE9FB', fg: '#5229A6' },
    MetaX: { solid: '#1D5FC4', tint: '#E6EEFB', fg: '#174C9E' },
    HiCat: { solid: '#B04A0B', tint: '#FDF0E4', fg: '#8E3B07' },
    Somia: { solid: '#0F766E', tint: '#E3F4F1', fg: '#0B5C55' },
    'Khác': { solid: '#4B5563', tint: '#EEF0F3', fg: '#3D4552' }
  };
  var ORDER = ['NovaS', 'MetaX', 'HiCat', 'Somia', 'Khác'];
  var LINK_TEAMS = ['NovaS', 'MetaX', 'HiCat', 'Somia'];
  var STATUS = {
    'Game mới': { bg: '#DCEFD9', fg: '#14532D' },
    'Đã chạy lâu': { bg: '#DDE6F5', fg: '#1E3A6E' },
    'Duy trì': { bg: '#FCEBC7', fg: '#6B4A00' }
  };
  var SRC = { raw: { bg: '#F6F1E4', fg: '#1E2238' }, event_base: { bg: '#DCEFD9', fg: '#14532D' } };
  var VIEWS = [['games', 'Tổng quan game'], ['teams', 'Link & Note team'], ['notes', 'Ghi chú'], ['tasks', 'Công việc tháng']];
  var TAB_IDX = { games: 0, teams: 1, notes: 2, tasks: 3 };
  var OUTFIT = { games: 'linh-outfit-4.png', teams: 'linh-outfit-3.png', notes: 'linh-outfit-2.png', tasks: 'linh-character-fullbody.png' };
  var SCENE = { games: ['linh-game.png', 'linh-game2.png'], teams: ['linh-outfit-3.png'], notes: ['linh-heart.png'], tasks: ['linh-work.png', 'linh-work2.png'] };
  var STAGE = { games: 'STAGE 01', teams: 'STAGE 02', notes: 'STAGE 03', tasks: 'STAGE 04' };
  var TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>';
  var SEARCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5068" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';

  /* Hình pixel trang trí (vẽ bằng ô vuông) */
  function pix(rows, colors, size) {
    var out = '';
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var c = colors[row[x]];
        if (c) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
      }
    });
    var w = rows[0].length, h = rows.length;
    return '<svg width="' + w * size + '" height="' + h * size + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" shape-rendering="crispEdges">' + out + '</svg>';
  }
  var DECO = {
    star: pix(['...K...', '..KYK..', 'KKKYKKK', 'KYYYYYK', '.KYYYK.', '.KYKYK.', '.K...K.'], { K: '#1E2238', Y: '#F2B84B' }, 5),
    coin: pix(['..KKK..', '.KYYYK.', 'KYYKYYK', 'KYKYYYK', 'KYYKYYK', '.KYYYK.', '..KKK..'], { K: '#1E2238', Y: '#F2B84B' }, 5),
    heart: pix(['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'], { K: '#1E2238', R: '#DE465A', W: '#FFFFFF' }, 5)
  };

  /* ================= Trạng thái ================= */
  var KEY = null, FILE = null, S = null;
  var ui = { view: 'games', editing: false, saved: false, trash: [], team: 'all', q: '', showHidden: false,
    notesMode: 'cards', period: '', taskTeam: 'all', imp: null, toast: '', toastType: 'info' };
  var prevTab = null, sceneKey = '', typer = null;

  /* ================= Tiện ích ================= */
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { u = String(u || '').trim(); return /^https?:\/\//i.test(u) ? u : '#'; }
  function nid() { return S.nextId++; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function tstyle(t) {
    var c = TEAMS[t] || TEAMS['Khác'];
    return '--solid:' + c.solid + ';--tint:' + c.tint + ';--fg:' + c.fg;
  }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr() {
    var d = new Date();
    return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()] + ' ' + p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function monthLabel(m) {
    var a = String(m || '').split('-');
    return a.length === 2 ? 'Tháng ' + parseInt(a[1], 10) + '/' + a[0] : 'Chưa rõ tháng';
  }
  function download(name, text) {
    var b = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function readText(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result || '')); };
      fr.onerror = function () { rej(fr.error); };
      fr.readAsText(file, 'utf-8');
    });
  }
  function readAvatar(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = 96; c.height = 96;
        var s = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 96, 96);
        cb(c.toDataURL('image/jpeg', 0.85));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ================= Dữ liệu (giống bản thường) ================= */
  function buildState(seed) {
    var id = 1;
    var s = { v: 1, avatar: '', games: [], teamItems: {}, notes: [], recent: [], periods: [], tables: {} };
    (seed.games || []).forEach(function (g) {
      s.games.push({ id: id++, name: g[0], sub: g[1], team: g[2], link: g[3], src: g[4], status: g[5], hidden: false, note: g[6] });
    });
    Object.keys(seed.teamItems || {}).forEach(function (k) {
      s.teamItems[k] = seed.teamItems[k].map(function (t) { return { id: id++, kind: 'link', title: t[0], url: t[1], text: '' }; });
    });
    (seed.notes || []).forEach(function (n) { s.notes.push({ id: id++, date: n[0], text: n[1] }); });
    (seed.recent || []).forEach(function (r) { s.recent.push({ team: r[0], game: r[1], text: r[2], date: r[3] }); });
    (seed.periods || []).forEach(function (p) {
      s.periods.push({ id: p[0], m: p[1], label: p[2], source: p[3], range: p[4], title: p[5] || ('Công việc DA · ' + p[2]), url: p[6] || '' });
    });
    Object.keys(seed.tables || {}).forEach(function (k) {
      s.tables[k] = seed.tables[k].map(function (r) { return { id: id++, team: r[0], game: r[1], done: r[2], pending: r[3], note: r[4] }; });
    });
    s.nextId = id;
    return s;
  }
  function ensure(s) {
    s.avatar = s.avatar || '';
    s.games = s.games || []; s.notes = s.notes || []; s.recent = s.recent || [];
    s.periods = s.periods || []; s.tables = s.tables || []; s.teamItems = s.teamItems || {};
    if (Array.isArray(s.tables)) s.tables = {};
    ['chung'].concat(LINK_TEAMS).forEach(function (k) { s.teamItems[k] = s.teamItems[k] || []; });
    var max = 0;
    function look(a) { (a || []).forEach(function (x) { if (x && typeof x.id === 'number' && x.id > max) max = x.id; }); }
    look(s.games); look(s.notes);
    Object.keys(s.teamItems).forEach(function (k) { look(s.teamItems[k]); });
    Object.keys(s.tables).forEach(function (k) { look(s.tables[k]); });
    s.nextId = Math.max(s.nextId || 1, max + 1);
    return s;
  }
  function sortedPeriods() {
    return S.periods.map(function (p, i) { return { p: p, i: i }; })
      .sort(function (a, b) { return a.p.m === b.p.m ? a.i - b.i : (a.p.m < b.p.m ? -1 : 1); })
      .map(function (x) { return x.p; });
  }
  function findPeriod(id) {
    for (var i = 0; i < S.periods.length; i++) if (S.periods[i].id === id) return S.periods[i];
    return null;
  }
  function latestPeriodId() {
    var s = sortedPeriods();
    for (var i = s.length - 1; i >= 0; i--) if (S.tables[s[i].id]) return s[i].id;
    return s.length ? s[s.length - 1].id : '';
  }
  async function persist() {
    try {
      var p = await C.encryptJSON(KEY, S);
      localStorage.setItem('wh_state', JSON.stringify({ base: FILE.ct.slice(0, 24), iv: p.iv, ct: p.ct }));
      return true;
    } catch (e) { return false; }
  }

  /* ================= Khởi động & đăng nhập ================= */
  async function fetchFile() {
    var r = await fetch('../data.enc.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('missing');
    var f = await r.json();
    if (!f.salt || !f.iv || !f.ct) throw new Error('bad');
    return f;
  }
  async function boot() {
    try { FILE = await fetchFile(); }
    catch (e) {
      root.innerHTML = '<div class="login-wrap"><div class="login"><h1>Chưa có dữ liệu</h1><p>Không tìm thấy file <b>data.enc.json</b> ở thư mục gốc. Mở <b>tools/tao-du-lieu.html</b> để tạo file này (xem README.md).</p></div></div>';
      return;
    }
    var raw = null;
    try { raw = sessionStorage.getItem('wh_key'); } catch (e) {}
    if (raw) {
      try { KEY = await C.importKey(raw); await start(await C.decryptJSON(KEY, FILE)); return; }
      catch (e) { KEY = null; try { sessionStorage.removeItem('wh_key'); } catch (e2) {} }
    }
    showLogin('');
  }
  function showLogin(err) {
    root.innerHTML = '<div class="login-wrap"><div class="lscene"><div class="say">Nhập tên và mật khẩu để vào game nhé!</div><img class="px" src="' + SPR + 'linh-character-fullbody.png" alt=""></div>' +
      '<form class="login" id="loginForm" autocomplete="on"><div class="stage">PLAYER 1</div><h1>Game Work Hub</h1><p>Đăng nhập để xem dữ liệu công việc.</p>' +
      (err ? '<div class="err" role="alert">' + esc(err) + '</div>' : '') +
      '<label>Tên đăng nhập<input id="lu" name="username" autocomplete="username" spellcheck="false" required></label>' +
      '<label>Mật khẩu<input id="lp" name="password" type="password" autocomplete="current-password" required></label>' +
      '<button class="btn dark" type="submit" id="loginBtn">Bắt đầu</button></form></div>';
    var u = document.getElementById('lu'); if (u) u.focus();
  }
  async function doLogin(user, pass) {
    var btn = document.getElementById('loginBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang kiểm tra…'; }
    try {
      var r = await C.openFile(FILE, user, pass, true);
      KEY = r.key;
      try { sessionStorage.setItem('wh_key', await C.exportKey(KEY)); } catch (e) {}
      await start(r.data);
    } catch (e) {
      await sleep(700);
      showLogin('Sai tên đăng nhập hoặc mật khẩu.');
    }
  }
  async function start(fileData) {
    var base = FILE.ct.slice(0, 24), local = null;
    try { local = JSON.parse(localStorage.getItem('wh_state') || 'null'); } catch (e) {}
    S = null;
    if (local && local.base === base) { try { S = ensure(await C.decryptJSON(KEY, local)); } catch (e) { S = null; } }
    if (!S) {
      S = ensure(fileData.v ? fileData : buildState(fileData));
      if (local && local.base !== base) { ui.toast = 'Đã nạp dữ liệu mới từ web (bản chỉnh sửa cũ trên trình duyệt này đã được thay).'; ui.toastType = 'info'; }
    }
    ui.period = latestPeriodId();
    var h = location.hash.replace('#', '');
    ui.view = VIEWS.some(function (v) { return v[0] === h; }) ? h : 'games';
    prevTab = null; sceneKey = '';
    render();
  }
  function logout() {
    try { sessionStorage.removeItem('wh_key'); } catch (e) {}
    KEY = null; S = null; ui.editing = false; ui.trash = []; ui.toast = ''; ui.saved = false;
    clearInterval(typer);
    showLogin('');
  }

  /* ================= Thành phần dùng chung ================= */
  function ro() { return ui.editing ? '' : ' readonly'; }
  function fld(o) {
    var a = ' class="cell ' + (o.cls || '') + '" spellcheck="false" aria-label="' + esc(o.label) + '"' + ro() +
      ' placeholder="' + esc(ui.editing ? (o.ph || '') : '') + '" data-c="' + o.c + '" data-id="' + o.id + '" data-k="' + o.k + '"' +
      (o.grp ? ' data-grp="' + esc(o.grp) + '"' : '');
    if (o.area) return '<textarea' + a + ' rows="1">\n' + esc(o.val) + '</textarea>';
    return '<input' + a + (o.type ? ' type="' + o.type + '"' : '') + ' value="' + esc(o.val) + '">';
  }
  function sel(o, opts, cur, st) {
    return '<select class="sel" aria-label="' + esc(o.label) + '" style="background:' + st.bg + ';color:' + st.fg +
      '" data-c="' + o.c + '" data-id="' + o.id + '" data-k="' + o.k + '">' +
      opts.map(function (v) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select>';
  }
  function tail() {
    if (ui.editing) {
      return '<button type="button" class="btn" data-act="recover"' + (ui.trash.length ? '' : ' disabled') + '>↶ Khôi phục · ' + ui.trash.length + '</button>' +
        '<button type="button" class="btn green" data-act="save">✓ Lưu</button>';
    }
    return '<button type="button" class="btn dark" data-act="edit">✎ Chỉnh sửa</button>';
  }
  function banners(extra) {
    var h = '';
    if (ui.toast) h += '<div class="banner ' + (ui.toastType || 'info') + '" role="status"><span>' + esc(ui.toast) + '</span><button type="button" class="x" data-act="toast-close" aria-label="Đóng thông báo">×</button></div>';
    if (ui.editing) h += '<div class="banner warn" role="status"><span>Đang chỉnh sửa: các nút xoá, thêm, ẩn đã bật. Nhớ bấm Lưu khi xong.</span>' + (extra || '') + '</div>';
    else if (ui.saved) h += '<div class="banner ok" role="status">✓ Đã lưu</div>';
    return h;
  }
  function searchBox(ph) {
    return '<label class="search">' + SEARCH + '<span class="sr">Tìm kiếm</span><input type="search" spellcheck="false" placeholder="' + esc(ph) + '" value="' + esc(ui.q) + '" data-search></label>';
  }
  function visibleGames() { return S.games.filter(function (g) { return !g.hidden; }); }

  /* ================= Khung trang, thanh tab, nhân vật ================= */
  function shellHtml() {
    return '<header id="top"><div class="navin">' +
      '<div class="brand"><span id="avaBox"></span><div class="welcome"><span class="wt">WELCOME, PLAYER!</span><span class="ws">Linh\'s Work Hub</span><span class="wsub">Nguyễn Thùy Linh · DA</span></div></div>' +
      '<nav aria-label="Điều hướng chính"><div class="tabs">' + VIEWS.map(function (v) {
        return '<a class="tab" href="#' + v[0] + '" data-tab="' + v[0] + '">' + v[1] + '</a>';
      }).join('') + '</div><div class="track"><div class="walker" id="walker"><span class="flip" id="wflip"><img class="px bob" id="wimg" alt="" src=""></span></div></div></nav>' +
      '<div class="util"><button type="button" class="rl" data-act="export" title="Tải bản sao lưu (đã mã hoá)">⬇ Sao lưu</button>' +
      '<button type="button" class="rl" data-act="import-pick" title="Nạp bản sao lưu">⬆ Nạp</button>' +
      '<input type="file" accept=".json,application/json" class="sr" id="importFile" aria-label="Chọn file sao lưu">' +
      '<button type="button" class="rl" data-act="logout">Thoát</button></div></div></header>' +
      '<main class="page">' +
      '<span class="deco floaty" style="top:14px;right:4%">' + DECO.star + '</span>' +
      '<span class="deco wiggle" style="top:18px;left:42%">' + DECO.coin + '</span>' +
      '<span class="deco floaty" style="top:10px;left:2%">' + DECO.heart + '</span>' +
      '<div class="herogrid"><div id="htext"></div><div id="scene"></div></div>' +
      '<div id="tools" style="display:flex;flex-direction:column;gap:14px"></div><div id="body"></div></main>' +
      '<footer><b>GAME OVER?</b> Chưa đâu. Cứ lưu lại rồi chơi tiếp nhé!</footer>';
  }
  function updateTop() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].dataset.tab === ui.view;
      tabs[i].classList.toggle('on', on);
      if (on) tabs[i].setAttribute('aria-current', 'page'); else tabs[i].removeAttribute('aria-current');
    }
    var idx = TAB_IDX[ui.view], w = $('#walker'), fl = $('#wflip'), im = $('#wimg');
    if (w) {
      if (prevTab !== null && idx !== prevTab) fl.style.transform = idx < prevTab ? 'scaleX(-1)' : 'none';
      im.src = SPR + OUTFIT[ui.view];
      w.style.left = ((idx * 2 + 1) * 12.5) + '%';
      prevTab = idx;
    }
    var box = $('#avaBox');
    if (box) {
      box.innerHTML = '<label class="ava" title="Bấm để đổi ảnh công ty"><span class="avat">' +
        (S.avatar ? '<img alt="Logo công ty" src="' + esc(S.avatar) + '">' : '<img class="px" alt="" src="' + SPR + 'linh-head.png">') +
        '</span><span class="cap" aria-hidden="true">Đổi ảnh</span><input type="file" accept="image/*" aria-label="Đổi ảnh công ty" data-avatar></label>';
    }
  }
  function render() {
    if (!S) return;
    if (!$('#top')) { root.innerHTML = shellHtml(); sceneKey = ''; prevTab = null; }
    var y = window.scrollY;
    $('#htext').innerHTML = heroText();
    $('#tools').innerHTML = toolsHtml();
    $('#body').innerHTML = body();
    updateTop();
    updateScene(false);
    afterRender();
    window.scrollTo(0, y);
  }
  function renderBody() {
    var b = $('#body');
    if (!b) return;
    b.innerHTML = body();
    afterRender();
  }
  function fit(t) { t.style.height = 'auto'; t.style.height = Math.max(34, t.scrollHeight + 2) + 'px'; }
  function afterRender() {
    var list = document.querySelectorAll('textarea.cell');
    for (var i = 0; i < list.length; i++) fit(list[i]);
  }

  /* ----- Khung nhân vật: bong bóng thoại + số liệu ----- */
  function curRows() { return (ui.period && ui.period !== 'timeline') ? (S.tables[ui.period] || null) : null; }
  function sayText() {
    if (ui.view === 'games') {
      var v = visibleGames(), n = v.filter(function (g) { return g.status === 'Game mới'; }).length;
      return v.length + ' game đang theo dõi, trong đó ' + n + ' game mới. Cố lên nào!';
    }
    if (ui.view === 'teams') {
      var l = 0, no = 0;
      Object.keys(S.teamItems).forEach(function (k) { S.teamItems[k].forEach(function (x) { if (x.kind === 'link') l++; else no++; }); });
      return 'Có ' + l + ' link và ' + no + ' note. Bấm tên là mở luôn!';
    }
    if (ui.view === 'notes') return S.notes.length + ' ghi chú. Viết lại ngay kẻo quên nhé!';
    if (ui.period === 'timeline') return 'Chọn một mốc trên đường line để xem lại kỳ báo cáo.';
    var rows = curRows();
    if (!rows) return 'Kỳ này chưa nhập vào web. Bấm + Thêm sheet nhé!';
    var pend = rows.filter(function (r) { return (r.pending || '').trim(); }).length;
    return pend ? 'Kỳ này còn ' + pend + ' dòng việc đang chờ. Xử lý dần thôi!' : 'Hết việc chờ rồi, giỏi quá!';
  }
  function statsHtml() {
    var a = [];
    if (ui.view === 'games') {
      var v = visibleGames();
      a = [[v.length, 'Game', 'c0'], [v.filter(function (g) { return g.status === 'Game mới'; }).length, 'Game mới', 'c3'],
        [v.filter(function (g) { return g.src === 'event_base'; }).length, 'event_base', 'c1'], [S.games.length - v.length, 'Đã ẩn', 'c2']];
    } else if (ui.view === 'teams') {
      var l = 0, no = 0;
      Object.keys(S.teamItems).forEach(function (k) { S.teamItems[k].forEach(function (x) { if (x.kind === 'link') l++; else no++; }); });
      a = [[l, 'Link', 'c0'], [no, 'Note', 'c1']];
    } else if (ui.view === 'notes') {
      a = [[S.notes.length, 'Ghi chú', 'c0'], [S.notes.filter(function (n) { return n.date === todayIso(); }).length, 'Hôm nay', 'c3']];
    } else {
      var rows = curRows();
      if (rows) a = [[rows.length, 'Dòng', 'c0'], [rows.filter(function (r) { return (r.pending || '').trim(); }).length, 'Đang chờ', 'c1']];
      else a = [[S.periods.length, 'Kỳ', 'c0'], [Object.keys(S.tables).length, 'Có bảng', 'c3']];
    }
    return a.map(function (x) { return '<div class="st ' + x[2] + '"><b>' + x[0] + '</b><span>' + esc(x[1]) + '</span></div>'; }).join('');
  }
  function sceneHtml() {
    var imgs = SCENE[ui.view];
    var sprite = imgs.length > 1
      ? '<span class="frames"><img class="px fa" alt="" src="' + SPR + imgs[0] + '"><img class="px fb" alt="" src="' + SPR + imgs[1] + '"></span>'
      : '<img class="px sprite" alt="" src="' + SPR + imgs[0] + '">';
    return '<div class="scenecard"><div class="pbadge">PLAYER 1 READY</div>' +
      '<div class="sky"><div class="sayrow"><div class="say" aria-live="polite"><span id="saytxt"></span><i class="caret">▌</i></div>' + sprite + '</div><div class="grass"></div></div>' +
      '<div class="sstats" id="sstats"></div></div>';
  }
  function typeSay(text) {
    clearInterval(typer);
    var el = $('#saytxt');
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
    el.textContent = ''; var i = 0;
    typer = setInterval(function () {
      var e2 = $('#saytxt');
      if (!e2) { clearInterval(typer); return; }
      i++; e2.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(typer);
    }, 28);
  }
  function updateScene(force) {
    var sc = $('#scene');
    if (!sc) return;
    var key = ui.view + (ui.view === 'tasks' ? ':' + ui.period : '');
    if (force || key !== sceneKey) { sceneKey = key; sc.innerHTML = sceneHtml(); typeSay(sayText()); }
    var st = $('#sstats');
    if (st) st.innerHTML = statsHtml();
  }

  /* ----- Phần đầu trang theo từng tab ----- */
  function heroText() {
    var v = ui.view;
    if (v === 'games') return '<span class="stage">' + STAGE.games + '</span><span class="date">' + todayStr() + '</span><h1 class="h1">Tổng quan game</h1><p class="sub">Bấm Chỉnh sửa để sửa, thêm, ẩn hoặc xoá game. Note xuống hàng bằng Enter.</p>';
    if (v === 'teams') return '<span class="stage">' + STAGE.teams + '</span><h1 class="h1">Link &amp; Note theo team</h1><p class="sub">Link lấy từ tab đầu tiên của sheet Overview. Mỗi mục là Link hoặc Note.</p>';
    if (v === 'notes') return '<span class="stage">' + STAGE.notes + '</span><h1 class="h1">Ghi chú</h1><p class="sub">Mỗi ghi chú gồm ngày và nội dung. Xem dạng thẻ nhỏ hoặc dạng bảng.</p>';
    var tl = ui.period === 'timeline', p = tl ? null : findPeriod(ui.period);
    var title = tl ? 'Timeline các kỳ báo cáo' : (p ? p.title : 'Chưa có kỳ báo cáo');
    var range = tl ? 'Mỗi mốc có link tới overview tương ứng' : (p ? p.range : '');
    var src = tl ? 'tất cả tab Overview trong sheet' : (p ? p.source : '');
    var titleField = (p && !tl)
      ? '<label class="sr" for="ptitle">Tên kỳ báo cáo</label><input id="ptitle" class="cell ptitle" spellcheck="false"' + ro() + ' value="' + esc(title) + '" data-c="ptitle">'
      : '<h1 class="h1">' + esc(title) + '</h1>';
    return '<span class="stage">' + STAGE.tasks + '</span><span class="date">' + esc(range) + '</span>' + titleField + '<p class="sub">Nguồn: ' + esc(src) + '</p>';
  }
  function toolsHtml() {
    var v = ui.view, t = '';
    if (v === 'games') {
      var hidden = S.games.filter(function (g) { return g.hidden; }).length;
      var add = ui.editing ? '<button type="button" class="mini" data-act="add-game" data-team="' + esc(ui.team === 'all' ? 'NovaS' : ui.team) + '">+ Thêm game (' + esc(ui.team === 'all' ? 'NovaS' : ui.team) + ')</button>' : '';
      return '<div class="tools">' + searchBox('Tìm game, note…') +
        '<button type="button" class="btn ' + (ui.showHidden ? 'on' : '') + '" data-act="toggle-hidden" aria-pressed="' + ui.showHidden + '">Game ẩn · ' + hidden + '</button>' + tail() + '</div>' + banners(add);
    }
    if (v === 'teams') return '<div class="tools">' + searchBox('Tìm link, note…') + tail() + '</div>' + banners('');
    if (v === 'notes') {
      var addN = ui.editing ? '<button type="button" class="mini" data-act="note-add">+ Thêm ghi chú</button>' : '';
      return '<div class="tools">' + searchBox('Tìm ghi chú…') +
        '<div class="seg" role="group" aria-label="Kiểu hiển thị"><button type="button" class="' + (ui.notesMode === 'cards' ? 'on' : '') + '" data-act="notes-mode" data-mode="cards" aria-pressed="' + (ui.notesMode === 'cards') + '">Thẻ</button>' +
        '<button type="button" class="' + (ui.notesMode === 'table' ? 'on' : '') + '" data-act="notes-mode" data-mode="table" aria-pressed="' + (ui.notesMode === 'table') + '">Bảng</button></div>' + tail() + '</div>' + banners(addN);
    }
    return '<div class="tools"><button type="button" class="btn" data-act="new-table">+ Tạo bảng mới</button>' +
      '<button type="button" class="btn teal" data-act="imp-open">+ Thêm sheet</button>' + tail() + '</div>' + banners('') + impPanel();
  }
  function body() {
    if (ui.view === 'games') return gamesBody();
    if (ui.view === 'teams') return teamsBody();
    if (ui.view === 'notes') return notesBody();
    return tasksBody();
  }

  /* ================= 1. Tổng quan game ================= */
  function gamesBody() {
    var q = ui.q.toLowerCase(), vis = visibleGames();
    function match(g) {
      if (g.hidden && !ui.showHidden) return false;
      return !q || (g.name + ' ' + g.sub + ' ' + g.note).toLowerCase().indexOf(q) >= 0;
    }
    var eb = vis.filter(function (g) { return g.src === 'event_base'; }).length;
    var tiles = '<button type="button" class="tile all ' + (ui.team === 'all' ? 'on' : '') + '" data-act="pick-team" data-team="all" aria-pressed="' + (ui.team === 'all') + '">' +
      '<span>Tất cả team</span><span class="big">' + vis.length + ' game</span><span class="sm">' + eb + ' event_base · ' + (vis.length - eb) + ' raw</span></button>';
    ORDER.forEach(function (k) {
      var l = vis.filter(function (g) { return g.team === k; });
      var e = l.filter(function (g) { return g.src === 'event_base'; }).length;
      tiles += '<button type="button" class="tile ' + (ui.team === k ? 'on' : '') + '" style="' + tstyle(k) + '" data-act="pick-team" data-team="' + esc(k) + '" aria-pressed="' + (ui.team === k) + '">' +
        '<span>' + esc(k) + '</span><span class="big">' + l.length + ' game</span><span class="sm">' + e + ' event_base · ' + (l.length - e) + ' raw</span></button>';
    });
    var groups = ORDER.filter(function (k) { return ui.team === 'all' || ui.team === k; }).map(function (k) {
      var rows = S.games.filter(function (g) { return g.team === k && match(g); });
      if (!rows.length && !(ui.editing && ui.team === k)) return '';
      return '<section class="group" style="' + tstyle(k) + '" aria-label="' + esc(k) + '"><div class="ghead"><h2>Team ' + esc(k) + '<small>' + rows.length + ' game</small></h2>' +
        (ui.editing ? '<button type="button" data-act="add-game" data-team="' + esc(k) + '">+ Thêm dòng</button>' : '') + '</div>' +
        '<div class="scroll"><div class="gt"><div class="gth"><span>Game</span><span>Link Insights</span><span>Nguồn data</span><span>Trạng thái</span><span>Note</span><span></span></div>' +
        rows.map(gameRow).join('') + '</div></div></section>';
    }).join('');
    var recent = S.recent.slice(0, 3).map(function (r) {
      return '<div class="it"><div><span class="tbadge" style="' + tstyle(r.team) + '">' + esc(r.team) + '</span> <span class="subtle">' + esc(r.date) + '</span></div><b>' + esc(r.game) + '</b><span>' + esc(r.text) + '</span></div>';
    }).join('');
    return '<section class="tiles" aria-label="Chọn team">' + tiles + '</section><div class="cols"><div class="left">' +
      (groups || '<div class="nodata">Không có game nào khớp.</div>') + '</div>' +
      '<aside class="aside" aria-label="Cập nhật data gần đây"><h2>Cập nhật data gần đây</h2>' + recent + '</aside></div>';
  }
  function gameRow(g) {
    var ed = ui.editing, s = STATUS[g.status] || STATUS['Đã chạy lâu'], r = SRC[g.src] || SRC.raw;
    var linkCell = ed ? fld({ c: 'game', id: g.id, k: 'link', val: g.link, ph: 'Dán link sheet…', label: 'Link Insights' })
      : (g.link ? '<a class="pill" href="' + esc(safeUrl(g.link)) + '" target="_blank" rel="noopener noreferrer">View ↗</a>' : '<span class="dash">—</span>');
    var srcCell = ed ? sel({ c: 'game', id: g.id, k: 'src', label: 'Nguồn data' }, ['raw', 'event_base'], g.src, r)
      : '<span class="badge" style="background:' + r.bg + ';color:' + r.fg + '">' + esc(g.src) + '</span>';
    var stCell = ed ? sel({ c: 'game', id: g.id, k: 'status', label: 'Trạng thái game' }, ['Game mới', 'Đã chạy lâu', 'Duy trì'], g.status, s)
      : '<span class="badge" style="background:' + s.bg + ';color:' + s.fg + '">' + esc(g.status) + '</span>';
    return '<div class="grow ' + (g.hidden ? 'is-hidden' : '') + '"><div>' +
      fld({ c: 'game', id: g.id, k: 'name', val: g.name, cls: 'strong', ph: 'Tên game', label: 'Tên game' }) +
      ((ed || g.sub) ? fld({ c: 'game', id: g.id, k: 'sub', val: g.sub, cls: 'subtle', ph: 'Tên phụ / store name', label: 'Tên phụ' }) : '') +
      (g.hidden ? '<span class="tag">Đã ẩn</span>' : '') + '</div>' +
      '<div class="cc">' + linkCell + '</div><div class="cc">' + srcCell + '</div><div class="cc">' + stCell + '</div>' +
      fld({ c: 'game', id: g.id, k: 'note', val: g.note, area: 1, ph: 'Thêm note…', label: 'Note' }) +
      '<div class="acts">' + (ed ? '<button type="button" class="minibtn" data-act="hide-game" data-id="' + g.id + '">' + (g.hidden ? 'Hiện' : 'Ẩn') + '</button>' +
        '<button type="button" class="del" data-act="del-game" data-id="' + g.id + '" aria-label="Xoá dòng">' + TRASH + '</button>' : '') + '</div></div>';
  }

  /* ================= 2. Link & Note theo team ================= */
  function teamsBody() {
    var q = ui.q.toLowerCase();
    var cards = ['chung'].concat(LINK_TEAMS).map(function (key) {
      var list = S.teamItems[key] || [];
      var shown = list.filter(function (x) { return !q || (x.title + ' ' + x.url + ' ' + x.text).toLowerCase().indexOf(q) >= 0; });
      var nl = list.filter(function (x) { return x.kind === 'link'; }).length;
      return '<section class="card ' + (key === 'chung' ? 'chung' : '') + '" style="' + (key === 'chung' ? '' : tstyle(key)) + '" aria-label="' + (key === 'chung' ? 'Link chung' : esc(key)) + '">' +
        '<div class="chead"><h2>' + (key === 'chung' ? 'Link chung' : esc(key)) + '</h2><span>' + nl + ' link · ' + (list.length - nl) + ' note</span></div>' +
        '<div class="clist">' + shown.map(function (x) { return titem(key, x); }).join('') + '</div>' +
        (shown.length ? '' : '<div class="empty">Chưa có mục nào.</div>') +
        (ui.editing ? '<div class="cfoot"><button type="button" data-act="titem-add" data-grp="' + key + '" data-kind="link">+ Link</button><button type="button" data-act="titem-add" data-grp="' + key + '" data-kind="note">+ Note</button></div>' : '') +
        '</section>';
    }).join('');
    return '<div class="cards">' + cards + '</div>';
  }
  function titem(key, x) {
    var link = x.kind === 'link', ed = ui.editing, inner;
    if (link && ed) {
      inner = '<div class="irow">' + fld({ c: 'titem', id: x.id, k: 'title', val: x.title, cls: 'strong', ph: 'Tên link', label: 'Tên link', grp: key }) +
        (x.url ? '<a class="open" href="' + esc(safeUrl(x.url)) + '" target="_blank" rel="noopener noreferrer" aria-label="Mở link">↗</a>' : '') + '</div>' +
        fld({ c: 'titem', id: x.id, k: 'url', val: x.url, cls: 'subtle', ph: 'Dán đường dẫn…', label: 'Đường dẫn', grp: key });
    } else if (link) {
      inner = x.url ? '<a class="ltitle" href="' + esc(safeUrl(x.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(x.title || '(chưa đặt tên)') + ' ↗</a>'
        : '<span class="ltitle">' + esc(x.title || '(chưa đặt tên)') + '</span>';
    } else {
      inner = fld({ c: 'titem', id: x.id, k: 'text', val: x.text, area: 1, cls: 'notefield', ph: 'Viết note…', label: 'Nội dung note', grp: key });
    }
    return '<div class="item"><button type="button" class="kind ' + (link ? '' : 'note') + '"' + (ed ? '' : ' disabled') +
      ' data-act="titem-kind" data-grp="' + key + '" data-id="' + x.id + '" aria-label="' + (link ? 'Đổi thành Note' : 'Đổi thành Link') + '">' + (link ? 'LINK' : 'NOTE') + '</button>' +
      '<div class="ibody">' + inner + '</div>' +
      (ed ? '<button type="button" class="del" data-act="titem-del" data-grp="' + key + '" data-id="' + x.id + '" aria-label="Xoá mục">' + TRASH + '</button>' : '') + '</div>';
  }

  /* ================= 3. Ghi chú ================= */
  function notesBody() {
    var q = ui.q.toLowerCase();
    var rows = S.notes.filter(function (n) { return !q || (n.date + ' ' + n.text).toLowerCase().indexOf(q) >= 0; });
    if (!rows.length) return '<div class="nodata">Chưa có ghi chú nào. Bấm Chỉnh sửa rồi + Thêm ghi chú.</div>';
    var del = function (n) { return ui.editing ? '<button type="button" class="del" data-act="note-del" data-id="' + n.id + '" aria-label="Xoá ghi chú">' + TRASH + '</button>' : ''; };
    if (ui.notesMode === 'cards') {
      return '<div class="ncards">' + rows.map(function (n) {
        return '<article class="ncard"><div class="top">' + fld({ c: 'note', id: n.id, k: 'date', val: n.date, type: 'date', label: 'Ngày' }) + del(n) + '</div>' +
          fld({ c: 'note', id: n.id, k: 'text', val: n.text, area: 1, ph: 'Viết note…', label: 'Ghi chú' }) + '</article>';
      }).join('') + '</div>';
    }
    return '<section class="ntable" aria-label="Bảng ghi chú"><div class="scroll"><div class="in"><div class="nth"><span>Ngày</span><span>Note</span><span></span></div>' +
      rows.map(function (n) {
        return '<div class="nrow"><div>' + fld({ c: 'note', id: n.id, k: 'date', val: n.date, type: 'date', label: 'Ngày' }) + '</div><div>' +
          fld({ c: 'note', id: n.id, k: 'text', val: n.text, area: 1, ph: 'Viết note…', label: 'Ghi chú' }) + '</div><div>' + del(n) + '</div></div>';
      }).join('') + '</div></div></section>';
  }

  /* ================= 4. Công việc tháng ================= */
  function impPanel() {
    var m = ui.imp;
    if (!m) return '';
    var h = '<section class="panel" aria-label="Thêm sheet"><div class="ph"><h2>Thêm sheet → tự chuyển thành bảng và gộp vào kỳ báo cáo</h2><button type="button" data-act="imp-close" aria-label="Đóng">×</button></div><div class="pb">';
    if (m.err) h += '<div class="err" role="alert">' + esc(m.err) + '</div>';
    if (m.step === 1) {
      h += '<p class="hint">Mở tab sheet cần lấy trên Google Sheets, bôi đen cả bảng (có dòng tiêu đề Team / Game / Task Done / Task Pending / Note), nhấn Ctrl+C rồi dán vào ô dưới. Hoặc tải file .csv (Google Sheets: Tệp → Tải xuống → CSV).</p>' +
        '<label>Dán dữ liệu từ sheet<textarea spellcheck="false" data-imp="text" placeholder="Dán vào đây…">' + esc(m.text || '') + '</textarea></label>' +
        '<label>Hoặc chọn file .csv<input type="file" accept=".csv,text/csv,text/plain" data-imp-file></label>' +
        '<div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="imp-close">Huỷ</button><button type="button" class="btn teal" data-act="imp-read">Đọc sheet</button></div>';
    } else {
      var periods = sortedPeriods().reverse();
      h += '<p style="margin:0">Đã đọc <b>' + m.rows.length + '</b> dòng. Nhận diện cột: <b>Team · Game · Task Done · Task Pending · Note</b>.</p>' +
        '<div class="pv"><table><thead><tr><th>Team</th><th>Game</th><th>Task Done</th><th>Task Pending</th><th>Note</th></tr></thead><tbody>' +
        m.rows.map(function (r) { return '<tr><td><span class="tbadge" style="' + tstyle(r.team) + '">' + esc(r.team) + '</span></td><td><b>' + esc(r.game) + '</b></td><td>' + esc(r.done || '—') + '</td><td>' + esc(r.pending || '—') + '</td><td>' + esc(r.note || '—') + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<div class="frow"><label>Gộp vào<select data-imp="target"><option value="new"' + (m.target === 'new' ? ' selected' : '') + '>Tạo kỳ báo cáo mới</option>' +
        periods.map(function (p) { return '<option value="' + esc(p.id) + '"' + (m.target === p.id ? ' selected' : '') + '>Thêm vào kỳ: ' + esc(p.label) + '</option>'; }).join('') + '</select></label>' +
        '<label>Tên kỳ (ngắn)<input type="text" spellcheck="false" data-imp="label" value="' + esc(m.label) + '" placeholder="VD: 5/10 – 30/10"></label>' +
        '<label>Tháng<input type="month" data-imp="month" value="' + esc(m.month) + '"></label></div>' +
        '<div class="frow"><label>Tên bảng<input type="text" spellcheck="false" data-imp="title" value="' + esc(m.title) + '" placeholder="VD: Công việc DA · Tháng 10"></label>' +
        '<label>Khoảng ngày (không bắt buộc)<input type="text" spellcheck="false" data-imp="range" value="' + esc(m.range) + '" placeholder="05/10 – 30/10/2026"></label>' +
        '<label>Tên tab trong sheet (không bắt buộc)<input type="text" spellcheck="false" data-imp="source" value="' + esc(m.source) + '"></label></div>' +
        '<p class="hint">Nếu chọn "Thêm vào kỳ" thì chỉ cần chọn kỳ, các ô tên kỳ / tháng bên cạnh sẽ được bỏ qua.</p>' +
        '<div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="imp-back">← Đổi dữ liệu</button><button type="button" class="btn teal" data-act="imp-merge">Chuyển thành bảng &amp; gộp vào kỳ</button></div>';
    }
    return h + '</div></section>';
  }
  function periodNav() {
    var latest = sortedPeriods().reverse().slice(0, 4), cur = findPeriod(ui.period);
    if (ui.period !== 'timeline' && cur && !latest.some(function (p) { return p.id === cur.id; })) latest.unshift(cur);
    return '<div class="pnav" role="group" aria-label="Kỳ báo cáo"><span class="plabel">KỲ BÁO CÁO</span>' +
      '<button type="button" class="chip ' + (ui.period === 'timeline' ? 'on' : '') + '" data-act="pick-period" data-id="timeline" aria-pressed="' + (ui.period === 'timeline') + '">Timeline · tất cả kỳ</button>' +
      latest.map(function (p) {
        return '<button type="button" class="chip ' + (ui.period === p.id ? 'on' : '') + '" data-act="pick-period" data-id="' + esc(p.id) + '" aria-pressed="' + (ui.period === p.id) + '">' + esc(p.label) + (p.isNew ? '<span class="newtag">NEW</span>' : '') + '</button>';
      }).join('') + '</div>';
  }
  function tasksBody() {
    var nav = periodNav();
    if (ui.period === 'timeline') return nav + timelineHtml();
    var p = findPeriod(ui.period);
    if (!p) return nav + '<div class="nodata">Chưa có kỳ báo cáo. Dùng “+ Thêm sheet” hoặc “+ Tạo bảng mới”.</div>';
    var rows = S.tables[ui.period];
    if (!rows) return nav + '<div class="nodata">Kỳ này lấy từ tab “' + esc(p.source) + '” và chưa được nhập vào web. Dùng “+ Thêm sheet” để chuyển thành bảng.</div>';
    var chips = '<div class="chips">' + ['all'].concat(ORDER).map(function (k) {
      var on = ui.taskTeam === k;
      return '<button type="button" class="chip ' + (on ? 'on' : '') + '" style="' + (k === 'all' ? '' : tstyle(k)) + '" data-act="task-team" data-team="' + esc(k) + '" aria-pressed="' + on + '">' + (k === 'all' ? 'Tất cả team' : esc(k)) + '</button>';
    }).join('') + '</div>';
    var groups = ORDER.filter(function (k) { return ui.taskTeam === 'all' || ui.taskTeam === k; }).map(function (k) {
      var rs = rows.filter(function (r) { return r.team === k; });
      if (!rs.length && !(ui.editing && ui.taskTeam === k)) return '';
      var pend = rs.filter(function (r) { return (r.pending || '').trim(); }).length;
      return '<div class="tgroup" style="' + tstyle(k) + '"><span><b>' + esc(k) + '</b><small>' + rs.length + ' dòng · ' + pend + ' đang chờ</small></span>' +
        (ui.editing ? '<button type="button" data-act="trow-add" data-team="' + esc(k) + '">+ Thêm dòng</button>' : '') + '</div>' +
        rs.map(function (r, i) {
          var has = !!(r.pending || '').trim();
          return '<div class="trow" style="' + tstyle(k) + '"><span class="no">' + (i + 1) + '</span>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'game', val: r.game, area: 1, cls: 'game', ph: 'Game', label: 'Game' }) + '</div>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'done', val: r.done, area: 1, ph: '- Task đã xong', label: 'Task Done' }) + '</div>' +
            '<div class="' + (has ? 'pend' : '') + '">' + fld({ c: 'trow', id: r.id, k: 'pending', val: r.pending, area: 1, ph: '- Task đang chờ', label: 'Task Pending' }) + '</div>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'note', val: r.note, area: 1, ph: 'Note', label: 'Note' }) + '</div>' +
            '<div>' + (ui.editing ? '<button type="button" class="del" data-act="trow-del" data-id="' + r.id + '" aria-label="Xoá dòng">' + TRASH + '</button>' : '') + '</div></div>';
        }).join('');
    }).join('');
    return nav + chips + '<section class="tt" aria-label="Bảng công việc"><div class="scroll"><div class="in"><div class="tth"><span>No</span><span>Game</span><span>Task Done</span><span>Task Pending</span><span>Note</span><span></span></div>' +
      groups + '</div></div></section>';
  }
  function timelineHtml() {
    var src = sortedPeriods().reverse(), last = src.length - 1;
    var nodes = src.map(function (p, i) {
      var has = !!S.tables[p.id], col = has ? '#2F7A4A' : '#C9BFA5';
      var newMonth = i === 0 || src[i - 1].m !== p.m;
      return '<div class="tln"><span class="mo">' + (newMonth ? esc(monthLabel(p.m)) : '') + '</span>' +
        '<div class="ln"><i style="left:' + (i === 0 ? '50%' : '0') + ';right:' + (i === last ? '50%' : '0') + '"></i><b style="background:' + col + '"></b></div>' +
        '<button type="button" data-act="pick-period" data-id="' + esc(p.id) + '" title="' + esc(p.range + ' · tab ' + p.source) + '">' + esc(p.label) + '</button>' +
        '<small style="color:' + (has ? '#14532D' : '#4A5068') + '">' + (has ? 'Đã có bảng' : 'Chưa nhập') + '</small>' +
        (p.url ? '<a href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener noreferrer">Sheet ↗</a>' : '') + '</div>';
    }).join('');
    return '<section class="tlbox" aria-label="Timeline các kỳ báo cáo"><span>Mới nhất ở bên trái, kéo ngang để xem kỳ cũ hơn. Bấm tên kỳ để mở bảng overview.</span>' +
      '<div class="tlscroll"><div class="tltrack">' + nodes + '</div></div></section>';
  }

  /* ================= Đọc dữ liệu dán từ Google Sheets ================= */
  function parseTable(text) {
    text = String(text || '').replace(/^﻿/, '');
    var first = text.split('\n')[0] || '';
    var delim = first.indexOf('\t') >= 0 ? '\t' : ',';
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"' && cell === '') { q = true; }
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') { cell += ch; }
    }
    row.push(cell); rows.push(row);
    return rows;
  }
  function normTeam(t) {
    var k = String(t || '').toLowerCase().replace(/\s+/g, '');
    if (k === 'novas') return 'NovaS';
    if (k === 'metax') return 'MetaX';
    if (k === 'hicat') return 'HiCat';
    if (k === 'somia') return 'Somia';
    return 'Khác';
  }
  function parseTasks(text) {
    var grid = parseTable(text), hi = -1, i, j;
    for (i = 0; i < grid.length; i++) {
      var low = grid[i].map(function (c) { return c.trim().toLowerCase(); });
      if (low.indexOf('game') >= 0 && low.some(function (c) { return c.indexOf('task done') === 0; })) { hi = i; break; }
    }
    if (hi < 0) return null;
    var head = grid[hi].map(function (c) { return c.trim().toLowerCase(); });
    function col(fn) { for (var k = 0; k < head.length; k++) if (fn(head[k])) return k; return -1; }
    var ti = col(function (c) { return c === 'team'; });
    var gi = col(function (c) { return c === 'game'; });
    var di = col(function (c) { return c.indexOf('task done') === 0; });
    var pi = col(function (c) { return c.indexOf('task pending') === 0; });
    var ni = col(function (c) { return c === 'note' || c.indexOf('note') === 0; });
    var title = '';
    for (i = 0; i < hi && !title; i++) for (j = 0; j < grid[i].length; j++) if (grid[i][j].trim()) { title = grid[i][j].trim(); break; }
    var out = [], cur = 'Khác';
    for (i = hi + 1; i < grid.length; i++) {
      var r = grid[i];
      var at = function (k) { return k >= 0 && r[k] != null ? r[k].trim() : ''; };
      if (at(ti)) cur = normTeam(at(ti));
      var row = { team: cur, game: at(gi), done: at(di), pending: at(pi), note: at(ni) };
      if (row.game || row.done || row.pending || row.note) out.push(row);
    }
    return { title: title, rows: out };
  }

  /* ================= Thao tác ================= */
  function setView(v) {
    ui.view = v; ui.q = ''; ui.saved = false; ui.imp = null; ui.toast = '';
    if (location.hash !== '#' + v) location.hash = '#' + v;
  }
  function listOf(kind, grp) {
    if (kind === 'game') return S.games;
    if (kind === 'note') return S.notes;
    if (kind === 'titem') return S.teamItems[grp];
    if (kind === 'trow') return S.tables[ui.period];
    return null;
  }
  function idxById(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }
  function removeTo(kind, grp, id) {
    var list = listOf(kind, grp), i = idxById(list, id);
    if (i < 0) return;
    var item = list.splice(i, 1)[0];
    ui.trash.push({ kind: kind, grp: grp, period: ui.period, item: item, idx: i });
  }
  function recover() {
    var t = ui.trash.pop();
    if (!t) return;
    var list;
    if (t.kind === 'trow') { S.tables[t.period] = S.tables[t.period] || []; list = S.tables[t.period]; ui.period = t.period; }
    else list = listOf(t.kind, t.grp);
    list.splice(Math.min(t.idx, list.length), 0, t.item);
    setView(t.kind === 'game' ? 'games' : t.kind === 'note' ? 'notes' : t.kind === 'titem' ? 'teams' : 'tasks');
  }
  function newImp(text) {
    var d = new Date();
    return { step: 1, text: text || '', err: '', rows: [], target: 'new', label: '', month: d.getFullYear() + '-' + p2(d.getMonth() + 1), title: '', range: '', source: '' };
  }

  document.addEventListener('click', async function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !S) return;
    var a = el.dataset.act, id = +el.dataset.id, team = el.dataset.team, grp = el.dataset.grp, i;
    switch (a) {
      case 'edit': ui.editing = true; ui.saved = false; ui.toast = ''; break;
      case 'save': {
        var ok = await persist();
        ui.editing = false; ui.trash = []; ui.saved = ok; sceneKey = '';
        if (!ok) { ui.toast = 'Không lưu được vào trình duyệt (có thể đang bật chế độ riêng tư). Dữ liệu vẫn còn trên trang cho đến khi bạn đóng nó.'; ui.toastType = 'warn'; }
        else ui.toast = '';
        break;
      }
      case 'recover': recover(); break;
      case 'toast-close': ui.toast = ''; break;
      case 'logout': logout(); return;
      case 'export': {
        var p = await C.encryptJSON(KEY, S);
        download('data.enc.json', JSON.stringify({ v: 1, iter: FILE.iter, salt: FILE.salt, iv: p.iv, ct: p.ct }));
        ui.toast = 'Đã tải data.enc.json (đã mã hoá). Muốn cả web dùng bản này: đặt file vào thư mục web và nhờ Claude đưa lên GitHub.'; ui.toastType = 'info';
        break;
      }
      case 'import-pick': { var f = document.getElementById('importFile'); if (f) f.click(); return; }
      case 'pick-team': ui.team = (team === ui.team ? 'all' : team); break;
      case 'toggle-hidden': ui.showHidden = !ui.showHidden; break;
      case 'add-game': S.games.unshift({ id: nid(), name: '', sub: '', team: team || 'NovaS', link: '', src: 'raw', status: 'Game mới', hidden: false, note: '' }); ui.q = ''; break;
      case 'hide-game': { i = idxById(S.games, id); if (i >= 0) S.games[i].hidden = !S.games[i].hidden; break; }
      case 'del-game': removeTo('game', null, id); break;
      case 'titem-add': S.teamItems[grp].push({ id: nid(), kind: el.dataset.kind, title: '', url: '', text: '' }); ui.q = ''; break;
      case 'titem-kind': {
        i = idxById(S.teamItems[grp], id);
        if (i >= 0) { var x = S.teamItems[grp][i]; if (x.kind === 'link') { x.kind = 'note'; x.text = x.text || x.title; } else { x.kind = 'link'; x.title = x.title || x.text; } }
        break;
      }
      case 'titem-del': removeTo('titem', grp, id); break;
      case 'note-add': S.notes.unshift({ id: nid(), date: todayIso(), text: '+ ' }); ui.q = ''; break;
      case 'note-del': removeTo('note', null, id); break;
      case 'notes-mode': ui.notesMode = el.dataset.mode; break;
      case 'pick-period': ui.period = el.dataset.id; ui.taskTeam = 'all'; break;
      case 'task-team': ui.taskTeam = team; break;
      case 'trow-add': S.tables[ui.period] = S.tables[ui.period] || []; S.tables[ui.period].push({ id: nid(), team: team, game: '', done: '', pending: '', note: '' }); break;
      case 'trow-del': removeTo('trow', null, id); break;
      case 'new-table': {
        var d = new Date(), pid = 'p' + nid(), n = S.periods.length + 1;
        S.periods.push({ id: pid, m: d.getFullYear() + '-' + p2(d.getMonth() + 1), label: 'Bảng mới ' + n, source: 'Tạo trực tiếp trên web', range: 'Chưa đặt ngày', title: 'Bảng công việc mới', isNew: true });
        S.tables[pid] = ORDER.map(function (k) { return { id: nid(), team: k, game: '', done: '', pending: '', note: '' }; });
        ui.period = pid; ui.editing = true; ui.saved = false;
        ui.toast = 'Đã tạo bảng trống, mỗi team 1 dòng. Nhập nội dung rồi bấm Lưu. Đổi tên bảng ở tiêu đề.'; ui.toastType = 'info';
        break;
      }
      case 'imp-open': ui.imp = newImp(''); ui.toast = ''; break;
      case 'imp-close': ui.imp = null; break;
      case 'imp-back': ui.imp.step = 1; ui.imp.err = ''; break;
      case 'imp-read': {
        var res = parseTasks(ui.imp.text);
        if (!res || !res.rows.length) { ui.imp.err = 'Không nhận ra bảng. Cần có dòng tiêu đề gồm các cột Game, Task Done, Task Pending (và Team, Note). Hãy bôi đen cả bảng trong sheet rồi dán lại.'; break; }
        ui.imp.err = ''; ui.imp.step = 2; ui.imp.rows = res.rows;
        if (!ui.imp.title) ui.imp.title = res.title || '';
        break;
      }
      case 'imp-merge': {
        var m = ui.imp;
        if (m.target === 'new' && !m.label.trim()) { m.err = 'Hãy nhập tên kỳ (ngắn) trước khi gộp.'; break; }
        var rows = m.rows.map(function (r) { return { id: nid(), team: r.team, game: r.game, done: r.done, pending: r.pending, note: r.note }; });
        var msg;
        if (m.target === 'new') {
          var pid2 = 'p' + nid();
          S.periods.push({ id: pid2, m: m.month || todayIso().slice(0, 7), label: m.label.trim(), source: m.source.trim() || 'Dán từ Google Sheets', range: m.range.trim() || monthLabel(m.month),
            title: m.title.trim() || ('Công việc DA · ' + m.label.trim()), isNew: true });
          S.tables[pid2] = rows; ui.period = pid2;
          msg = 'Đã chuyển sheet thành bảng và gộp vào kỳ “' + m.label.trim() + '” (' + rows.length + ' dòng).';
        } else {
          S.tables[m.target] = (S.tables[m.target] || []).concat(rows); ui.period = m.target;
          msg = 'Đã thêm ' + rows.length + ' dòng vào kỳ đã chọn.';
        }
        ui.imp = null; ui.taskTeam = 'all'; sceneKey = '';
        var ok2 = await persist();
        ui.toast = ok2 ? msg : msg + ' (Chưa lưu được vào trình duyệt.)'; ui.toastType = ok2 ? 'info' : 'warn';
        break;
      }
      default: return;
    }
    render();
  });

  function setField(t) {
    var c = t.dataset.c, k = t.dataset.k;
    if (c === 'ptitle') { var p = findPeriod(ui.period); if (p) p.title = t.value; return; }
    var list = listOf(c, t.dataset.grp);
    if (!list) return;
    var i = idxById(list, +t.dataset.id);
    if (i >= 0) list[i][k] = t.value;
  }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.dataset || !S) return;
    if (t.dataset.c) { setField(t); if (t.tagName === 'TEXTAREA') fit(t); return; }
    if (t.dataset.search !== undefined) { ui.q = t.value; renderBody(); return; }
    if (t.dataset.imp && ui.imp) ui.imp[t.dataset.imp] = t.value;
  });
  document.addEventListener('change', async function (e) {
    var t = e.target;
    if (!t.dataset) return;
    if (t.dataset.avatar !== undefined && t.files && t.files[0]) {
      readAvatar(t.files[0], async function (d) { S.avatar = d; await persist(); render(); });
      return;
    }
    if (t.dataset.impFile !== undefined && t.files && t.files[0] && ui.imp) {
      try { ui.imp.text = await readText(t.files[0]); ui.imp.err = ''; } catch (err) { ui.imp.err = 'Không đọc được file.'; }
      render(); return;
    }
    if (t.id === 'importFile' && t.files && t.files[0]) {
      try {
        var f = JSON.parse(await readText(t.files[0]));
        S = ensure(await C.decryptJSON(KEY, f));
        var ok = await persist();
        ui.toast = ok ? 'Đã nạp bản sao lưu.' : 'Đã nạp bản sao lưu (chưa lưu được vào trình duyệt).'; ui.toastType = ok ? 'info' : 'warn';
        ui.trash = []; ui.editing = false; ui.period = latestPeriodId(); sceneKey = '';
      } catch (err) {
        ui.toast = 'Không nạp được file: sai định dạng hoặc được mã hoá bằng tài khoản khác.'; ui.toastType = 'warn';
      }
      render(); return;
    }
    if (t.tagName === 'SELECT' && t.dataset.c) { setField(t); render(); return; }
    if (t.tagName === 'SELECT' && t.dataset.imp && ui.imp) { ui.imp[t.dataset.imp] = t.value; }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'loginForm') {
      e.preventDefault();
      doLogin(document.getElementById('lu').value, document.getElementById('lp').value);
    }
  });
  window.addEventListener('hashchange', function () {
    if (!S) return;
    var h = location.hash.replace('#', '');
    if (VIEWS.some(function (v) { return v[0] === h; }) && h !== ui.view) { ui.view = h; ui.q = ''; ui.saved = false; ui.imp = null; ui.toast = ''; render(); }
  });
  window.addEventListener('beforeunload', function (e) {
    if (ui.editing) { e.preventDefault(); e.returnValue = ''; }
  });

  boot();
})();
