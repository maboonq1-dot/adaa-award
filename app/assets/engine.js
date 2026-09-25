/* ============================================================
   جائزة أداء الصحة — محرّك القواعد
   ------------------------------------------------------------
   كل حكمٍ في هذا الملفّ مشتقٌّ من نصٍّ في الدليل، ومكتوبٌ بجانبه
   مصدرُه. وما لم يحسمه الدليل يُعلَن **افتراضاً** ويُعرَض للتغيير
   في شاشة المنهجية — لا يُدسّ في الشيفرة بلا إعلان.
   ============================================================ */

/* ---- افتراضاتٌ قابلة للضبط، معلَنةٌ في شاشة المنهجية ---- */
const CFG = {
  metRatio:   0.60,  // أدنى نسبةٍ من مؤشّرات الحزمة يجب أن تبلغ المستهدَف
  trendRatio: 0.60,  // أدنى نسبةٍ من المؤشّرات ذات الاتجاه الموجب
  cycles:     3,     // «اتجاهٌ إيجابيّ لثلاث دوراتٍ متتالية» — نصُّ الدليل
  divergence: 12,    // عتبة تباعُد المُحصّلة التي تُلزِم حوار التوحيد
  dimGap:     28,    // تباعُدُ بُعدٍ مفرد: أوسعُ من خطوة مرسًى واحدة — أي أن المقيّمَيْن
                     // لم يختارا مرسيين متجاورين، وهذا خلافٌ في القراءة لا في التقدير
  w1: 0.50, w2: 0.50, // وزنا المرحلتين في الدرجة المركّبة — افتراضٌ لا نصّ
  letci: { Le: 0.40, T: 0.25, C: 0.20, I: 0.15 },
  s2:    { adli: 0.60, letci: 0.25, visit: 0.15 }
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ============ ١ · قراءة مؤشّر ============ */

/** هل بلغت القيمةُ المستهدَف الوطنيّ؟ */
function meets(k, v) {
  if (v === null || v === undefined) return false;
  if (k.better === 'band') return v >= k.band[0] && v <= k.band[1];
  return k.better === 'down' ? v <= k.target : v >= k.target;
}

/** مقدار التحسُّن من a إلى b بالاتجاه الصحيح للمؤشّر */
function gain(k, a, b) {
  if (k.better === 'band') {
    const mid = (k.band[0] + k.band[1]) / 2;
    return Math.abs(mid - a) - Math.abs(mid - b);
  }
  return k.better === 'down' ? a - b : b - a;
}

/** درجةُ المستوى ٠–١ : أين القيمةُ من المستهدَف */
function levelScore(k, v) {
  if (v === null || v === undefined) return null;
  if (k.better === 'band') {
    const [lo, hi] = k.band, mid = (lo + hi) / 2, half = (hi - lo) / 2;
    return clamp(1 - Math.abs(v - mid) / (half * 2), 0, 1);
  }
  const ratio = k.better === 'down'
    ? (v <= 0 ? 1.25 : k.target / v)
    : v / k.target;
  return clamp((ratio - 0.55) / 0.70, 0, 1);   // ‏٥٥٪ من المستهدَف = صفر، ١٢٥٪ = واحد
}

/** حكمُ الاتجاه عبر ثلاث دورات: ‎2 موجبٌ لثلاث، 1 موجبٌ لدورتين، 0 غيرُ ذلك */
function trendGrade(k, s) {
  if (!s || s.length < 3) return 0;
  const g1 = gain(k, s[0], s[1]), g2 = gain(k, s[1], s[2]), gt = gain(k, s[0], s[2]);
  const eps = Math.abs(k.target) * 0.004;
  if (g1 > -eps && g2 > -eps && gt > eps) return 2;
  if (gt > eps) return 1;
  return 0;
}

/* ============ ٢ · بوابة الأهليّة ============
   نصُّ الدليل — «ما الذي يؤهّل الجهة للمشاركة؟»:
     • بياناتٌ مستمدّة من المصادر الرسمية لوزارة الصحة وشركائها.
     • أداءٌ يحقّق المستهدفات الوطنية أو يتجاوزها.
     • اتجاهٌ إيجابيّ لثلاث دوراتٍ متتالية في مؤشّرات المسار.
   ثلاثتُها **قاطعة**: سقوطُ واحدةٍ يُسقِط الأهليّة. */
function eligibility(c) {
  const ks = kpisOf(c.key);
  const rows = ks.map(k => {
    const s = c.missing.includes(k.id) ? null : c.vals[k.id];
    const last = s ? s[2] : null;
    return {
      k, s, last,
      official: !c.missing.includes(k.id),
      met: s ? meets(k, last) : false,
      trend: s ? trendGrade(k, s) : 0,
      level: levelScore(k, last)
    };
  });

  const withData = rows.filter(r => r.official);
  const metN   = withData.filter(r => r.met).length;
  const trendN = withData.filter(r => r.trend === 2).length;

  const gates = [
    { id: 'source', name: 'المصدر الرسميّ',
      req: 'كلُّ مؤشّرات الحزمة مستمدّة من مصادر وزارة الصحة وشركائها',
      pass: c.missing.length === 0,
      val: `${ks.length - c.missing.length}/${ks.length} مؤشّراً متوفّراً رسمياً`,
      miss: c.missing },
    { id: 'targets', name: 'بلوغ المستهدفات الوطنية',
      req: `تحقيقُ ${Math.round(CFG.metRatio * 100)}٪ من مؤشّرات الحزمة للمستهدَف أو تجاوزُه`,
      pass: withData.length > 0 && metN / ks.length >= CFG.metRatio,
      val: `${metN}/${ks.length} مؤشّراً بالغٌ المستهدَف`,
      ratio: metN / ks.length },
    { id: 'trend', name: 'اتجاهٌ موجبٌ لثلاث دورات',
      req: `اتجاهٌ إيجابيّ متّصلٌ عبر ${CFG.cycles} دوراتٍ في ${Math.round(CFG.trendRatio * 100)}٪ من المؤشّرات`,
      pass: withData.length > 0 && trendN / ks.length >= CFG.trendRatio,
      val: `${trendN}/${ks.length} مؤشّراً باتجاهٍ موجبٍ متّصل`,
      ratio: trendN / ks.length }
  ];

  return { rows, gates, pass: gates.every(g => g.pass) };
}

/* ============ ٣ · المرحلة الأولى — LeTCI على المؤشّرات ============
   نصُّ الدليل: «مراجعةٌ قائمة على البيانات لمؤشّرات الأداء الرئيسة،
   والاتجاهات، والمقارنات المرجعية» — وهي أبعادُ LeTCI الأربعة. */
function stage1Raw(c) {
  const el = eligibility(c);
  const ks = kpisOf(c.key);
  const withData = el.rows.filter(r => r.official && r.level !== null);

  const Le = withData.length ? withData.reduce((a, r) => a + r.level, 0) / withData.length : 0;
  const Tr = withData.length ? withData.reduce((a, r) => a + r.trend / 2, 0) / withData.length : 0;

  // التكامل: تغطيةُ الحزمة × اتّساق التجربة المشتركة
  const cover = (ks.length - c.missing.length) / ks.length;
  const shared = SHARED.map(k => c.missing.includes(k.id) ? null : levelScore(k, c.vals[k.id][2])).filter(x => x !== null);
  const shAvg = shared.length ? shared.reduce((a, b) => a + b, 0) / shared.length : 0;
  const I = cover * 0.5 + shAvg * 0.5;

  return { el, Le, T: Tr, I, cover, shAvg };
}

/** المقارنات (C) تحتاج المسارَ كلَّه — لذلك تُحسَب على دفعتين،
    وتُعاد كلّما دخل ملفٌّ جديد بالتسجيل. */
let _S1 = null;
function computeS1() {
  const raw = {};
  CASES.forEach(c => { raw[c.id] = stage1Raw(c); });

  // المقارنةُ بين النظراء داخل **الفئة**: مستشفى إصاباتٍ لا يُقارَن بمستشفى قلب،
  // وتجمّعٌ لا يُقارَن بمستشفى. هذا ما تفرضه فئاتُ النتيجة المعلنة.
  CATS.forEach(cat => {
    const pool = CASES.filter(c => c.key === cat.key && eligibility(c).pass);
    const sorted = pool.map(c => ({ id: c.id, Le: raw[c.id].Le })).sort((a, b) => a.Le - b.Le);
    const n = sorted.length;
    sorted.forEach((x, i) => { raw[x.id].C = n <= 1 ? 0.5 : i / (n - 1); });
    CASES.filter(c => c.key === cat.key && !eligibility(c).pass)
         .forEach(c => { raw[c.id].C = 0; });
  });

  Object.keys(raw).forEach(id => {
    const r = raw[id], w = CFG.letci;
    r.parts = { Le: r.Le * 100, T: r.T * 100, C: (r.C ?? 0) * 100, I: r.I * 100 };
    r.score = +(r.parts.Le * w.Le + r.parts.T * w.T + r.parts.C * w.C + r.parts.I * w.I).toFixed(1);
  });
  return raw;
}

function stage1(id) {
  if (!_S1) _S1 = computeS1();
  return _S1[id];
}

/* ============ ٤ · المرحلة الثانية — ADLI + LeTCI + الزيارة ============
   نصُّ الدليل: «يُقيَّم كل مسار بصورةٍ مستقلّة من قِبَل مقيّمَيْن اثنين،
   إلى جانب خبيرٍ عن اللجنة العلمية، ثم تُوحَّد النتائج بالتوافق،
   وتُعتمد نهائياً من لجنة التحكيم». */

const VISIT = [
  { k: 'V1', name: 'مطابقة الأدلّة للمُبلَّغ',  q: 'هل ما شوهد ميدانياً يطابق ما ورد في الاستمارة؟' },
  { k: 'V2', name: 'تتبُّع الرقم إلى مصدره',    q: 'هل أمكن تتبُّع نتيجةٍ مُعلَنة إلى سجلّها الأصليّ؟' },
  { k: 'V3', name: 'شهادة الميدان',            q: 'هل يعرف العاملون المنهج ويطبّقونه بلا توجيهٍ مسبق؟' },
  { k: 'V4', name: 'استدامة الأثر',            q: 'هل الأثرُ قائمٌ بنظامٍ لا بأشخاص؟' }
];

/** تقييمٌ مولَّدٌ ببذرةٍ ثابتة لكل مُقيِّمٍ على ملفّ — نموذجٌ تشغيليّ */
function genReview(caseId, userId, base) {
  const r = mulberry32(seedOf(caseId + userId));
  // شدّةُ المُقيِّم: ميلٌ ثابتٌ في شخصه يسري على كل أبعاده — وهو أصلُ التباعُد،
  // فوقه تذبذبٌ لكل بُعدٍ على حدة. لذلك يُقاس التباعُد على المُحصّلة لا على بُعد.
  const severity = (r() - 0.5) * 19;
  const jitter = () => (r() - 0.5) * 15;
  const mk = dims => {
    const o = {};
    dims.forEach(d => { o[d.k] = clamp(Math.round(base + severity + jitter()), 5, 100); });
    return o;
  };
  return {
    by: userId,
    adli: mk(ADLI),
    letci: mk(LETCI),
    visit: mk(VISIT),
    note: '',
    at: '2026-05-' + String(4 + Math.floor(r() * 20)).padStart(2, '0')
  };
}

function reviewScore(rv) {
  const avg = o => Object.values(o).reduce((a, b) => a + b, 0) / Object.values(o).length;
  return +(avg(rv.adli) * CFG.s2.adli + avg(rv.letci) * CFG.s2.letci + avg(rv.visit) * CFG.s2.visit).toFixed(1);
}

/* ============ ٥ · الحالة والتصفية ============
   القِمع: كل الجهات ← المؤهّلون ← أفضل ١٠ ← أفضل ٥ ← أفضل ٣ */

const STATE = {
  ineligible: { name: 'غير مؤهّل',          tone: 'off',  desc: 'لم تستوفِ شروط الأهليّة الثلاثة' },
  out1:       { name: 'خرج بعد المرحلة ١',  tone: 'off',  desc: 'مؤهَّلٌ ولم يبلغ العشرة الأوائل في مساره' },
  qualified:  { name: 'متأهّل للمرحلة ٢',   tone: 'ink',  desc: 'ضمن أفضل ١٠ في المسار — استمارةٌ وزيارةٌ ميدانية' },
  out2:       { name: 'خرج بعد المرحلة ٢',  tone: 'off',  desc: 'لم يبلغ الخمسة الأوائل بعد تقييم الأنظمة' },
  finalist:   { name: 'متأهّل للتحكيم',     tone: 'ink',  desc: 'ضمن أفضل ٥ — أمام لجنة التحكيم' },
  honored:    { name: 'مُكرَّم',             tone: 'gold', desc: 'ضمن الثلاثة الأوائل — تكريمٌ ولوحةُ شرف' },
  winner:     { name: 'فائزٌ بالمسار',       tone: 'gold', desc: 'الأعلى أداءً في مساره باعتماد لجنة التحكيم' },
  blocked:    { name: 'محجوب',              tone: 'red',  desc: 'قرارُ حجبٍ من لجنة الحجب والتظلّم' }
};

/* حالةُ حجبٍ واحدة مفروضةٌ في النموذج لتشغيل مسار الحجب والتظلّم.
   اختيرت على ملفٍّ كان ضمن الخمسة الأوائل — فالحجبُ لا يُختبَر على ملفٍّ هامشيّ. */
const OVERRIDE = { 'C17-PRIM-GEN': 'blocked' };

/* حوارات التوحيد المفتوحة والمغلقة، والتظلّمات — حالةٌ حيّة تتغيّر بالاستخدام */
const DB = {
  reviews: {},      // caseId → { userId: review }
  consensus: {},    // caseId → { adli, letci, visit, rationale, by, at }
  ballots: {},      // trackId → { judgeId: [caseId مرتّبة] }
  confirmed: {},    // trackId → { order:[caseId], by, at, rationale }
  appeals: [],      // تظلّمات
  log: [],          // سجلٌّ لا يُمحى
  submissions: {},  // caseId → استمارة المشاركة
  registry: []      // تسجيلاتٌ جديدة من النموذج
};

function logIt(who, act, on, detail) {
  DB.log.unshift({ at: new Date().toISOString().slice(0, 16).replace('T', ' '), who, act, on, detail });
}

/* ---- بناء الترتيب الكامل للفئة ----
   ‏**افتراضٌ فرضَته النتيجة المعلنة:** الدليل يقول «أفضل ١٠ لكل مسار»،
   والنتيجةُ المعلنة توّجت في مسار إنقاذ الأرواح خمسَ جهاتٍ موزَّعةً على
   ثلاث فئات — أي أن التتويج يقع في **الفئة**. ولمّا كان آخرُ الغربال
   في الفئة، وجب أن يكون أوّلُه فيها أيضاً، وإلّا خلَت فئةٌ من مرشَّحين.
   فالعتباتُ ١٠ ← ٥ ← ٣ تُطبَّق هنا **لكلّ فئة**، وهذا مُعلَنٌ في المنهجية. */
function catBoard(catKey) {
  const all = CASES.filter(c => c.key === catKey);
  const rows = all.map(c => {
    const s1 = stage1(c.id);
    return { c, s1, eligible: s1.el.pass, s1s: s1.score };
  });

  const elig = rows.filter(r => r.eligible).sort((a, b) => b.s1s - a.s1s);
  elig.forEach((r, i) => { r.rank1 = i + 1; });
  const cut1 = STAGES[0].cut;
  const q = elig.slice(0, cut1);

  // المرحلة ٢: الدرجة الموحَّدة إن وُجدت، وإلا متوسّط المقيّمين
  q.forEach(r => {
    const rev = reviewsOf(r.c.id);
    const cons = DB.consensus[r.c.id];
    const evs = Object.values(rev).filter(x => x.by.startsWith('U-EV'));
    r.reviews = rev;
    r.divergence = evs.length === 2 ? Math.abs(reviewScore(evs[0]) - reviewScore(evs[1])) : null;
    r.needsConsensus = r.divergence !== null && r.divergence > CFG.divergence && !cons;
    // درجةُ المرحلة الثانية لا تُحتسَب بدرجةِ مُقيِّمٍ واحد: نصُّ الدليل «مقيّمان اثنان».
    // ترتيبٌ يُبنى على نصف التقييم المطلوب ترتيبٌ بلا سند.
    r.s2s = cons ? reviewScore(cons)
          : evs.length === 2 ? +(evs.reduce((a, x) => a + reviewScore(x), 0) / 2).toFixed(1)
          : null;
    r.s2source = cons ? 'موحَّدة بالتوافق'
          : evs.length === 2 ? 'متوسّط مقيّمَيْن — لم تُوحَّد'
          : evs.length === 1 ? 'درجةٌ واحدة — تنتظر المُقيِّم الثاني'
          : 'قيد التقييم';
    r.comp = r.s2s === null ? null : +(r.s1s * CFG.w1 + r.s2s * CFG.w2).toFixed(1);
  });

  const scored = q.filter(r => r.comp !== null).sort((a, b) => b.comp - a.comp);
  scored.forEach((r, i) => { r.rank2 = i + 1; });
  const cut2 = STAGES[1].cut;
  const fin = scored.slice(0, cut2);

  // المرحلة ٣: بطاقات المحكّمين (بوردا) ثم اعتمادُ رئيس اللجنة
  const conf = DB.confirmed[catKey];
  let order = null;
  if (conf) order = conf.order;
  else {
    const bal = DB.ballots[catKey] || {};
    const ids = fin.map(r => r.c.id);
    if (Object.keys(bal).length && ids.length) {
      const pts = {}; ids.forEach(i => pts[i] = 0);
      Object.values(bal).forEach(list => list.forEach((id, i) => { if (pts[id] !== undefined) pts[id] += ids.length - i; }));
      order = ids.slice().sort((a, b) => pts[b] - pts[a] || 0);
    }
  }

  // ‏**لا فائزَ قبل الاعتماد.** محصّلةُ بطاقات المحكّمين تُعرَض بوصفها محصّلة،
  // ولا تُحوِّل حالةَ ملفٍّ إلى «فائز» حتى يعتمدها رئيس لجنة التحكيم بمبرَّرٍ مُسجَّل.
  // الفارقُ ليس شكلياً: إعلانُ فائزٍ من حسابٍ لم يُعتمَد يسبق اللجنةَ إلى قرارها.
  const decided = !!conf;
  rows.forEach(r => {
    let st;
    if (!r.eligible) st = 'ineligible';
    else if (!q.includes(r)) st = 'out1';
    else if (!fin.includes(r)) st = r.comp === null ? 'qualified' : 'out2';
    else {
      const pos = decided ? order.indexOf(r.c.id) : -1;
      if (pos === 0) st = 'winner';
      else if (pos > 0 && pos < 3) st = 'honored';
      else st = 'finalist';
    }
    r.state = OVERRIDE[r.c.id] || st;
    r.blocked = !!OVERRIDE[r.c.id];
    r.finalPos = decided ? order.indexOf(r.c.id) : -1;
  });

  return {
    key: catKey, cat: C(catKey), tid: C(catKey).track, rows,
    eligible: elig, qualified: q, finalists: fin,
    order, confirmed: !!conf,
    counts: {
      all: all.length, eligible: elig.length,
      qualified: q.length, finalists: fin.length,
      scored: scored.length, diverging: q.filter(r => r.needsConsensus).length
    }
  };
}

/* ---- تقييماتُ ملفّ: المخزَّنة أو المولَّدة ---- */
function assignedTo(caseId) {
  // الإسناد ببذرةٍ ثابتة مع منع تعارض المصالح
  const evs = PEOPLE.filter(p => p.role === 'eval' && p.aff !== CASE(caseId).entity);
  const exs = PEOPLE.filter(p => p.role === 'expert' && p.aff !== CASE(caseId).entity);
  const r = mulberry32(seedOf(caseId + 'assign'));
  const pick = (arr, n) => arr.slice().sort(() => r() - 0.5).slice(0, n).map(p => p.id);
  return { evals: pick(evs, 2), expert: pick(exs, 1)[0] };
}

function reviewsOf(caseId) {
  if (DB.reviews[caseId]) return DB.reviews[caseId];
  const a = assignedTo(caseId);
  const s1 = stage1(caseId);
  const base = clamp(s1.score * 0.9 + 8, 25, 92);
  const r = mulberry32(seedOf(caseId + 'progress'));
  const out = {};
  // نحو ١٥٪ من الملفّات ما تزال قيد التقييم — واقعُ دورةٍ جارية
  const done = r() > 0.15;
  if (done) {
    a.evals.forEach(u => { out[u] = genReview(caseId, u, base); });
    out[a.expert] = genReview(caseId, a.expert, base);
  }
  DB.reviews[caseId] = out;
  return out;
}

/* ---- اللوحة الشاملة: لوحةٌ لكلّ فئة ---- */
let _boards = null;
function boards() {
  if (!_boards) { _boards = {}; CATS.forEach(c => { _boards[c.key] = catBoard(c.key); }); }
  return _boards;
}
function refresh() { _boards = null; _S1 = null; }
function rowOf(caseId) {
  const c = CASE(caseId);
  if (!c) return null;
  return boards()[c.key].rows.find(r => r.c.id === caseId) || null;
}
/** تجميعُ فئات المسار في رقمٍ واحد — للعرض على مستوى المسار */
function trackTotals(tid) {
  const bs = T(tid).cats.map(c => boards()[c.key]);
  const sum = k => bs.reduce((a, b) => a + b.counts[k], 0);
  return {
    tid, boards: bs,
    all: sum('all'), eligible: sum('eligible'), qualified: sum('qualified'),
    finalists: sum('finalists'), scored: sum('scored'), diverging: sum('diverging'),
    confirmed: bs.every(b => b.confirmed), anyConfirmed: bs.some(b => b.confirmed),
    winners: bs.filter(b => b.confirmed && b.order).map(b => b.order[0])
  };
}

/* ---- إحصاءات الدورة ---- */
function cycleStats() {
  const b = boards();
  const sum = k => CATS.reduce((a, c) => a + b[c.key].counts[k], 0);
  return {
    entities: ENTITIES.length,
    cases: CASES.length,
    cats: CATS.length,
    eligible: sum('eligible'),
    qualified: sum('qualified'),
    finalists: sum('finalists'),
    diverging: sum('diverging'),
    confirmedCats: CATS.filter(c => b[c.key].confirmed).length,
    blocked: Object.keys(OVERRIDE).length
  };
}
