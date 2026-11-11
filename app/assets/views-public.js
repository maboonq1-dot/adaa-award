/* جائزة أداء الصحة — الواجهة المُعرِّفة: الجائزة، والمسارات، والمنهجية، والحوكمة */

function pageHead(title, sub, actions = '', crumb = '') {
  return `${crumb ? `<div class="crumb">${crumb}</div>` : ''}
  <div class="ph"><div class="ph__t"><h1>${esc(title)}</h1>${sub ? `<p class="ph__s">${sub}</p>` : ''}</div>
  ${actions ? `<div class="ph__a">${actions}</div>` : ''}</div>`;
}

/* ============ الصفحة الأولى ============ */
function viewHome() {
  const st = cycleStats();
  const b = boards();

  const trackCards = TRACKS.map(t => {
    const tt = trackTotals(t.id);
    const wins = tt.winners.map(id => E(CASE(id).entity).name);
    return `<a class="card" href="#/track/${t.id}" style="text-decoration:none;color:inherit">
      <div class="row" style="gap:8px;margin-block-end:6px">${ic('track')}<h3 style="font-size:14px">${esc(t.short)}</h3>
        ${t.cats.length > 1 ? pill(ar(t.cats.length) + ' فئات', 'i') : ''}</div>
      <p class="sm mut" style="min-block-size:52px">${esc(t.aim)}</p>
      <div class="row sm" style="gap:var(--s-4)">
        <span class="tag"><i>مُسجَّل</i>${ar(tt.all)}</span>
        <span class="tag"><i>مؤهَّل</i>${ar(tt.eligible)}</span>
        <span class="tag"><i>متأهّل</i>${ar(tt.qualified)}</span>
      </div>
      ${wins.length ? `<div class="hn__s" style="margin-block-start:8px">${ic('medal')} ${esc(wins.join(' · '))}</div>`
            : `<div class="sm mut" style="margin-block-start:8px">${ic('flat')} لم تُعتمد نتيجةُ فئاته بعد</div>`}
    </a>`;
  }).join('');

  return `
  ${pageHead('جائزة أداء الصحة · ' + CYCLE.name + ' ' + ar(CYCLE.year),
    'منصّةُ إدارة الجائزة: تسجيلُ الجهات، وبوّابةُ الأهليّة، وتقييمُ المرحلتين، وقاعةُ التحكيم، والحجبُ والتظلّم — في مسارٍ واحدٍ موثَّقٍ من التسجيل إلى الوسام.',
    link('سجِّل جهتك', '#/register', 'p') + link('لوحة الجائزة', '#/board'))}

  ${card(`<div class="rowj" style="align-items:flex-start">
      <div style="flex:1 1 420px">
        <p class="lead" style="margin-block-end:var(--s-4)">
          تُكرِّم الجائزةُ المنشآت الصحية التي تحقّق تميّزاً <b>مستداماً وقابلاً للقياس</b> في الجودة
          والكفاءة حول المريض. وتعتمد <b>${CYCLE.name}</b> منهجيّةَ التفكير المنظوميّ المبنيّة على
          إطار <b>مالكولم بالدريج</b> للتميّز المؤسّسيّ المستدام، مع الحفاظ على مسارات تميّز الأداء الستّة.</p>
        <div class="row">
          ${pill('٦ مسارات', 'g')} ${pill('٣ مراحل للتقييم', 'i')}
          ${pill('مواءمةٌ كاملة مع رؤية ٢٠٣٠', 'g')} ${pill('١٠٠ عام على أوّل مديريّة للصحة', 'au')}
        </div>
      </div>
      <div class="grid g-4" style="flex:1 1 300px;min-inline-size:280px">
        ${stat(ar(st.cases), 'ملفّ مشاركة', 'من ' + nEnt(st.entities))}
        ${stat(ar(st.eligible), 'اجتاز الأهليّة', 'من ' + ar(st.cases), 'ink')}
        ${stat(ar(st.finalists), 'بلغ التحكيم', 'أفضل ٥ لكلّ فئة', 'gold')}
        ${stat(ar(st.diverging), 'تباعُدٌ مفتوح', 'يلزمه حوارُ توحيد', st.diverging ? 'red' : '')}
      </div>
    </div>`)}

  ${card(head('المسارات الستّة', 'يتواءم كل مسارٍ مع رؤية السعودية ٢٠٣٠ وبرنامج تحوّل القطاع الصحي، بما يدعم نموذج الرعاية الصحية، ورفع الكفاءة، والتصدّي للعبء المتزايد من الأمراض.')
    + `<div class="grid g-3">${trackCards}</div>`)}

  ${card(head('المراحل الثلاث', 'مسارٌ عادلٌ قائمٌ على الأدلّة، يعمل على نحوٍ تدريجيّ لتأهيل الجهات الأعلى أداءً في كل مسار.')
    + `<div class="grid g-3">${STAGES.map(s => `
      <div class="card card--flat">
        <div class="row" style="margin-block-end:6px">
          <span class="rub__k">${ar(s.id)}</span><b>${esc(s.name)}</b>
        </div>
        <p class="sm mut">${esc(s.desc)}</p>
        <div class="hr" style="margin-block:var(--s-3)"></div>
        <div class="rowj sm">
          <span>${pill(s.cutLabel, 'i')}</span>
          <span class="mut">${esc(s.owner)}</span>
        </div>
      </div>`).join('')}</div>`)}

  ${card(head('نتائج الدورة الثامنة — أُعلِنت', RESULTS.headline + ' في ' + dt(RESULTS.day) + '.',
      pill('بياناتٌ حقيقية', 'g') + link('الصفحة كاملةً', '#/results', 'gold'))
    + `<div class="honor">${RESULTS.medals.map(m => {
        const md = MEDALS.find(x => x.id === m.medal);
        return `<div class="hn"><div class="hn__m">${esc(md.no)}</div>
          <div style="min-inline-size:0"><b>${esc(md.name)}</b><em style="color:var(--text)">${esc(m.winner)}</em></div></div>`;
      }).join('')}</div>
    <div class="hr"></div>
    <div class="grid g-3">${RESULTS.tracks.map(rt => {
        const t = T(rt.track), n = rt.cats.reduce((a, c) => a + c.winners.length, 0);
        return `<a class="card card--flat" href="#/results" style="text-decoration:none;color:inherit">
          <div class="rowj"><b class="sm">${esc(t.short)}</b>${pill(num(n, '', 'جهتان', 'جهاتٍ', 'جهةً'), 'au')}</div>
          <div class="sm mut" style="margin-block-start:4px">${rt.cats.flatMap(c => c.winners.map(w => esc(w[0]))).join(' · ')}</div>
        </a>`;
      }).join('')}</div>`)}

  ${card(head('ما الذي يحصل عليه الفائزون؟', 'يحتفي كلُّ مسارٍ بالجهات الأعلى أداءً، مع منح تكريماتٍ إضافية للجهات التي تُظهر أثراً استثنائياً يُحدث تحوّلاً ملموساً على مستوى المنظومة.')
    + `<div class="honor">${HONORS.map(h => `
      <div class="hn"><div class="hn__m">${h.no}</div>
        <div><b>${esc(h.name)}</b><em>${esc(h.desc)}</em><div class="hn__s">${esc(h.scope)}</div></div></div>`).join('')}</div>
    <div class="row sm mut" style="margin-block-start:var(--s-4)">${GIFTS.map(g => pill(g, 'au')).join(' ')}</div>`)}

  ${card(head('جدول الدورة', 'الحالة محدَّثةٌ إلى تاريخ اليوم في هذه النسخة التجريبية.')
    + timelineHtml())}

  <div class="credit">
    <span class="credit__l">فكرةٌ وتنفيذ</span>
    <b class="credit__n" dir="ltr">MOAYAD ABOONQ</b>
  </div>
  `;
}

