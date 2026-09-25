/* جائزة أداء الصحة — الموجِّه، وتبديل الدور، والربط */

let ME = 'U-CH1';
let BFILTER = '';
let _lastHash = null;

/* ============ الصلاحيات: مَن يفتح أيّ شاشة ============ */
const CAN = {
  desk:      ['eval', 'expert', 'chair', 'judge', 'appeals', 'sec', 'entity'],
  // اللجنةُ التنفيذية (الأمانة) تدير الجدول والتشغيل ولا ترى درجةً قبل الاعتماد —
  // نصُّ الدليل في وصفها، ومفروضٌ هنا لا موصوفٌ فقط.
  case:      ['eval', 'expert', 'chair', 'judge', 'appeals'],
  consensus: ['eval', 'expert', 'chair', 'appeals'],
  judging:   ['judge', 'chair', 'appeals', 'sec'],
  appeals:   ['appeals', 'sec', 'chair'],
  log:       ['chair', 'appeals', 'sec'],
  // المُقيِّم والخبير وممثّلُ الجهة لا يرون لوحة الترتيب: المصفوفةُ في «الحوكمة»
  // ليست ديباجة — تُفرَض هنا. والجهةُ ترى مرتبتَها هي في ملفّها لا ترتيب غيرها.
  board:     ['chair', 'judge', 'appeals', 'sec']
};

