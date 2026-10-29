/* Game Work Hub – bản "Cream pixel" (v2).
 * Dùng chung dữ liệu mã hoá (../data.enc.json) và cách lưu với bản thường (../index.html).
 */
(function () {
  'use strict';
  var C = window.WH_CRYPTO;
  var root = document.getElementById('root');
  var SPR = 'assets/';

  /* ================= Hằng số ================= */
  var PAL = {
    ink: { solid: '#1E2238', tint: '#E8E0F7', fg: '#1E2238' },
    NovaS: { solid: '#6D3FC8', tint: '#EFE9FB', fg: '#5229A6' },
    MetaX: { solid: '#1D5FC4', tint: '#E6EEFB', fg: '#174C9E' },
    HiCat: { solid: '#B04A0B', tint: '#FDF0E4', fg: '#8E3B07' },
    Somia: { solid: '#0F766E', tint: '#E3F4F1', fg: '#0B5C55' },
    'Khác': { solid: '#4B5563', tint: '#EEF0F3', fg: '#3D4552' },
    rose: { solid: '#C2416C', tint: '#FBE1EA', fg: '#8E2A4D' },
    green: { solid: '#2F7A4A', tint: '#DCEFD9', fg: '#1D5A33' },
    gold: { solid: '#B7791F', tint: '#FCEBC7', fg: '#7A4F0B' }
  };
  var BOARD_COLORS = [['ink', 'Đen'], ['NovaS', 'Tím'], ['MetaX', 'Xanh dương'], ['HiCat', 'Cam'], ['Somia', 'Xanh ngọc'], ['rose', 'Hồng'], ['green', 'Xanh lá'], ['gold', 'Vàng'], ['Khác', 'Xám']];
  var BOARD_SIZES = [[3, 'Nhỏ (1/4 hàng)'], [4, 'Gọn (1/3 hàng)'], [6, 'Vừa (1/2 hàng)'], [8, 'Rộng (2/3 hàng)'], [9, 'Lớn (3/4 hàng)'], [12, 'Cả hàng']];
  var BOARD_HEIGHTS = [[0, 'Tự động'], [220, 'Thấp'], [320, 'Vừa'], [440, 'Cao'], [600, 'Rất cao'], [800, 'Dài']];
  var RT_COLORS = [['#C0392B', 'Đỏ'], ['#D9822B', 'Cam'], ['#2E8B57', 'Xanh lá'], ['#2F6FDE', 'Xanh dương'], ['#7B4FC9', 'Tím'], ['#6B7280', 'Xám']];
  var AUTO = ['rose', 'green', 'gold', 'Somia', 'NovaS', 'MetaX', 'HiCat'];
  var ORDER = ['NovaS', 'MetaX', 'HiCat', 'Somia', 'Khác'];
  var LINK_TEAMS = ['NovaS', 'MetaX', 'HiCat', 'Somia'];
  var STATUS = {
    'Game mới': { bg: '#DCEFD9', fg: '#14532D' },
    'Đã chạy lâu': { bg: '#DDE6F5', fg: '#1E3A6E' },
    'Duy trì': { bg: '#FCEBC7', fg: '#6B4A00' }
  };
  var SRC = { raw: { bg: '#F6F1E4', fg: '#1E2238' }, event_base: { bg: '#DCEFD9', fg: '#14532D' } };
  /* Mục "Công việc tháng" (tasks) tạm ẩn: code vẫn còn, chỉ không hiện trong menu. */
  var VIEWS = [['games', 'Tổng quan game'], ['teams', 'Link team'], ['notes', 'Ghi chú'], ['mood', 'Cảm xúc']];
  var TAB_IDX = { games: 0, teams: 1, notes: 2, mood: 3 };
  var OUTFIT = { games: 'linh-punk.png', teams: 'linh-kawaii.png', notes: 'linh-denim.png', mood: 'linh-hoodie.png', tasks: 'linh-hoodie.png' };
  var STAGE = { games: 'STAGE 01', teams: 'STAGE 02', notes: 'STAGE 03', mood: 'STAGE 04', tasks: 'STAGE 05' };
  var V = '?v=4';

  /* ----- Nhật ký cảm xúc ----- */
  var MOODS = [
    { id: 'happy', label: 'Vui', color: '#F2B84B', fg: '#1E2238' },
    { id: 'excited', label: 'Hứng khởi', color: '#FF9EC4', fg: '#1E2238' },
    { id: 'love', label: 'Yêu đời', color: '#D9A6F2', fg: '#1E2238' },
    { id: 'cool', label: 'Ngầu', color: '#5BC0EB', fg: '#1E2238' },
    { id: 'chill', label: 'Bình yên', color: '#7BC47F', fg: '#1E2238' },
    { id: 'focus', label: 'Tập trung', color: '#3FB6A8', fg: '#1E2238' },
    { id: 'silly', label: 'Hài hước', color: '#C6E24A', fg: '#1E2238' },
    { id: 'busy', label: 'Ngập việc', color: '#F5A25D', fg: '#1E2238' },
    { id: 'tired', label: 'Mệt', color: '#B9A7E8', fg: '#1E2238' },
    { id: 'stress', label: 'Căng thẳng', color: '#C9344B', fg: '#FFFFFF' },
    { id: 'sad', label: 'Buồn', color: '#8DB6E8', fg: '#1E2238' },
    { id: 'confused', label: 'Hoang mang', color: '#D8C3A5', fg: '#1E2238' }
  ];
  var FACES = {
    happy: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKYYYKYK', 'KYYYYYYYK', 'KYKYYYKYK', 'KYYKKKYYK', '.KYYYYYK.', '..KKKKK..'],
    excited: ['..KKKKK..', '.KYYYYYK.', 'KYWYYYWYK', 'KYKYYYKYK', 'KYYYYYYYK', 'KYKKKKKYK', 'KYYKRKYYK', '.KYYYYYK.', '..KKKKK..'],
    love: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KRYRYRYRK', 'KYRYYYRYK', 'KYYYYYYYK', 'KYYKKKYYK', '.KYYYYYK.', '..KKKKK..'],
    cool: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKKKKKYK', 'KYKKYKKYK', 'KYYYYYYYK', 'KYYYKKYYK', '.KYYYYYK.', '..KKKKK..'],
    chill: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKYYYKYK', 'KYPYYYPYK', 'KYYYYYYYK', 'KYYKKKYYK', '.KYYYYYK.', '..KKKKK..'],
    focus: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KKKKYKKKK', 'KKWKYKWKK', 'KKKKYKKKK', 'KYYKKKYYK', '.KYYYYYK.', '..KKKKK..'],
    silly: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKYYYKKK', 'KYYYYYYYK', 'KYYKKKYYK', 'KYYYRYYYK', '.KYYYYYK.', '..KKKKK..'],
    busy: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYNK', 'KYKYYYKNK', 'KYKYYYKYK', 'KYYYKYYYK', 'KYYKYKYYK', '.KYYYYYK.', '..KKKKK..'],
    tired: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYYYYYYYK', 'KYKKYKKYK', 'KYuuYuuYK', 'KYYYKYYYK', '.KYYYYYK.', '..KKKKK..'],
    stress: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKKYKKYK', 'KYYYYYYYK', 'KYYKKKYYK', 'KYKYYYKYK', '.KYYYYYK.', '..KKKKK..'],
    sad: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKYYYKYK', 'KYNYYYNYK', 'KYYKKKYYK', 'KYKYYYKYK', '.KYYYYYK.', '..KKKKK..'],
    confused: ['..KKKKK..', '.KYYYYYK.', 'KYYYYYYYK', 'KYKYYYKYK', 'KYYYYYKYK', 'KYYYYYYYK', 'KYYKKYYYK', '.KYYYYYK.', '..KKKKK..']
  };
  var MOOD_ECHO = {
    happy: 'Wow, vui ghê! Kể mình nghe thêm đi!',
    excited: 'Woah, hứng khởi dữ vậy! Có chuyện gì vui hả?',
    love: 'Yêu đời quá đi! Kể mình nghe với!',
    cool: 'Ngầu lắm luôn! Hôm nay bạn làm gì mà ngầu vậy?',
    chill: 'Bình yên là tuyệt nhất. Hôm nay có gì nhẹ nhàng nè?',
    focus: 'Đang vào guồng hả? Cố lên, mình ngồi cạnh nè!',
    silly: 'Hihi, hôm nay lầy lội hả? Kể mình nghe!',
    busy: 'Ôi, nhiều việc hả? Kể mình nghe, mình nghe nè!',
    tired: 'Mệt rồi hả? Viết ra cho nhẹ lòng nhé.',
    stress: 'Hít sâu nào. Chuyện gì làm bạn căng thẳng vậy?',
    sad: 'Mình ở đây nè. Bạn muốn kể gì không?',
    confused: 'Hoang mang hả? Cứ viết hết ra, mình cùng gỡ rối.'
  };
  var MOOD_PROMPTS = {
    happy: ['Hôm nay vui ghê, mọi thứ đều suôn sẻ!', 'Làm xong một việc khó, sảng khoái quá!', 'Today feels like a good day!'],
    excited: ['Hôm nay hứng khởi cực kỳ, làm gì cũng thích!', 'Có ý tưởng mới, mình muốn thử ngay!', 'Feeling pumped today!'],
    love: ['Yêu đời lắm, mọi thứ đều xinh!', 'Hôm nay được khen, vui như Tết.', 'Feeling grateful today.'],
    cool: ['Hôm nay ngầu lòi, xử lý việc gọn ghẽ!', 'Mọi thứ trong tầm tay, easy!', 'Cool, calm and productive.'],
    chill: ['Hôm nay nhẹ nhàng, làm việc từ từ thôi.', 'Một ngày yên bình, cà phê ngon.', 'Slow and steady, mình ổn lắm.'],
    focus: ['Hôm nay tập trung cao độ, chạy deadline vèo vèo.', 'Vào flow rồi, đừng ai làm phiền!', 'In the zone.'],
    silly: ['Hôm nay hơi lầy, cười cả ngày.', 'Pha trò cho team vui, thành công mỹ mãn!', 'Just being silly today.'],
    busy: ['Ôi, nay nhiều việc quá trời!', 'Task cứ ập đến liên tục, chạy deadline thôi.', 'So many tasks, so little time!'],
    tired: ['Hơi mệt rồi, cần một giấc ngủ ngon.', 'Đầu óc lờ đờ, uống thêm cà phê nữa.', 'Low battery. Cần sạc pin!'],
    stress: ['Hôm nay hơi căng, số liệu cứ lệch hoài.', 'Có chút bực, hít thở sâu nào.', 'Deadline đang đuổi theo mình...'],
    sad: ['Hôm nay hơi buồn, không rõ vì sao.', 'Mong ngày mai tốt hơn.', 'Hơi chạnh lòng một chút thôi.'],
    confused: ['Hôm nay hơi rối, chưa biết bắt đầu từ đâu.', 'Số liệu lạ quá, mình cần suy nghĩ thêm.', 'Wait, what just happened?']
  };
  var ENERGY_RANGE = { happy: [4, 5], excited: [4, 5], love: [4, 5], cool: [4, 5], chill: [3, 4], focus: [3, 5], silly: [3, 5], busy: [3, 5], tired: [1, 2], stress: [2, 3], sad: [1, 2], confused: [2, 3] };
  var MOOD_SUM = {
    happy: 'Bạn vui nhiều lắm! Giữ năng lượng này nhé.',
    excited: 'Bạn hứng khởi nhiều lắm, tận dụng nhé!',
    love: 'Bạn đang yêu đời lắm, lan tỏa nhé!',
    cool: 'Ngầu thật, cứ giữ phong độ nhé!',
    chill: 'Những ngày bình yên thật quý. Cứ thong thả nhé.',
    focus: 'Bạn tập trung tốt, nhớ nghỉ giữa giờ nhé!',
    silly: 'Nhiều ngày lầy lội, vui lắm!',
    busy: 'Ngập việc nhiều quá, nhớ nghỉ ngơi và uống nước nhé!',
    tired: 'Bạn mệt khá nhiều rồi, hãy ngủ đủ giấc và tự thưởng chút gì đó.',
    stress: 'Căng thẳng hơi nhiều, thử chia nhỏ việc và hít thở sâu nhé.',
    sad: 'Mấy hôm nay hơi buồn, nếu cần thì tâm sự với người thân nhé.',
    confused: 'Hơi hoang mang nhiều, thử viết ra từng việc rồi hỏi đồng nghiệp nhé.'
  };
  var ENERGY_TXT = ['', 'Cạn pin', 'Hơi thấp', 'Vừa vừa', 'Khá tốt', 'Tràn đầy'];
  var THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  var CHEERS = [
    'chiphoho cố gắng làm việc chăm chỉ nhé!',
    'Mỗi con số hôm nay là một bí mật được tìm ra. Đi săn thôi!',
    'Uống ngụm nước đã, rồi mình cùng làm tiếp nhé!',
    'Bug hôm nay sẽ thành insight ngày mai!',
    'chiphoho giỏi lắm, cứ từ từ từng việc một nhé!',
    'Hôm nay chỉ cần làm tốt hơn hôm qua một chút thôi.',
    'Cà phê sẵn sàng, dữ liệu sẵn sàng, bạn cũng sẵn sàng!',
    'Cười lên nào, hôm nay là một ngày đáng yêu!',
    'Xong việc nào thì tự thưởng một cái bánh nhé!',
    'Query lỗi cũng không sao, thử lại lần nữa là được!',
    'Một bước nhỏ mỗi ngày, lên level thật nhanh!',
    'Nghỉ mắt 20 giây, nhìn ra xa một chút nhé!',
    'chiphoho là DA xịn nhất của team đó!',
    'Nhiều việc quá? Chia nhỏ ra, xử từng cái một!',
    'Chúc bạn một ngày không lỗi tracking nào!',
    'Vươn vai một cái nào, rồi mình quẩy tiếp!',
    'Nhớ ăn trưa đúng giờ nha, no bụng mới có insight!',
    'Số liệu có lệch thì mình bình tĩnh tìm nguyên nhân thôi.',
    'chiphoho ơi, hôm nay cũng là một ngày tuyệt vời!',
    'Cố lên, user drop ở đâu mình cũng tìm ra!',
    'Niềm vui nhỏ: tick xong một task là vui rồi!',
    'Mưa hay nắng, mình vẫn có dashboard đẹp để ngắm.',
    'Hít sâu, thở ra. Mọi chuyện đều ổn thôi!',
    'Ghi chú lại ngay kẻo quên nhé!',
    'Hạnh phúc hôm nay là hoàn thành đúng deadline!',
    'chiphoho cứ làm hết sức, phần còn lại để team lo!',
    'Một ngày mới, một bảng số liệu mới. Chiến thôi!',
    'Đừng quên khen bản thân một câu: giỏi lắm!',
    'Làm việc vui vẻ nhé, vui là hiệu quả gấp đôi!',
    'Xử xong cái này là mình được nghỉ giải lao rồi!',
    'You\'ve got this, chiphoho!',
    'Small steps, big wins.',
    'Data + coffee = magic.',
    'Today is a great day to ship something!',
    'Keep calm and query on.',
    'Một ngày tốt lành, chiphoho nhé!',
    'Every insight starts with one curious question.',
    'Cứ vui, mọi việc sẽ nhẹ như lông hồng!'
  ];
  var TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>';
  var SEARCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A6078" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';

  function pix(rows, colors, size) {
    var out = '';
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var c = colors[row[x]];
        if (c) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
      }
    });
    return '<svg width="' + rows[0].length * size + '" height="' + rows.length * size + '" viewBox="0 0 ' + rows[0].length + ' ' + rows.length + '" aria-hidden="true" shape-rendering="crispEdges">' + out + '</svg>';
  }
  var DECO = {
    star: pix(['...K...', '..KYK..', 'KKKYKKK', 'KYYYYYK', '.KYYYK.', '.KYKYK.', '.K...K.'], { K: '#1E2238', Y: '#F2B84B' }, 5),
    coin: pix(['..KKK..', '.KYYYK.', 'KYYKYYK', 'KYKYYYK', 'KYYKYYK', '.KYYYK.', '..KKK..'], { K: '#1E2238', Y: '#F2B84B' }, 5),
    heart: pix(['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'], { K: '#1E2238', R: '#DE465A', W: '#FFFFFF' }, 5),
    dice: pix(['KKKKKKK', 'KWWWWWK', 'KWKWKWK', 'KWWKWWK', 'KWKWKWK', 'KWWWWWK', 'KKKKKKK'], { K: '#1E2238', W: '#FFFFFF' }, 3)
  };
  function faceSvg(id, size) {
    var m = moodById(id);
    return pix(FACES[id], { K: '#1E2238', Y: m ? m.color : '#F2B84B', P: '#F29A9A', N: '#5E8FC9', u: '#6B5AA6' }, size);
  }

  /* ================= Trạng thái ================= */
  var KEY = null, FILE = null, S = null;
  var ui = { view: 'games', editing: false, saved: false, trash: [], team: 'all', q: '', delMoods: {},
    notesMode: 'cards', notesSort: 'desc', period: '', taskTeam: 'all', imp: null, toast: '', toastType: 'info' };
  var prevTab = null, sceneKey = '', typer = null, cheerIdx = null;

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
  function colorOf(name) {
    if (PAL[name]) return PAL[name];
    var h = 0, s = String(name || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return PAL[AUTO[h % AUTO.length]];
  }
  function cvars(c) { return '--solid:' + c.solid + ';--tint:' + c.tint + ';--fg:' + c.fg; }
  function tstyle(name) { return cvars(colorOf(name)); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr() {
    var d = new Date();
    return THU[d.getDay()] + ' · ' + p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function curMonth() { return todayIso().slice(0, 7); }
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
  function readAs(file, mode) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = function () { rej(fr.error); };
      if (mode === 'buffer') fr.readAsArrayBuffer(file); else fr.readAsText(file, 'utf-8');
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

  /* ================= Dữ liệu ================= */
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
    (seed.periods || []).forEach(function (p) {
      s.periods.push({ id: p[0], m: p[1], label: p[2], source: p[3], range: p[4], title: p[5] || ('Công việc DA · ' + p[2]), url: p[6] || '' });
    });
    Object.keys(seed.tables || {}).forEach(function (k) {
      s.tables[k] = seed.tables[k].map(function (r) { return { id: id++, team: r[0], game: r[1], done: r[2], pending: r[3], note: r[4] }; });
    });
    s.nextId = id;
    return s;
  }
  function deriveGroups(rows) {
    var seen = [];
    (rows || []).forEach(function (r) { if (seen.indexOf(r.team) < 0) seen.push(r.team); });
    return seen.map(function (n, i) { var o = ORDER.indexOf(n); return { n: n, k: o < 0 ? 100 + i : o }; })
      .sort(function (a, b) { return a.k - b.k; }).map(function (x) { return x.n; });
  }
  function ensure(s) {
    s.avatar = s.avatar || ''; s.ts = +s.ts || 0;
    s.games = s.games || []; s.notes = s.notes || []; s.periods = s.periods || []; s.teamItems = s.teamItems || {};
    s.tables = (s.tables && !Array.isArray(s.tables)) ? s.tables : {};
    ['chung'].concat(LINK_TEAMS).forEach(function (k) { s.teamItems[k] = s.teamItems[k] || []; });
    if (!Array.isArray(s.boards) || !s.boards.length) {
      s.boards = [{ id: 'chung', name: 'Link chung', color: 'ink', w: 12, h: 0 }].concat(LINK_TEAMS.map(function (k) { return { id: k, name: k, color: k, w: 3, h: 0 }; }));
    }
    s.boards.forEach(function (b) {
      s.teamItems[b.id] = s.teamItems[b.id] || [];
      if (b.w == null) b.w = (Math.min(4, Math.max(1, +b.cols || 1))) * 3;
      b.w = Math.min(12, Math.max(3, Math.round(+b.w) || 3)); b.h = Math.max(0, Math.round(+b.h) || 0);
      delete b.cols;
    });
    s.groups = (s.groups && typeof s.groups === 'object') ? s.groups : {};
    Object.keys(s.tables).forEach(function (pid) {
      var g = s.groups[pid] = s.groups[pid] || [];
      deriveGroups(s.tables[pid]).forEach(function (n) { if (g.indexOf(n) < 0) g.push(n); });
    });
    var max = 0;
    function look(a) { (a || []).forEach(function (x) { if (x && typeof x.id === 'number' && x.id > max) max = x.id; }); }
    s.games.forEach(function (g) { if (g.store == null) g.store = ''; });
    s.moods = Array.isArray(s.moods) ? s.moods : [];
    look(s.games); look(s.notes); look(s.moods);
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
  function findBoard(id) {
    for (var i = 0; i < S.boards.length; i++) if (S.boards[i].id === id) return S.boards[i];
    return null;
  }
  function latestPeriodId() {
    var s = sortedPeriods();
    for (var i = s.length - 1; i >= 0; i--) if (S.tables[s[i].id]) return s[i].id;
    return s.length ? s[s.length - 1].id : '';
  }
  /* Gộp nhật ký cảm xúc: giữ mọi ngày đã ghi, ngày trùng thì bản mới hơn (ts) thắng */
  function mergeMoodList(src) {
    var changed = false;
    (src || []).forEach(function (m) {
      if (ui.delMoods[m.date]) return;
      var ex = findMood(m.date);
      if (!ex) { S.moods.push({ id: nid(), date: m.date, mood: m.mood, energy: m.energy, text: m.text || '', ts: m.ts || 0 }); changed = true; }
      else if ((m.ts || 0) > (ex.ts || 0)) { ex.mood = m.mood; ex.energy = m.energy; ex.text = m.text || ''; ex.ts = m.ts; changed = true; }
    });
    return changed;
  }
  /* Mở bản lưu cũ trên trình duyệt: khoá hiện tại, hoặc (khi file dữ liệu đã đổi muối) khoá cũ tính lại từ mật khẩu vừa nhập */
  var cred = null;
  async function oldState(rec) {
    if (!rec) return null;
    try { return ensure(await C.decryptJSON(KEY, rec)); } catch (e) {}
    if (cred && rec.salt) {
      try { return ensure(await C.decryptJSON(await C.deriveKey(cred.u, cred.p, C.fromB64(rec.salt), rec.iter || C.ITER, false), rec)); } catch (e) {}
    }
    return null;
  }
  async function mergeStoredMoods() {
    var local = null;
    try { local = JSON.parse(localStorage.getItem('wh_state') || 'null'); } catch (e) {}
    if (!local) return;
    try { mergeMoodList(ensure(await C.decryptJSON(KEY, local)).moods); } catch (e) {}
  }
  /* Lưu vào trình duyệt (bản dự phòng trên máy này) */
  async function persistLocal() {
    try {
      var p = await C.encryptJSON(KEY, S);
      localStorage.setItem('wh_state', JSON.stringify({ base: FILE.ct.slice(0, 24), salt: FILE.salt, iter: FILE.iter, iv: p.iv, ct: p.ct }));
      return true;
    } catch (e) { return false; }
  }
  /* Lưu: máy này + đẩy lên Firebase (nếu đã kết nối) */
  var pq = Promise.resolve();
  function persist() {
    var run = pq.then(doPersist, doPersist);
    pq = run.catch(function () {});
    return run;
  }
  async function doPersist() {
    CL.busy = true;
    S.ts = Date.now();
    var ok = await persistLocal();
    if (ok) await pushUp();
    CL.busy = false; refreshSync();
    return ok;
  }

  /* ================= Đồng bộ qua Firebase (dữ liệu đã mã hoá trên máy trước khi gửi) ================= */
  var FB = { apiKey: 'AIzaSyDQTZEcrVzvcbj1bEO16fMDd8c_4ikcNIw', projectId: 'game-work-hub-chiphoho', email: 'linh@gamehub.app' };
  var FB_DOC = 'https://firestore.googleapis.com/v1/projects/' + FB.projectId + '/databases/(default)/documents/hub/state';
  var CL = { ck: null, ckRaw: '', token: '', refresh: '', exp: 0, seen: 0, busy: false, err: false };
  function saveFbSession() {
    try { sessionStorage.setItem('wh_fb', JSON.stringify({ ck: CL.ckRaw, refresh: CL.refresh })); } catch (e) {}
  }
  async function cloudLogin(user, pass) {
    CL = { ck: null, ckRaw: '', token: '', refresh: '', exp: 0, seen: 0, busy: false, err: false };
    try {
      var ck = await C.deriveKey(user, pass, new TextEncoder().encode('wh-cloud-v1:' + FB.projectId), C.ITER, true);
      var r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FB.apiKey, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: FB.email, password: pass, returnSecureToken: true })
      });
      if (!r.ok) throw new Error('auth');
      var j = await r.json();
      CL.token = j.idToken; CL.refresh = j.refreshToken; CL.exp = Date.now() + (+j.expiresIn || 3600) * 1000;
      CL.ck = ck; CL.ckRaw = await C.exportKey(ck);
      saveFbSession();
    } catch (e) { CL.ck = null; CL.err = true; }
  }
  function cloudResume() {
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem('wh_fb') || 'null'); } catch (e) {}
    if (!s || !s.ck || !s.refresh) { CL.err = true; return Promise.resolve(); }
    return C.importKey(s.ck).then(function (k) { CL.ck = k; CL.ckRaw = s.ck; CL.refresh = s.refresh; }, function () { CL.err = true; });
  }
  async function fbToken() {
    if (CL.token && Date.now() < CL.exp - 60000) return CL.token;
    if (!CL.refresh) throw new Error('noauth');
    var r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + FB.apiKey, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(CL.refresh)
    });
    if (!r.ok) throw new Error('refresh');
    var j = await r.json();
    CL.token = j.id_token; CL.refresh = j.refresh_token; CL.exp = Date.now() + (+j.expires_in || 3600) * 1000;
    saveFbSession();
    return CL.token;
  }
  async function fbGet() {
    var r = await fetch(FB_DOC, { headers: { Authorization: 'Bearer ' + await fbToken() } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('get ' + r.status);
    var f = (await r.json()).fields || {};
    if (!f.ct || !f.iv) return null;
    return { iv: f.iv.stringValue, ct: f.ct.stringValue, ts: +((f.ts && f.ts.integerValue) || 0) };
  }
  async function fbPut(p, ts) {
    var r = await fetch(FB_DOC + '?updateMask.fieldPaths=iv&updateMask.fieldPaths=ct&updateMask.fieldPaths=ts', {
      method: 'PATCH', headers: { Authorization: 'Bearer ' + await fbToken(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { iv: { stringValue: p.iv }, ct: { stringValue: p.ct }, ts: { integerValue: String(ts) } } })
    });
    if (!r.ok) throw new Error('put ' + r.status);
  }
  async function pushUp() {
    if (!CL.ck || !S) { ui.sync = 'off'; return; }
    try {
      var d = await fbGet();
      if (d && d.ts > CL.seen) {
        mergeMoodList(ensure(await C.decryptJSON(CL.ck, d)).moods);
        await persistLocal();
        ui.toast = 'Một máy khác vừa lưu trước đó. Mình đã gộp nhật ký cảm xúc; các phần khác lấy theo bản bạn vừa lưu.'; ui.toastType = 'warn';
      }
      await fbPut(await C.encryptJSON(CL.ck, S), S.ts);
      CL.seen = S.ts; ui.sync = 'ok';
    } catch (e) { ui.sync = 'fail'; }
  }
  /* Kéo bản mới nhất từ Firebase về (true nếu dữ liệu trên máy vừa được thay) */
  async function syncDown() {
    if (!CL.ck || !S) return false;
    var d = await fbGet();
    if (!d) { await persist(); return false; }
    CL.seen = d.ts;
    if (d.ts > (S.ts || 0)) {
      var cs = ensure(await C.decryptJSON(CL.ck, d)), mine = S.moods;
      try { var cur = localStorage.getItem('wh_state'); if (cur) localStorage.setItem('wh_backup', cur); } catch (e) {}
      S = cs; S.ts = d.ts;
      var changed = mergeMoodList(mine);
      await persistLocal();
      if (changed) await persist();
      ui.sync = 'ok';
      return true;
    }
    if (d.ts < S.ts) await pushUp(); else ui.sync = 'ok';
    return false;
  }
  function refreshSync() {
    var u = $('#util');
    if (u && S) u.innerHTML = utilHtml();
  }
  async function syncTick() {
    if (!S || !CL.ck || CL.busy || ui.editing) return;
    CL.busy = true;
    try {
      if (ui.sync === 'fail') await pushUp();
      if (await syncDown()) render();
    } catch (e) { ui.sync = 'fail'; }
    CL.busy = false; refreshSync();
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
      var local = location.protocol === 'file:';
      root.innerHTML = '<div class="login-wrap"><div class="lscene"><div class="say" style="cursor:default">' + (local ? 'Bạn mở bằng cách bấm đúp file rồi! Hãy dùng MO-WEB-TREN-MAY.bat nhé.' : 'Mình chưa tìm thấy dữ liệu...') + '</div><img class="px" src="' + SPR + 'linh-mood-sad.png' + V + '" alt=""></div>' +
        '<div class="login"><h1>Chưa mở được dữ liệu</h1>' +
        (local ? '<p>Trang này đang mở trực tiếp từ file nên không đọc được dữ liệu. Hãy bấm đúp vào <b>MO-WEB-TREN-MAY.bat</b> trong thư mục dự án để mở đúng cách.</p>'
          : '<p>Không tìm thấy file <b>data.enc.json</b> ở thư mục gốc. Mở <b>tools/tao-du-lieu.html</b> để tạo file này (xem README.md).</p>') + '</div></div>';
      return;
    }
    var raw = null;
    try { raw = sessionStorage.getItem('wh_key'); } catch (e) {}
    if (raw) {
      try { KEY = await C.importKey(raw); var fd = await C.decryptJSON(KEY, FILE); await cloudResume(); await start(fd); return; }
      catch (e) { KEY = null; try { sessionStorage.removeItem('wh_key'); } catch (e2) {} }
    }
    showLogin('');
  }
  function showLogin(err) {
    document.body.classList.remove('editing');
    root.innerHTML = '<div class="login-wrap"><div class="lscene"><div class="say" style="cursor:default">Nhập tên và mật khẩu để vào game nhé!</div><img class="px" src="' + SPR + 'linh-punk.png' + V + '" alt=""></div>' +
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
      cred = { u: user, p: pass };
      await cloudLogin(user, pass);
      await start(r.data);
      var prev = null;
      try { prev = JSON.parse(localStorage.getItem('wh_state_prev') || 'null'); } catch (e2) {}
      if (prev) {
        var po = await oldState(prev);
        if (po) { if (mergeMoodList(po.moods)) { await persist(); render(); } try { localStorage.removeItem('wh_state_prev'); } catch (e3) {} }
      }
      cred = null;
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
      if (local && local.base !== base) {
        var old = await oldState(local), kept = false;
        if (old) { kept = mergeMoodList(old.moods); if (kept) await persistLocal(); }
        else { try { localStorage.setItem('wh_state_prev', JSON.stringify(local)); } catch (e) {} }
        ui.toast = 'Đã nạp dữ liệu mới từ web (chỉnh sửa cũ trên trình duyệt này đã được thay' + (kept ? ', nhưng nhật ký cảm xúc các ngày trước vẫn được giữ lại)' : ')') + '.'; ui.toastType = 'info';
      }
    }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    ui.sync = CL.ck ? 'ok' : 'off';
    if (CL.ck) {
      try { await Promise.race([syncDown(), sleep(8000).then(function () { throw new Error('slow'); })]); }
      catch (e) { ui.sync = 'fail'; }
    }
    ui.period = latestPeriodId();
    var h = location.hash.replace('#', '');
    ui.view = VIEWS.some(function (v) { return v[0] === h; }) ? h : 'games';
    initMood();
    prevTab = null; sceneKey = '';
    render();
  }
  function logout() {
    try { sessionStorage.removeItem('wh_key'); sessionStorage.removeItem('wh_fb'); } catch (e) {}
    CL = { ck: null, ckRaw: '', token: '', refresh: '', exp: 0, seen: 0, busy: false, err: false };
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
  /* Kéo thả / nút ▲▼ để đổi thứ tự (chỉ khi đang chỉnh sửa) */
  function dattr(kind, id, grp) { return ' data-dk="' + kind + '" data-did="' + esc(id) + '"' + (grp ? ' data-dgrp="' + esc(grp) + '"' : ''); }
  function mv(kind, id, grp) {
    var b = ' data-act="move" data-dk="' + kind + '" data-id="' + esc(id) + '"' + (grp ? ' data-grp="' + esc(grp) + '"' : '');
    return '<span class="mv"><span class="grip" title="Kéo để đổi vị trí" aria-hidden="true">⠿</span>' +
      '<button type="button" class="mvb"' + b + ' data-dir="-1" aria-label="Chuyển lên">▲</button>' +
      '<button type="button" class="mvb"' + b + ' data-dir="1" aria-label="Chuyển xuống">▼</button></span>';
  }
  function dlist(kind, grp) { return kind === 'game' ? S.games : kind === 'titem' ? S.teamItems[grp] : kind === 'board' ? S.boards : null; }
  function dfind(list, id) {
    for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return i;
    return -1;
  }
  function stepItem(kind, grp, id, dir) {
    var list = dlist(kind, grp), i = list ? dfind(list, id) : -1;
    if (i < 0) return;
    var j = i + dir;
    while (kind === 'game' && j >= 0 && j < list.length && list[j].team !== list[i].team) j += dir;
    if (j < 0 || j >= list.length) return;
    var t = list[i]; list[i] = list[j]; list[j] = t;
  }
  function moveItem(kind, grp, id, tid, after) {
    var list = dlist(kind, grp), i = list ? dfind(list, id) : -1;
    if (i < 0 || String(id) === String(tid)) return false;
    var it = list.splice(i, 1)[0], j = dfind(list, tid);
    if (j < 0) { list.splice(i, 0, it); return false; }
    list.splice(after ? j + 1 : j, 0, it);
    return true;
  }
  function banners(extra) {
    var h = '';
    if (ui.toast) h += '<div class="banner ' + (ui.toastType || 'info') + '" role="status"><span>' + esc(ui.toast) + '</span><button type="button" class="x" data-act="toast-close" aria-label="Đóng thông báo">×</button></div>';
    if (ui.editing) h += '<div class="banner warn" role="status"><span>Đang chỉnh sửa: các nút xoá, thêm, ẩn đã bật. Nhớ bấm Lưu ở thanh trên khi xong.</span>' + (extra || '') + '</div>';
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
      }).join('') + '</div><div class="track"><div class="walker" id="walker"><span id="wflip" style="display:block"><img class="px bob" id="wimg" alt="" src=""></span></div></div></nav>' +
      '<div class="util" id="util"></div></div></header>' +
      '<main class="page">' +
      '<span class="deco floaty" style="top:14px;right:4%">' + DECO.star + '</span>' +
      '<span class="deco wiggle" style="top:18px;left:42%">' + DECO.coin + '</span>' +
      '<span class="deco floaty" style="top:10px;left:2%">' + DECO.heart + '</span>' +
      '<div class="herogrid"><div id="htext"></div><div id="scene"></div></div>' +
      '<div id="tools" style="display:flex;flex-direction:column;gap:18px"></div><div id="body"></div></main>' +
      '<footer><b>GAME OVER?</b><span>Chưa đâu. Cứ lưu lại rồi chơi tiếp nhé!</span>' +
      '<div class="flinks"><button type="button" data-act="export">Tải bản sao lưu</button><button type="button" data-act="import-pick">Nạp bản sao lưu</button></div>' +
      '<input type="file" accept=".json,application/json" class="sr" id="importFile" aria-label="Chọn file sao lưu"></footer>';
  }
  function utilHtml() {
    var h = '';
    var sy = ui.sync === 'ok' ? ['ok', '☁ Đã đồng bộ', 'Dữ liệu đã được lưu chung cho mọi máy'] : ui.sync === 'fail' ? ['fail', '☁ Chưa đồng bộ', 'Chưa gửi được lên mạng, sẽ tự thử lại. Dữ liệu vẫn được lưu trên máy này'] : CL.err ? ['fail', '☁ Chưa kết nối', 'Chưa kết nối được Firebase, dữ liệu chỉ lưu trên máy này'] : null;
    if (sy) h += '<span class="syncchip ' + sy[0] + '" title="' + sy[2] + '">' + sy[1] + '</span>';
    if (ui.editing) {
      h += '<button type="button" class="rl" data-act="recover"' + (ui.trash.length ? '' : ' disabled') + '>↶ Khôi phục · ' + ui.trash.length + '</button>' +
        '<button type="button" class="rl green" data-act="save">✓ Lưu</button>';
    } else {
      h += '<button type="button" class="rl dark" data-act="edit">✎ Chỉnh sửa</button>';
    }
    return h + '<button type="button" class="rl" data-act="logout">Thoát</button>';
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
      im.src = SPR + OUTFIT[ui.view] + V;
      w.style.left = ((idx * 2 + 1) * 12.5) + '%';
      prevTab = idx;
    }
    var box = $('#avaBox');
    if (box) {
      box.innerHTML = '<label class="ava" title="Bấm để đổi ảnh công ty"><span class="avat">' +
        (S.avatar ? '<img alt="Logo công ty" src="' + esc(S.avatar) + '">' : '<img class="px" alt="" src="' + SPR + 'linh-head.png' + V + '">') +
        '</span><span class="cap" aria-hidden="true">Đổi ảnh</span><input type="file" accept="image/*" aria-label="Đổi ảnh công ty" data-avatar></label>';
    }
    var u = $('#util');
    if (u) u.innerHTML = utilHtml();
  }
  function render() {
    if (!S) return;
    if (!$('#top')) { root.innerHTML = shellHtml(); sceneKey = ''; prevTab = null; }
    var y = window.scrollY;
    document.body.classList.toggle('editing', ui.editing);
    $('#htext').innerHTML = heroText();
    $('#tools').innerHTML = toolsHtml();
    $('#body').innerHTML = body();
    updateTop();
    updateScene(false);
    afterRender();
    window.scrollTo(0, y);
    if (ui.md && ui.md.scroll) {
      ui.md.scroll = false;
      var f = $('#moodform');
      if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function renderBody() {
    var b = $('#body');
    if (!b) return;
    b.innerHTML = body();
    afterRender();
  }
  function fit(t) { t.style.height = 'auto'; t.style.height = Math.max(38, t.scrollHeight + 2) + 'px'; }
  function afterRender() {
    var list = document.querySelectorAll('textarea.cell');
    for (var i = 0; i < list.length; i++) fit(list[i]);
  }

  /* ----- Khung nhân vật: lời chào mỗi ngày + Linh ----- */
  function dayCheer() {
    if (cheerIdx === null) {
      var d = new Date(), seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
      cheerIdx = (Math.imul(seed, 2654435761) >>> 0) % CHEERS.length;
    }
    return CHEERS[cheerIdx];
  }
  function newCheer() {
    var n;
    do { n = Math.floor(Math.random() * CHEERS.length); } while (n === cheerIdx && CHEERS.length > 1);
    cheerIdx = n;
  }
  function sayText() {
    if (ui.view === 'mood') return ui.md.say;
    var d = new Date();
    return 'Hôm nay là ' + THU[d.getDay()] + ', ' + p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '.\n' + dayCheer();
  }
  function sceneHtml() {
    var isMood = ui.view === 'mood';
    var sprite = isMood && ui.md.mood ? 'linh-mood-' + ui.md.mood + '.png' : OUTFIT[ui.view];
    var bubble = isMood
      ? '<div class="say" aria-live="polite"><span id="saytxt"></span><i class="caret">▌</i></div>'
      : '<button type="button" class="say" data-act="newcheer" title="Bấm để đổi câu khác" aria-live="polite"><span id="saytxt"></span><i class="caret">▌</i></button>';
    return '<div class="scenecard"><div class="pbadge">PLAYER 1 READY</div>' +
      '<div class="sky"><div class="sayrow"><div class="leftcol">' + bubble + '</div>' +
      '<img class="px sprite" alt="" src="' + SPR + sprite + V + '"></div><div class="grass"></div></div></div>';
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
    var key = ui.view + (ui.view === 'mood' ? ':' + (ui.md.mood || '-') + ':' + ui.md.sv : '');
    if (force || key !== sceneKey) { sceneKey = key; sc.innerHTML = sceneHtml(); typeSay(sayText()); }
  }

  /* ----- Phần đầu trang theo từng tab ----- */
  function heroText() {
    var v = ui.view;
    if (v === 'games') return '<span class="stage">' + STAGE.games + '</span><span class="date">' + todayStr() + '</span><h1 class="h1">Tổng quan game</h1>';
    if (v === 'teams') return '<span class="stage">' + STAGE.teams + '</span><h1 class="h1">Link team</h1>';
    if (v === 'notes') return '<span class="stage">' + STAGE.notes + '</span><h1 class="h1">Ghi chú</h1>';
    if (v === 'mood') return '<span class="stage">' + STAGE.mood + '</span><span class="date">' + todayStr() + '</span><h1 class="h1">Cảm xúc hôm nay</h1>';
    var p = findPeriod(ui.period);
    var titleField = p
      ? '<label class="sr" for="ptitle">Tên bảng</label><input id="ptitle" class="cell ptitle" spellcheck="false"' + ro() + ' value="' + esc(p.title) + '" data-c="ptitle">'
      : '<h1 class="h1">Chưa có kỳ báo cáo</h1>';
    var meta = '';
    if (p && ui.editing) {
      meta = '<div class="sheetbar"><label>Tên tab<input type="text" spellcheck="false" data-c="plabel" value="' + esc(p.label) + '"></label>' +
        '<label>Link Google Sheet<input type="text" spellcheck="false" data-c="purl" value="' + esc(p.url || '') + '" placeholder="https://docs.google.com/spreadsheets/…"></label>' +
        '<label>Khoảng ngày<input type="text" spellcheck="false" data-c="prange" value="' + esc(p.range || '') + '" placeholder="03/09 – 02/10/2026"></label></div>';
    } else if (p) {
      meta = '<p class="sub">Nguồn: ' + esc(p.source) + '</p>' +
        (p.url ? '<div><a class="btn" href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener noreferrer">Mở Google Sheet ↗</a></div>' : '');
    }
    return '<span class="stage">' + STAGE.tasks + '</span><span class="date">' + esc(p ? p.range : '') + '</span>' + titleField + meta;
  }
  function toolsHtml() {
    var v = ui.view;
    if (v === 'games') {
      var t = ui.team === 'all' ? 'NovaS' : ui.team;
      var add = ui.editing ? '<button type="button" class="mini" data-act="add-game" data-team="' + esc(t) + '">+ Thêm game (' + esc(t) + ')</button>' : '';
      return '<div class="tools">' + searchBox('Tìm game, note…') + '</div>' + banners(add);
    }
    if (v === 'teams') return '<div class="tools">' + searchBox('Tìm link, note…') + '</div>' + banners('');
    if (v === 'notes') {
      var addN = ui.editing ? '<button type="button" class="mini" data-act="note-add">+ Thêm ghi chú</button>' : '';
      return '<div class="tools">' + searchBox('Tìm ghi chú…') +
        '<div class="seg" role="group" aria-label="Kiểu hiển thị"><button type="button" class="' + (ui.notesMode === 'cards' ? 'on' : '') + '" data-act="notes-mode" data-mode="cards" aria-pressed="' + (ui.notesMode === 'cards') + '">Thẻ</button>' +
        '<button type="button" class="' + (ui.notesMode === 'table' ? 'on' : '') + '" data-act="notes-mode" data-mode="table" aria-pressed="' + (ui.notesMode === 'table') + '">Bảng</button></div>' +
        '<button type="button" class="btn" data-act="notes-sort">Sắp xếp theo ngày: ' + (ui.notesSort === 'desc' ? 'mới nhất trước ↓' : 'cũ nhất trước ↑') + '</button></div>' + (ui.editing ? richToolbar() : '') + banners(addN);
    }
    if (v === 'mood') return banners('');
    return '<div class="tools"><button type="button" class="btn" data-act="new-table">+ Tạo bảng mới</button>' +
      '<button type="button" class="btn teal" data-act="imp-open">+ Thêm sheet</button></div>' + banners('') + impPanel();
  }
  function body() {
    if (ui.view === 'games') return gamesBody();
    if (ui.view === 'teams') return teamsBody();
    if (ui.view === 'notes') return notesBody();
    if (ui.view === 'mood') return moodBody();
    return tasksBody();
  }

  /* ================= 1. Tổng quan game ================= */
  function gamesBody() {
    var q = ui.q.toLowerCase(), vis = visibleGames();
    function match(g) {
      if (g.hidden && !ui.editing) return false;
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
        '<div class="scroll"><div class="gt"><div class="gth"><span>Game</span><span>Link Insights</span><span>Store</span><span>Nguồn data</span><span>Trạng thái</span><span>Note</span><span></span></div>' +
        rows.map(gameRow).join('') + '</div></div></section>';
    }).join('');
    return '<section class="tiles" aria-label="Chọn team">' + tiles + '</section><div class="stack">' +
      (groups || '<div class="nodata">Không có game nào khớp.</div>') + '</div>';
  }
  function gameRow(g) {
    var ed = ui.editing, s = STATUS[g.status] || STATUS['Đã chạy lâu'], r = SRC[g.src] || SRC.raw;
    var linkCell = ed ? fld({ c: 'game', id: g.id, k: 'link', val: g.link, ph: 'Dán link sheet…', label: 'Link Insights' })
      : (g.link ? '<a class="pill" href="' + esc(safeUrl(g.link)) + '" target="_blank" rel="noopener noreferrer">View ↗</a>' : '<span class="dash">—</span>');
    var storeCell = ed ? fld({ c: 'game', id: g.id, k: 'store', val: g.store || '', ph: 'Dán link store…', label: 'Link Store' })
      : (g.store ? '<a class="pill" href="' + esc(safeUrl(g.store)) + '" target="_blank" rel="noopener noreferrer">View ↗</a>' : '<span class="dash">—</span>');
    var srcCell = ed ? sel({ c: 'game', id: g.id, k: 'src', label: 'Nguồn data' }, ['raw', 'event_base'], g.src, r)
      : '<span class="badge" style="background:' + r.bg + ';color:' + r.fg + '">' + esc(g.src) + '</span>';
    var stCell = ed ? sel({ c: 'game', id: g.id, k: 'status', label: 'Trạng thái game' }, ['Game mới', 'Đã chạy lâu', 'Duy trì'], g.status, s)
      : '<span class="badge" style="background:' + s.bg + ';color:' + s.fg + '">' + esc(g.status) + '</span>';
    return '<div class="grow ' + (g.hidden ? 'is-hidden' : '') + '"' + (ed ? dattr('game', g.id, g.team) : '') + '><div>' +
      fld({ c: 'game', id: g.id, k: 'name', val: g.name, cls: 'strong', ph: 'Tên game', label: 'Tên game' }) +
      ((ed || g.sub) ? fld({ c: 'game', id: g.id, k: 'sub', val: g.sub, cls: 'subtle', ph: 'Tên phụ / store name', label: 'Tên phụ' }) : '') +
      (g.hidden ? '<span class="tag">Đã ẩn</span>' : '') + '</div>' +
      '<div class="cc">' + linkCell + '</div><div class="cc">' + storeCell + '</div><div class="cc">' + srcCell + '</div><div class="cc">' + stCell + '</div>' +
      fld({ c: 'game', id: g.id, k: 'note', val: g.note, area: 1, ph: 'Thêm note…', label: 'Note' }) +
      '<div class="acts">' + (ed ? mv('game', g.id, g.team) + '<button type="button" class="minibtn" data-act="hide-game" data-id="' + g.id + '">' + (g.hidden ? 'Hiện' : 'Ẩn') + '</button>' +
        '<button type="button" class="del" data-act="del-game" data-id="' + g.id + '" aria-label="Xoá dòng">' + TRASH + '</button>' : '') + '</div></div>';
  }

  /* ================= 2. Link & Note theo team ================= */
  function teamsBody() {
    var q = ui.q.toLowerCase();
    var cards = S.boards.map(function (b) {
      var c = PAL[b.color] || PAL.ink;
      var list = S.teamItems[b.id] || [];
      var shown = list.filter(function (x) { return (!x.hidden || ui.editing) && (!q || (x.title + ' ' + x.url + ' ' + x.text).toLowerCase().indexOf(q) >= 0); });
      var vis = list.filter(function (x) { return !x.hidden; });
      var nl = vis.filter(function (x) { return x.kind === 'link'; }).length;
      var head = ui.editing
        ? '<div class="chead"><input spellcheck="false" aria-label="Tên nhóm" value="' + esc(b.name) + '" placeholder="Tên nhóm" data-c="board" data-bid="' + esc(b.id) + '" data-k="name"></div>' +
          '<div class="boardbar">' + mv('board', b.id) + '<label>Rộng<select class="sizesel" data-c="board" data-bid="' + esc(b.id) + '" data-k="w">' +
          BOARD_SIZES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === b.w ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') +
          (BOARD_SIZES.some(function (s) { return s[0] === b.w; }) ? '' : '<option value="' + b.w + '" selected>Tuỳ chỉnh</option>') + '</select></label>' +
          '<label>Cao<select class="sizesel" data-c="board" data-bid="' + esc(b.id) + '" data-k="h">' +
          BOARD_HEIGHTS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === b.h ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') +
          (BOARD_HEIGHTS.some(function (s) { return s[0] === b.h; }) ? '' : '<option value="' + b.h + '" selected>Tuỳ chỉnh</option>') + '</select></label>' +
          '<label>Màu<select class="sizesel" data-c="board" data-bid="' + esc(b.id) + '" data-k="color">' +
          BOARD_COLORS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === b.color ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label>' +
          '<button type="button" class="del" data-act="board-del" data-bid="' + esc(b.id) + '" aria-label="Xoá nhóm" style="margin-left:auto">' + TRASH + '</button></div>'
        : '<div class="chead"><h2>' + esc(b.name) + '</h2><span>' + nl + ' link · ' + (vis.length - nl) + ' note</span></div>';
      var ic = b.w <= 4 ? 1 : b.w <= 8 ? 2 : b.w <= 10 ? 3 : 4;
      return '<section class="card w' + b.w + (b.h ? ' fixh' : '') + '" style="' + cvars(c) + (b.h ? ';height:' + b.h + 'px' : '') + '" aria-label="' + esc(b.name) + '"' + (ui.editing ? dattr('board', b.id) : '') + ' data-bw="' + b.w + '">' + head +
        '<div class="cbody"><div class="clist c' + ic + '">' + shown.map(function (x) { return titem(b.id, x); }).join('') + '</div>' +
        (shown.length ? '' : '<div class="empty">Chưa có mục nào.</div>') + '</div>' +
        (ui.editing ? '<div class="cfoot"><button type="button" data-act="titem-add" data-grp="' + esc(b.id) + '" data-kind="link">+ Link</button><button type="button" data-act="titem-add" data-grp="' + esc(b.id) + '" data-kind="note">+ Note</button></div>' +
          '<span class="rsz" data-bid="' + esc(b.id) + '" title="Kéo để đổi kích thước bảng" aria-hidden="true"></span>' : '') +
        '</section>';
    }).join('');
    return '<div class="cards">' + cards + (ui.editing ? '<button type="button" class="addboard card w6" data-act="board-add">+ Thêm nhóm mới</button>' : '') + '</div>';
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
    return '<div class="item' + (x.hidden ? ' is-hidden' : '') + '"' + (ed ? dattr('titem', x.id, key) : '') + '>' + (ed ? mv('titem', x.id, key) : '') + '<button type="button" class="kind ' + (link ? '' : 'note') + '"' + (ed ? '' : ' disabled') +
      ' data-act="titem-kind" data-grp="' + esc(key) + '" data-id="' + x.id + '" aria-label="' + (link ? 'Đổi thành Note' : 'Đổi thành Link') + '">' + (link ? 'LINK' : 'NOTE') + '</button>' +
      '<div class="ibody">' + inner + (x.hidden ? '<span class="tag">Đã ẩn</span>' : '') + '</div>' +
      (ed ? '<button type="button" class="minibtn" data-act="titem-hide" data-grp="' + esc(key) + '" data-id="' + x.id + '">' + (x.hidden ? 'Hiện' : 'Ẩn') + '</button>' +
        '<button type="button" class="del" data-act="titem-del" data-grp="' + esc(key) + '" data-id="' + x.id + '" aria-label="Xoá mục">' + TRASH + '</button>' : '') + '</div>';
  }

  /* ================= 3. Ghi chú ================= */
  function notesBody() {
    var q = ui.q.toLowerCase();
    var rows = S.notes.filter(function (n) { return (!n.hidden || ui.editing) && (!q || (n.date + ' ' + n.text).toLowerCase().indexOf(q) >= 0); });
    var dir = ui.notesSort === 'asc' ? 1 : -1;
    rows = rows.slice().sort(function (a, b) {
      if (a.date === b.date) return dir * (a.id - b.id);
      return dir * (a.date < b.date ? -1 : 1);
    });
    if (!rows.length) return '<div class="nodata">Chưa có ghi chú nào. Bấm Chỉnh sửa rồi + Thêm ghi chú.</div>';
    var del = function (n) {
      return ui.editing ? '<span class="acts"><button type="button" class="minibtn" data-act="note-hide" data-id="' + n.id + '">' + (n.hidden ? 'Hiện' : 'Ẩn') + '</button>' +
        '<button type="button" class="del" data-act="note-del" data-id="' + n.id + '" aria-label="Xoá ghi chú">' + TRASH + '</button></span>' : '';
    };
    if (ui.notesMode === 'cards') {
      return '<div class="ncards">' + rows.map(function (n) {
        return '<article class="ncard' + (n.hidden ? ' is-hidden' : '') + '"><div class="top">' + fld({ c: 'note', id: n.id, k: 'date', val: n.date, type: 'date', label: 'Ngày' }) + (n.hidden ? '<span class="tag">Đã ẩn</span>' : '') + del(n) + '</div>' +
          rte(n) + noteLink(n) + '</article>';
      }).join('') + '</div>';
    }
    return '<section class="ntable" aria-label="Bảng ghi chú"><div class="scroll"><div class="in"><div class="nth"><span>Ngày</span><span>Note</span><span>Link</span><span></span></div>' +
      rows.map(function (n) {
        return '<div class="nrow' + (n.hidden ? ' is-hidden' : '') + '"><div>' + fld({ c: 'note', id: n.id, k: 'date', val: n.date, type: 'date', label: 'Ngày' }) + (n.hidden ? '<span class="tag">Đã ẩn</span>' : '') + '</div><div>' +
          rte(n) + '</div><div>' + noteLink(n) + '</div><div class="delcol">' + del(n) + '</div></div>';
      }).join('') + '</div></div></section>';
  }

  /* ----- Ô ghi chú có định dạng chữ + cột Link ----- */
  var RT_OK = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, STRIKE: 1, DEL: 1, UL: 1, OL: 1, LI: 1, BR: 1, DIV: 1, P: 1, SPAN: 1, FONT: 1, MARK: 1 };
  function cleanStyle(s) {
    var keep = [];
    String(s || '').split(';').forEach(function (d) {
      var p = d.split(':'); if (p.length < 2) return;
      var k = p[0].trim().toLowerCase(), v = p.slice(1).join(':').trim();
      if ((k === 'color' || k === 'background-color') && /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i.test(v)) keep.push(k + ':' + v);
      else if (k === 'font-weight' && /^(bold|normal|[1-9]00)$/.test(v)) keep.push(k + ':' + v);
      else if (k === 'font-style' && /^(italic|normal)$/.test(v)) keep.push(k + ':' + v);
      else if ((k === 'text-decoration' || k === 'text-decoration-line') && /^[a-z\s-]+$/i.test(v)) keep.push(k + ':' + v);
    });
    return keep.join(';');
  }
  function cleanHtml(h) {
    var doc = new DOMParser().parseFromString('<body>' + String(h || '') + '</body>', 'text/html'), out = document.createElement('div');
    (function walk(src, dst) {
      for (var n = src.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); continue; }
        if (n.nodeType !== 1) continue;
        var tag = n.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') continue;
        if (!RT_OK[tag]) { walk(n, dst); continue; }
        var el = document.createElement(tag === 'FONT' ? 'span' : tag.toLowerCase());
        var st = cleanStyle(n.getAttribute('style'));
        if (tag === 'FONT' && /^#[0-9a-f]{3,8}$/i.test(n.getAttribute('color') || '')) st += ';color:' + n.getAttribute('color');
        if (st) el.setAttribute('style', st);
        walk(n, el); dst.appendChild(el);
      }
    })(doc.body, out);
    return out.innerHTML;
  }
  function rte(n) {
    var ed = ui.editing, h = n.html != null ? cleanHtml(n.html) : esc(n.text).replace(/\n/g, '<br>');
    return '<div class="rte' + (ed ? ' ed' : '') + '"' + (ed ? ' contenteditable="true" spellcheck="false" role="textbox" aria-multiline="true" data-ph="Viết note…"' : '') +
      ' data-rte="note" data-id="' + n.id + '" aria-label="Ghi chú">' + h + '</div>';
  }
  function noteLink(n) {
    if (ui.editing) return fld({ c: 'note', id: n.id, k: 'link', val: n.link || '', ph: 'Dán link…', label: 'Link' });
    return n.link ? '<a class="pill" href="' + esc(safeUrl(n.link)) + '" target="_blank" rel="noopener noreferrer">Mở link ↗</a>' : '<span class="dash">—</span>';
  }
  function richToolbar() {
    function b(cmd, face, label, v) { return '<button type="button" class="rtbtn" data-rt="' + cmd + '"' + (v ? ' data-v="' + v + '"' : '') + ' title="' + label + '" aria-label="' + label + '">' + face + '</button>'; }
    return '<div class="rtb" role="toolbar" aria-label="Định dạng chữ">' +
      b('bold', '<b>B</b>', 'In đậm') + b('italic', '<i>I</i>', 'In nghiêng') + b('underline', '<u>U</u>', 'Gạch chân') + b('strikeThrough', '<s>S</s>', 'Gạch ngang') +
      '<span class="rtsep"></span>' +
      RT_COLORS.map(function (c) { return '<button type="button" class="rtc" data-rt="foreColor" data-v="' + c[0] + '" style="--c:' + c[0] + '" title="Chữ màu ' + c[1] + '" aria-label="Chữ màu ' + c[1] + '">A</button>'; }).join('') +
      '<span class="rtsep"></span>' +
      [['#FFE27A', 'vàng'], ['#FFB8D1', 'hồng'], ['#B8F0C8', 'xanh lá'], ['#BFE0FF', 'xanh dương']].map(function (c) { return '<button type="button" class="rtc hl" data-rt="hiliteColor" data-v="' + c[0] + '" style="--c:' + c[0] + '" title="Tô nền ' + c[1] + '" aria-label="Tô nền ' + c[1] + '"></button>'; }).join('') +
      '<span class="rtsep"></span>' + b('insertUnorderedList', '• —', 'Danh sách') + b('removeFormat', 'Tx', 'Xoá định dạng') + '</div>';
  }
  function syncRte(el) {
    var i = idxById(S.notes, +el.dataset.id);
    if (i >= 0) { S.notes[i].html = cleanHtml(el.innerHTML); S.notes[i].text = el.innerText.replace(/ /g, ' ').trim(); }
  }

  /* ================= 4. Cảm xúc hôm nay ================= */
  function moodById(id) { for (var i = 0; i < MOODS.length; i++) if (MOODS[i].id === id) return MOODS[i]; return null; }
  function findMood(date) { for (var i = 0; i < S.moods.length; i++) if (S.moods[i].date === date) return S.moods[i]; return null; }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  function isoAdd(iso, n) {
    var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  }
  function fmtDM(iso) { var a = String(iso).split('-'); return a[2] + '/' + a[1]; }
  function dayName(iso) { return THU[new Date(iso + 'T00:00:00').getDay()]; }
  function initMood() {
    ui.md = { date: todayIso(), today: todayIso(), mood: '', energy: 3, text: '', range: '7', sv: 0, say: '', scroll: false };
    loadMoodDate(todayIso());
  }
  /* Sang ngày mới: ô điền tự chuyển sang hôm nay (nếu đang ở "hôm nay" của hôm qua) */
  function checkNewDay() {
    if (!S || !ui.md) return;
    var t = todayIso();
    if (ui.md.today === t) return;
    var follow = ui.md.date === ui.md.today;
    ui.md.today = t; cheerIdx = null; sceneKey = '';
    if (follow) loadMoodDate(t);
    render();
  }
  function loadMoodDate(d) {
    var e = findMood(d), m = ui.md;
    m.date = d;
    if (e) { m.mood = e.mood; m.energy = e.energy; m.text = e.text || ''; m.say = e.text || MOOD_ECHO[e.mood] || ''; }
    else {
      m.mood = ''; m.energy = 3; m.text = '';
      m.say = d === todayIso() ? 'Hôm nay bạn thấy thế nào? Kể mình nghe nhé!' : 'Ngày ' + fmtDM(d) + ' bạn thấy thế nào nhỉ?';
    }
    m.sv++;
  }
  function pips(n) {
    return '<span class="epips" aria-label="Năng lượng ' + n + ' trên 5">' + [1, 2, 3, 4, 5].map(function (i) { return '<i class="' + (i <= n ? 'on' : '') + '"></i>'; }).join('') + '</span>';
  }
  function moodBody() {
    var md = ui.md, today = todayIso(), days = +md.range || 7, from = isoAdd(today, -(days - 1));
    if (md.range === 'all') {
      from = S.moods.reduce(function (m, e) { return e.date < m ? e.date : m; }, today);
      days = Math.round((new Date(today + 'T00:00:00') - new Date(from + 'T00:00:00')) / 864e5) + 1;
    }
    var list = S.moods.filter(function (e) { return e.date >= from && e.date <= today; })
      .sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : b.id - a.id); });
    var form = '<section class="card moodform" id="moodform" aria-label="Ghi cảm xúc">' +
      '<div class="mhead"><h2>' + (md.date === today ? 'Hôm nay bạn thấy thế nào?' : 'Ngày ' + fmtDM(md.date) + ' bạn thấy thế nào?') + '</h2>' +
      '<div class="mdatebox"><button type="button" class="minibtn" data-act="mood-shift" data-d="-1" aria-label="Ngày trước">‹</button>' +
      '<span class="mdatechip">' + esc(dayName(md.date)) + ' · ' + fmtDM(md.date) + (md.date === today ? ' · Hôm nay' : '') + '</span>' +
      '<button type="button" class="minibtn" data-act="mood-shift" data-d="1" aria-label="Ngày sau"' + (md.date >= today ? ' disabled' : '') + '>›</button>' +
      (md.date === today ? '' : '<button type="button" class="minibtn" data-act="mood-today">Về hôm nay</button>') + '</div></div>' +
      '<div class="mpick" role="radiogroup" aria-label="Chọn cảm xúc">' + MOODS.map(function (m) {
        var on = md.mood === m.id;
        return '<button type="button" class="moodbtn' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-act="mood-pick" data-m="' + m.id + '" style="--c:' + m.color + '">' + faceSvg(m.id, 5) + '<span>' + m.label + '</span></button>';
      }).join('') + '</div>' +
      '<div class="mrow"><span class="mlabel">Năng lượng</span><div class="energy" role="group" aria-label="Năng lượng">' + [1, 2, 3, 4, 5].map(function (e) {
        return '<button type="button" class="epip' + (e <= md.energy ? ' on' : '') + '" data-act="mood-energy" data-e="' + e + '" aria-label="Năng lượng ' + e + ' trên 5"></button>';
      }).join('') + '</div><span class="subtle">' + ENERGY_TXT[md.energy] + '</span></div>' +
      '<label class="mtext"><span class="mlabel">Kể cho mình nghe nào</span><textarea class="mnote" spellcheck="false" data-md="text" rows="4" placeholder="VD: Ôi, nay nhiều việc quá…">\n' + esc(md.text) + '</textarea></label>' +
      '<div class="mbtns"><button type="button" class="btn" data-act="mood-random">' + DECO.dice + ' Random giúp mình</button><button type="button" class="btn green" data-act="mood-save">' + (findMood(md.date) ? 'Cập nhật cảm xúc' : 'Lưu cảm xúc') + '</button></div></section>';

    var counts = {}, max = 0;
    MOODS.forEach(function (m) { counts[m.id] = 0; });
    list.forEach(function (e) { if (counts[e.mood] != null) counts[e.mood]++; });
    MOODS.forEach(function (m) { if (counts[m.id] > max) max = counts[m.id]; });
    var dom = max ? MOODS.filter(function (m) { return counts[m.id] === max; })[0] : null;
    var total = list.length;
    var avg = total ? list.reduce(function (s, e) { return s + (+e.energy || 0); }, 0) / total : 0;
    var have = {}, streak = 0, d = '';
    S.moods.forEach(function (e) { have[e.date] = 1; });
    d = have[today] ? today : isoAdd(today, -1);
    while (have[d] && streak < 4000) { streak++; d = isoAdd(d, -1); }
    var sum = '<section class="card msum" aria-label="Tổng hợp"><div class="mhead"><h2>Tổng hợp</h2><div class="seg" role="group" aria-label="Khoảng thời gian">' +
      [['7', '7 ngày'], ['30', '30 ngày'], ['90', '90 ngày'], ['all', 'Tất cả']].map(function (r) {
        return '<button type="button" class="' + (md.range === r[0] ? 'on' : '') + '" data-act="mood-range" data-r="' + r[0] + '" aria-pressed="' + (md.range === r[0]) + '">' + r[1] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="mstats"><div class="mstat"><b>' + total + '/' + days + '</b><span>ngày đã ghi</span></div><div class="mstat"><b>' + (total ? avg.toFixed(1) : '–') + '</b><span>năng lượng TB</span></div><div class="mstat"><b>' + streak + '</b><span>ngày liên tiếp</span></div></div>' +
      '<div class="mbars">' + MOODS.map(function (m) {
        var c = counts[m.id];
        return '<div class="mbar"><span class="mbl">' + faceSvg(m.id, 3) + m.label + '</span><span class="mtrack"><i style="width:' + (total ? Math.round(c * 100 / total) : 0) + '%;background:' + m.color + '"></i></span><b>' + c + '</b></div>';
      }).join('') + '</div>' +
      '<p class="mverdict">' + esc(dom ? MOOD_SUM[dom.id] : 'Chưa có ngày nào được ghi trong khoảng này. Bắt đầu từ hôm nay nhé!') + '</p></section>';

    var cells = '';
    for (var i = 0; i < days; i++) {
      var ds = isoAdd(from, i), e = findMood(ds), dd = ds.slice(8), m = e ? moodById(e.mood) : null;
      if (m) cells += '<button type="button" class="mcell' + (ds === today ? ' today' : '') + '" style="--c:' + m.color + '" data-act="mood-open" data-date="' + ds + '" title="' + esc(dayName(ds) + ' ' + fmtDM(ds) + ' · ' + m.label) + '" aria-label="' + esc(dayName(ds) + ' ' + fmtDM(ds) + ': ' + m.label) + '">' + faceSvg(m.id, 3) + '<small>' + dd + '</small></button>';
      else cells += '<span class="mcell empty' + (ds === today ? ' today' : '') + '" title="' + esc(fmtDM(ds) + ': chưa ghi') + '"><small>' + dd + '</small></span>';
    }
    var heat = '<section class="card mheat" aria-label="Dòng thời gian cảm xúc"><div class="mhead"><h2>Dòng thời gian</h2></div><div class="mcells">' + cells + '</div></section>';

    var log = list.length ? list.map(function (e) {
      var m = moodById(e.mood) || MOODS[0];
      return '<article class="mlogitem"><div class="mface" style="--c:' + m.color + '">' + faceSvg(m.id, 5) + '<small>' + esc(dayName(e.date)) + '<br>' + fmtDM(e.date) + '</small></div>' +
        '<div class="mbub"><div class="mmeta"><span class="mtag" style="background:' + m.color + ';color:' + m.fg + '">' + m.label + '</span>' + pips(+e.energy || 0) +
        '<span class="mact"><button type="button" class="minibtn" data-act="mood-open" data-date="' + e.date + '">Sửa</button>' +
        (ui.editing ? '<button type="button" class="del" data-act="mood-del" data-id="' + e.id + '" aria-label="Xoá ngày này">' + TRASH + '</button>' : '') + '</span></div>' +
        (e.text ? '<p>' + esc(e.text) + '</p>' : '') + '</div></article>';
    }).join('') : '<div class="nodata">Chưa có ngày nào trong khoảng này.</div>';
    var logCard = '<section class="card mlog" aria-label="Nhật ký"><div class="mhead"><h2>Nhật ký</h2></div><div class="mlist">' + log + '</div></section>';
    return '<div class="mtop">' + form + sum + '</div>' + heat + logCard;
  }

  /* ================= 5. Công việc tháng (tạm ẩn khỏi menu) ================= */
  function periodNav() {
    var all = sortedPeriods().reverse(), latest = all.slice(0, 4), cur = findPeriod(ui.period);
    if (cur && !latest.some(function (p) { return p.id === cur.id; })) latest.unshift(cur);
    var others = all.filter(function (p) { return !latest.some(function (q) { return q.id === p.id; }); });
    return '<div class="pnav" role="group" aria-label="Kỳ báo cáo"><span class="plabel">KỲ BÁO CÁO</span>' +
      latest.map(function (p) {
        return '<button type="button" class="chip ' + (ui.period === p.id ? 'on' : '') + '" data-act="pick-period" data-id="' + esc(p.id) + '" aria-pressed="' + (ui.period === p.id) + '">' + esc(p.label) + (p.isNew ? '<span class="newtag">NEW</span>' : '') + '</button>';
      }).join('') +
      (others.length ? '<select class="plain" data-pickperiod aria-label="Chọn kỳ cũ hơn"><option value="">Kỳ cũ hơn…</option>' +
        others.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.label) + (S.tables[p.id] ? '' : ' (chưa nhập)') + '</option>'; }).join('') + '</select>' : '') +
      '</div>';
  }
  function tasksBody() {
    var nav = periodNav();
    var p = findPeriod(ui.period);
    if (!p) return nav + '<div class="nodata">Chưa có kỳ báo cáo. Dùng “+ Thêm sheet” hoặc “+ Tạo bảng mới”.</div>';
    var rows = S.tables[ui.period];
    if (!rows) return nav + '<div class="nodata">Kỳ này lấy từ tab “' + esc(p.source) + '” và chưa được nhập vào web. Dùng “+ Thêm sheet” để chuyển thành bảng.</div>';
    var names = S.groups[ui.period] || [];
    var filter = names.indexOf(ui.taskTeam) >= 0 ? ui.taskTeam : 'all';
    var chips = '<div class="chips"><button type="button" class="chip ' + (filter === 'all' ? 'on' : '') + '" data-act="task-team" data-team="all" aria-pressed="' + (filter === 'all') + '">Tất cả team</button>' +
      names.map(function (k) {
        var on = filter === k;
        return '<button type="button" class="chip ' + (on ? 'on' : '') + '" style="' + tstyle(k) + '" data-act="task-team" data-team="' + esc(k) + '" aria-pressed="' + on + '">' + esc(k) + '</button>';
      }).join('') + '</div>';
    var cards = names.filter(function (k) { return filter === 'all' || filter === k; }).map(function (k) {
      var rs = rows.filter(function (r) { return r.team === k; });
      var pend = rs.filter(function (r) { return (r.pending || '').trim(); }).length;
      var head = ui.editing
        ? '<div class="tgroup"><div class="tgact"><input spellcheck="false" aria-label="Tên team" value="' + esc(k) + '" data-c="tgname" data-old="' + esc(k) + '"></div>' +
          '<div class="tgact"><button type="button" class="light" data-act="trow-add" data-team="' + esc(k) + '">+ Thêm dòng</button>' +
          '<button type="button" class="del" data-act="tg-del" data-team="' + esc(k) + '" aria-label="Xoá team ' + esc(k) + '">' + TRASH + '</button></div></div>'
        : '<div class="tgroup"><span><b>' + esc(k) + '</b><small>' + rs.length + ' dòng · ' + pend + ' đang chờ</small></span></div>';
      return '<section class="tcard" style="' + tstyle(k) + '" aria-label="' + esc(k) + '">' + head +
        '<div class="scroll"><div class="in"><div class="tth"><span>No</span><span>Game</span><span>Task Done</span><span>Task Pending</span><span>Note</span><span></span></div>' +
        rs.map(function (r, i) {
          var has = !!(r.pending || '').trim();
          return '<div class="trow"><span class="no">' + (i + 1) + '</span>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'game', val: r.game, area: 1, cls: 'game', ph: 'Game', label: 'Game' }) + '</div>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'done', val: r.done, area: 1, ph: '- Task đã xong', label: 'Task Done' }) + '</div>' +
            '<div class="' + (has ? 'pend' : '') + '">' + fld({ c: 'trow', id: r.id, k: 'pending', val: r.pending, area: 1, ph: '- Task đang chờ', label: 'Task Pending' }) + '</div>' +
            '<div>' + fld({ c: 'trow', id: r.id, k: 'note', val: r.note, area: 1, ph: 'Note', label: 'Note' }) + '</div>' +
            '<div class="delcol">' + (ui.editing ? '<button type="button" class="del" data-act="trow-del" data-id="' + r.id + '" aria-label="Xoá dòng">' + TRASH + '</button>' : '') + '</div></div>';
        }).join('') + (rs.length ? '' : '<div class="empty">Team này chưa có dòng nào.</div>') + '</div></div></section>';
    }).join('');
    return nav + chips + '<div class="stack">' + (cards || '<div class="nodata">Bảng này chưa có team nào.</div>') +
      (ui.editing ? '<button type="button" class="addboard" data-act="tg-add">+ Thêm team</button>' : '') + '</div>';
  }

  /* ----- Thêm sheet: dán dữ liệu, file .csv hoặc file .xlsx ----- */
  function impPanel() {
    var m = ui.imp;
    if (!m) return '';
    var h = '<section class="panel" aria-label="Thêm sheet"><div class="ph"><h2>Thêm sheet → tự chuyển thành bảng và gộp vào kỳ báo cáo</h2><button type="button" data-act="imp-close" aria-label="Đóng">×</button></div><div class="pb">';
    if (m.err) h += '<div class="err" role="alert">' + esc(m.err) + '</div>';
    if (m.busy) h += '<p class="hint">Đang đọc file…</p>';
    if (m.step === 1) {
      h += '<p class="hint">Cách 1 (khuyên dùng): trên Google Sheets chọn <b>Tệp → Tải xuống → Microsoft Excel (.xlsx)</b>, rồi chọn file đó ở dưới. Mỗi tab có bảng công việc sẽ thành một kỳ báo cáo. ' +
        'Cách 2: bôi đen bảng trong một tab, Ctrl+C rồi dán vào ô dưới (cần có dòng tiêu đề Team / Game / Task Done / Task Pending / Note).</p>' +
        '<label>Chọn file .xlsx hoặc .csv<input type="file" accept=".xlsx,.csv,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-imp-file></label>' +
        '<label>Hoặc dán dữ liệu từ sheet<textarea spellcheck="false" data-imp="text" placeholder="Dán vào đây…">' + esc(m.text || '') + '</textarea></label>' +
        '<label>Link Google Sheet (không bắt buộc, sẽ hiện nút mở sheet)<input type="text" spellcheck="false" data-imp="url" value="' + esc(m.url || '') + '" placeholder="https://docs.google.com/spreadsheets/d/…"></label>' +
        '<div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="imp-close">Huỷ</button><button type="button" class="btn teal" data-act="imp-read">Đọc dữ liệu đã dán</button></div>';
    } else {
      h += '<p style="margin:0">Tìm thấy <b>' + m.items.length + '</b> bảng công việc. Chọn bảng muốn thêm, đặt tên tab và tháng cho từng bảng. Nếu tên tab trùng một kỳ đã có thì các dòng sẽ được thêm vào kỳ đó.</p>';
      h += m.items.map(function (it, i) {
        return '<div class="pitem"><div class="ptop"><label class="chk"><input type="checkbox" data-imp-item="' + i + '" data-f="inc"' + (it.inc ? ' checked' : '') + '> <span><b>' + esc(it.name) + '</b> · ' + it.rows.length + ' dòng</span></label>' +
          '<label>Tên tab<input type="text" spellcheck="false" data-imp-item="' + i + '" data-f="label" value="' + esc(it.label) + '" placeholder="VD: 5/10 – 30/10"></label>' +
          '<label>Tháng<input type="month" data-imp-item="' + i + '" data-f="month" value="' + esc(it.month) + '"></label></div>' +
          '<label>Tên bảng<input type="text" spellcheck="false" data-imp-item="' + i + '" data-f="title" value="' + esc(it.title) + '" placeholder="VD: Công việc DA · Tháng 10"></label>' +
          '<details><summary>Xem trước các dòng</summary><div class="pv"><table><thead><tr><th>Team</th><th>Game</th><th>Task Done</th><th>Task Pending</th><th>Note</th></tr></thead><tbody>' +
          it.rows.slice(0, 40).map(function (r) { return '<tr><td><span class="tbadge" style="' + tstyle(r.team) + '">' + esc(r.team) + '</span></td><td><b>' + esc(r.game) + '</b></td><td>' + esc(r.done || '—') + '</td><td>' + esc(r.pending || '—') + '</td><td>' + esc(r.note || '—') + '</td></tr>'; }).join('') +
          '</tbody></table></div></details></div>';
      }).join('');
      h += '<label>Link Google Sheet (không bắt buộc, áp dụng cho các kỳ mới)<input type="text" spellcheck="false" data-imp="url" value="' + esc(m.url || '') + '" placeholder="https://docs.google.com/spreadsheets/d/…"></label>' +
        '<div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="imp-back">← Chọn lại</button><button type="button" class="btn teal" data-act="imp-merge">Chuyển thành bảng &amp; gộp vào kỳ</button></div>';
    }
    return h + '</div></section>';
  }

  function parseTable(text, delim) {
    text = String(text || '').replace(/^﻿/, '');
    if (!delim) {
      var head = text.split('\n').slice(0, 6).join('\n');
      delim = head.indexOf('\t') >= 0 ? '\t' : ',';
    }
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
    var s = String(t || '').trim(), k = s.toLowerCase().replace(/\s+/g, '');
    if (k === 'novas') return 'NovaS';
    if (k === 'metax') return 'MetaX';
    if (k === 'hicat') return 'HiCat';
    if (k === 'somia') return 'Somia';
    if (k === 'others' || k === 'khac' || k === 'khác' || !k) return 'Khác';
    return s;
  }
  function parseGrid(grid) {
    var hi = -1, i, j;
    for (i = 0; i < grid.length; i++) {
      var low = (grid[i] || []).map(function (c) { return String(c == null ? '' : c).trim().toLowerCase(); });
      if (low.indexOf('game') >= 0 && low.some(function (c) { return c.indexOf('task done') === 0; })) { hi = i; break; }
    }
    if (hi < 0) return null;
    var head = grid[hi].map(function (c) { return String(c == null ? '' : c).trim().toLowerCase(); });
    function col(fn) { for (var k = 0; k < head.length; k++) if (fn(head[k])) return k; return -1; }
    var ti = col(function (c) { return c === 'team'; });
    var gi = col(function (c) { return c === 'game'; });
    var di = col(function (c) { return c.indexOf('task done') === 0; });
    var pi = col(function (c) { return c.indexOf('task pending') === 0; });
    var ni = col(function (c) { return c === 'note' || c.indexOf('note') === 0; });
    var title = '';
    for (i = 0; i < hi && !title; i++) for (j = 0; j < (grid[i] || []).length; j++) if (String(grid[i][j] || '').trim()) { title = String(grid[i][j]).trim(); break; }
    var out = [], cur = 'Khác';
    for (i = hi + 1; i < grid.length; i++) {
      var r = grid[i] || [];
      var at = function (k) { return k >= 0 && r[k] != null ? String(r[k]).trim() : ''; };
      if (at(ti)) cur = normTeam(at(ti));
      var row = { team: cur, game: at(gi), done: at(di), pending: at(pi), note: at(ni) };
      if (row.game || row.done || row.pending || row.note) out.push(row);
    }
    return { title: title, rows: out };
  }
  /* Đọc file .xlsx không cần thư viện ngoài: giải nén zip rồi đọc XML */
  async function inflate(data) {
    var ds = new DecompressionStream('deflate-raw');
    var st = new Blob([data]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(st).arrayBuffer());
  }
  async function unzip(buf) {
    var u8 = new Uint8Array(buf), dv = new DataView(buf), i = u8.length - 22;
    while (i >= 0 && dv.getUint32(i, true) !== 0x06054b50) i--;
    if (i < 0) throw new Error('zip');
    var n = dv.getUint16(i + 10, true), p = dv.getUint32(i + 16, true), files = {};
    for (var k = 0; k < n; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      var nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
      var name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
      var ds = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
      files[name] = { method: method, data: u8.subarray(ds, ds + csize) };
      p += 46 + nl + el + cl;
    }
    return files;
  }
  async function zipText(files, name) {
    var f = files[name];
    if (!f) return null;
    var d = f.method === 0 ? f.data : await inflate(f.data);
    return new TextDecoder().decode(d);
  }
  function xmlDoc(s) { return new DOMParser().parseFromString(s, 'application/xml'); }
  function colIdx(ref) {
    var m = /^([A-Z]+)/.exec(ref)[1], n = 0;
    for (var i = 0; i < m.length; i++) n = n * 26 + (m.charCodeAt(i) - 64);
    return n - 1;
  }
  function textOf(el) { return Array.prototype.map.call(el.getElementsByTagName('t'), function (x) { return x.textContent; }).join(''); }
  async function readXlsx(buf) {
    var files = await unzip(buf);
    var wbx = await zipText(files, 'xl/workbook.xml');
    if (!wbx) throw new Error('xlsx');
    var relMap = {}, rels = await zipText(files, 'xl/_rels/workbook.xml.rels');
    if (rels) Array.prototype.forEach.call(xmlDoc(rels).getElementsByTagName('Relationship'), function (r) { relMap[r.getAttribute('Id')] = r.getAttribute('Target'); });
    var sst = [], sx = await zipText(files, 'xl/sharedStrings.xml');
    if (sx) Array.prototype.forEach.call(xmlDoc(sx).getElementsByTagName('si'), function (si) { sst.push(textOf(si)); });
    var out = [], sheets = xmlDoc(wbx).getElementsByTagName('sheet');
    for (var i = 0; i < sheets.length; i++) {
      var sh = sheets[i], name = sh.getAttribute('name');
      var rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      var target = relMap[rid];
      if (!target) continue;
      target = target.replace(/^\//, '');
      var path = target.indexOf('xl/') === 0 ? target : 'xl/' + target;
      var sxml = await zipText(files, path);
      if (!sxml) continue;
      var grid = [], rows = xmlDoc(sxml).getElementsByTagName('row');
      for (var r = 0; r < rows.length; r++) {
        var ri = parseInt(rows[r].getAttribute('r'), 10) - 1, cells = rows[r].getElementsByTagName('c'), row = [];
        for (var c = 0; c < cells.length; c++) {
          var ce = cells[c], ci = colIdx(ce.getAttribute('r')), t = ce.getAttribute('t'), v = '';
          if (t === 'inlineStr') v = textOf(ce);
          else {
            var ve = ce.getElementsByTagName('v')[0];
            v = ve ? ve.textContent : '';
            if (t === 's') v = sst[parseInt(v, 10)] || '';
            else if (t === 'b') v = v === '1' ? 'TRUE' : 'FALSE';
          }
          row[ci] = v;
        }
        for (var k = 0; k < row.length; k++) if (row[k] == null) row[k] = '';
        grid[isNaN(ri) ? r : ri] = row;
      }
      for (var g = 0; g < grid.length; g++) if (!grid[g]) grid[g] = [];
      out.push({ name: name, grid: grid });
    }
    return out;
  }
  function makeItems(list) {
    var items = [];
    list.forEach(function (x) {
      var res = parseGrid(x.grid);
      if (res && res.rows.length) items.push({ name: x.name, rows: res.rows, inc: true, label: x.label != null ? x.label : x.name, month: curMonth(), title: res.title || '' });
    });
    return items;
  }

  /* ================= Thao tác ================= */
  function setView(v) {
    ui.view = v; ui.q = ''; ui.saved = false; ui.imp = null; ui.toast = '';
    if (location.hash !== '#' + v) location.hash = '#' + v;
  }
  function listOf(kind, grp) {
    if (kind === 'game') return S.games;
    if (kind === 'note') return S.notes;
    if (kind === 'mood') return S.moods;
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
  function uniqueName(base, taken) {
    var n = base, i = 2;
    while (taken.indexOf(n) >= 0) n = base + ' ' + (i++);
    return n;
  }
  function recover() {
    var t = ui.trash.pop();
    if (!t) return;
    var v;
    if (t.kind === 'board') {
      S.boards.splice(Math.min(t.idx, S.boards.length), 0, t.board);
      S.teamItems[t.board.id] = t.items; v = 'teams';
    } else if (t.kind === 'tgroup') {
      S.tables[t.period] = (S.tables[t.period] || []).concat(t.rows);
      var g = S.groups[t.period] = S.groups[t.period] || [];
      if (g.indexOf(t.name) < 0) g.splice(Math.min(t.idx, g.length), 0, t.name);
      ui.period = t.period; v = 'tasks';
    } else {
      var list;
      if (t.kind === 'trow') { S.tables[t.period] = S.tables[t.period] || []; list = S.tables[t.period]; ui.period = t.period; }
      else list = listOf(t.kind, t.grp);
      list.splice(Math.min(t.idx, list.length), 0, t.item);
      v = t.kind === 'game' ? 'games' : t.kind === 'note' ? 'notes' : t.kind === 'mood' ? 'mood' : t.kind === 'titem' ? 'teams' : 'tasks';
    }
    setView(v);
  }
  function newImp() { return { step: 1, text: '', err: '', url: '', items: [], busy: false }; }

  document.addEventListener('click', async function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !S) return;
    var a = el.dataset.act, id = +el.dataset.id, team = el.dataset.team, grp = el.dataset.grp, bid = el.dataset.bid, i;
    switch (a) {
      case 'edit': ui.editing = true; ui.saved = false; ui.toast = ''; break;
      case 'save': {
        var ok = await persist();
        ui.editing = false; ui.trash = []; ui.saved = ok;
        if (!ok) { ui.toast = 'Không lưu được vào trình duyệt (có thể đang bật chế độ riêng tư). Dữ liệu vẫn còn trên trang cho đến khi bạn đóng nó.'; ui.toastType = 'warn'; }
        else ui.toast = '';
        break;
      }
      case 'recover': recover(); break;
      case 'toast-close': ui.toast = ''; break;
      case 'logout': logout(); return;
      case 'newcheer': newCheer(); sceneKey = ''; break;
      case 'export': {
        var p = await C.encryptJSON(KEY, S);
        download('data.enc.json', JSON.stringify({ v: 1, iter: FILE.iter, salt: FILE.salt, iv: p.iv, ct: p.ct }));
        ui.toast = 'Đã tải data.enc.json (đã mã hoá). Muốn cả web dùng bản này: đặt file vào thư mục web và nhờ Claude đưa lên GitHub.'; ui.toastType = 'info';
        break;
      }
      case 'import-pick': { var f = document.getElementById('importFile'); if (f) f.click(); return; }
      case 'pick-team': ui.team = (team === ui.team ? 'all' : team); break;
      case 'add-game': S.games.unshift({ id: nid(), name: '', sub: '', team: team || 'NovaS', link: '', store: '', src: 'raw', status: 'Game mới', hidden: false, note: '' }); ui.q = ''; break;
      case 'hide-game': { i = idxById(S.games, id); if (i >= 0) S.games[i].hidden = !S.games[i].hidden; break; }
      case 'del-game': removeTo('game', null, id); break;
      case 'titem-add': S.teamItems[grp].push({ id: nid(), kind: el.dataset.kind, title: '', url: '', text: '' }); ui.q = ''; break;
      case 'titem-kind': {
        i = idxById(S.teamItems[grp], id);
        if (i >= 0) { var x = S.teamItems[grp][i]; if (x.kind === 'link') { x.kind = 'note'; x.text = x.text || x.title; } else { x.kind = 'link'; x.title = x.title || x.text; } }
        break;
      }
      case 'titem-del': removeTo('titem', grp, id); break;
      case 'board-add': {
        var nb = 'b' + nid();
        S.boards.push({ id: nb, name: 'Nhóm mới', color: 'rose', w: 3, h: 0 });
        S.teamItems[nb] = []; ui.q = ''; break;
      }
      case 'board-del': {
        i = S.boards.map(function (b) { return b.id; }).indexOf(bid);
        if (i >= 0) {
          var bd = S.boards.splice(i, 1)[0];
          ui.trash.push({ kind: 'board', board: bd, items: S.teamItems[bid] || [], idx: i });
          delete S.teamItems[bid];
        }
        break;
      }
      case 'mood-pick': ui.md.mood = el.dataset.m; ui.md.say = MOOD_ECHO[ui.md.mood] || ''; ui.md.sv++; break;
      case 'mood-energy': ui.md.energy = +el.dataset.e; break;
      case 'mood-range': ui.md.range = el.dataset.r; break;
      case 'mood-random': {
        var rm = pickOne(MOODS.filter(function (x) { return x.id !== ui.md.mood; })), rp = pickOne(MOOD_PROMPTS[rm.id]), er = ENERGY_RANGE[rm.id];
        ui.md.mood = rm.id; ui.md.text = rp; ui.md.say = rp;
        ui.md.energy = er[0] + Math.floor(Math.random() * (er[1] - er[0] + 1)); ui.md.sv++;
        break;
      }
      case 'mood-save': {
        var md = ui.md;
        if (!md.mood) { ui.toast = 'Hãy chọn một cảm xúc trước nhé!'; ui.toastType = 'warn'; break; }
        var ex = findMood(md.date), txt = md.text.trim();
        await mergeStoredMoods();
        ex = findMood(md.date);
        if (ex) { ex.mood = md.mood; ex.energy = md.energy; ex.text = txt; ex.ts = Date.now(); }
        else S.moods.push({ id: nid(), date: md.date, mood: md.mood, energy: md.energy, text: txt, ts: Date.now() });
        delete ui.delMoods[md.date];
        var okm = await persist();
        md.text = txt; md.say = txt || MOOD_ECHO[md.mood]; md.sv++;
        ui.toast = okm ? 'Đã lưu cảm xúc ngày ' + fmtDM(md.date) + '.' : 'Chưa lưu được vào trình duyệt (có thể đang bật chế độ riêng tư).';
        ui.toastType = okm ? 'ok' : 'warn';
        break;
      }
      case 'mood-open': loadMoodDate(el.dataset.date); ui.md.scroll = true; break;
      case 'mood-today': loadMoodDate(todayIso()); break;
      case 'mood-shift': {
        var nd = isoAdd(ui.md.date, +el.dataset.d);
        if (nd <= todayIso()) loadMoodDate(nd);
        break;
      }
      case 'mood-del': {
        var dm = S.moods.filter(function (x) { return x.id === id; })[0];
        if (dm) ui.delMoods[dm.date] = 1;
        removeTo('mood', null, id); break;
      }
      case 'note-add': S.notes.unshift({ id: nid(), date: todayIso(), text: '', link: '' }); ui.q = ''; break;
      case 'note-del': removeTo('note', null, id); break;
      case 'notes-mode': ui.notesMode = el.dataset.mode; break;
      case 'notes-sort': ui.notesSort = ui.notesSort === 'desc' ? 'asc' : 'desc'; break;
      case 'move': stepItem(el.dataset.dk, grp, el.dataset.id, +el.dataset.dir); break;
      case 'titem-hide': { i = idxById(S.teamItems[grp], id); if (i >= 0) S.teamItems[grp][i].hidden = !S.teamItems[grp][i].hidden; break; }
      case 'note-hide': { i = idxById(S.notes, id); if (i >= 0) S.notes[i].hidden = !S.notes[i].hidden; break; }
      case 'pick-period': ui.period = el.dataset.id; ui.taskTeam = 'all'; break;
      case 'task-team': ui.taskTeam = team; break;
      case 'trow-add': S.tables[ui.period] = S.tables[ui.period] || []; S.tables[ui.period].push({ id: nid(), team: team, game: '', done: '', pending: '', note: '' }); break;
      case 'trow-del': removeTo('trow', null, id); break;
      case 'tg-add': {
        var gl = S.groups[ui.period] = S.groups[ui.period] || [];
        var nm = uniqueName('Team mới', gl);
        gl.push(nm);
        S.tables[ui.period] = S.tables[ui.period] || [];
        S.tables[ui.period].push({ id: nid(), team: nm, game: '', done: '', pending: '', note: '' });
        break;
      }
      case 'tg-del': {
        var gl2 = S.groups[ui.period] || [], gi = gl2.indexOf(team);
        if (gi >= 0) {
          var all = S.tables[ui.period] || [];
          ui.trash.push({ kind: 'tgroup', period: ui.period, name: team, idx: gi, rows: all.filter(function (r) { return r.team === team; }) });
          S.tables[ui.period] = all.filter(function (r) { return r.team !== team; });
          gl2.splice(gi, 1);
          if (ui.taskTeam === team) ui.taskTeam = 'all';
        }
        break;
      }
      case 'new-table': {
        var pid = 'p' + nid(), n = S.periods.length + 1;
        S.periods.push({ id: pid, m: curMonth(), label: 'Bảng mới ' + n, source: 'Tạo trực tiếp trên web', range: 'Chưa đặt ngày', title: 'Bảng công việc mới', url: '', isNew: true });
        S.tables[pid] = ORDER.map(function (k) { return { id: nid(), team: k, game: '', done: '', pending: '', note: '' }; });
        S.groups[pid] = ORDER.slice();
        ui.period = pid; ui.taskTeam = 'all'; ui.editing = true; ui.saved = false;
        ui.toast = 'Đã tạo bảng trống. Bạn có thể đổi tên tab, tên team, xoá hoặc thêm team. Nhớ bấm Lưu ở thanh trên.'; ui.toastType = 'info';
        break;
      }
      case 'imp-open': ui.imp = newImp(); ui.toast = ''; break;
      case 'imp-close': ui.imp = null; break;
      case 'imp-back': ui.imp.step = 1; ui.imp.err = ''; ui.imp.items = []; break;
      case 'imp-read': {
        var grid = parseTable(ui.imp.text);
        var items = makeItems([{ name: 'Dữ liệu đã dán', grid: grid, label: '' }]);
        if (!items.length) { ui.imp.err = 'Không nhận ra bảng. Cần có dòng tiêu đề gồm các cột Game, Task Done, Task Pending (và Team, Note). Hãy bôi đen cả bảng trong sheet rồi dán lại.'; break; }
        ui.imp.err = ''; ui.imp.step = 2; ui.imp.items = items;
        break;
      }
      case 'imp-merge': {
        var m = ui.imp, chosen = m.items.filter(function (it) { return it.inc; });
        if (!chosen.length) { m.err = 'Hãy chọn ít nhất một bảng để thêm.'; break; }
        var bad = chosen.filter(function (it) { return !String(it.label).trim(); })[0];
        if (bad) { m.err = 'Hãy đặt tên tab cho bảng “' + bad.name + '” trước khi gộp.'; break; }
        var added = 0, created = 0;
        chosen.forEach(function (it) {
          var label = String(it.label).trim(), rows = it.rows.map(function (r) { return { id: nid(), team: r.team, game: r.game, done: r.done, pending: r.pending, note: r.note }; });
          var ex = S.periods.filter(function (p) { return p.label === label; })[0], pid2;
          if (ex) {
            pid2 = ex.id;
            S.tables[pid2] = (S.tables[pid2] || []).concat(rows);
            if (m.url.trim() && !ex.url) ex.url = m.url.trim();
          } else {
            pid2 = 'p' + nid(); created++;
            S.periods.push({ id: pid2, m: it.month || curMonth(), label: label, source: it.name === 'Dữ liệu đã dán' ? 'Dán từ Google Sheets' : it.name, range: monthLabel(it.month || curMonth()),
              title: String(it.title).trim() || ('Công việc DA · ' + label), url: m.url.trim(), isNew: true });
            S.tables[pid2] = rows;
          }
          var g = S.groups[pid2] = S.groups[pid2] || [];
          deriveGroups(rows).forEach(function (n) { if (g.indexOf(n) < 0) g.push(n); });
          added += rows.length; ui.period = pid2;
        });
        ui.imp = null; ui.taskTeam = 'all';
        var ok2 = await persist();
        var msg = 'Đã thêm ' + added + ' dòng từ ' + chosen.length + ' bảng (' + created + ' kỳ mới) vào Công việc tháng.';
        ui.toast = ok2 ? msg : msg + ' (Chưa lưu được vào trình duyệt.)'; ui.toastType = ok2 ? 'info' : 'warn';
        break;
      }
      default: return;
    }
    render();
  });

  var PFIELD = { ptitle: 'title', plabel: 'label', purl: 'url', prange: 'range' };
  function setField(t) {
    var c = t.dataset.c, k = t.dataset.k;
    if (PFIELD[c]) { var p = findPeriod(ui.period); if (p) p[PFIELD[c]] = t.value; return; }
    if (c === 'board') {
      var b = findBoard(t.dataset.bid);
      if (b) b[k] = k === 'w' ? Math.min(12, Math.max(3, +t.value || 3)) : k === 'h' ? Math.max(0, +t.value || 0) : t.value;
      return;
    }
    var list = listOf(c, t.dataset.grp);
    if (!list) return;
    var i = idxById(list, +t.dataset.id);
    if (i >= 0) list[i][k] = t.value;
  }
  function renameGroup(oldName, newName) {
    newName = String(newName || '').trim();
    if (!newName || newName === oldName) return false;
    var g = S.groups[ui.period] || [], i = g.indexOf(oldName);
    (S.tables[ui.period] || []).forEach(function (r) { if (r.team === oldName) r.team = newName; });
    if (i >= 0) {
      if (g.indexOf(newName) >= 0) g.splice(i, 1); else g[i] = newName;
    }
    if (ui.taskTeam === oldName) ui.taskTeam = 'all';
    return true;
  }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.dataset || !S) return;
    if (t.dataset.rte) { syncRte(t); return; }
    if (t.dataset.md === 'text') { ui.md.text = t.value; return; }
    if (t.dataset.c) { if (t.dataset.c !== 'tgname') { setField(t); if (t.tagName === 'TEXTAREA') fit(t); } return; }
    if (t.dataset.search !== undefined) { ui.q = t.value; renderBody(); return; }
    if (t.dataset.impItem !== undefined && ui.imp && t.type !== 'checkbox') { ui.imp.items[+t.dataset.impItem][t.dataset.f] = t.value; return; }
    if (t.dataset.imp && ui.imp) ui.imp[t.dataset.imp] = t.value;
  });
  document.addEventListener('change', async function (e) {
    var t = e.target;
    if (!t.dataset) return;
    if (t.dataset.md === 'date') { if (t.value && S) { loadMoodDate(t.value); render(); } return; }
    if (t.dataset.avatar !== undefined && t.files && t.files[0]) {
      readAvatar(t.files[0], async function (d) { S.avatar = d; await persist(); render(); });
      return;
    }
    if (t.dataset.impFile !== undefined && t.files && t.files[0] && ui.imp) {
      var file = t.files[0];
      ui.imp.busy = true; ui.imp.err = ''; render();
      try {
        var items;
        if (/\.xlsx$/i.test(file.name)) {
          items = makeItems(await readXlsx(await readAs(file, 'buffer')));
        } else if (/\.xls$/i.test(file.name)) {
          throw new Error('xls');
        } else {
          items = makeItems([{ name: file.name.replace(/\.[^.]+$/, ''), grid: parseTable(await readAs(file, 'text')), label: file.name.replace(/\.[^.]+$/, '') }]);
        }
        if (!items.length) ui.imp.err = 'Không tìm thấy bảng công việc trong file (cần dòng tiêu đề có cột Game, Task Done, Task Pending).';
        else { ui.imp.items = items; ui.imp.step = 2; }
      } catch (err) {
        ui.imp.err = err.message === 'xls' ? 'File .xls (Excel cũ) chưa đọc được. Hãy tải về dạng .xlsx hoặc .csv.' : 'Không đọc được file. Hãy thử tải lại file dạng .xlsx hoặc .csv từ Google Sheets.';
      }
      ui.imp.busy = false; render(); return;
    }
    if (t.dataset.impItem !== undefined && ui.imp && t.type === 'checkbox') { ui.imp.items[+t.dataset.impItem].inc = t.checked; return; }
    if (t.dataset.pickperiod !== undefined) { if (t.value) { ui.period = t.value; ui.taskTeam = 'all'; render(); } return; }
    if (t.id === 'importFile' && t.files && t.files[0]) {
      try {
        var f = JSON.parse(await readAs(t.files[0], 'text'));
        S = ensure(await C.decryptJSON(KEY, f));
        var ok = await persist();
        ui.toast = ok ? 'Đã nạp bản sao lưu.' : 'Đã nạp bản sao lưu (chưa lưu được vào trình duyệt).'; ui.toastType = ok ? 'info' : 'warn';
        ui.trash = []; ui.editing = false; ui.period = latestPeriodId(); sceneKey = '';
      } catch (err) {
        ui.toast = 'Không nạp được file: sai định dạng hoặc được mã hoá bằng tài khoản khác.'; ui.toastType = 'warn';
      }
      render(); return;
    }
    if (t.dataset.c === 'tgname') { if (renameGroup(t.dataset.old, t.value)) render(); else t.value = t.dataset.old; return; }
    if (t.tagName === 'SELECT' && t.dataset.c) { setField(t); render(); return; }
    if (t.dataset.c && PFIELD[t.dataset.c] && t.dataset.c !== 'ptitle') { render(); return; }
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
  /* ----- Định dạng chữ cho ghi chú (bấm nút khi đang đặt con trỏ trong ô) ----- */
  document.addEventListener('mousedown', function (e) {
    if (!S || !e.target.closest) return;
    var b = e.target.closest('[data-rt]');
    if (b) {
      e.preventDefault();
      var a = document.activeElement, ed = a && a.closest ? a.closest('.rte[contenteditable]') : null;
      if (!ed) return;
      document.execCommand('styleWithCSS', false, true);
      document.execCommand(b.dataset.rt, false, b.dataset.v || null);
      syncRte(ed);
      return;
    }
    var g = e.target.closest('.grip');
    if (g) { var r = g.closest('[data-dk]'); if (r) r.setAttribute('draggable', 'true'); }
  });
  document.addEventListener('paste', function (e) {
    var r = e.target.closest ? e.target.closest('.rte[contenteditable]') : null;
    if (!r) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });

  /* ----- Kéo thả đổi thứ tự ----- */
  var drag = null;
  function clearDrag() {
    var m = document.querySelectorAll('.drop-before,.drop-after,.dragging,[draggable="true"]');
    for (var i = 0; i < m.length; i++) { m[i].classList.remove('drop-before', 'drop-after', 'dragging'); m[i].removeAttribute('draggable'); }
  }
  function dropTarget(e) {
    if (!drag || !e.target.closest) return null;
    var t = e.target.closest('[data-dk="' + drag.k + '"]');
    return t && (t.dataset.dgrp || '') === drag.grp ? t : null;
  }
  function dropAfter(t, e) {
    var r = t.getBoundingClientRect();
    if (drag.k === 'board' && t.parentNode && r.width < t.parentNode.clientWidth * 0.7) return e.clientX - r.left > r.width / 2;
    return e.clientY - r.top > r.height / 2;
  }
  document.addEventListener('mouseup', function () { if (!drag) clearDrag(); });
  document.addEventListener('dragstart', function (e) {
    var r = e.target.closest ? e.target.closest('[data-dk]') : null;
    if (!r || r.getAttribute('draggable') !== 'true') return;
    drag = { k: r.dataset.dk, id: r.dataset.did, grp: r.dataset.dgrp || '' };
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', drag.id); } catch (x) {}
    r.classList.add('dragging');
  });
  document.addEventListener('dragover', function (e) {
    var t = dropTarget(e);
    if (!t) return;
    e.preventDefault();
    var m = document.querySelectorAll('.drop-before,.drop-after');
    for (var i = 0; i < m.length; i++) m[i].classList.remove('drop-before', 'drop-after');
    t.classList.add(dropAfter(t, e) ? 'drop-after' : 'drop-before');
  });
  document.addEventListener('drop', function (e) {
    var t = dropTarget(e);
    if (!t) return;
    e.preventDefault();
    var d = drag, after = dropAfter(t, e);
    drag = null; clearDrag();
    if (moveItem(d.k, d.grp, d.id, t.dataset.did, after)) render();
  });
  document.addEventListener('dragend', function () { drag = null; clearDrag(); });

  /* ----- Kéo góc để đổi kích thước bảng (Link team) ----- */
  document.addEventListener('pointerdown', function (e) {
    var h = S && e.target.closest ? e.target.closest('.rsz') : null;
    if (!h) return;
    e.preventDefault();
    var card = h.closest('.card'), grid = card.parentNode, b = findBoard(h.dataset.bid);
    if (!b) return;
    var left = card.getBoundingClientRect().left, startH = card.offsetHeight, sy = e.clientY, vert = false;
    function onMove(ev) {
      var cs = getComputedStyle(grid), cols = cs.gridTemplateColumns.split(' ').length || 12, gap = parseFloat(cs.columnGap) || 0;
      var colw = (grid.clientWidth + gap) / cols;
      b.w = Math.min(12, Math.max(3, Math.round(Math.round((ev.clientX - left + gap) / colw) * 12 / cols)));
      card.className = card.className.replace(/\bw\d+\b/, 'w' + b.w);
      if (Math.abs(ev.clientY - sy) > 8) vert = true;
      if (vert) { b.h = Math.max(160, Math.round(startH + ev.clientY - sy)); card.style.height = b.h + 'px'; card.classList.add('fixh'); }
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      render();
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });

  setInterval(checkNewDay, 30000);
  setInterval(syncTick, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { checkNewDay(); syncTick(); } });
  window.addEventListener('focus', function () { checkNewDay(); syncTick(); });
  window.addEventListener('beforeunload', function (e) {
    if (ui.editing) { e.preventDefault(); e.returnValue = ''; }
  });

  boot();
})();