function timelineHtml() {
  const tl = timelineView();
  return `<div class="tl">${tl.map((x, i) => `
    <div class="tl__i tl__i--${x.s}">
      <div class="tl__d">${dt(x.d)}</div>
      <div class="tl__m"><i></i>${i < tl.length - 1 ? '<s></s>' : ''}</div>
      <div class="tl__t">${esc(x.t)}<em>${esc(x.who)}${x.s === 'now' ? ' · جارٍ الآن' : ''}</em></div>
    </div>`).join('')}</div>`;
}

/* ============ المنهجية ============ */
function viewMethod() {
  const dimCard = (list, title, note_, model) => card(
    head(title, note_, pill(model, 'i')) +
    `<div class="rub">${list.map(d => `
      <div class="rub__row">
        <div class="rub__h"><span class="rub__k">${esc(d.k)}</span><b>${esc(d.name)}</b>
          <span class="sm mut">${esc(d.en)}</span></div>
        <div class="rub__q">${esc(d.q)}</div>
        <div class="rub__anch">${d.anchors.map((a, i) => `
          <div style="border:1px solid var(--line);border-radius:var(--r-sm);padding:7px 8px;font-size:10.5px;line-height:1.5;color:var(--text-2);background:var(--surface-2)">
            <i style="font-style:normal;font-family:var(--f-num);font-size:10px;opacity:.7;display:block;margin-block-end:2px">${ar([0, 30, 60, 85][i])}–${ar([25, 55, 80, 100][i])}</i>${esc(a)}</div>`).join('')}</div>
      </div>`).join('')}</div>`);

  const w = CFG.letci;
  return `
  ${pageHead('المنهجية', 'تستند الجائزة إلى إطار مالكولم بالدريج للتميّز المؤسّسيّ المستدام. وما لا يحسمه الدليل يُعلَن هنا افتراضاً — لا يُدسّ في الحساب.')}

  ${card(head('في إيجاز')
    + `<div class="grid g-2">
      ${[['تستند إلى إطار مالكولم بالدريج للتميّز المؤسّسيّ المستدام.', 'method'],
         ['يُقيّم نموذج ADLI العملياتِ وفق أربعة أبعاد: المنهجية، والتطبيق، والتعلّم، والتكامل.', 'split'],
         ['يُقيّم نموذج LeTCI النتائجَ وفق أربعة أبعاد: المستويات، والاتجاهات، والمقارنات، والتكامل.', 'board'],
         ['تقييمٌ مستقلّ، ومراجعةٌ توافقيّة، وزيارةٌ ميدانية للتحقّق.', 'visit']]
        .map(([t, i], n) => `<div class="row" style="align-items:flex-start;gap:var(--s-3)">
          <span class="rub__k">${ar(n + 1)}</span><div>${ic(i)} ${esc(t)}</div></div>`).join('')}
    </div>`)}

  ${dimCard(LETCI, 'أبعاد النتائج · LeTCI', 'تُطبَّق في المرحلة الأولى على مؤشّرات الأداء، وفي المرحلة الثانية على النتائج المعروضة في الاستمارة.', 'LeTCI')}
  ${dimCard(ADLI, 'أبعاد العمليات · ADLI', 'تُطبَّق في المرحلة الثانية على منظومة العمل: التخطيط، والتنفيذ، والمتابعة، والتحسين، والاستدامة.', 'ADLI')}

  ${card(head('الأوزان والعتبات', 'هذه أرقامٌ تحكم الحساب. المكتوب بالأخضر منصوصٌ عليه في الدليل، والمكتوب بالكهرمانيّ افتراضُ المنصّة.')
    + table([['البند'], ['القيمة', 'c'], ['المصدر'], ['ماذا يعني تغييرُها']], [
      ['نصيب المرحلة الأولى', pc(CFG.w1 * 100, 0), 'assume', 'الدليل لا يذكر وزناً للمراحل. أُخِذ ٥٠٪ لأنه الوزن المُعلَن في الأدبيات السابقة للجائزة.'],
      ['نصيب المرحلة الثانية', pc(CFG.w2 * 100, 0), 'assume', 'رفعُه يُعلي منظومةَ العمل على النتيجة الرقمية، وخفضُه يعكس ذلك.'],
      ['المرحلة الثالثة', 'قرارٌ لا درجة', 'text', '«مراجعةٌ نهائية من لجنة التحكيم لتأكيد الجهات الفائزة» — قرارٌ يعتمد الترتيب أو يعدّله بمبرَّر، لا درجةٌ تُضاف.'],
      ['أوزان LeTCI', `${pc(w.Le * 100, 0)}، ${pc(w.T * 100, 0)}، ${pc(w.C * 100, 0)}، ${pc(w.I * 100, 0)}`, 'assume', 'المستويات ثم الاتجاهات: الجائزةُ تكافئ الأداء المستدام لا القفزة الواحدة.'],
      ['أوزان المرحلة الثانية', `عمليات ${pc(CFG.s2.adli * 100, 0)}، نتائج ${pc(CFG.s2.letci * 100, 0)}، زيارة ${pc(CFG.s2.visit * 100, 0)}`, 'assume', 'الزيارةُ تحقُّقٌ لا درجةُ تجميل: وزنُها يكفي لأن تُسقِط ملفّاً لا يصمد على الأرض.'],
      ['عتبة تباعُد المُحصّلة', ar(CFG.divergence) + ' نقطة', 'assume', 'فوقها يُلزَم حوارُ التوحيد بحضور خبير اللجنة العلمية، ويُوقَف اعتمادُ المسار.'],
      ['عتبة تباعُد البُعد المفرد', ar(CFG.dimGap) + ' نقطة', 'assume', 'أوسعُ من خطوةِ مرسًى واحدة — أي أن المقيّمَيْن لم يختارا مرسيين متجاورين. ذاك خلافٌ في قراءة البند، وما دونه شدّةُ مُقيِّم.'],
      ['نسبة بلوغ المستهدفات', pc(CFG.metRatio * 100, 0), 'assume', 'الدليل يشترط «أداءً يحقّق المستهدفات الوطنية أو يتجاوزها» دون نسبة. رفعُها يُضيّق البوّابة.'],
      ['طول الاتجاه', ar(CFG.cycles) + ' دورات', 'text', '«اتجاهٌ إيجابيّ لثلاث دوراتٍ متتالية» — نصٌّ صريح.'],
      ['موضعُ التصفية', 'داخل الفئة', 'assume', 'الدليل يقول «أفضل ١٠ لكلّ مسار»، ونتيجةُ الدورة الثامنة توّجت في مسار إنقاذ الأرواح خمسَ جهاتٍ في ثلاث فئات — أي أن التتويج يقع في الفئة. ولمّا كان آخرُ الغربال في الفئة وجب أن يكون أوّلُه فيها، وإلّا خلَت فئةٌ من مرشَّحين.'],
      ['حجمُ التتويج', 'حتى ٣ لكلّ فئة', 'assume', 'رعايةُ الأمومة توّجت جهتين لا ثلاثاً في الدورة الثامنة — فالعتبةُ سقفٌ لا حصّةٌ تُملأ.'],
      ['نافذة التظلّم', ar(CYCLE.appealWeeks) + ' أسابيع', 'text', 'من تاريخ حفل الجائزة وإعلان النتائج.']
    ].map(([a, b_, src, why]) => `<tr>
        <td><b>${esc(a)}</b></td>
        <td class="c n"><b>${b_}</b></td>
        <td>${src === 'text' ? pill('نصُّ الدليل', 'g') : pill('افتراضُ المنصّة', 'a')}</td>
        <td class="mut">${esc(why)}</td></tr>`))
    + note('<b>لماذا تُعرَض الأوزان بدل أن تُخفى؟</b> لأن أوّل ما يُطعَن فيه في أيّ جائزةٍ هو الوزن، لا الدرجة. جهةٌ تعرف أن العمليات ٦٠٪ من المرحلة الثانية تعرف أين تستثمر، وجهةٌ تُفاجَأ بالوزن بعد النتيجة تملك حُجّةَ تظلُّمٍ صحيحة.', 'i', 'verdict')
  )}

  ${card(head('لماذا مقيّمان وخبير — لا مقيّمٌ واحد؟')
    + `<p class="lead">نصُّ الدليل: «يُقيَّم كلُّ مسارٍ بصورةٍ مستقلّة من قِبَل مقيّمَيْن اثنين، إلى جانب خبيرٍ عن اللجنة العلمية،
       ثم تُوحَّد النتائج بالتوافق، وتُعتمد نهائياً من لجنة التحكيم».</p>
    <div class="grid g-3">
      ${[['الحجاب', 'lock', 'لا يرى المقيّمُ درجةَ زميله قبل إرسال درجته. أوّلُ ما يُفسِد التقييم المزدوج هو أن يرى الثاني حكمَ الأول.'],
         ['التباعُد', 'split', `فرقٌ فوق ${ar(CFG.divergence)} نقطة بين المقيّمَيْن ليس خطأً — بل إشارةٌ إلى أن البند نفسه يحتمل قراءتين. المنصّة تُوقِف الاعتماد وتفتح الحوار.`],
         ['التوحيد', 'merge', 'الخبير طرفٌ ثالثٌ يُدير الحوار ولا يملك ترجيحاً منفرداً. الدرجةُ الموحَّدة تُسجَّل بمبرَّرٍ مكتوب يُقرأ في التظلّم.']]
        .map(([t, i, d]) => `<div class="card card--flat">
          <div class="row" style="margin-block-end:6px">${ic(i)}<b>${esc(t)}</b></div>
          <p class="sm mut" style="margin:0">${esc(d)}</p></div>`).join('')}
    </div>`)}
  `;
}