const ROUTES = [
  { re: /^#?\/?$/,                    v: () => viewHome(),         nav: 'home' },
  { re: /^#\/board$/,                 v: () => viewBoard(),        nav: 'board', k: 'board' },
  { re: /^#\/track\/([A-Z]+)$/,       v: m => viewTrack(m[1]),     nav: 'board' },
  { re: /^#\/cat\/([A-Z]+:[A-Z]+)$/,  v: m => viewCat(m[1]),       nav: 'board' },
  { re: /^#\/results$/,               v: () => viewResults(),      nav: 'results' },
  { re: /^#\/register$/,              v: () => viewRegister(),     nav: 'reg' },
  { re: /^#\/entity\/([\w-]+)$/,      v: m => viewEntity(m[1]),    nav: 'reg' },
  { re: /^#\/desk$/,                  v: () => viewDesk(),         nav: 'desk',    k: 'desk' },
  { re: /^#\/case\/([\w-]+)$/,        v: m => viewCase(m[1]),      nav: 'desk',    k: 'case' },
  { re: /^#\/consensus\/([\w-]+)$/,   v: m => viewConsensus(m[1]), nav: 'desk',    k: 'consensus' },
  { re: /^#\/judging$/,               v: () => viewJudging(),      nav: 'judging', k: 'judging' },
  { re: /^#\/appeals$/,               v: () => viewAppeals(),      nav: 'appeals', k: 'appeals' },
  { re: /^#\/method$/,                v: () => viewMethod(),       nav: 'method' },
  { re: /^#\/gov$/,                   v: () => viewGov(),          nav: 'gov' },
  { re: /^#\/verdict$/,               v: () => viewVerdict(),      nav: 'verdict' },
  { re: /^#\/log$/,                   v: () => viewLog(),          nav: 'log',     k: 'log' }
];

/* ============ الشريط الجانبيّ ============ */
function buildRail() {
  const role = myRole();
  const b = boards();
  const openDiv = CATS.reduce((a, c) => a + b[c.key].counts.diverging, 0);
  const mine = ['eval', 'expert'].includes(role) ? myCases().filter(x => !(DB.reviews[x.r.c.id] || {})[ME]).length : 0;

  const items = [
    ['الجائزة', [
      ['home',    'الرئيسة',        '#/',         'home',   null],
      ['board',   'لوحة الجائزة',   '#/board',    'board',  null],
      ['method',  'المنهجية',       '#/method',   'method', null],
      ['gov',     'الحوكمة واللجان','#/gov',      'gov',    null]
    ]],
    ['النتائج', [
      ['results', 'نتائج الدورة الثامنة', '#/results', 'medal', null]
    ]],
    ['المشاركة', [
      ['reg',     'تسجيل جهة',      '#/register', 'reg',    null]
    ]],
    ['العمل', [
      ['desk',    'مكتبي',          '#/desk',     'desk',   mine || null],
      ['judging', 'قاعة التحكيم',   '#/judging',  'judge',  null],
      ['appeals', 'الحجب والتظلّم', '#/appeals',  'shield', null],
      ['log',     'السجلّ',          '#/log',      'log',    null]
    ]],
    ['', [
      ['verdict', 'الحكم',          '#/verdict',  'verdict', null]
    ]]
  ];

  const html = items.map(([g, list]) => {
    const vis = list.filter(([id]) => !CAN[id] || CAN[id].includes(role));
    if (!vis.length) return '';
    return `${g ? `<div class="nav__g">${esc(g)}</div>` : '<div style="block-size:8px"></div>'}
      ${vis.map(([id, t, h, i, n]) => `<a href="${h}" data-nav="${id}">${ic(i)}<span>${esc(t)}</span>
        ${id === 'desk' && n ? `<span class="nav__n nav__n--red">${ar(n)}</span>`
          : id === 'appeals' && openDiv ? `<span class="nav__n">${ar(openDiv)}</span>` : ''}</a>`).join('')}`;
  }).join('');

  document.getElementById('rail').innerHTML = `
    <a class="brand" href="#/">
      <span class="brand__mk">أداء</span>
      <span><span class="brand__t">جائزة أداء الصحة</span><span class="brand__s">${esc(CYCLE.name)} · ${ar(CYCLE.year)}</span></span>
    </a>
    <nav class="nav">${html}</nav>
    <div class="rail__foot">
      <b>جائزة أداء الصحة</b> — وزارة الصحة، المملكة العربية السعودية<br>
      <a href="mailto:${CYCLE.email}" dir="ltr">${CYCLE.email}</a>
      <div class="rail__ind">
        هذه المنصّةُ <b>نموذجٌ مستقلّ</b> لا تُمثّل الوزارة ولا تصدر عنها.<br>
        فكرةٌ وتنفيذ <span dir="ltr">MOAYAD ABOONQ</span>
      </div>
    </div>`;
}

/* ============ الرأس ============ */
function topbar() {
  const p = me(), R = ROLES[p.role];
  const comm = COMMITTEES.find(c => c.id === R.comm);
  return `<div class="top">
    <div class="top__who">${ic('user')} أنت الآن</div>
    <select class="top__sel" data-me>
      ${PEOPLE.map(x => `<option value="${x.id}" ${x.id === ME ? 'selected' : ''}>${esc(x.name)} — ${esc(ROLES[x.role].name)}</option>`).join('')}
    </select>
    <div class="top__ctx">${esc(R.desk)}${comm ? ' · ' + esc(comm.name) : ''}</div>
    <div class="top__sp">${pill(CYCLE.name + ' · ' + ar(CYCLE.year), 'g')}</div>
  </div>`;
}

/* ============ العرض ============ */
function render() {
  const h = location.hash || '#/';
  let out = null, nav = 'home', key = null;
  for (const r of ROUTES) {
    const m = h.match(r.re);
    if (m) { out = r.v(m); nav = r.nav; key = r.k; break; }
  }
  if (key && CAN[key] && !CAN[key].includes(myRole())) {
    out = `${pageHead('خارج صلاحيّتك', 'هذه الشاشة ليست ضمن ما يفتحه دورُك الحاليّ — وهذا سلوكٌ مقصود: الفصلُ بين اللجان يُفرَض تقنياً لا تنظيمياً فقط.')}
      ${card(note('دورُك الحاليّ: <b>' + esc(ROLES[myRole()].name) + '</b>. بدِّل الدور من أعلى الصفحة لترى المنصّة بعينٍ أخرى — كلُّ دورٍ يرى ما يخصّه وحده.', 'i', 'lock')
        + `<div class="hr"></div>${link('مصفوفة الصلاحيات', '#/gov')} ${link('الرئيسة', '#/')}`)}`;
  }
  if (out === null) { out = viewHome(); nav = 'home'; }

  document.getElementById('envbar').innerHTML =
    `<b>نموذجٌ مستقلّ غير تابعٍ لوزارة الصحة</b> · نسخةُ عرض — البنيةُ والمنهجيةُ من دليل ${esc(CYCLE.name)}، و<b>قيمُ المؤشّرات والدرجات محاكاة</b>. لا يُبنى قرارٌ على أرقام هذه النسخة.`;
  document.getElementById('top').innerHTML = topbar();

  const page = document.getElementById('page');
  page.innerHTML = out;
  if (h !== _lastHash) { window.scrollTo({ top: 0 }); _lastHash = h; }
  page.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
    { duration: 200, easing: 'cubic-bezier(.2,.8,.3,1)' });

  buildRail();
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  bind();
  const h1 = (page.querySelector('h1')?.textContent || '').trim();
  document.title = !h1 ? 'جائزة أداء الصحة · ' + CYCLE.name
    : h1.startsWith('جائزة أداء الصحة') ? h1 : 'جائزة أداء الصحة · ' + h1;
}

/* ============ إنشاء ملفٍّ جديد عند التسجيل ============ */
function createCase(entId, catKey) {
  const exist = CASES.find(c => c.entity === entId && c.key === catKey);
  if (exist) return exist.id;
  const ent = E(entId), cat = C(catKey), ks = kpisOf(catKey);
  const vals = {}; ks.forEach(k => { vals[k.id] = series(entId, catKey, k); });
  const r2 = mulberry32(seedOf(entId + catKey + 'feed'));
  const missing = [];
  if (ent.feed === 'partial') {
    cat.kpis.forEach(k => { if (r2() < 0.28) missing.push(k.id); });
    if (r2() < 0.45) missing.push('ESAT');
  }
  const id = `${entId}-${catKey.replace(':', '-')}`;
  CASES.push({ id, entity: entId, track: cat.track, cat: cat.id, key: catKey, vals, missing, registeredAt: '2026-02-24' });
  refresh();
  return id;
}

/* ============ الربط ============ */
function on(sel, ev, fn) { document.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn)); }

function bind() {
  /* تبديل الدور */
  on('[data-me]', 'change', e => {
    ME = e.target.value;
    const role = myRole();
    logIt(me().name, 'تبديلُ الدور', null, ROLES[role].name);
    if (role === 'entity') location.hash = '#/desk';
    render();
  });

  /* ---- نموذج التسجيل ---- */
  on('[data-reg]', 'change', e => {
    const k = e.target.dataset.reg;
    REG[k] = e.target.value;
    if (k === 'sector') { REG.entity = ''; REG.cat = ''; }
    if (k === 'entity') { REG.cat = ''; }
    REG.err = {};
    render();
  });
  on('[data-rep]', 'input', e => { REG.rep[e.target.dataset.rep] = e.target.value; });
  on('[data-ack]', 'change', e => { REG.ack[e.target.dataset.ack] = e.target.checked; });
  on('[data-reg-back]', 'click', e => { REG.step = +e.target.dataset.regBack; REG.err = {}; render(); });
  on('[data-reg-reset]', 'click', () => {
    Object.assign(REG, { step: 1, sector: '', entity: '', cat: '', rep: {}, ack: {}, done: null, err: {} });
    render();
  });
  on('[data-reg-next]', 'click', e => {
    const s = +e.target.dataset.regNext;
    REG.err = {};
    if (s === 1) {
      if (!REG.sector) REG.err.sector = 'اختر القطاع.';
      else if (!REG.entity) REG.err.entity = 'اختر الجهة كما هي في السجلّ الرسميّ.';
    }
    if (s === 2) {
      ['name', 'title', 'email', 'phone'].forEach(k => { if (!(REG.rep[k] || '').trim()) REG.err[k] = 'حقلٌ مطلوب.'; });
      if (REG.rep.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(REG.rep.email)) REG.err.email = 'بريدٌ غيرُ صالح.';
    }
    if (s === 3 && !REG.cat) REG.err.cat = 'اختر فئةً واحدة.';
    if (!Object.keys(REG.err).length) REG.step = s + 1;
    render();
  });
  on('[data-reg-submit]', 'click', () => {
    REG.err = {};
    if (!['data', 'evid', 'visit', 'rules'].every(k => REG.ack[k])) {
      REG.err.ack = 'الإقرارُ بالبنود الأربعة شرطُ تسجيل.';
      return render();
    }
    const cid = createCase(REG.entity, REG.cat);
    REG.done = cid;
    logIt(REG.rep.name || 'ممثّل الجهة', 'تسجيلُ مشاركة', cid, `${E(REG.entity).name} — ${catLabel(REG.cat)}`);
    render();
    window.scrollTo({ top: 0 });
  });

  /* ---- بطاقة التسجيل ---- */
  on('[data-sc]', 'click', e => {
    const [cid, key, k, v] = e.currentTarget.dataset.sc.split('|');
    DB.reviews[cid] = DB.reviews[cid] || {};
    const rv = DB.reviews[cid][ME] || { by: ME, adli: {}, letci: {}, visit: {}, note: '' };
    rv[key][k] = +v;
    DB.reviews[cid][ME] = rv;
    refresh(); render();
  });
  on('[data-note]', 'input', e => {
    const cid = e.target.dataset.note;
    DB.reviews[cid] = DB.reviews[cid] || {};
    DB.reviews[cid][ME] = DB.reviews[cid][ME] || { by: ME, adli: {}, letci: {}, visit: {}, note: '' };
    DB.reviews[cid][ME].note = e.target.value;
  });
  on('[data-sc-send]', 'click', e => {
    const cid = e.target.dataset.scSend;
    const rv = (DB.reviews[cid] || {})[ME];
    if (!rv) return;
    rv.at = new Date().toISOString().slice(0, 10);
    logIt(me().name, 'إرسالُ درجة', cid, `المُحصّلة ${fmt(reviewScore(rv), 1)} — ${ROLES[myRole()].name}`);
    refresh(); render();
  });

  /* ---- استمارة المشاركة ---- */
  on('[data-sec]', 'input', e => {
    const cid = e.target.dataset.case, s = e.target.dataset.sec;
    DB.submissions[cid] = DB.submissions[cid] || { sec: {}, files: [], at: null };
    DB.submissions[cid].sec[s] = e.target.value;
  });
  on('[data-up]', 'click', e => {
    const cid = e.target.dataset.up;
    DB.submissions[cid] = DB.submissions[cid] || { sec: {}, files: [], at: null };
    const n = DB.submissions[cid].files.length + 1;
    const kinds = ['محضر اجتماع', 'لقطة نظام', 'تقرير مُعتمَد', 'سجلّ أصليّ', 'شهادة تحقّق'];
    DB.submissions[cid].files.push({ n: `دليل-${n}.pdf`, t: kinds[(n - 1) % kinds.length] });
    logIt(me().name, 'رفعُ دليل', cid, `دليل-${n}.pdf`);
    render();
  });
  on('[data-unfile]', 'click', e => {
    const [cid, i] = e.target.dataset.unfile.split(':');
    DB.submissions[cid].files.splice(+i, 1);
    render();
  });
  on('[data-sub-send]', 'click', e => {
    const cid = e.target.dataset.subSend;
    const d = DB.submissions[cid] || { sec: {}, files: [], at: null };
    const filled = FORM.filter(f => (d.sec[f.id] || '').trim().length > 40).length;
    if (filled < FORM.length || !d.files.length) {
      alert(`لا تُرسَل الاستمارةُ قبل اكتمالها:\n• الأقسام المكتملة ${filled} من ${FORM.length} (٤٠ حرفاً فأكثر لكلّ قسم)\n• الأدلّة المرفوعة ${d.files.length} — ودليلٌ واحدٌ على الأقلّ شرط.\n\nنصُّ الدليل: «أدلّةٌ داعمة لكلّ نتيجةٍ مُبلَّغٍ عنها».`);
      return;
    }
    d.at = new Date().toISOString().slice(0, 10);
    DB.submissions[cid] = d;
    logIt(me().name, 'إرسالُ استمارة المشاركة', cid, `${d.files.length} دليلاً مرفوعاً`);
    render();
  });

  /* ---- التوحيد ---- */
  on('[data-cons]', 'click', e => {
    const cid = e.target.dataset.cons;
    const r = document.getElementById('cs-r');
    if (!r || r.value.trim().length < 25) {
      alert('المبرَّرُ شرطُ اعتماد. اكتب ما حسم الخلاف — لا صيغةً عامّة.\n(خمسةٌ وعشرون حرفاً فأكثر)');
      return;
    }
    const a = assignedTo(cid), rv = DB.reviews[cid];
    const evs = a.evals.map(u => rv[u]).filter(Boolean);
    const mid = (o1, o2) => { const o = {}; Object.keys(o1).forEach(k => o[k] = Math.round((o1[k] + o2[k]) / 2)); return o; };
    DB.consensus[cid] = {
      by: ME, at: new Date().toISOString().slice(0, 10), rationale: r.value.trim(),
      adli: mid(evs[0].adli, evs[1].adli), letci: mid(evs[0].letci, evs[1].letci), visit: mid(evs[0].visit, evs[1].visit)
    };
    logIt(me().name, 'اعتمادُ درجةٍ موحَّدة', cid, `المُحصّلة ${fmt(reviewScore(DB.consensus[cid]), 1)}`);
    refresh(); render();
  });

  /* ---- بطاقات التحكيم ---- */
  on('[data-bal]', 'click', e => {
    const [key, i, d] = e.currentTarget.dataset.bal.split('|');
    const b = boards()[key];
    DB.ballots[key] = DB.ballots[key] || {};
    const cur = DB.ballots[key][ME] || b.finalists.map(r => r.c.id);
    const a = +i, t = a + +d;
    if (t < 0 || t >= cur.length) return;
    [cur[a], cur[t]] = [cur[t], cur[a]];
    DB.ballots[key][ME] = cur;
    render();
  });
  on('[data-bal-send]', 'click', e => {
    const key = e.target.dataset.balSend;
    const b = boards()[key];
    DB.ballots[key] = DB.ballots[key] || {};
    DB.ballots[key][ME] = DB.ballots[key][ME] || b.finalists.map(r => r.c.id);
    logIt(me().name, 'إيداعُ بطاقة تحكيم', null, catLabel(key) + ' — الأول: ' + E(CASE(DB.ballots[key][ME][0]).entity).name);
    refresh(); render();
  });
  on('[data-confirm]', 'click', e => {
    const key = e.target.dataset.confirm;
    const b0 = boards()[key];
    // شرطُ الرفع المُعلَن في لوحة رئيس اللجنة العلمية — مفروضٌ هنا لا موصوفٌ فقط
    if (b0.counts.diverging) {
      alert(`لا تُعتمَد هذه الفئة: فيها ${b0.counts.diverging} ملفّاً بتباعُدٍ مفتوحٍ بين المقيّمَيْن.\n\n`
        + 'لجنةُ التحكيم تعتمد ترتيباً، وترتيبٌ مبنيٌّ على درجةٍ لم تُوحَّد هو ترتيبٌ بلا سند.\n'
        + 'أغلِق حوارات التوحيد أوّلاً — من مكتب اللجنة العلمية.');
      return;
    }
    const t = document.getElementById('cf-' + key);
    if (!t || t.value.trim().length < 20) { alert('مبرَّرُ الاعتماد شرطٌ — عشرون حرفاً فأكثر.'); return; }
    const b = boards()[key], bal = DB.ballots[key] || {};
    const ids = b.finalists.map(r => r.c.id);
    const pts = {}; ids.forEach(i => pts[i] = 0);
    Object.values(bal).forEach(l => l.forEach((id, i) => { if (pts[id] !== undefined) pts[id] += ids.length - i; }));
    DB.confirmed[key] = {
      order: ids.slice().sort((a, c) => pts[c] - pts[a]),
      by: ME, at: new Date().toISOString().slice(0, 10), rationale: t.value.trim()
    };
    logIt(me().name, 'اعتمادُ فائزي فئة', null, `${catLabel(key)} — ${E(CASE(DB.confirmed[key].order[0]).entity).name}`);
    refresh(); render();
  });

  /* ---- التظلّم ---- */
  on('[data-appeal]', 'click', e => {
    const cid = e.target.dataset.appeal;
    const t = document.getElementById('ap-' + cid);
    if (!t || t.value.trim().length < 25) { alert('نصُّ التظلّم شرطٌ — حدِّد الإجراء المُعترَض عليه في خمسةٍ وعشرين حرفاً فأكثر.'); return; }
    DB.appeals.unshift({
      case: cid, text: t.value.trim(), by: me().name,
      at: new Date().toISOString().slice(0, 10), status: 'قيد النظر', decision: null
    });
    logIt(me().name, 'تقديمُ تظلّم', cid, '');
    render();
  });
  on('[data-apdec]', 'click', e => {
    const [i, st] = e.target.dataset.apdec.split('|');
    const d = document.getElementById('dc-' + i);
    if (!d || d.value.trim().length < 20) { alert('القرارُ يحتاج تسبيباً — عشرون حرفاً فأكثر.'); return; }
    DB.appeals[+i].status = st;
    DB.appeals[+i].decision = d.value.trim();
    logIt(me().name, 'البتُّ في تظلّم', DB.appeals[+i].case, st);
    render();
  });

  /* ---- مرشِّح اللوحة ---- */
  on('[data-bfilter]', 'change', e => { BFILTER = e.target.value; render(); });
}

/* ============ الإقلاع ============ */
/* اتّجاهُ الوثيقة يُفرَض من هنا لا من وسم html وحده: النسخةُ المنشورة تُغلَّف
   بهيكلٍ لا يحمل dir="rtl"، وكلُّ الخصائص المنطقية (inline-start…) تتبعه. */
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');
window.addEventListener('hashchange', render);
render();
