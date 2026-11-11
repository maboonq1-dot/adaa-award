/* ============================================================
   جائزة أداء الصحة — العرض التنفيذي
   ------------------------------------------------------------
   تسعُ شرائح لمن يقرّر في عشر دقائق ولا يتصفّح. كلُّ رقمٍ فيها
   يُحسَب من بيانات المنصّة نفسها فلا يخالف العرضُ الشاشات، وما كان
   محاكاةً يحمل وسمه على الشريحة لا في هامشها.
   ============================================================ */
(function () {
  'use strict';

  /* القراراتُ التي لا يحسمها النظام — تُعرَض في الشريحة 7 وتُعدّ في الخلاصة */
  const DECISIONS = [
    { d: 'وزن المرحلتين والعتبات', why: 'أول ما يُطعَن فيه هو الوزن لا الدرجة.',
      who: 'اللجنة العلمية', now: 'افتراض معلَن في شاشة المنهجية', tone: 'a' },
    { d: 'أثر السقف', why: () => `من بلغ ${ar(95)}% لا يُظهر اتجاهاً موجباً، فيسقط المتفوّق ويتأهل الصاعد.`,
      who: 'اللجنة العلمية', now: 'يُعلَّم بشارة «قُربَ السقف» ولا يُعالَج في الحساب', tone: 'r' },
    { d: 'اسم المسار السادس', why: 'ثلاثة مسمّيات في ثلاثة مصادر.',
      who: 'اللجنة التوجيهية', now: 'اعتُمد نص الدليل', tone: '' },
    { d: 'ربط البيانات بمصادر الجائزة', why: 'بدونه تبقى الأرقام محاكاة.',
      who: 'اللجنة التنفيذية', now: 'غير قائم', tone: 'r' },
    { d: 'نص الإقرار والتعهّد', why: 'يُحتجّ به عند الخلاف في الزيارة الميدانية.',
      who: 'إدارة قانونية', now: 'مسوّدة للمراجعة', tone: 'a' }
  ];

  const nFiles = n => num(n, 'ملفّ', 'ملفّان', 'ملفّات', 'ملفّاً');
  const nCats  = n => num(n, 'فئة', 'فئتان', 'فئات', 'فئةً');
  const nEnts  = n => num(n, 'جهة', 'جهتان', 'جهات', 'جهةً');

  /* إطارٌ مشترك: شريط علويّ بالاسم والموضع والعدّاد */
  const frame = (i, label, inner, cls = '') => `
    <section class="sl ${cls}" data-i="${i}" aria-label="${esc(label)}">
      <div class="sl__top"><b>جائزة أداء الصحة</b><span>${esc(label)}</span><span class="n">${ar(i + 1)} / ${ar(SLIDES.length)}</span></div>
      ${inner}
    </section>`;

  /* ============ الشرائح ============ */
  const SLIDES = [

    /* 1 · الغلاف */
    () => `
    <section class="sl sl--cover" data-i="0" aria-label="الغلاف">
      <div class="sl__top"><span class="cv__mk">أداء</span><b>جائزة أداء الصحة</b><span class="sp">عرض تنفيذي</span></div>
      <div class="cv__mid">
        <h2>منصّة إدارة جائزة أداء الصحة</h2>
        <p class="cv__s">${esc(CYCLE.name)} ${ar(CYCLE.year)} — من التسجيل إلى الوسام في مسار واحد موثّق</p>
      </div>
      <div class="cv__ft">
        <p>نموذج مستقل غير تابع لوزارة الصحة</p>
        <p>فكرة وتنفيذ <span dir="ltr">MOAYAD ABOONQ</span></p>
        <p class="c">تُقام الدورة إحياءً لمرور ${ar(100)} عام على تأسيس أول مديرية للصحة عام ${ar(1343)}هـ في مكة المكرمة</p>
      </div>
      <div class="cv__num" aria-hidden="true">${ar(STAGES[0].cut)} ← ${ar(STAGES[1].cut)} ← ${ar(STAGES[2].cut)}</div>
    </section>`,

    /* 2 · الخلاصة */
    () => {
      const st = cycleStats(), roles = Object.keys(ROLES).length;
      return frame(1, 'الخلاصة', `
      <h2>جائزة تُدار بالأدلة، من أول ملف إلى آخر وسام</h2>
      <dl class="sl__body">
        <div class="sd"><dt>ما هي</dt><dd>منصّة تدير الجائزة كلها: تسجيل الجهات، وحكم الأهلية، وتقييم المرحلتين، والتحكيم، والتظلّم.</dd></div>
        <div class="sd"><dt>ما الجديد فيها</dt><dd>تفصل التسجيل عن الأهلية عن الاستمارة. الجهة لا ترشّح نفسها بملف تكتبه، بل يُحسب أداؤها من بياناتها الرسمية.</dd></div>
        <div class="sd"><dt>ما الذي اختُبر</dt><dd>${nCats(st.cats)} وسبعة أدوار، ومسار كامل جُرِّب على نتيجة الحفل المعلنة: ${nEnts(RESULT_COUNT)} وثلاثة أوسمة.</dd></div>
        <div class="sd"><dt>ما المطلوب</dt><dd>${num(DECISIONS.length, 'قرار', 'قراران', 'قرارات', 'قراراً')} من اللجان، وفئة تجريبية واحدة ببيانات حقيقية.</dd></div>
      </dl>
      <p class="sl__fn">الأرقام والدرجات داخل النموذج محاكاة. صفحة النتائج وحدها بيانات حقيقية.</p>`);
    },

    /* 3 · الفكرة */
    () => {
      const st = cycleStats();
      return frame(2, 'الفكرة', `
      <h2>ثلاثة أشياء كانت واحداً، والمنصّة تفصلها</h2>
      <div class="sl__body">
        <div class="sc3">
          <div><span class="k">التسجيل</span><p>مفتوح لكل القطاعات. تثبت الجهة هويتها، وتفوّض ممثلاً، وتختار الفئة.</p><em>هوية وتفويض</em></div>
          <div><span class="k">الأهلية</span><p>حكم فوري من البيانات الرسمية بثلاثة شروط قاطعة: مصدر رسمي، وبلوغ المستهدفات، واتجاه موجب لثلاث دورات.</p><em>تُحسَب ولا تُكتَب</em></div>
          <div><span class="k">الاستمارة</span><p>تُفتح لأفضل ${ar(STAGES[0].cut)} في كل فئة فقط. بها يُقيَّم نظام العمل (ADLI) وتُجرى الزيارة الميدانية.</p><em>المرحلة الثانية</em></div>
        </div>
        <p class="sl__claim">لو رُفعت المشاركة عند التسجيل لفازت الجهة التي تُحسن الكتابة، لا التي تُحسن الأداء.</p>
        <p class="sl__fn">في النموذج التجريبي: ${nFiles(st.cases)} كانت ستُقيَّم بشرياً بدل ${ar(st.qualified)} <span class="pl">محاكاة</span></p>
      </div>`);
    },

    /* 4 · المسار */
    () => {
      const nodes = [
        ['التسجيل', 'الجهة', 'مفتوح لكل القطاعات', 'هوية وتفويض'],
        ['الأهلية', 'المنصّة آلياً', 'ثلاثة شروط قاطعة', 'حكم فوري'],
        ['المرحلة ' + ar(1), 'اللجنة العلمية', 'مؤشرات الأداء (LeTCI)', `أفضل ${ar(STAGES[0].cut)}`],
        ['المرحلة ' + ar(2), 'مقيّمان وخبير', 'نظام العمل (ADLI) وزيارة', `أفضل ${ar(STAGES[1].cut)}`],
        ['المرحلة ' + ar(3), 'لجنة التحكيم', 'قرار الاعتماد', `حتى ${ar(STAGES[2].cut)} في الفئة`]
      ];
      return frame(3, 'المسار', `
      <h2>ملف واحد يمرّ بخمس محطات، ولكل محطة صاحبها</h2>
      <div class="sl__body mid">
        <div class="stp">${nodes.map(([n, who, how, out], i) => `
          <div><span class="no">${ar(i + 1)}</span><span class="nm">${esc(n)}</span><span class="ow">${esc(who)}</span><span class="mt">${esc(how)}</span><span class="ou">${esc(out)}</span></div>`).join('')}
        </div>
        <p class="stl-h">حالات الملف الثماني — الذهب لا يُمنح إلا بعد اعتماد لجنة التحكيم</p>
        <div class="stl">${['ineligible', 'out1', 'qualified', 'out2', 'finalist', 'honored', 'winner', 'blocked'].map(k => stateBadge(k)).join('')}</div>
      </div>`);
    },

    /* 5 · العدالة */
    () => frame(4, 'العدالة', `
      <h2>العدالة تُفرض بالشاشة، لا باللائحة وحدها</h2>
      <div class="sl__body">
        <table class="st">
          <thead><tr><th>الحماية</th><th>ما تمنعه</th><th>ما يحدث على الشاشة</th></tr></thead>
          <tbody>
            <tr><td>الحجاب</td><td class="mt">أن يرى المقيّم الثاني حكم الأول</td><td>لا تظهر درجة الزميل قبل أن ترسل درجتك</td></tr>
            <tr><td>عتبة التباعُد (${ar(CFG.divergence)} نقطة)</td><td class="mt">تحويل حكمين متباعدين إلى رقم واحد بصمت</td><td>يتوقف الاعتماد ويختفي زره حتى يُوحَّد</td></tr>
            <tr><td>تعارض المصالح</td><td class="mt">أن يقيّم المقيّم جهته</td><td>يُستبعد من الإسناد ويُسجَّل السبب</td></tr>
            <tr><td>فصل اللجان</td><td class="mt">انفراد جهة بالقرار النهائي</td><td>التحكيم لا يرى هوية المقيّم، والأمانة لا ترى درجة قبل الاعتماد</td></tr>
            <tr><td>لا فائز قبل الاعتماد</td><td class="mt">إعلان فائز من حساب لم يُعتمد</td><td>المحصّلة تُعرض محصّلة، والحالة لا تتغيّر حتى يعتمد رئيس التحكيم بمبرَّر</td></tr>
          </tbody>
        </table>
        <p class="sl__fn">وكل فعل يُسجَّل: من فعل، ومتى، وبأي صلاحية. هذا هو السجلّ الذي تطلبه لجنة التظلّم.</p>
      </div>`),

    /* 6 · اختُبرت على النتيجة */
    () => frame(5, 'الاختبار', `
      <h2>اختُبرت على نتيجة الحفل، فعدّلت أربعة أشياء</h2>
      <div class="sl__body bw">
        <div class="bn"><b>${ar(RESULT_COUNT)}</b><span>${nEnts(RESULT_COUNT)} في ${nCats(CATS.length)}</span><em>من ${ar(CATS.length * 3)} مقعداً ممكناً. لم تُملأ المقاعد بمن لم يستحق.</em></div>
        <div class="cg">
          <div class="th"><span></span><span>كان</span><span>صار</span></div>
          <div><span class="h">الفئة</span><span class="was">التصفية على مستوى المسار</span><span class="now">التصفية والتتويج داخل الفئة. إنقاذ الأرواح توّج ${ar(5)} جهات في ${ar(3)} فئات.</span></div>
          <div><span class="h">وحدة التنافس</span><span class="was">كل مشارك جهة</span><span class="now">تجمّع أو منشأة مفردة أو جهة أم. الجهة الأم لا تدخل مساراً.</span></div>
          <div><span class="h">الأوسمة</span><span class="was">أوسمة عامة</span><span class="now">ثلاثة مسمّاة: نضج إدارة الأداء، وتجربة الموظفين، وتجربة المريض.</span></div>
          <div class="fix"><span class="h">القطاع الخاص</span><span class="was">الربط الجزئي يُسقط أغلب الملفات</span><span class="now">الربط الجزئي عقبة تُعالَج باتفاق بيانات، لا سقف. حكمٌ صُحِّح.</span></div>
        </div>
      </div>`),

    /* 7 · القرارات */
    () => frame(6, 'القرارات', `
      <h2>ما لا يحلّه النظام يحتاج قراراً</h2>
      <div class="sl__body">
        <table class="st">
          <thead><tr><th>القرار</th><th>لماذا يهمّ</th><th>الجهة المقترحة</th><th>وضعه الآن</th></tr></thead>
          <tbody>${DECISIONS.map(x => `
            <tr><td>${esc(x.d)}</td><td class="mt">${esc(typeof x.why === 'function' ? x.why() : x.why)}</td><td>${esc(x.who)}</td>
            <td><span class="tg ${x.tone ? 'tg--' + x.tone : ''}">${esc(x.now)}</span></td></tr>`).join('')}
          </tbody>
        </table>
        <p class="sl__fn">الجهات المقترحة من اللجان الست في دليل الجائزة، والاقتراح لمن يملك الاعتماد.</p>
      </div>`),

    /* 8 · الحقيقي والمحاكاة */
    () => frame(7, 'الحقيقي والمحاكاة', `
      <h2>الحقيقي والمحاكاة، بلا خلط</h2>
      <div class="sl__body">
        <div class="rs">
          <div><p class="h"><i></i>من الدليل</p><ul>
            <li>المسارات الستة والمراحل الثلاث وعتبات <span class="nw">${ar(STAGES[0].cut)} ← ${ar(STAGES[1].cut)} ← ${ar(STAGES[2].cut)}</span></li>
            <li>شروط الأهلية الثلاثة واللجان الست</li>
            <li>مقيّمان وخبير، ثم توحيد بالتوافق</li>
            <li>إطار بالدريج، ونموذجا ADLI وLeTCI</li>
            <li>نافذة التظلّم ${ar(CYCLE.appealWeeks)} أسابيع</li></ul></div>
          <div><p class="h"><i></i>من الإعلان الرسمي</p><ul>
            <li>أسماء الفائزين الـ${ar(RESULT_COUNT)}</li>
            <li>الفئات داخل المسارات</li>
            <li>الأوسمة الثلاثة وأصحابها</li>
            <li>لا درجة منشورة لأي فائز، فلا درجة معروضة</li></ul></div>
          <div class="sim"><p class="h"><i></i>محاكاة</p><ul>
            <li>قيم المؤشرات لـ${nEnts(ENTITIES.length)} (${nFiles(CASES.length)})</li>
            <li>درجات المقيّمين</li>
            <li>المستهدفات الرقمية</li>
            <li>أسماء أعضاء اللجان</li></ul></div>
        </div>
        <p class="sl__fn">نموذج مستقل: لا يمثّل وزارة الصحة ولا يصدر عنها.</p>
      </div>`),

    /* 9 · الخطوة التالية */
    () => frame(8, 'الخطوة التالية', `
      <h2>الخطوة التالية: فئة واحدة ببيانات حقيقية</h2>
      <div class="sl__body">
        <div class="nx">
          <ol>
            <li><div><b>نختار فئة واحدة</b> محدودة العدد، لتبقى التجربة قابلة للمتابعة.</div></li>
            <li><div><b>نربط مؤشراتها</b> بالمصدر الرسمي بدل القيم المولَّدة.</div></li>
            <li><div><b>نشغّل عليها كل المراحل</b>: التقييم والتوحيد والتحكيم والتظلّم. ثم نقيس: كم يوماً وفّرنا؟ وكم تظلّماً سقط قبل أن يُكتب؟</div></li>
          </ol>
          <div class="nx__n"><h3>ما نحتاجه</h3><ul>
            <li>اعتماد الأوزان من اللجنة العلمية</li>
            <li>جهة تملك البيانات وتتيحها</li>
            <li>مراجعة قانونية لنص الإقرار</li></ul></div>
        </div>
        <div class="nx__cta">
          <button type="button" class="dk__cta" data-dk="tour">${ic('play')}شاهد المنصّة تعمل</button>
          <span>فكرة وتنفيذ <span dir="ltr">MOAYAD ABOONQ</span></span>
        </div>
      </div>`)
  ];

  /* ============ المشغِّل ============ */
  const D = { el: null, i: 0, opener: null, tx: 0 };
  const N = SLIDES.length;

  function build() {
    if (D.el) D.el.remove();
    const el = document.createElement('div');
    el.className = 'dk'; el.id = 'deck'; el.tabIndex = -1; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'العرض التنفيذي');
    el.innerHTML = `
      <div class="dk__bar">
        <div class="dk__brand"><span class="mk">أداء</span><span>جائزة أداء الصحة <small>عرض تنفيذي</small></span></div>
        <div class="dk__ctl">
          <button type="button" class="dk__btn" data-dk="full" title="ملء الشاشة (F)" aria-label="ملء الشاشة">${ic('full')}</button>
          <button type="button" class="dk__btn" data-dk="close" title="إغلاق (Esc)" aria-label="إغلاق العرض">${ic('x')}</button>
        </div>
      </div>
      <div class="dk__main">
        <button type="button" class="dk__nav dk__nav--prev" data-dk="prev" aria-label="الشريحة السابقة">${ic('prev')}</button>
        <div class="dk__stage" aria-live="polite">${SLIDES.map(f => f()).join('')}</div>
        <button type="button" class="dk__nav dk__nav--next" data-dk="next" aria-label="الشريحة التالية">${ic('next')}</button>
      </div>
      <div class="dk__foot">
        <span class="dk__cnt"></span>
        <div class="dk__prog">${SLIDES.map((_, i) => `<button type="button" data-dk="go" data-i="${i}" aria-label="الشريحة ${ar(i + 1)}"></button>`).join('')}</div>
        <span class="dk__note">نموذج مستقل غير تابع لوزارة الصحة — الأرقام محاكاة إلا صفحة النتائج</span>
      </div>`;
    el.addEventListener('click', onClick);
    el.addEventListener('touchstart', e => { D.tx = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - D.tx;
      if (Math.abs(dx) > 60) go(D.i + (dx > 0 ? 1 : -1));   // القراءةُ من اليمين: السحبُ يميناً يُظهر التالي
    }, { passive: true });
    document.body.appendChild(el);
    D.el = el;
  }

  function go(n) {
    n = Math.max(0, Math.min(N - 1, n)); D.i = n;
    D.el.querySelectorAll('.sl').forEach((s, i) => s.classList.toggle('on', i === n));
    D.el.querySelectorAll('.dk__prog button').forEach((b, i) => {
      b.classList.toggle('on', i === n); b.classList.toggle('past', i < n);
      if (i === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    D.el.querySelector('.dk__cnt').textContent = `${ar(n + 1)} / ${ar(N)}`;
    D.el.querySelector('[data-dk="prev"]').disabled = n === 0;
    D.el.querySelector('[data-dk="next"]').disabled = n === N - 1;
    const stage = D.el.querySelector('.dk__stage'); if (stage) stage.scrollTop = 0;
  }

  function onClick(e) {
    const b = e.target.closest('[data-dk]'); if (!b) return;
    const a = b.dataset.dk;
    if (a === 'close') close();
    else if (a === 'prev') go(D.i - 1);
    else if (a === 'next') go(D.i + 1);
    else if (a === 'go') go(+b.dataset.i);
    else if (a === 'full') fullscreen();
    else if (a === 'tour') { close(); if (window.startTour) window.startTour(); }
  }

  function fullscreen() {
    try {
      const d = document;
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
      else { const el = D.el; (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
    } catch (_) { /* بعضُ المضيفين يمنع ملء الشاشة — لا يضرّ */ }
  }

  function onKey(e) {
    if (!D.el || D.el.hidden) return;
    const k = e.key, onBtn = e.target.closest && e.target.closest('button');
    if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'ArrowLeft' || k === 'PageDown') { e.preventDefault(); go(D.i + 1); }
    else if (k === 'ArrowRight' || k === 'PageUp') { e.preventDefault(); go(D.i - 1); }
    else if ((k === ' ' || k === 'Enter') && !onBtn) { e.preventDefault(); go(D.i + 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N - 1); }
    else if (k === 'f' || k === 'F') { fullscreen(); }
    else if (/^[1-9]$/.test(k)) { go(+k - 1); }
    else if (k === 'Tab') {                       // حبسُ التركيز داخل العرض
      const f = [...D.el.querySelectorAll('button:not(:disabled)')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }

  function open(i = 0) {
    if (window.tourActive && window.tourActive()) window.stopTour(true);
    D.opener = document.activeElement;
    build(); go(i);
    D.el.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey, true);
    D.el.focus();
  }

  function close() {
    if (!D.el) return;
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {}
    document.removeEventListener('keydown', onKey, true);
    D.el.remove(); D.el = null;
    document.documentElement.style.overflow = '';
    const back = (D.opener && D.opener.isConnected) ? D.opener : document.querySelector('[data-open-deck]');
    if (back && back.focus) back.focus();
  }

  window.openDeck = open;
  window.closeDeck = close;
})();
