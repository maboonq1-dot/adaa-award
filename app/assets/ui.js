/* جائزة أداء الصحة — أدوات العرض المشتركة */

const AR_D = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

/** الأرقام عربية-هنديّة، والفاصلة العشرية «٫» وفاصلة الآلاف «٬» */
function ar(x) {
  if (x === null || x === undefined || x === '') return '—';
  return String(x).replace(/[0-9]/g, d => AR_D[+d]).replace(/\./g, '٫').replace(/,/g, '٬');
}
function fmt(n, d = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const s = Number(n).toFixed(d);
  const [i, f] = s.split('.');
  return ar(f ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + f : i.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}
const pc = (n, d = 1) => fmt(n, d) + '٪';
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

/* ============ الأيقونات ============ */
const I = {
  home:    '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  track:   '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  stage:   '<path d="M4 18h4V9H4zM10 18h4V4h-4zM16 18h4v-6h-4z"/>',
  gov:     '<path d="M3 21h18M5 21V10M19 21V10M12 3 3 8h18zM9 21v-6h6v6"/>',
  reg:     '<path d="M15 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/><path d="M14 3v5h5M8 13h8M8 17h5"/>',
  board:   '<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>',
  desk:    '<path d="M4 5h16v6H4zM4 13h16v6H4z"/><path d="M8 8h.01M8 16h.01"/>',
  judge:   '<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4 6.7 19.2l1.1-5.9L3.5 9.2l5.9-.8z"/>',
  shield:  '<path d="M12 3 5 6v6c0 4.4 3 8.1 7 9 4-.9 7-4.6 7-9V6z"/>',
  method:  '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3z"/><path d="M8 3h8"/>',
  verdict: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  log:     '<path d="M8 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8zM8 3 4 7v14h4"/><path d="M11 8h6M11 12h6M11 16h4"/>',
  check:   '<path d="m4 12.5 5 5L20 6.5"/>',
  x:       '<path d="M6 6 18 18M18 6 6 18"/>',
  warn:    '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
  up:      '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down:    '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  flat:    '<path d="M5 12h14"/>',
  user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  building:'<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M4 21h17"/><path d="M8 8h3M8 12h3M8 16h3"/>',
  file:    '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M13 3v5h5"/>',
  clip:    '<path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 17.9a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>',
  eye:     '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12"/><circle cx="12" cy="12" r="2.6"/>',
  lock:    '<rect x="4" y="10" width="16" height="11" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  split:   '<path d="M4 6h5l6 12h5M20 6h-5"/><path d="m17 3 3 3-3 3M17 15l3 3-3 3"/>',
  merge:   '<path d="M4 6h5l6 6 5 0M4 18h5l3-3"/><path d="m17 9 3 3-3 3"/>',
  medal:   '<circle cx="12" cy="15" r="6"/><path d="m8 3 2.5 6M16 3l-2.5 6M12 12.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 14.7l2-.3z"/>',
  visit:   '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11"/><circle cx="12" cy="10" r="2.6"/>',
  flask:   '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3z"/>',
  grid:    '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  star:    '<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4 6.7 19.2l1.1-5.9L3.5 9.2l5.9-.8z"/>',
  gavel:   '<path d="m14 3 7 7-3 3-7-7zM3 21h10M10 10 3 17l3 3 7-7"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  arrow:   '<path d="M19 12H5M12 5l-7 7 7 7"/>',
  deck:    '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
  play:    '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
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
  '١ — بوّابة الأهليّة': 'gates',
  'الملفّات المُسنَدة': 'desk-list',
  'نتائج المؤشّرات · المرحلة الأولى': 's1-break',
  'الإسناد': 'assign',
  'بطاقة التسجيل — درجتي': 'scorecard',
  'الأبعاد المتباعدة': 'dv',
  'الدرجة الموحَّدة': 'cons',
  'نافذة التظلّم': 'appeal-window',
  'التظلّمات': 'appeal-list',
  '٥ — التظلّم': 'appeal',
  'من يرى ماذا — مصفوفة الصلاحيات': 'matrix',
  'الأوزان والعتبات': 'weights'
};
const head = (title, sub = '', right = '', tid = TOUR_HEADS[title]) =>
  `<div class="hd"${tid ? ` data-tour="${tid}"` : ''}><div><h2>${esc(title)}</h2>${sub ? `<p class="hd__s">${sub}</p>` : ''}</div>${right ? `<div class="hd__r">${right}</div>` : ''}</div>`;
const note = (txt, tone = 'n', icon = 'verdict') =>
  `<div class="note note--${tone}">${ic(icon)}<div>${txt}</div></div>`;
const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const stat = (v, l, sub = '', tone = '') =>
  `<div class="stat ${tone ? 'stat--' + tone : ''}"><b class="num">${v}</b><span>${esc(l)}</span>${sub ? `<em>${esc(sub)}</em>` : ''}</div>`;
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
  `${fmt(v, k.unit === 'يوم' ? 2 : d)}<span class="u">${k.unit === '٪' ? '٪' : ' ' + k.unit}</span>`;

/* ============ وسمُ المسار والفئة ============
   الفئةُ تُذكَر فقط حين يكون للمسار أكثرُ من فئة — وإلّا كان الوسمُ حشواً. */
function catLabel(key, long = false) {
  const c = C(key); if (!c) return '—';
  const t = T(c.track), multi = t.cats.length > 1;
  return long ? (multi ? `${t.name} · ${c.name}` : t.name)
              : (multi ? `${t.short} · ${c.short}` : t.short);
}
const caseLabel = (cs, long) => catLabel(cs.key, long);