/* ============ الحوكمة ============ */
function viewGov() {
  return `
  ${pageHead('الحوكمة واللجان', 'تتوزّع مسؤوليات التقييم والتحكيم بين جهاتٍ متخصّصة، بما يضمن استقلالية عملية التقييم وعدم انفراد أيّ جهةٍ باتخاذ القرار النهائي.')}

  ${card(head('ستّ لجانٍ منفصلة لضمان العدالة')
    + `<div class="grid g-2">${COMMITTEES.map(c => `
      <div class="card card--flat">
        <div class="rowj" style="margin-block-end:6px"><b>${esc(c.name)}</b>${pill(c.stage, 'i')}</div>
        <p class="sm mut">${esc(c.role)}</p>
        <div class="row sm">${c.can.map(x => pill(x)).join(' ')}</div>
      </div>`).join('')}</div>`)}

  ${card(head('من يرى ماذا — مصفوفة الصلاحيات',
      'الفصلُ ليس تنظيمياً فقط: المنصّة تمنع تقنياً ما تمنعه اللائحة. المُقيِّم لا يرى ترتيب الفئة حتى لا يُقيّم بالموقع، ولجنةُ التحكيم لا ترى هويّة المُقيِّم حتى لا تُقيَّم الدرجةُ بقائلها.')
    + table([['الدور'], ['ملفّ جهته', 'c'], ['ملفّ مُسنَد', 'c'], ['درجة زميله', 'c'], ['ترتيب الفئة', 'c'], ['هويّة المُقيِّم', 'c'], ['السجلّ', 'c']],
      [['ممثّل الجهة',          1, 0, 0, 0, 0, 0],
       ['مُقيِّم',               0, 1, 2, 0, 1, 0],
       ['خبير اللجنة العلمية',  0, 1, 1, 0, 1, 0],
       ['رئيس اللجنة العلمية',  0, 1, 1, 1, 1, 1],
       ['عضو لجنة التحكيم',     0, 1, 1, 1, 0, 0],
       ['لجنة الحجب والتظلّم',  0, 1, 1, 1, 1, 1],
       ['أمانة الجائزة',        0, 0, 0, 1, 0, 1]]
      .map(r => `<tr><td><b>${esc(r[0])}</b></td>${r.slice(1).map(v =>
        v === 2 ? `<td class="c">${pill('بعد إرسال درجته', 'a')}</td>`
        : `<td class="c">${v ? `<span class="yn yn--y">${ic('check')}</span>` : `<span class="yn yn--n" style="opacity:.45">${ic('x')}</span>`}</td>`).join('')}</tr>`))
    + note('<b>قاعدةُ تعارض المصالح.</b> لا يُسنَد ملفٌّ إلى مُقيِّمٍ ينتمي إلى الجهة صاحبة الملفّ. المنصّة تمنع الإسناد وتسجّل سببَ المنع في السجلّ — فالمنعُ الصامت لا يُثبِت نزاهةً عند التظلّم.', 'g', 'shield'))}

  ${card(head('الحجب والتظلّم', `للمنشآت الحقّ في تقديم تظلُّمها خلال مدّةٍ أقصاها ${ar(CYCLE.appealWeeks)} أسابيع من تاريخ حفل الجائزة وإعلان النتائج.`)
    + kv([
      ['قناة التقديم', `البريد الإلكترونيّ المخصّص · <span class="num" dir="ltr">${CYCLE.email}</span>`],
      ['بدء المدّة', dt(CYCLE.ceremony) + ' — تاريخ حفل الجائزة وإعلان النتائج'],
      ['الجهة الناظرة', 'لجنة الحجب والتظلّم'],
      ['نطاق النظر', 'حالات الحجب، والتظلّمات، والتحقّق من سلامة الإجراءات وفق الضوابط المعتمدة']
    ]))}
  `;
}

