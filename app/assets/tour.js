/* ============================================================
   جائزة أداء الصحة — جولة المنصّة
   ------------------------------------------------------------
   المنصّةُ تعمل أمام المشاهد بالخطوات: تبدّل الدور، وتفتح الشاشة،
   وتملأ الحقول وتضغط الأزرار الحقيقية، وتشرح ما يحدث.

   ثلاثةُ قراراتٍ تحكم هذا الملفّ:
   ١) الجولةُ تعمل على لقطةٍ مؤقّتة وتُستعاد عند الخروج، فلا يبقى
      في السجلّ ولا في الملفّات أثرٌ لها — السجلُّ المصنوع كذبة.
   ٢) الرجوعُ إلى خطوةٍ سابقة يُعيد تشغيل ما قبلها بسرعةٍ من اللقطة،
      فتكون الحالةُ دائماً هي الحالة الصحيحة لا تخميناً لها.
   ٣) كلُّ خطوةٍ تضغط الأزرارَ نفسَها التي يضغطها المستخدم، فيُختبَر
      مسارُ الشيفرة الحقيقيّ لا نسخةٌ منه.
   ============================================================ */
(function () {
  'use strict';

  const CANCEL = Symbol('cancel');
  const CH = ['الصورة الكاملة', 'الجهة تسجّل', 'التقييم المستقل', 'التباعُد والتوحيد', 'التحكيم والاعتماد', 'بعد الإعلان', 'الخلاصة'];
  const S = { on: false, i: 0, auto: true, tok: 0, snap: null, mem: {}, timer: 0, raf: 0, ui: null, lookFn: null, busy: false, check: null, cur: 0 };

  const q = (s, r = document) => r.querySelector(s);
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const DECIDED = ['honored', 'winner', 'out2', 'out1', 'ineligible', 'blocked'];
  const KPI_ALL = [...TRACKS.flatMap(t => t.kpis), ...SHARED];
  const kpiName = id => (KPI_ALL.find(k => k.id === id) || { name: id }).name;

  /* ============ لقطةُ الحالة واستعادتها ============ */
  function snapshot() {
    return { db: JSON.stringify(DB), reg: JSON.stringify(REG), n: CASES.length, me: ME, bf: BFILTER, hash: location.hash || '#/', y: window.scrollY };
  }
  function restore(s) {
    const db = JSON.parse(s.db);   Object.keys(DB).forEach(k => delete DB[k]);   Object.assign(DB, db);
    const rg = JSON.parse(s.reg);  Object.keys(REG).forEach(k => delete REG[k]); Object.assign(REG, rg);
    CASES.length = s.n; DEMO_NOW = null; refresh();
  }

  /* ============ اختياراتٌ تُحسَب من الحالة، فتتكرّر هي نفسُها عند كلّ إعادة ============ */
  function initMem() {
    const m = { reg: {} };

    // ملفُّ القصّة: أوّلُ ملفٍّ متأهّلٍ لم يبدأ تقييمُه. وإن لم يوجد نُفرِّغ أوّلَ ملفّ (وتُستعاد حالتُه عند الخروج)
    // تجمّعٌ صحّيٌّ أوّلاً: قصّتُه أبسطُ على من يشاهد (الرعاية الأولية أو الوقاية)، ولا يُشكِل عليه تخصّصٌ
    const qual = CATS.flatMap(c => boards()[c.key].qualified);
    const pending = x => !Object.keys(reviewsOf(x.c.id)).length;
    let r = qual.find(x => pending(x) && E(x.c.entity).kind === 'cluster') || qual.find(pending);
    if (!r) { r = qual.find(x => E(x.c.entity).kind === 'cluster') || qual[0]; DB.reviews[r.c.id] = {}; delete DB.consensus[r.c.id]; refresh(); }
    m.story = r.c.id;
    m.storyKey = CASE(m.story).key;
    const a = assignedTo(m.story); m.X = a.evals[0]; m.Y = a.evals[1]; m.EX = a.expert;

    // فئةُ التسجيل: أوّلُ فئةٍ حرّةٍ تسقط فيها جهةٌ بعينها في الأهليّة — فالسقوطُ أوضحُ ما في المنصّة
    m.reg.ent = 'P05';
    const ent = E(m.reg.ent), taken = CASES.filter(c => c.entity === ent.id).map(c => c.key);
    const free = CATS.filter(c => fits(ent, c) && !taken.includes(c.key));
    const failing = free.find(c => !eligibility(buildCase(ent.id, c.key)).pass);
    m.reg.cat = (failing || free[0] || CATS.find(c => fits(ent, c))).key;

    // فئتا التحكيم: واحدةٌ موقوفةٌ بتباعُدٍ مفتوح، وواحدةٌ نظيفة
    const bs = CATS.map(c => boards()[c.key]);
    const blocked = bs.find(b => !b.confirmed && b.counts.diverging > 0 && b.finalists.length >= 1);
    m.blocked = blocked ? blocked.key : null;
    const clean = bs.filter(b => !b.confirmed && b.counts.diverging === 0 && b.finalists.length >= 3);
    const pick = clean.find(b => b.key !== m.storyKey) || clean[0];
    m.clean = pick ? pick.key : null;
    return m;
  }

  function appealCid(m) {
    const cands = [m.reg.cid, ...CASES.filter(c => c.entity === m.reg.ent).map(c => c.id), 'C17-PRIM-GEN'];
    return cands.find(id => id && rowOf(id) && DECIDED.includes(rowOf(id).state)) || 'C17-PRIM-GEN';
  }

  /* تقييمٌ كامل بالمراسي: مرتفعٌ لمقيّمٍ ومنخفضٌ لآخر، فيتباعدان فوق عتبة التباعُد */
  async function scoreAll(K, cid, mode, noteText) {
    const pick = {
      high: { adli: [3, 2, 2, 2], letci: [3, 2, 2, 2], visit: [2, 3, 2, 2] },
      low:  { adli: [1, 1, 1, 1], letci: [1, 1, 0, 1], visit: [1, 1, 1, 1] }
    }[mode];
    for (const [key, dims] of [['adli', ADLI], ['letci', LETCI], ['visit', VISIT]]) {
      for (let i = 0; i < dims.length; i++) {
        await K.click(`[data-sc="${cid}|${key}|${dims[i].k}|${ANCHOR_MID[pick[key][i]]}"]`, true);
      }
    }
    await K.type(`#nt-${cid}`, noteText);
  }

  /* ============ الخطوات ============
     role/route/look/title/body/note: نصٌّ أو دالّةٌ (mem, phase) → نصّ.
     act: الأفعالُ التي تضغطها الجولة. look: ما يُضاء — وسمُ data-tour أو دالّةٌ تُرجع عنصراً. */
  const STEPS = [
    /* ١ · الصورة الكاملة */
    { ch: 0, role: 'U-CH1', route: '#/', title: 'جولة المنصّة',
      body: 'ستشاهد المنصّة تعمل بنفسها: جهة تسجّل، ومقيّمان يقيّمان ويتباعدان، وخبير يوحّد، ولجنة تحكيم تعتمد، ثم تظلّم. تعمل الجولة على نسخة مؤقتة، وكل شيء يرجع كما كان حين تخرج.',
      note: 'توقّف أو تخطَّ أو ارجع في أي وقت من الأزرار تحت.',
      look: () => () => q('.ph') },

    { ch: 0, role: 'U-CH1', route: '#/board', title: 'لوحة الجائزة',
      body: () => { const s = cycleStats(); return `هذه حالة الدورة كلها: ${nEnt(s.entities)} و${nCase(s.cases)} في ${num(s.cats, 'فئة', 'فئتين', 'فئات', 'فئةً')}. لكل فئة قمعها: من سجّل، ومن اجتاز الأهلية، ومن تأهّل، ومن بلغ التحكيم.`; },
      note: 'الأرقام هنا محاكاة. الحقيقي في صفحة النتائج.',
      look: 'board-funnel' },

    { ch: 0, role: 'U-CH1', route: '#/results', title: 'النتائج المعلنة',
      body: () => `وهذه نتائج حفل ${dt(CYCLE.ceremony)} الحقيقية: ${num(RESULT_COUNT, 'جهة', 'جهتان', 'جهات', 'جهةً')} وثلاثة أوسمة، بترتيبها داخل كل فئة. هي الصفحة الوحيدة غير المحاكاة، ولا فيها درجة لأي فائز لأن الدرجات لم تُعلن.`,
      look: 'res-medals' },

    /* ٢ · الجهة تسجّل */
    { ch: 1, role: 'U-EN2', date: '2026-01-20', route: '#/register', title: 'التسجيل مفتوح لكل القطاعات',
      body: 'ممثّل مستشفى خاص يبدأ باختيار القطاع. لاحظ التنبيه: ربط القطاع الخاص بالمنصّة الوطنية جزئي، والمنصّة تقول هذا قبل أن يكمل، لا بعد الإعلان.',
      act: async K => { await K.click('input[name="sector"][value="private"]'); },
      look: () => () => q('.form .note--a') || q('[data-tour="reg-sector"]') },

    { ch: 1, role: 'U-EN2', route: '#/register', title: 'الجهة وممثّلها',
      body: 'يختار الاسم كما هو في السجل الرسمي، لأن بيانات الجهة تُطابَق عليه. ثم يفوّض ممثلاً واحداً هو الذي يوقّع باسم الجهة.',
      act: async (K, m) => {
        await K.set('select[data-reg="entity"]', m.reg.ent);
        await K.click('[data-reg-next="1"]');
        await K.type('input[data-rep="name"]', 'فهد المطيري');
        await K.type('input[data-rep="title"]', 'مدير الجودة');
        await K.type('input[data-rep="email"]', 'quality@example.com');
        await K.type('input[data-rep="phone"]', '0500000000');
      },
      look: 'reg-rep' },

    { ch: 1, role: 'U-EN2', route: '#/register', title: 'كل جهة ترى فئاتها هي',
      body: 'تظهر للمستشفى الفئات التي تقبل المنشآت المفردة فقط. والتنافس داخل الفئة لا داخل المسار: إصابات المستشفيات لا تُقارَن بتجمّع صحي، لأن حزمة المؤشرات مختلفة.',
      act: async (K, m) => {
        await K.click('[data-reg-next="2"]');
        await K.click(`input[name="cat"][value="${m.reg.cat}"]`);
      },
      look: 'reg-cat' },

    { ch: 1, role: 'U-EN2', route: '#/register', title: 'حكم الأهلية فوري',
      body: (m, ph) => {
        const c = m.reg.cid && CASE(m.reg.cid);
        if (ph === 'pre' || !c) return 'يوافق على أربعة إقرارات ثم يسجّل. والمنصّة تصدر حكم الأهلية في اللحظة نفسها من بياناته الرسمية.';
        const g = eligibility(c).gates.find(x => !x.pass);
        if (!g) return 'اجتازت الجهة البوّابة، فتدخل الترتيب مباشرة.';
        const miss = g.miss && g.miss.length ? ` الناقص: ${esc(g.miss.map(kpiName).join('، '))}.` : '';
        return `لم تجتز الجهة شرط «${esc(g.name)}»: ${esc(ar(g.val))}.${miss} السبب ظاهر بالرقم، لا برفض إداري.`;
      },
      note: 'ثلاثة شروط قاطعة من دليل الجائزة. سقوط واحد يُسقط الملف.',
      act: async (K, m) => {
        await K.click('[data-reg-next="3"]');
        for (const k of ['data', 'evid', 'visit', 'rules']) await K.click(`input[data-ack="${k}"]`, true);
        await K.click('[data-reg-submit]');
        m.reg.cid = REG.done;
      },
      look: 'gates' },

    /* ٣ · التقييم المستقل */
    { ch: 2, role: m => m.X, date: '2026-05-25', route: '#/desk', title: 'مكتب المقيّم',
      body: 'يرى المقيّم الملفات المُسنَدة إليه فقط. ولا يُسنَد إليه ملف من جهته: تعارض المصالح يُستبعَد آلياً، ويُسجَّل سببه.',
      look: m => () => { const a = q(`a[href="#/case/${m.story}"]`); return a ? a.closest('tr') : q('[data-tour="desk-list"]'); } },

    { ch: 2, role: m => m.X, route: '#/board', title: 'ولا يرى ترتيب الفئة',
      body: 'حاول المقيّم فتح لوحة الترتيب فرُفض. من يعرف موقع الجهة قبل أن يضع درجته يقيّم الموقع لا الملف. الفصل بين الأدوار مفروض بالشاشة، لا بالتعليمات.',
      look: 'denied' },

    { ch: 2, role: m => m.X, route: m => '#/case/' + m.story, title: 'بطاقة التسجيل بالمراسي',
      body: 'يختار المقيّم مرسىً وصفياً لكل بُعد: أربعة لنظام العمل (ADLI)، وأربعة للنتائج (LeTCI)، وأربعة للزيارة الميدانية. بدل رقم حر. ولا يرى درجة زميله قبل أن يرسل درجته: هذا هو الحجاب.',
      act: async (K, m) => {
        await scoreAll(K, m.story, 'high', 'الأدلة تدعم التطبيق في أغلب الوحدات، والزيارة أكّدت المحاضر.');
        await K.click('[data-sc-send]');
      },
      look: 'scorecard' },

    { ch: 2, role: m => m.Y, route: m => '#/case/' + m.story, title: 'المقيّم الثاني يقيّم باستقلال',
      body: 'الملف نفسه، ومقيّم آخر لا يعرف ما وضعه الأول. هنا اختار مراسي أدنى في أغلب الأبعاد.',
      act: async (K, m) => {
        await scoreAll(K, m.story, 'low', 'التطبيق في وحدتين فقط من خمس، ولم أجد محضراً يثبت المتابعة.');
        await K.click('[data-sc-send]');
      },
      look: 'scorecard' },

    /* ٤ · التباعُد والتوحيد */
    { ch: 3, role: m => m.EX, date: '2026-06-05', route: m => '#/consensus/' + m.story, title: 'تباعُد يوقف الاعتماد',
      body: m => { const r = rowOf(m.story), dv = r && r.divergence; return `الفرق بين المقيّمين ${dv == null ? '' : fmt(dv, 1)} نقطة، والعتبة ${ar(CFG.divergence)}. الاعتماد متوقف حتى يُفتح حوار توحيد بحضور خبير اللجنة العلمية. الأبعاد المظلَّلة هي مواضع الخلاف.`; },
      look: 'dv' },

    { ch: 3, role: m => m.EX, route: m => '#/consensus/' + m.story, title: 'توحيد بمبرَّر مكتوب',
      body: 'يسجّل الخبير الدرجة الموحَّدة، والمبرَّر إلزامي. هذا المبرَّر هو ما يُقرأ لاحقاً لو اعترضت الجهة.',
      act: async K => {
        await K.type('#cs-r', 'اتفق المقيّمان بعد مراجعة المحضر على أن التطبيق يشمل ثلاث وحدات لا خمساً، فاستقرّت الأبعاد قرب المتوسط.');
        await K.click('[data-cons]');
      },
      look: 'cons' },

    /* ٥ · التحكيم والاعتماد */
    { ch: 4, role: 'U-JD1', date: '2026-08-28', route: '#/judging', title: 'فئة فيها تباعُد مفتوح',
      body: 'هنا لا يظهر زر الاعتماد أصلاً. لجنة التحكيم تعتمد ترتيباً، والترتيب المبني على درجة لم تُوحَّد لا سند له. تُغلَق حوارات التوحيد أولاً.',
      look: m => m.blocked ? 'judge-' + m.blocked : null },

    { ch: 4, role: 'U-JD1', route: '#/judging', title: 'بطاقات المحكّمين',
      body: 'كل محكّم يُودع بطاقته، وتُحسَب المحصّلة بنقاط بوردا. جرّبنا هنا أن يخالف أحدهم الترتيب الحسابي. ولاحظ: لا فائز بعد.',
      note: 'الأسماء والدرجات هنا محاكاة. الفائزون الحقيقيون في صفحة النتائج.',
      act: async (K, m) => {
        const key = m.clean; if (!key) return;
        await K.click(`[data-bal="${key}|1|-1"]`);
        await K.click(`[data-bal-send="${key}"]`);
        for (const j of ['U-JD2', 'U-JD3']) { ME = j; await K.nav('#/judging'); await K.click(`[data-bal-send="${key}"]`); }
        ME = 'U-JD1'; await K.nav('#/judging');
      },
      look: m => m.clean ? 'judge-' + m.clean : null },

    { ch: 4, role: 'U-JD1', route: '#/judging', title: 'اعتماد رئيس التحكيم',
      body: 'الرئيس وحده يعتمد، بمبرَّر مسجَّل. الآن فقط يصير الأول «فائزاً» والثاني والثالث «مُكرَّمَين»، وتتحول الشارات إلى ذهبية. الذهب لا يُمنح إلا بعد الاعتماد.',
      act: async (K, m) => {
        if (!m.clean) return;
        await K.type(`[id="cf-${m.clean}"]`, 'اعتُمدت المحصّلة بعد التحقق من اكتمال محاضر التوحيد والزيارات في الفئة.');
        await K.click(`[data-confirm="${m.clean}"]`);
      },
      look: m => m.clean ? 'judge-' + m.clean : null },

    /* ٦ · بعد الإعلان */
    { ch: 5, role: 'U-EN2', date: '2026-09-20', route: m => '#/entity/' + appealCid(m), title: 'التظلّم داخل المنصّة',
      body: () => `يقدّم ممثّل الجهة تظلّمه خلال ${ar(CYCLE.appealWeeks)} أسابيع من الحفل. والتظلّم إجرائي: يحدّد البند الذي لم تُطبَّق قاعدته كما نُشرت، لا الشعور بالنتيجة.`,
      note: () => `نافذة التظلّم من ${dt(CYCLE.ceremony)} إلى ${dt(CYCLE.appealEnds)}، وتاريخ العرض داخلها.`,
      act: async (K, m) => {
        await K.type(`#ap-${appealCid(m)}`, 'لم يُطبَّق الشرط الأول كما نُشر: مؤشر واحد غير متاح رسمياً رغم وجود سجله الأصلي لدينا، ونطلب مراجعة الإجراء.');
        await K.click('[data-appeal]');
      },
      look: 'appeal' },

    { ch: 5, role: 'U-AP1', route: '#/appeals', title: 'قرار مُسبَّب',
      body: 'لجنة الحجب والتظلّم تبتّ بقرار مكتوب يظهر للمتظلّم. تنظر في سلامة الإجراء، وليست فرصة تقييم ثانية.',
      act: async K => {
        await K.type('#dc-0', 'رُفض التظلّم: الإجراء طُبّق كما نُشر، والمؤشر الناقص غير مغذّى من المصدر الرسمي.');
        await K.click('[data-apdec="0|مرفوض"]');
      },
      look: 'appeal-list' },

    { ch: 5, role: 'U-CH1', route: '#/log', title: 'سجلّ لا يُمحى',
      body: 'كل ما جرى في الجولة مسجَّل: من فعل، ومتى، وبأي صلاحية. وهذا أول ما تطلبه لجنة التظلّم. وسيُمحى هذا السجل حين تخرج، لأن الجولة تعمل على نسخة مؤقتة.',
      look: 'log' },

    /* ٧ · الخلاصة */
    { ch: 6, role: 'U-CH1', route: '#/verdict', title: 'هذا ما تفعله المنصّة', end: true,
      body: 'وما لا تفعله: الأرقام محاكاة، والأوزان افتراض معلن، والبيانات غير مربوطة بمصدرها. والقرارات التي تنتظر اللجان في العرض التنفيذي.',
      look: () => () => q('.ph') }
  ];

  /* ============ أدواتُ الفعل: كلٌّ منها يعمل بسرعتين، بطيئةٍ للعرض وسريعةٍ للإعادة ============ */
  function setVal(el, v) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }

  function makeKit(fast, guard) {
    const miss = sel => { if (S.check) S.check.push({ j: S.cur, miss: typeof sel === 'string' ? sel : '(دالّة)' }); };
    const K = {
      fast,
      async wait(ms) { await sleep(fast ? 0 : ms); guard(); },
      async nav(route) {
        const cur = location.hash || '#/';
        const same = cur === route || (route === '#/' && (cur === '' || cur === '#' || cur === '#/'));
        if (same) render(); else { location.hash = route; await sleep(fast ? 30 : 150); }
        guard();
      },
      async find(sel, ms = 1800) {
        const t0 = performance.now();
        for (;;) {
          guard();
          const el = typeof sel === 'function' ? sel() : q(sel);
          if (el) return el;
          if (performance.now() - t0 > ms) { miss(sel); return null; }
          await sleep(30);
        }
      },
      async point(el, ms = 520) {
        if (fast || !el) return;
        ensureVisible(el);
        const r = el.getBoundingClientRect();
        cursorTo(r.left + r.width / 2, r.top + Math.min(r.height / 2, 26));
        await sleep(ms); guard();
      },
      async click(sel, quick = false) {
        const el0 = await K.find(sel); if (!el0) return false;
        await K.point(el0.closest('label') || el0, quick ? 130 : 520);
        if (!fast) { tap(); await sleep(quick ? 70 : 140); guard(); }
        el0.click();
        await K.wait(quick ? 40 : 160);
        return true;
      },
      async type(sel, text) {
        const el = await K.find(sel); if (!el) return false;
        await K.point(el);
        el.focus({ preventScroll: true });
        if (fast) { setVal(el, text); return true; }
        let cur = '';
        for (const ch of text) { cur += ch; setVal(el, cur); await sleep(22); guard(); }
        await sleep(220); guard();
        return true;
      },
      async set(sel, value) {
        const el = await K.find(sel); if (!el) return false;
        await K.point(el);
        el.value = value; el.dispatchEvent(new Event('change', { bubbles: true }));
        await K.wait(200);
        return true;
      }
    };
    return K;
  }

  /* ============ المؤشّر والإطار المُضيء ============ */
  function cursorTo(x, y) { const c = S.ui && S.ui.cur; if (!c) return; c.style.left = x + 'px'; c.style.top = y + 'px'; c.classList.add('on'); }
  function tap() { const c = S.ui && S.ui.cur; if (!c) return; c.classList.add('tap'); setTimeout(() => c.classList.remove('tap'), 180); }
  function hideCursor() { if (S.ui) S.ui.cur.classList.remove('on'); }

  function ensureVisible(el) {
    const r = el.getBoundingClientRect();
    const pr = S.ui ? S.ui.panel.getBoundingClientRect() : { left: 0, right: 0, top: 9e9, bottom: 9e9 };
    const hidden = r.bottom > pr.top && r.top < pr.bottom && r.right > pr.left && r.left < pr.right;
    if (hidden || r.top < 96 || r.bottom > window.innerHeight - 20) window.scrollBy({ top: r.top - 150, behavior: 'auto' });
  }

  function resolveTarget(spec) {
    if (!spec) return null;
    let el = null;
    try { el = typeof spec === 'function' ? spec() : (q(`[data-tour="${spec}"]`) || q(spec)); } catch (_) { el = null; }
    if (!el) return null;
    return el.matches && el.matches('.hd') ? (el.closest('.card') || el) : el;
  }

  function setLook(spec, scroll) {
    S.lookFn = spec ? () => resolveTarget(spec) : null;
    const u = S.ui; if (!u) return;
    u.ring.classList.remove('pop'); void u.ring.offsetWidth; u.ring.classList.add('pop');
    if (scroll && spec) {
      const el = resolveTarget(spec);
      if (el) { el.style.scrollMarginTop = '104px'; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  }

  function loop() {
    if (!S.on) return;
    const ring = S.ui && S.ui.ring;
    if (ring) {
      const el = S.lookFn ? S.lookFn() : null;
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect();
        const top = Math.max(r.top, 6), bot = Math.min(r.bottom, innerHeight - 6), lf = Math.max(r.left, 6), rt = Math.min(r.right, innerWidth - 6);
        if (bot - top > 8 && rt - lf > 8) {
          ring.style.left = (lf - 5) + 'px'; ring.style.top = (top - 5) + 'px';
          ring.style.width = (rt - lf + 10) + 'px'; ring.style.height = (bot - top + 10) + 'px';
          ring.classList.add('on');
        } else ring.classList.remove('on');
      } else ring.classList.remove('on');
    }
    S.raf = requestAnimationFrame(loop);
  }

  /* ============ اللوحة ============ */
  function mountUI() {
    const root = document.createElement('div'); root.id = 'tour-root';
    const groups = CH.map((_, c) => `<div class="g" title="${esc(CH[c])}">${STEPS.map((s, j) => s.ch === c ? `<button type="button" data-tr="go" data-j="${j}" aria-label="الخطوة ${ar(j + 1)}"></button>` : '').join('')}</div>`).join('');
    root.innerHTML = `
      <div class="tr-veil" aria-hidden="true">نعيد تهيئة الخطوة…</div>
      <div class="tr-ring" aria-hidden="true"></div>
      <div class="tr-cur" aria-hidden="true"></div>
      <div class="tr" role="region" aria-label="جولة المنصّة" aria-live="polite">
        <div class="tr__hd"><span class="tr__ch"></span><span class="tr__n"></span>
          <button type="button" class="tr__x" data-tr="exit" aria-label="إنهاء الجولة" title="إنهاء (Esc)">${ic('x')}</button></div>
        <div class="tr__who"></div>
        <h3 class="tr__t"></h3>
        <p class="tr__b"></p>
        <p class="tr__note" hidden></p>
        <div class="tr__acts" hidden></div>
        <div class="tr__ctl">
          <button type="button" class="tr__c" data-tr="prev" aria-label="الخطوة السابقة" title="السابق">${ic('prev')}</button>
          <button type="button" class="tr__c tr__c--play" data-tr="play" aria-label="إيقاف مؤقت" title="تشغيل أو إيقاف (مسافة)">${ic('pause')}</button>
          <button type="button" class="tr__c" data-tr="next" aria-label="الخطوة التالية" title="التالي">${ic('next')}</button>
          <div class="tr__tk">${groups}</div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const $ = s => root.querySelector(s);
    S.ui = { root, veil: $('.tr-veil'), ring: $('.tr-ring'), cur: $('.tr-cur'), panel: $('.tr'),
      ch: $('.tr__ch'), n: $('.tr__n'), who: $('.tr__who'), t: $('.tr__t'), b: $('.tr__b'), note: $('.tr__note'), acts: $('.tr__acts'), play: $('[data-tr="play"]'), tk: $('.tr__tk') };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-tr]'); if (!b) return;
      const a = b.dataset.tr;
      if (a === 'exit') stop(true);
      else if (a === 'prev') prev();
      else if (a === 'next') next();
      else if (a === 'play') setAuto(!S.auto);
      else if (a === 'go') jump(+b.dataset.j);
      else if (a === 'replay') jump(0);
      else if (a === 'deck') { stop(true); if (window.openDeck) window.openDeck(0); }
    });
  }

  const val = (x, ph) => { try { return typeof x === 'function' ? x(S.mem, ph) : x; } catch (e) { console.warn('جولة: نصّ الخطوة', e); return ''; } };

  function paint(j, ph) {
    const st = STEPS[j], u = S.ui; if (!u) return;
    u.ch.textContent = `${ar(st.ch + 1)} — ${CH[st.ch]}`;
    u.n.textContent = `${ar(j + 1)} من ${ar(STEPS.length)}`;
    u.t.textContent = val(st.title, ph) || '';
    u.b.innerHTML = val(st.body, ph) || '';
    const note = val(st.note, ph);
    u.note.hidden = !note; u.note.innerHTML = note || '';
    const p = me();
    u.who.innerHTML = `<span>${esc(p.name)} — ${esc(ROLES[p.role].name)}</span>${DEMO_NOW ? `<span class="d">تاريخ العرض: ${dt(DEMO_NOW)}</span>` : ''}`;
    u.acts.hidden = !st.end;
    u.acts.innerHTML = st.end
      ? `<button type="button" class="btn btn--p" data-tr="deck">${ic('deck')}العرض التنفيذي</button><button type="button" class="btn" data-tr="replay">${ic('replay')}أعد الجولة</button><button type="button" class="btn" data-tr="exit">إنهاء الجولة</button>` : '';
    u.tk.querySelectorAll('button').forEach(b => { const k = +b.dataset.j; b.classList.toggle('on', k === j); b.classList.toggle('past', k < j); });
  }

  function syncPlay() {
    const u = S.ui; if (!u) return;
    u.play.innerHTML = ic(S.auto ? 'pause' : 'play');
    u.play.setAttribute('aria-label', S.auto ? 'إيقاف مؤقت' : 'متابعة');
  }
  function setBusy(on, veil) {
    S.busy = on; const u = S.ui; if (!u) return;
    u.panel.classList.toggle('tr--busy', on && !!veil);
    u.veil.classList.toggle('on', !!veil);
  }

  /* ============ تشغيلُ خطوة ============ */
  async function runStep(j, o) {
    const st = STEPS[j], fast = !!o.fast, tok = o.tok;
    const guard = () => { if (tok !== S.tok || !S.on) throw CANCEL; };
    const K = makeKit(fast, guard);
    S.cur = j; guard();
    if (st.date) DEMO_NOW = st.date;
    const role = typeof st.role === 'function' ? st.role(S.mem) : st.role;
    if (role) ME = role;
    if (!fast) { paint(j, 'pre'); hideCursor(); setLook(null); if (S.ui) S.ui.veil.classList.remove('on'); }

    const route = typeof st.route === 'function' ? st.route(S.mem) : st.route;
    if (route) await K.nav(route);
    guard();

    const spec = () => (typeof st.look === 'function' ? st.look(S.mem) : st.look);
    if (!fast && st.look && !st.act) setLook(spec(), true);
    if (st.act) await st.act(K, S.mem);
    guard();

    if (S.check && st.look && !resolveTarget(spec())) S.check.push({ j, miss: 'look' });
    if (!fast) { hideCursor(); if (st.look) setLook(spec(), true); paint(j, 'post'); }
  }

  async function play(j) {
    const tok = ++S.tok; clearTimeout(S.timer); S.i = j; setBusy(true);
    try { await runStep(j, { fast: false, tok }); }
    catch (e) { if (e === CANCEL) return; console.error('جولة: تعذّرت الخطوة', j + 1, e); }
    if (tok !== S.tok) return;
    setBusy(false); schedule(tok);
  }

  async function jump(n) {
    n = clampN(n, 0, STEPS.length - 1);
    const tok = ++S.tok; clearTimeout(S.timer); S.i = n; setBusy(true, true);
    try {
      restore(S.snap); S.mem = initMem();
      for (let j = 0; j < n; j++) await runStep(j, { fast: true, tok });
      await runStep(n, { fast: false, tok });
    } catch (e) { if (e === CANCEL) return; console.error('جولة: تعذّرت إعادة التهيئة', n + 1, e); }
    if (tok !== S.tok) return;
    setBusy(false); schedule(tok);
  }

  function schedule(tok) {
    clearTimeout(S.timer); syncPlay();
    if (!S.auto || S.i >= STEPS.length - 1 || !S.ui) return;
    const words = (S.ui.t.textContent + ' ' + S.ui.b.textContent).trim().split(/\s+/).length;
    const dwell = clampN(3400 + words * 320, 5200, 13500);
    S.timer = setTimeout(() => { if (tok === S.tok && S.auto) next(); }, dwell);
  }
  function setAuto(v) {
    S.auto = v; syncPlay(); clearTimeout(S.timer);
    if (v && !S.busy) S.timer = setTimeout(next, 900);
  }
  function next() { if (S.i < STEPS.length - 1) { if (S.busy) jump(S.i + 1); else play(S.i + 1); } }
  function prev() { if (S.i > 0) jump(S.i - 1); }

  function onKey(e) {
    if (!S.on) return;
    const k = e.key, onBtn = e.target.closest && e.target.closest('button, a');
    if (k === 'Escape') { e.preventDefault(); stop(true); }
    else if (k === 'ArrowLeft') { e.preventDefault(); next(); }
    else if (k === 'ArrowRight') { e.preventDefault(); prev(); }
    else if (k === ' ' && !onBtn) { e.preventDefault(); setAuto(!S.auto); }
  }

  /* ============ البدء والخروج ============ */
  function start() {
    if (S.on) return;
    if (window.closeDeck) window.closeDeck();
    S.on = true; S.auto = true; S.snap = snapshot(); S.mem = initMem();
    mountUI(); syncPlay();
    document.body.classList.add('touring');
    document.addEventListener('keydown', onKey, true);
    S.raf = requestAnimationFrame(loop);
    play(0);
  }

  function stop(restoreState) {
    if (!S.on) return;
    S.tok++; clearTimeout(S.timer); cancelAnimationFrame(S.raf); S.on = false;
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('touring');
    if (S.ui) S.ui.root.remove();
    S.ui = null; S.lookFn = null;
    if (restoreState && S.snap) {
      restore(S.snap); ME = S.snap.me; BFILTER = S.snap.bf;
      location.hash = S.snap.hash; render(); window.scrollTo({ top: S.snap.y });
    }
  }

  /* ============ فحصٌ ذاتيّ: يُشغِّل الخطوات كلَّها سريعاً ويُبلِّغ بما لم يجده ============
     يُستعمل بعد أيّ تعديلٍ في القوالب: عنوانُ بطاقةٍ تغيّر يُسقِط إطاراً مُضيئاً،
     وزرٌّ أُعيدت تسميتُه يُسقِط فعلاً — وهذا الفحصُ يكشفهما قبل أن يراهما أحد. */
  async function check() {
    if (S.on) return { error: 'الجولة تعمل الآن' };
    const snap = snapshot(), tok = ++S.tok;
    S.on = true; S.snap = snap; S.check = []; S.mem = initMem();
    const out = { steps: STEPS.length, misses: [], errors: [] };
    try {
      for (let j = 0; j < STEPS.length; j++) {
        try { await runStep(j, { fast: true, tok }); } catch (e) { out.errors.push({ j: j + 1, e: String(e && e.message || e) }); }
      }
      const m = S.mem;
      out.after = {
        reviews: Object.keys(DB.reviews[m.story] || {}).length,
        consensus: !!DB.consensus[m.story],
        confirmed: m.clean ? !!DB.confirmed[m.clean] : null,
        winnerState: m.clean && DB.confirmed[m.clean] ? rowOf(CASE(DB.confirmed[m.clean].order[0]).id).state : null,
        appeal: DB.appeals[0] ? DB.appeals[0].status : null,
        log: DB.log.length, registeredCase: m.reg.cid || null,
        registeredState: m.reg.cid && rowOf(m.reg.cid) ? rowOf(m.reg.cid).state : null,
        picks: { story: m.story, X: m.X, Y: m.Y, EX: m.EX, cat: m.reg.cat, blocked: m.blocked, clean: m.clean }
      };
    } finally {
      out.misses = S.check; S.check = null;
      S.on = false; S.tok++;
      restore(snap); ME = snap.me; BFILTER = snap.bf;
      out.restored = { log: DB.log.length, cases: CASES.length === snap.n };
      location.hash = snap.hash; render();
    }
    return out;
  }

  window.startTour = start;
  window.stopTour = stop;
  window.tourActive = () => S.on;
  window.tourCheck = check;
})();
