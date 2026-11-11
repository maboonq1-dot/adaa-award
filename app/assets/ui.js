/* جائزة أداء الصحة — أدوات العرض المشتركة */

/** الأرقام إنجليزيّة (0-9) في المنصّة كلّها، والعشريّة «.» والآلاف «,» والنسبة «%».
    دليلُ الجائزة نفسه يكتب بها («2026» و«50%»)، فالمنصّةُ تطابق مصدرَها.
    وبقي اسمُ الدالّة القديم ar() كي لا تُلمَس مئاتُ المواضع التي تستدعيها؛ وصارت تُعيد الرقمَ كما هو. */
function ar(x) {
  if (x === null || x === undefined || x === '') return '—';
  return String(x);
}
function fmt(n, d = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const s = Number(n).toFixed(d);
  const [i, f] = s.split('.');
  return ar(f ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + f : i.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}
const pc = (n, d = 1) => fmt(n, d) + '%';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

/** تمييز العدد في العربية: مفرد ومثنّى وجمع قلّة وجمع كثرة */
function num(n, one, two, few, many) {
  if (n === 0) return `لا ${many}`;
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${ar(n)} ${few}`;
  return `${ar(n)} ${many}`;
}
const nCase = n => num(n, 'ملفٌّ واحد', 'ملفّان', 'ملفّات', 'ملفّاً');
const nEnt  = n => num(n, 'جهةٌ واحدة', 'جهتان', 'جهات', 'جهةً');

/** التاريخ ميلاديٌّ مختصر */
function dt(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  const M = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${ar(+d)} ${M[+m - 1]} ${ar(y)}`;
}

/* ============ الأيقونات ============
   كلُّ أيقونةٍ بطبقتين: خطٌّ رئيسيّ، وظلٌّ خافتٌ من اللون نفسه (class="s") يمنحها جسماً.
   مرسومةٌ على شبكة 24، بسُمك 1.7 وأطرافٍ مدوَّرة، فتبدو مجموعةً واحدة لا قطعاً متفرّقة. */
const I = {
  /* ---- التنقّل ---- */
  home:    '<path class="s" d="M5.2 10.4V19a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2v-8.6L12 4.6z"/><path d="M3.2 11.2 11.2 4.1a1.2 1.2 0 0 1 1.6 0l8 7.1"/><path d="M5.2 9.8V19a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V9.8"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
  board:   '<rect class="s" x="13.2" y="11.2" width="7.3" height="9.3" rx="2"/><rect x="3.5" y="3.5" width="7.3" height="9.3" rx="2"/><rect x="13.2" y="3.5" width="7.3" height="5.6" rx="2"/><rect x="13.2" y="11.2" width="7.3" height="9.3" rx="2"/><rect x="3.5" y="14.9" width="7.3" height="5.6" rx="2"/>',
  method:  '<path class="s" d="M6.6 15.2h10.8l2.1 3.9a1.9 1.9 0 0 1-1.7 2.8H6.2a1.9 1.9 0 0 1-1.7-2.8z"/><path d="M9.2 3.5h5.6"/><path d="M10 3.5v6L4.6 19.2a1.9 1.9 0 0 0 1.7 2.8h11.4a1.9 1.9 0 0 0 1.7-2.8L14 9.5v-6"/><path d="M7.2 14.6h9.6"/>',
  gov:     '<path class="s" d="M4.8 10h14.4v8.4H4.8z"/><path d="M3 9.4 11.2 4a1.4 1.4 0 0 1 1.6 0L21 9.4z"/><path d="M6.3 10v8.4M10.1 10v8.4M13.9 10v8.4M17.7 10v8.4"/><path d="M3.5 21h17M4.8 18.4h14.4"/>',
  medal:   '<path d="M8.3 3.2 10.9 8.6M15.7 3.2 13.1 8.6"/><circle class="s" cx="12" cy="14.8" r="6"/><circle cx="12" cy="14.8" r="6"/><path d="m12 11.9.95 1.9 2.1.3-1.5 1.5.35 2.1-1.9-1-1.9 1 .35-2.1-1.5-1.5 2.1-.3z"/>',
  reg:     '<path class="s" d="M6.2 3.5H14l4.8 4.8v10.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M6.2 3.5H14l4.8 4.8v10.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M14 3.5v3.8a1 1 0 0 0 1 1h3.8"/><path d="M11.5 11.8v5.4M8.8 14.5h5.4"/>',
  desk:    '<path class="s" d="M3.5 13.4h4.9l1.3 2.2h4.6l1.3-2.2h4.9V18a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z"/><path d="M3.5 13.4 5.9 5.9a2 2 0 0 1 1.9-1.4h8.4a2 2 0 0 1 1.9 1.4l2.4 7.5"/><path d="M3.5 13.4h4.9l1.3 2.2h4.6l1.3-2.2h4.9V18a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z"/>',
  gavel:   '<g transform="rotate(-40 12 12)"><rect class="s" x="6.5" y="3" width="11" height="5.8" rx="1.8"/><rect x="6.5" y="3" width="11" height="5.8" rx="1.8"/><path d="M12 8.8V20"/></g><path d="M11.2 21h9.3"/>',
  scale:   '<path d="M12 4.6V20.5M7.5 20.5h9M5 7.8h14"/><circle cx="12" cy="4.4" r="1.2"/><path class="s" d="M5 7.8 2.5 14.6a2.9 2.9 0 0 0 5 0z"/><path d="M5 7.8 2.5 14.6a2.9 2.9 0 0 0 5 0z"/><path class="s" d="m19 7.8-2.5 6.8a2.9 2.9 0 0 0 5 0z"/><path d="m19 7.8-2.5 6.8a2.9 2.9 0 0 0 5 0z"/>',
  log:     '<rect class="s" x="4.5" y="3.5" width="15" height="17" rx="2.5"/><rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><path d="M10.4 8.4h5.4M10.4 12h5.4M10.4 15.6h3.4"/><circle cx="7.7" cy="8.4" r=".9" fill="currentColor" stroke="none"/><circle cx="7.7" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="7.7" cy="15.6" r=".9" fill="currentColor" stroke="none"/>',
  verdict: '<circle class="s" cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="8.6"/><path d="m15.7 8.3-2 5.4-5.4 2 2-5.4z"/>',

  /* ---- مساراتُ الجائزة الستّة ---- */
  heartbeat: '<path class="s" d="M12 20.4s-7.9-4.6-7.9-10.4A4.5 4.5 0 0 1 8.6 5.5c1.4 0 2.6.7 3.4 1.8.8-1.1 2-1.8 3.4-1.8a4.5 4.5 0 0 1 4.5 4.5c0 5.8-7.9 10.4-7.9 10.4z"/><path d="M12 20.4s-7.9-4.6-7.9-10.4A4.5 4.5 0 0 1 8.6 5.5c1.4 0 2.6.7 3.4 1.8.8-1.1 2-1.8 3.4-1.8a4.5 4.5 0 0 1 4.5 4.5c0 5.8-7.9 10.4-7.9 10.4z"/><path d="M3.2 12.4h4.3l1.5-2.9 2.3 5.6 1.7-2.7h7.8"/>',
  clinic:  '<path class="s" d="M5.2 10.2V19a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6v-8.8L12 5z"/><path d="M3.2 11 11.2 4.2a1.2 1.2 0 0 1 1.6 0L20.8 11"/><path d="M5.2 9.8V19a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6V9.8"/><path d="M12 11.6v5M9.5 14.1h5"/>',
  siren:   '<path class="s" d="M7 17v-4.6a5 5 0 0 1 10 0V17z"/><path d="M7 17v-4.6a5 5 0 0 1 10 0V17"/><path d="M5.6 17h12.8a1 1 0 0 1 1 1v2.5H4.6V18a1 1 0 0 1 1-1z"/><path d="M12 3v1.7M4.7 6.2 6 7.4M19.3 6.2 18 7.4M2.8 12.2h1.7M21.2 12.2h-1.7"/>',
  shieldcheck: '<path class="s" d="M12 3.2 4.8 6v5.5c0 4.4 3 7.9 7.2 9.3 4.2-1.4 7.2-4.9 7.2-9.3V6z"/><path d="M12 3.2 4.8 6v5.5c0 4.4 3 7.9 7.2 9.3 4.2-1.4 7.2-4.9 7.2-9.3V6z"/><path d="m8.9 12 2.2 2.2 4-4.3"/>',
  mother:  '<circle class="s" cx="9" cy="7" r="2.9"/><circle cx="9" cy="7" r="2.9"/><path d="M3.4 20.5v-1.4a5.3 5.3 0 0 1 5.3-5.3h.6a5.3 5.3 0 0 1 3.4 1.2"/><circle class="s" cx="17.2" cy="13.6" r="2"/><circle cx="17.2" cy="13.6" r="2"/><path d="M13.9 20.5v-.7a3.3 3.3 0 0 1 3.3-3.3 3.3 3.3 0 0 1 3.3 3.3v.7"/>',
  gauge:   '<path class="s" d="M4 16.6a8 8 0 0 1 16 0z"/><path d="M4 16.6a8 8 0 0 1 16 0"/><path d="M12 16.6 15.6 11.4"/><circle cx="12" cy="16.6" r="1.3"/><path d="M7.1 11.6l1 .9M12 8.7v1.3M16.9 11.6l-1 .9"/><path d="M6.5 20.4h11"/>',

  /* ---- مربّعات الأرقام ---- */
  files:   '<path d="M6.6 16.6V6.6a2 2 0 0 1 2-2H16"/><rect class="s" x="9.4" y="7.4" width="11.1" height="13.1" rx="2.1"/><rect x="9.4" y="7.4" width="11.1" height="13.1" rx="2.1"/><path d="M12.4 12.2h5.1M12.4 15.6h3.4"/>',
  building:'<path class="s" d="M5 20.5V6.6A1.6 1.6 0 0 1 6.6 5h6.8A1.6 1.6 0 0 1 15 6.6v13.9z"/><path d="M5 20.5V6.6A1.6 1.6 0 0 1 6.6 5h6.8A1.6 1.6 0 0 1 15 6.6v13.9"/><path d="M15 10.5h2.4A1.6 1.6 0 0 1 19 12.1v8.4"/><path d="M3.4 20.5h17.2M8.4 9h3.2M8.4 12.6h3.2M8.4 16.2h3.2"/>',
  verified:'<circle class="s" cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="8.6"/><path d="m8.3 12.3 2.6 2.6 4.9-5.3"/>',
  funnel:  '<path class="s" d="M4 5.5h16l-6.1 7.1V18l-3.8 2.2v-7.6z"/><path d="M4 5.5h16l-6.1 7.1V18l-3.8 2.2v-7.6z"/>',
  split:   '<path d="M12 20.5v-7"/><path d="M12 13.5 6.2 8M12 13.5 17.8 8"/><path d="M6.2 8v3.7M6.2 8h3.7M17.8 8v3.7M17.8 8h-3.7"/>',
  layers:  '<path class="s" d="M12 3.6 21 8.3l-9 4.7-9-4.7z"/><path d="M12 3.6 21 8.3l-9 4.7-9-4.7z"/><path d="m3 12.3 9 4.7 9-4.7M3 16.3l9 4.7 9-4.7"/>',
  trophy:  '<path class="s" d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.8v1.6a3.2 3.2 0 0 0 3 3.2M16.5 6h2.7v1.6a3.2 3.2 0 0 1-3 3.2"/><path d="M12 14v3.2M8.8 20.5h6.4M9.8 17.2h4.4"/>',
  target:  '<circle class="s" cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.7"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  calendar:'<rect class="s" x="3.5" y="5" width="17" height="15.5" rx="2.5"/><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3.2v3.6M16 3.2v3.6"/>',
  users:   '<circle class="s" cx="9" cy="8.4" r="3.3"/><circle cx="9" cy="8.4" r="3.3"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M15.6 5.4a3.2 3.2 0 0 1 0 6M17.6 14.4a6 6 0 0 1 3.6 5.4"/>',
  chart:   '<rect x="3.8" y="12.4" width="4" height="8.1" rx="1.2"/><rect class="s" x="10" y="4.5" width="4" height="16" rx="1.2"/><rect x="10" y="4.5" width="4" height="16" rx="1.2"/><rect x="16.2" y="9" width="4" height="11.5" rx="1.2"/>',
  clock:   '<circle class="s" cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>',

  /* ---- أساسيّة ---- */
  track:   '<circle class="s" cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  stage:   '<rect class="s" x="10" y="4" width="4" height="14" rx="1"/><path d="M4 18h4V9H4zM10 18h4V4h-4zM16 18h4v-6h-4z"/>',
  judge:   '<g transform="rotate(-40 12 12)"><rect class="s" x="6.5" y="3" width="11" height="5.8" rx="1.8"/><rect x="6.5" y="3" width="11" height="5.8" rx="1.8"/><path d="M12 8.8V20"/></g><path d="M11.2 21h9.3"/>',
  shield:  '<path class="s" d="M12 3.2 4.8 6v5.5c0 4.4 3 7.9 7.2 9.3 4.2-1.4 7.2-4.9 7.2-9.3V6z"/><path d="M12 3.2 4.8 6v5.5c0 4.4 3 7.9 7.2 9.3 4.2-1.4 7.2-4.9 7.2-9.3V6z"/>',
  check:   '<path d="m4 12.5 5 5L20 6.5"/>',
  x:       '<path d="M6 6 18 18M18 6 6 18"/>',
  warn:    '<path class="s" d="M12 4.2 2.9 19.6h18.2z"/><path d="M12 4.2 2.9 19.6h18.2z"/><path d="M12 10.2v4M12 16.9h.01"/>',
  up:      '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down:    '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  flat:    '<path d="M5 12h14"/>',
  user:    '<circle class="s" cx="12" cy="8.2" r="4"/><circle cx="12" cy="8.2" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  file:    '<path class="s" d="M14 3.5H7.5a1.5 1.5 0 0 0-1.5 1.5v14a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7.5z"/><path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5z"/><path d="M13.5 3.5v4h4.5"/>',
  clip:    '<path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 17.9a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>',
  eye:     '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12"/><circle class="s" cx="12" cy="12" r="2.8"/><circle cx="12" cy="12" r="2.8"/>',
  lock:    '<rect class="s" x="4.5" y="10.5" width="15" height="10" rx="2.2"/><rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  merge:   '<path d="M4 6h5l6 6 5 0M4 18h5l3-3"/><path d="m17 9 3 3-3 3"/>',
  visit:   '<path class="s" d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11"/><circle cx="12" cy="10" r="2.6"/>',
  flask:   '<path class="s" d="M6.6 15.2h10.8l2.1 3.9a1.9 1.9 0 0 1-1.7 2.8H6.2a1.9 1.9 0 0 1-1.7-2.8z"/><path d="M10 3.5v6L4.6 19.2a1.9 1.9 0 0 0 1.7 2.8h11.4a1.9 1.9 0 0 0 1.7-2.8L14 9.5v-6M9.2 3.5h5.6"/>',
  grid:    '<rect class="s" x="13" y="13" width="7.5" height="7.5" rx="1.6"/><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.6"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.6"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.6"/>',
  star:    '<path class="s" d="m12 3.4 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.7 6.8 19.4l1-5.8-4.2-4.1 5.8-.8z"/><path d="m12 3.4 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.7 6.8 19.4l1-5.8-4.2-4.1 5.8-.8z"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  arrow:   '<path d="M19 12H5M12 5l-7 7 7 7"/>',
  deck:    '<rect class="s" x="3" y="4" width="18" height="12.5" rx="2"/><rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8 20.5h8M12 16.5v4"/>',
  play:    '<circle class="s" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M10 8.6v6.8l5.6-3.4z" fill="currentColor"/>',
  next:    '<path d="M15 6l-6 6 6 6"/>',
  prev:    '<path d="M9 6l6 6-6 6"/>',
  stop:    '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  pause:   '<path d="M9 6v12M15 6v12"/>',
  replay:  '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4"/>',
  full:    '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.file}</svg>`;

/* ============ شارات ============ */
function stateBadge(st, extra = '') {
  const s = STATE[st] || STATE.ineligible;
  const glyph = { gold: 'medal', ink: 'check', red: 'shield', off: 'flat' }[s.tone];
  return `<span class="bdg bdg--${s.tone}" title="${esc(s.desc)}">${ic(glyph)}${esc(s.name)}${extra ? ' · ' + esc(extra) : ''}</span>`;
}
function pill(txt, tone = 'n', title = '') {
  return `<span class="pill pill--${tone}"${title ? ` title="${esc(title)}"` : ''}>${esc(txt)}</span>`;
}
function yn(ok, y = 'مستوفى', n = 'غير مستوفٍ') {
  return `<span class="yn yn--${ok ? 'y' : 'n'}">${ic(ok ? 'check' : 'x')}${ok ? y : n}</span>`;
}

/* ============ اتجاه المؤشّر: خطٌّ من ثلاث نقاط ============ */
function spark(k, s, w = 76, h = 26) {
  if (!s) return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <line x1="3" y1="${h/2}" x2="${w-3}" y2="${h/2}" stroke="var(--n-300)" stroke-width="1.4" stroke-dasharray="2 3"/></svg>`;
  const g = trendGrade(k, s);
  const col = g === 2 ? 'var(--ink-500)' : g === 1 ? 'var(--ink-300)' : 'var(--r-400)';
  const lo = Math.min(...s, k.better === 'band' ? k.band[0] : k.target);
  const hi = Math.max(...s, k.better === 'band' ? k.band[1] : k.target);
  const pad = (hi - lo) * 0.22 || 1;
  const Y = v => h - 4 - ((v - lo + pad) / (hi - lo + pad * 2)) * (h - 8);
  const X = i => 5 + i * ((w - 10) / 2);
  const pts = s.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const ty = k.better === 'band' ? Y((k.band[0] + k.band[1]) / 2) : Y(k.target);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <line x1="2" y1="${ty.toFixed(1)}" x2="${w-2}" y2="${ty.toFixed(1)}" stroke="var(--au-300)" stroke-width="1.2" stroke-dasharray="3 2.5"/>
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    ${s.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${i === 2 ? 2.6 : 1.8}" fill="${col}"/>`).join('')}
  </svg>`;
}

/* ============ قرص الدرجة ============ */
function dial(score, size = 64, label = '') {
  const v = score === null || score === undefined ? null : clamp(score, 0, 100);
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  const off = v === null ? c : c * (1 - v / 100);
  return `<div class="dial" style="--sz:${size}px">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--n-200)" stroke-width="5"/>
      ${v === null ? '' : `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--ink-500)"
        stroke-width="5" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
        transform="rotate(-90 ${size/2} ${size/2}) scale(-1,1) translate(${-size},0)"/>`}
    </svg>
    <div class="dial__v num">${v === null ? '—' : fmt(v, 1)}</div>
    ${label ? `<div class="dial__l">${esc(label)}</div>` : ''}
  </div>`;
}

/* ============ شريطُ نسبة ============ */
function bar(v, tone = 'ink', title = '') {
  const p = clamp(v ?? 0, 0, 100);
  return `<span class="bar bar--${tone}"${title ? ` title="${esc(title)}"` : ''}><i style="inline-size:${p.toFixed(1)}%"></i></span>`;
}

/* ============ اسمٌ مختصر ودائرةُ حروف ============ */
function initials(name) {
  const w = String(name).replace(/^(د\.|أ\.|م\.)\s*/, '').split(/\s+/).filter(Boolean);
  return (w[0] || '؟').slice(0, 1) + (w[1] ? w[1].slice(0, 1) : '');
}
function chip(person, sub = '') {
  const p = typeof person === 'string' ? (PEOPLE.find(x => x.id === person) || { name: person }) : person;
  return `<span class="chip"><i class="chip__av">${esc(initials(p.name))}</i>
    <span><b>${esc(p.name)}</b>${sub ? `<em>${esc(sub)}</em>` : ''}</span></span>`;
}

/* ============ لبنات التخطيط ============ */
const card = (inner, cls = '', attrs = '') => `<section class="card ${cls}"${attrs ? ' ' + attrs : ''}>${inner}</section>`;
/* مواضعُ الجولة: كلُّ بطاقةٍ تُعرَف بعنوانها، فيجدها المُرشِد دون أن تُلوَّث القوالبُ بسمات.
   عنوانٌ تغيّر ولم يتغيّر هنا يُسقِط الإطارَ المُضيء فقط، ولا يكسر شيئاً — ويكشفه فحصُ الجولة. */
const TOUR_HEADS = {
  'القِمع في الفئات العشر': 'board-funnel',
  'الأوسمة الثلاثة': 'res-medals',
  'حكمُ بوّابة الأهليّة — فوريّ': 'gates',
  '1 — بوّابة الأهليّة': 'gates',
  'الملفّات المُسنَدة': 'desk-list',
  'نتائج المؤشّرات · المرحلة الأولى': 's1-break',
  'الإسناد': 'assign',
  'بطاقة التسجيل — درجتي': 'scorecard',
  'الأبعاد المتباعدة': 'dv',
  'الدرجة الموحَّدة': 'cons',
  'نافذة التظلّم': 'appeal-window',
  'التظلّمات': 'appeal-list',
  '5 — التظلّم': 'appeal',
  'من يرى ماذا — مصفوفة الصلاحيات': 'matrix',
  'الأوزان والعتبات': 'weights'
};
const head = (title, sub = '', right = '', tid = TOUR_HEADS[title]) =>
  `<div class="hd"${tid ? ` data-tour="${tid}"` : ''}><div><h2>${esc(title)}</h2>${sub ? `<p class="hd__s">${sub}</p>` : ''}</div>${right ? `<div class="hd__r">${right}</div>` : ''}</div>`;
const note = (txt, tone = 'n', icon = 'verdict') =>
  `<div class="note note--${tone}">${ic(icon)}<div>${txt}</div></div>`;
const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
/* رمزُ المربّع: يُمرَّر صراحةً (الوسيط الخامس) أو يُستنتَج من تسميته، فلا تُلمَس 23 نداءً.
   التسميةُ تُطبَّع (بلا تشكيل ولا همزات) كي لا يكسرها حرفٌ مُشكَّل. */
const STAT_ICON = [
  [/جهه مسجله/, 'building'], [/ملف مشاركه|ملف مسند/, 'files'], [/اجتاز الاهليه/, 'verified'],
  [/متاهل للمرحله/, 'funnel'], [/بلغ التحكيم/, 'gavel'], [/تباعد مفتوح/, 'split'],
  [/ملف محجوب/, 'lock'], [/تظلم مقدم/, 'scale'], [/قيد النظر|بانتظار درجتي/, 'clock'],
  [/اسابيع النافذه/, 'calendar'], [/فئات للتنافس|فئه واحده/, 'layers'], [/جهه توجت|جهه تتوج/, 'trophy'],
  [/مسارات للتميز/, 'target'], [/اوسمه مسماه/, 'medal'], [/جهه مختلفه/, 'users'], [/فئه معتمده/, 'verified']
];
const normAr = t => String(t).replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const statIcon = (l, tone) => {
  const n = normAr(l); const hit = STAT_ICON.find(([re]) => re.test(n));
  return hit ? hit[1] : ({ gold: 'trophy', red: 'warn', ink: 'chart' }[tone] || 'files');
};
const stat = (v, l, sub = '', tone = '', icon = '') =>
  `<div class="stat ${tone ? 'stat--' + tone : ''}"><b class="num">${v}</b><i class="stat__i">${ic(icon || statIcon(l, tone))}</i><span>${esc(l)}</span>${sub ? `<em>${esc(sub)}</em>` : ''}</div>`;

/* بلاطةُ المسار: لكلّ مسارٍ رمزُه، بدل دائرةٍ واحدةٍ عامّة تُشبه الستّةَ كلَّها */
const TRACK_IC = { LIFE: 'heartbeat', PRIM: 'clinic', EMER: 'siren', PREV: 'shieldcheck', MATE: 'mother', EFFI: 'gauge' };
const trackIc = (id, cls = '') => `<span class="tk ${cls}">${ic(TRACK_IC[id] || 'track')}</span>`;
const empty = txt => `<div class="empty">${ic('flat')}<p>${esc(txt)}</p></div>`;
const btn = (txt, attrs = '', tone = '') => `<button class="btn ${tone ? 'btn--' + tone : ''}" ${attrs}>${txt}</button>`;
const link = (txt, href, tone = '') => `<a class="btn ${tone ? 'btn--' + tone : ''}" href="${href}">${txt}</a>`;
const tag = (a, b) => `<span class="tag"><i>${esc(a)}</i>${esc(b)}</span>`;

/** جدولٌ يمرّر أفقياً على الشاشات الضيّقة دون أن يدفع الصفحة */
const table = (cols, rows, cls = '') =>
  `<div class="tw"><table class="tb ${cls}">
     <thead><tr>${cols.map(c => `<th${c[1] ? ` class="${c[1]}"` : ''}>${c[0]}</th>`).join('')}</tr></thead>
     <tbody>${rows.join('')}</tbody></table></div>`;

/* وحدة المؤشّر تُكتب بعد الرقم بمسافةٍ رفيعة */
const unit = (v, k, d = 1) => v === null || v === undefined ? '—' :
  `${fmt(v, k.unit === 'يوم' ? 2 : d)}<span class="u">${k.unit === '%' ? '%' : ' ' + k.unit}</span>`;

/* ============ وسمُ المسار والفئة ============
   الفئةُ تُذكَر فقط حين يكون للمسار أكثرُ من فئة — وإلّا كان الوسمُ حشواً. */
function catLabel(key, long = false) {
  const c = C(key); if (!c) return '—';
  const t = T(c.track), multi = t.cats.length > 1;
  return long ? (multi ? `${t.name} · ${c.name}` : t.name)
              : (multi ? `${t.short} · ${c.short}` : t.short);
}
const caseLabel = (cs, long) => catLabel(cs.key, long);