/* ============ صفحة مسار: بوّابةٌ إلى فئاته ============ */
function viewTrack(tid) {
  const t = T(tid); if (!t) return viewHome();
  const tt = trackTotals(tid);
  const b = boards();
  const single = t.cats.length === 1;

  return `
  ${pageHead(t.name, t.aim,
    link('كل المسارات', '#/board') + link('التسجيل', '#/register'),
    `<a href="#/board">لوحة الجائزة</a> ${ic('arrow')} ${esc(t.short)}`)}

  ${t.altName ? note(`<b>اسمان لمسارٍ واحد.</b> دليلُ الدورة الثامنة يسمّيه «${esc(t.name)}»، ونشرةُ الحفل تسمّيه «${esc(t.altName)}». اعتمدت المنصّةُ اسمَ الدليل وأبقت الآخر ظاهراً — في الجوائز المسمّى عقدٌ لا عنوان، و«الاستدامة» تفتح باباً للتقييم لا يفتحه حذفُها.`, 'a', 'warn') : ''}

  <div class="grid g-4">
    ${stat(ar(t.cats.length), single ? 'فئةٌ واحدة' : 'فئاتٌ للتنافس', single ? 'لا تقسيمَ داخليّ' : 'لكلٍّ ترتيبُها وفائزُها', 'ink')}
    ${stat(ar(tt.all), 'ملفّ مشاركة')}
    ${stat(ar(tt.eligible), 'اجتاز الأهليّة', pc(tt.all ? tt.eligible / tt.all * 100 : 0, 0))}
    ${stat(ar(tt.finalists), 'بلغ التحكيم', 'أفضل ٥ لكلّ فئة', 'gold')}
  </div>

  ${card(head(single ? 'الفئة' : 'فئات المسار',
      single ? 'مسارٌ بفئةٍ واحدة: التنافسُ فيه على مستوى المسار نفسه.'
             : 'التصفيةُ والتتويجُ يقعان داخل الفئة. جهةٌ تتنافس في فئةٍ لا تُقارَن بجهةٍ في أخرى، لأن الحزمةَ مختلفة.')
    + `<div class="grid g-2">${t.cats.map(cat => {
        const bb = b[cat.key];
        const win = bb.order ? E(CASE(bb.order[0]).entity).name : null;
        return `<a class="card card--flat" href="#/cat/${cat.key}" style="text-decoration:none;color:inherit">
          <div class="rowj" style="margin-block-end:6px"><b>${esc(single ? 'الفئة العامة' : cat.short)}</b>
            ${pill(cat.unit === 'cluster' ? 'تجمّعات' : cat.unit === 'hospital' ? 'منشآت مفردة' : 'تجمّعاتٌ ومنشآت', 'i')}</div>
          ${single ? '' : `<p class="sm mut" style="margin-block-end:6px">${esc(cat.name)}</p>`}
          <div class="row sm" style="gap:var(--s-4)">
            <span class="tag"><i>مُسجَّل</i>${ar(bb.counts.all)}</span>
            <span class="tag"><i>مؤهَّل</i>${ar(bb.counts.eligible)}</span>
            <span class="tag"><i>نهائيّ</i>${ar(bb.counts.finalists)}</span>
            ${bb.counts.diverging ? '<span class="tag" style="color:var(--r-500)"><i>تباعُد</i>' + ar(bb.counts.diverging) + '</span>' : ''}
          </div>
          <div class="sm" style="margin-block-start:8px">${win ? `<span style="color:var(--au-700)">${ic('medal')} ${esc(win)}</span>`
            : `<span class="mut">${ic('flat')} لم تُعتمد النتيجة بعد</span>`}</div>
          <div class="sm mut" style="margin-block-start:6px">${cat.kpis.map(k => esc(k.name)).join(' · ')}</div>
        </a>`;
      }).join('')}</div>`)}

  ${card(head('حزمة المسار كاملةً', 'اتّحادُ حزم الفئات، والمقاييسُ المشتركة الثلاثة تُقاس في كلّ فئة.')
    + table([['المؤشّر'], ['الفئة'], ['المستهدَف', 'c'], ['الاتجاه', 'c']],
      kpisOfTrack(tid).map(k => {
        const shared = SHARED.some(x => x.id === k.id);
        const owner = t.cats.filter(c => c.kpis.some(x => x.id === k.id));
        return `<tr>
          <td><b>${esc(k.name)}</b></td>
          <td class="sm mut">${shared ? pill('كلُّ الفئات', 'i') : owner.map(c => esc(single ? 'الفئة العامة' : c.short)).join(' · ')}</td>
          <td class="c n">${k.better === 'band' ? ar(k.band[0]) + '–' + ar(k.band[1]) : unit(k.target, k, k.unit === 'يوم' ? 1 : 0)}</td>
          <td class="c">${ic(k.better === 'down' ? 'down' : k.better === 'band' ? 'flat' : 'up')}</td></tr>`;
      }))
    + note('<b>لماذا تُقاس التجربة المشتركة في كل فئة؟</b> لأن فئةً تبلغ مستهدفاتها السريرية بينما تنهار فيها تجربةُ المستفيد أو رضا العاملين لم تبلغ تميّزاً — بلغت رقماً. الدليل يضمّ المقياسين إلى كلّ مسارٍ لهذا السبب، وأوسمةُ الدورة الثامنة الثلاثة اثنان منها على هذين البُعدين وحدهما.', 'i'))}
  `;
}
