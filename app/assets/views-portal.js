/* جائزة أداء الصحة — بوّابة الجهة: التسجيل، والأهليّة، والاستمارة، والأدلّة */

/* حالةُ نموذج التسجيل — حيّةٌ في الذاكرة */
const REG = { step: 1, sector: '', entity: '', cat: '', rep: {}, ack: {}, done: null, err: {} };

/* أقسام استمارة المشاركة — مبنيّةٌ على معايير بالدريج وتُقرأ بـ ADLI */
const FORM = [
  { id: 'S0', name: 'سياق المنشأة', adli: '—',
    q: 'مَن أنتم، ومَن تخدمون، وبأيّ حجمٍ ومواردَ ونطاقٍ جغرافيّ؟ وما التحدّي الأبرز في هذا المسار؟',
    hint: 'السياق ليس مقدّمةً بروتوكولية: بدونه تُقارَن منشأةٌ في مدينةٍ بمنشأةٍ في ريفٍ نائٍ كأنّهما نظيران.' },
  { id: 'S1', name: 'القيادة والتوجّه', adli: 'A',
    q: 'كيف حدّدت القيادةُ أولويّةَ هذا المسار، وبأيّ حوكمةٍ تُتابعها؟',
    hint: 'اذكر المنهجَ لا النيّة: اجتماعاتٌ دوريّة، ومالكٌ معلَن، وقرارٌ مُوثَّق.' },
  { id: 'S2', name: 'المستفيدون والعاملون', adli: 'D',
    q: 'كيف يُسمَع صوتُ المستفيد وصوتُ العامل، وكيف تحوّل إلى تغييرٍ فعليّ؟',
    hint: 'اربط شكوى أو نتيجةَ استبيانٍ بتغييرٍ محدَّدٍ وتاريخِه.' },
  { id: 'S3', name: 'العمليات والتحسين', adli: 'L',
    q: 'ما دورات التحسين التي أُجريَت في المسار خلال الدورات الثلاث، وما الذي تعلّمتموه من فشلٍ منها؟',
    hint: 'دورةُ تحسينٍ بلا فشلٍ مذكورٍ تُقرأ عرضاً لا تعلّماً.' },
  { id: 'S4', name: 'التكامل والاستدامة', adli: 'I',
    q: 'كيف يستمرّ الأثرُ إذا انتقل صاحبُ المبادرة؟ وكيف يتّصل هذا المسار ببقيّة عمليّاتكم؟',
    hint: 'هذا البند يفصل بين نظامٍ يعمل وشخصٍ مجتهد.' },
  { id: 'S5', name: 'النتائج والأدلّة', adli: 'LeTCI',
    q: 'اعرض نتائج مؤشّرات المسار للدورات الثلاث، وأرفِق لكلّ نتيجةٍ دليلَها.',
    hint: 'نصُّ الدليل: «أدلّةٌ داعمة لكلّ نتيجةٍ مُبلَّغٍ عنها». نتيجةٌ بلا دليلٍ لا تُحتسَب.' }
];

/* نافذةُ التسجيل الفعليّة أُغلقت في فبراير: النموذجُ بعدها للتجربة، وهذا يُقال قبل الملء لا بعده */
function regNote() {
  const w = regWindow();
  if (w.st !== 'closed') return '';
  return note(`<b>التسجيل الفعلي أُغلق.</b> أُقفل في ${dt(CYCLE.regClose)}. هذا النموذج للتجربة فقط، ولا يُسجّل شيئاً خارج جلستك.`, 'a', 'warn');
}

/* ============ نموذج التسجيل ============ */
function viewRegister() {
  if (REG.done) return regDone();
  const steps = ['الجهة', 'الممثّل المفوَّض', 'المسار', 'الإقرار'];

  return `
  ${pageHead('تسجيل جهةٍ في ' + CYCLE.name,
    'التسجيل مفتوحٌ لكلّ القطاعات: التجمّعات الصحية، والمستشفيات الجامعية، والقطاعات العسكرية والأمنية، والقطاع الخاص، وغيرها. والتسجيلُ لا يعني القبول — بل يفتح بوّابةَ الأهليّة، وحكمُها يظهر فوراً.')}

  ${note('<b>اقرأ هذا قبل أن تملأ حقلاً.</b> في هذه الجائزة لا تُرشِّح الجهةُ نفسَها بملفٍّ تكتبه. المرحلةُ الأولى تُحسَب من <b>بياناتك الرسمية المُغذّاة أصلاً</b> إلى مصادر وزارة الصحة وشركائها. ما تفعله هنا: تُثبِت هويّتك، وتُفوِّض ممثّلاً، وتختار المسار. أمّا <b>استمارةُ المشاركة</b> فتُفتَح في المرحلة الثانية لأفضل ' + ar(STAGES[0].cut) + ' جهاتٍ في كلّ فئةٍ وحدهم.', 'i', 'verdict')}

  ${regNote()}

  ${card(`<div class="steps">${steps.map((s, i) => `
      <div class="${REG.step === i + 1 ? 'on' : REG.step > i + 1 ? 'ok' : ''}">
        <b>${ar(i + 1)} — ${esc(s)}</b>${REG.step > i + 1 ? 'تمّ' : REG.step === i + 1 ? 'الآن' : 'لاحقاً'}</div>`).join('')}</div>
    ${[regStep1, regStep2, regStep3, regStep4][REG.step - 1]()}`)}
  `;
}

function regStep1() {
  const list = REG.sector ? ENTITIES.filter(e => e.sector === REG.sector) : [];
  return `<div class="form">
    <div class="fld ${REG.err.sector ? 'fld--bad' : ''}" data-tour="reg-sector">
      <label>القطاع <span>*</span></label>
      <div class="opts">${Object.entries(SECTORS).map(([k, v]) => `
        <label class="opt"><input type="radio" name="sector" value="${k}" data-reg="sector" ${REG.sector === k ? 'checked' : ''}>
          <div><b>${esc(v.name)}</b><em>${esc(v.note)}</em></div>
          <span style="margin-inline-start:auto">${v.feed === 'full' ? pill('ربطٌ كامل', 'g') : pill('ربطٌ جزئيّ', 'a')}</span>
        </label>`).join('')}</div>
      ${REG.err.sector ? `<div class="fld__err">${esc(REG.err.sector)}</div>` : ''}
    </div>

    ${REG.sector ? `<div class="fld ${REG.err.entity ? 'fld--bad' : ''}" data-tour="reg-entity">
      <label for="ent">اسم الجهة <span>*</span></label>
      <em>الاسمُ كما هو مسجَّلٌ في المصادر الرسمية — عليه يُطابَق ملفُّ البيانات.</em>
      <select id="ent" data-reg="entity">
        <option value="">— اختر —</option>
        ${list.map(e => `<option value="${e.id}" ${REG.entity === e.id ? 'selected' : ''}>${esc(e.name)} — ${esc(e.region)}</option>`).join('')}
      </select>
      ${REG.err.entity ? `<div class="fld__err">${esc(REG.err.entity)}</div>` : ''}
    </div>` : ''}

    ${REG.sector && SECTORS[REG.sector].feed !== 'full'
      ? note(`<b>تنبيهٌ مبكِّر.</b> ${esc(SECTORS[REG.sector].name)}: ${esc(SECTORS[REG.sector].note)}. شرطُ الأهليّة الأول يقتضي أن تكون <b>كلُّ</b> مؤشّرات الحزمة مستمدّةً من المصادر الرسمية. إن نقص مؤشّرٌ واحد سقطت الأهليّة — وسترى ذلك بالتفصيل بعد اختيار المسار، لا بعد إقفال الترشيح.`, 'a', 'warn')
      : ''}

    <div class="row" style="justify-content:flex-end">${btn('التالي', 'data-reg-next="1"', 'p')}</div>
  </div>`;
}

function regStep2() {
  const f = (k, l, t = 'text', hint = '') => `<div class="fld ${REG.err[k] ? 'fld--bad' : ''}">
    <label for="r-${k}">${esc(l)} <span>*</span></label>${hint ? `<em>${esc(hint)}</em>` : ''}
    <input id="r-${k}" type="${t}" data-rep="${k}" value="${esc(REG.rep[k] || '')}" ${t === 'email' || t === 'tel' ? 'dir="ltr"' : ''}>
    ${REG.err[k] ? `<div class="fld__err">${esc(REG.err[k])}</div>` : ''}</div>`;

  return `<div class="form">
    ${note('الممثّلُ المفوَّض هو <b>الشخص الوحيد</b> الذي يوقّع على ما يُقدَّم باسم الجهة، وإليه تُوجَّه المراسلات وقرارُ الأهليّة والزيارة الميدانية. تفويضٌ واحدٌ لكلّ جهةٍ في الدورة.', 'i', 'user')}
    <div class="grid g-2" data-tour="reg-rep">
      ${f('name', 'اسم الممثّل المفوَّض')}
      ${f('title', 'المسمّى الوظيفيّ', 'text', 'يجب أن يكون في مستوى اتّخاذ القرار — لا منسّقاً بلا صلاحية.')}
      ${f('email', 'البريد الإلكترونيّ الرسميّ', 'email', 'بريدُ جهةِ العمل لا بريدٌ شخصيّ.')}
      ${f('phone', 'رقم الجوّال', 'tel')}
    </div>
    <div class="fld">
      <label for="r-alt">بديلٌ عند التعذُّر</label>
      <em>اسمٌ وبريدٌ يُراسَل إن تعذّر الوصول إلى الممثّل خلال ثلاثة أيام عمل.</em>
      <input id="r-alt" type="text" data-rep="alt" value="${esc(REG.rep.alt || '')}">
    </div>
    <div class="rowj">${btn('رجوع', 'data-reg-back="1"')}${btn('التالي', 'data-reg-next="2"', 'p')}</div>
  </div>`;
}

function regStep3() {
  const ent = REG.entity ? E(REG.entity) : null;
  const taken = ent ? CASES.filter(c => c.entity === ent.id).map(c => c.key) : [];
  const pool = ent ? CATS.filter(c => fits(ent, c)) : [];
  const blocked = ent ? CATS.filter(c => !fits(ent, c)) : [];
  const KIND = { cluster: 'تجمّعٌ صحيّ', hospital: 'منشأةٌ مفردة', authority: 'جهةٌ أمّ' };

  const byTrack = TRACKS.map(t => {
    const list = pool.filter(c => c.track === t.id);
    if (!list.length) return '';
    return `<div style="margin-block-end:var(--s-4)">
      <div class="row" style="gap:6px;margin-block-end:6px">${ic('track')}<b>${esc(t.name)}</b>
        ${t.cats.length > 1 ? pill(num(t.cats.length, 'فئةٌ واحدة', 'فئتان', 'فئاتٍ', 'فئةً'), 'i') : ''}</div>
      <div class="opts">${list.map(c => {
        const has = taken.includes(c.key);
        const b = boards()[c.key];
        return `<label class="opt"><input type="radio" name="cat" value="${c.key}" data-reg="cat" ${REG.cat === c.key ? 'checked' : ''}>
          <div><b>${esc(t.cats.length > 1 ? c.name : t.name)}</b>
            <em>${esc(t.aim)}</em>
            <em class="sm">حزمةُ الفئة: ${c.kpis.map(k => esc(k.name)).join(' · ')}</em></div>
          <span style="margin-inline-start:auto">${has ? pill('مسجَّلٌ سابقاً', 'a') : pill(ar(b.counts.all) + ' مُسجَّل')}</span>
        </label>`;
      }).join('')}</div></div>`;
  }).join('');

  return `<div class="form">
    <div class="fld ${REG.err.cat ? 'fld--bad' : ''}" data-tour="reg-cat">
      <label>الفئة <span>*</span></label>
      <em>التنافسُ يقع في <b>الفئة</b> لا في المسار: مسارُ إنقاذ الأرواح ثلاثُ فئاتٍ لكلٍّ ترتيبُها وفائزُها.
        وللجهة أن تسجّل في أكثر من فئة — ولكلٍّ ملفٌّ وتقييمٌ مستقلّ.</em>
      ${ent ? note(`<b>${esc(ent.name)}</b> مصنّفةٌ <b>${esc(KIND[ent.kind])}</b>، فتُعرَض عليها ${ar(pool.length)} فئاتٍ من ${ar(CATS.length)}.
        ${blocked.length ? 'أمّا ' + blocked.map(c => esc(catLabel(c.key))).join(' · ') + ' فوحدةُ التنافس فيها ' + esc(blocked[0].unit === 'cluster' ? 'التجمّعُ الصحيّ' : 'المنشأةُ المفردة') + '، ولا تُقبَل فيها هذه الجهة.' : ''}`, 'i', 'building') : ''}
      <div style="margin-block-start:var(--s-4)">${byTrack || empty('لا فئةَ تقبل هذا النوع من الجهات. الجهاتُ الأمّ تُمنَح الأوسمة الثلاثة ولا تدخل مساراً.')}</div>
      ${REG.err.cat ? `<div class="fld__err">${esc(REG.err.cat)}</div>` : ''}
    </div>
    <div class="rowj">${btn('رجوع', 'data-reg-back="2"')}${btn('التالي', 'data-reg-next="3"', 'p')}</div>
  </div>`;
}

function regStep4() {
  const acks = [
    ['data', 'أُقِرُّ بأنّ بيانات المنشأة المُغذّاة إلى مصادر وزارة الصحة وشركائها صحيحةٌ ومطابقةٌ لسجلّاتنا الأصليّة.'],
    ['evid', 'أتعهّد بتقديم دليلٍ داعمٍ لكلّ نتيجةٍ نُبلِّغ عنها، وبإتاحة السجلّ الأصليّ للتحقّق.'],
    ['visit', 'أوافق على استقبال زيارةٍ ميدانية للتحقّق من المعلومات والأدلّة، دون إشعارٍ مسبقٍ بموعدها الدقيق.'],
    ['rules', 'اطّلعتُ على المنهجية والأوزان والعتبات المنشورة، وعلى أن التظلّم يُقدَّم خلال ' + ar(CYCLE.appealWeeks) + ' أسابيع من إعلان النتائج.']
  ];
  return `<div class="form">
    ${note('<b>لماذا إقرارٌ لا مجرّد زرّ موافقة؟</b> لأن أضعف نقطةٍ في أيّ جائزةٍ تقوم على البيانات هي الفجوةُ بين ما يُبلَّغ وما يُسجَّل. هذا الإقرار هو ما يُحتَجُّ به إن انكشف تعارضٌ في الزيارة الميدانية.', 'a', 'shield')}
    <div class="opts" data-tour="reg-ack">${acks.map(([k, t]) => `
      <label class="opt"><input type="checkbox" data-ack="${k}" ${REG.ack[k] ? 'checked' : ''}>
        <div><b style="font-weight:400;font-size:12.5px;line-height:1.7">${esc(t)}</b></div></label>`).join('')}</div>
    ${REG.err.ack ? `<div class="fld__err">${esc(REG.err.ack)}</div>` : ''}
    <div class="rowj">${btn('رجوع', 'data-reg-back="3"')}${btn('تسجيلٌ وعرضُ حكم الأهليّة', 'data-reg-submit="1"', 'p')}</div>
  </div>`;
}

function regDone() {
  const cid = REG.done;
  const c = CASE(cid);
  const el = eligibility(c);
  const s1 = stage1(cid);
  const r = rowOf(cid) || { state: 'ineligible', rank1: null };
  return `
  ${pageHead('تمّ التسجيل', `${esc(E(c.entity).name)} · ${esc(caseLabel(c, true))}`,
    link('افتح ملفّ الجهة', '#/entity/' + cid, 'p') + btn('تسجيلُ مسارٍ آخر', 'data-reg-reset="1"'))}
  ${card(head('حكمُ بوّابة الأهليّة — فوريّ', 'لا انتظارَ لجنة: الشروط الثلاثة تُحسَب من بياناتك الرسمية لحظةَ التسجيل.',
      el.pass ? stateBadge(r.state) : stateBadge('ineligible'))
    + gatesHtml(el)
    + (el.pass
      ? note(`<b>اجتزتَ البوّابة.</b> درجتك في المرحلة الأولى <b class="num">${fmt(s1.score, 1)}</b> من ١٠٠، وترتيبك ${r.rank1 ? '<b class="num">' + ar(r.rank1) + '</b> في المسار' : 'قيد الاحتساب'}. أفضلُ ${ar(STAGES[0].cut)} جهاتٍ في الفئة يُفتَح لهم نموذجُ المشاركة.`, 'g', 'check')
      : note('<b>لم تجتز البوّابة — وهذا ليس رفضاً إدارياً.</b> الشروطُ الثلاثة منصوصٌ عليها في دليل الجائزة، وكلٌّ منها قاطع. اقرأ أعلاه أيَّها سقط: بعضُها يُعالَج بربط بياناتٍ قبل إقفال التسجيل، وبعضُها يحتاج دورةً كاملةً من التحسين.', 'r', 'x'))
  )}
  ${card(head('ماذا يحدث بعد اليوم') + timelineHtml())}
  `;
}

/* ============ عرض الشروط الثلاثة ============ */
function gatesHtml(el) {
  return `<div class="grid g-3">${el.gates.map((g, i) => `
    <div class="card card--flat" style="border-color:${g.pass ? 'var(--g-200)' : 'var(--r-200)'}">
      <div class="rowj" style="margin-block-end:6px">
        <div class="row" style="gap:6px"><span class="rub__k" style="background:${g.pass ? 'var(--g-600)' : 'var(--r-500)'}">${ar(i + 1)}</span><b>${esc(g.name)}</b></div>
        ${yn(g.pass)}
      </div>
      <p class="sm mut" style="margin-block-end:6px">${esc(g.req)}</p>
      <div class="row"><b class="num" style="font-size:13px">${esc(ar(g.val))}</b></div>
      ${g.ratio !== undefined ? bar(g.ratio * 100, g.pass ? 'g' : 'red') : ''}
      ${g.miss && g.miss.length ? `<div class="sm" style="color:var(--r-500);margin-block-start:6px">الناقص: ${g.miss.map(id => {
        const k = [...TRACKS.flatMap(t => t.kpis), ...SHARED].find(x => x.id === id);
        return esc(k ? k.name : id);
      }).join(' · ')}</div>` : ''}
    </div>`).join('')}</div>`;
}

/* ============ بوّابة الجهة ============ */
function viewEntity(cid) {
  const c = CASE(cid); if (!c) return viewHome();
  const r = rowOf(cid); if (!r) return viewHome();
  const ent = E(c.entity), t = T(c.track), el = r.s1.el;
  const b = boards()[c.key];
  const openForm = ['qualified', 'finalist', 'honored', 'winner', 'out2'].includes(r.state);
  const sub = DB.submissions[cid];

  return `
  ${pageHead(ent.name, `${esc(caseLabel(c, true))} · ${esc(SECTORS[ent.sector].name)} · ${esc(ent.region)}`,
    stateBadge(r.state) + (r.rank1 ? pill('المرتبة ' + ar(r.rank1) + ' من ' + ar(b.counts.eligible) + ' في الفئة', 'i') : ''),
    `<a href="#/board">لوحة الجائزة</a> ${ic('arrow')} <a href="#/track/${c.track}">${esc(t.short)}</a> ${ic('arrow')} <a href="#/cat/${c.key}">${esc(C(c.key).short)}</a> ${ic('arrow')} ملفّ الجهة`)}

  ${r.blocked ? note('<b>هذا الملفّ محجوب.</b> صدر قرارُ حجبٍ من لجنة الحجب والتظلّم. الملفُّ يبقى مفتوحاً للاطّلاع ولا يدخل الترتيب. للجهة أن تتظلّم خلال ' + ar(CYCLE.appealWeeks) + ' أسابيع من إعلان النتائج.', 'r', 'shield') : ''}

  ${card(head('المسار الشخصيّ للملفّ', 'أين أنت الآن، وما الذي يفتح الخطوةَ التالية.')
    + journeyHtml(r))}

  ${card(head('١ — بوّابة الأهليّة', 'ثلاثةُ شروطٍ من دليل الجائزة. سقوطُ واحدٍ يُسقِط الملفّ.',
      el.pass ? pill('مستوفاة', 'g') : pill('غيرُ مستوفاة', 'r'))
    + gatesHtml(el))}

  ${card(head('٢ — لوحة المؤشّرات', 'قيمُ الدورات الثلاث كما وردت من المصادر الرسمية. الخطُّ الذهبيّ هو المستهدَف الوطنيّ.',
      `<span class="tag"><i>درجة المرحلة ١</i><b class="num">${fmt(r.s1s, 1)}</b></span>`)
    + kpiTable(c, el))}

  ${card(head('٣ — استمارة المشاركة',
      openForm ? 'مفتوحةٌ لك: أنت ضمن أفضل ' + ar(STAGES[0].cut) + ' في الفئة.'
               : 'تُفتَح في المرحلة الثانية لأفضل ' + ar(STAGES[0].cut) + ' جهاتٍ في كلّ فئةٍ وحدهم.',
      openForm ? (sub ? pill('مُرسَلة · ' + dt(sub.at), 'g') : pill('لم تُرسَل بعد', 'a')) : pill('مُقفَلة', ''))
    + (openForm ? formHtml(cid, sub)
      : `<div class="empty">${ic('lock')}<p>الاستمارةُ ليست بابَ الدخول إلى الجائزة، بل بابَ المرحلة الثانية.<br>
         المرحلةُ الأولى تُحسَب من بياناتك الرسمية وحدها — ولا يُقدَّم فيها ملفٌّ ولا تُكتَب فيها كلمة.</p>
         ${r.state === 'ineligible' ? '' : link('اقرأ المنهجية', '#/method')}</div>`))}

  ${openForm ? card(head('٤ — الزيارة الميدانية', 'للتحقّق من المعلومات والأدلّة — لا لعرضٍ تقديميّ.')
    + visitHtml(cid, r)) : ''}

  ${card(head('٥ — التظلّم', `يُقدَّم خلال ${ar(CYCLE.appealWeeks)} أسابيع من تاريخ حفل الجائزة وإعلان النتائج، عبر البريد المخصّص.`)
    + appealBox(cid, r))}
  `;
}

/* رحلةُ الملفّ */
function journeyHtml(r) {
  const st = r.state;
  const idx = { ineligible: 0, out1: 1, qualified: 2, out2: 2, finalist: 3, honored: 4, winner: 4, blocked: 0 }[st] ?? 0;
  const nodes = [
    ['التسجيل', 'تمّ', true],
    ['الأهليّة', r.eligible ? 'اجتاز' : 'لم يجتز', r.eligible],
    ['المرحلة ١ — المؤشّرات', r.rank1 ? 'المرتبة ' + ar(r.rank1) : '—', idx >= 2],
    ['المرحلة ٢ — الأنظمة', r.s2s === null ? 'قيد التقييم' : 'الدرجة ' + fmt(r.s2s, 1), idx >= 3],
    ['المرحلة ٣ — التحكيم', r.finalPos === 0 ? 'فائز' : r.finalPos > 0 ? 'مُكرَّم' : '—', idx >= 4]
  ];
  return `<div class="funnel">${nodes.map(([n, v, ok], i) => `
    <div class="fn fn--j fn--${ok ? (i === 4 ? 4 : 2) : 0}">
      <div class="fn__l">${esc(n)}</div>
      <div class="fn__t"><i style="inline-size:${ok ? 100 : 0}%"></i></div>
      <div class="fn__n">${esc(v)}</div>
    </div>`).join('')}
  <p class="sm mut" style="margin:var(--s-2) 0 0">${esc(STATE[st].desc)}</p></div>`;
}

/* جدول المؤشّرات */
/** مؤشّرٌ نسبيّ بلغ أعلى المدى: مجالُ تحسُّنه ضاق، فيُعاقَب في شرط الاتجاه بلا ذنب */
function atCeiling(k, r) {
  return k.unit === '٪' && k.better === 'up' && r.official && r.last >= 95 && r.trend < 2;
}

function kpiTable(c, el) {
  const ceil = el.rows.filter(r => atCeiling(r.k, r));
  return table([['المؤشّر'], ['د٦', 'c'], ['د٧', 'c'], ['د٨', 'c'], ['المستهدَف', 'c'], ['الاتجاه', 'c'], ['بلغ؟', 'c'], ['الحُجّية']],
    el.rows.map(r => {
      const k = r.k;
      return `<tr class="${r.official ? '' : 'is-out'}">
        <td><b>${esc(k.name)}</b>${SHARED.some(s => s.id === k.id) ? ' ' + pill('مشترك', 'i') : ''}${atCeiling(k, r) ? ' ' + pill('قُربَ السقف', 'a', 'بلغ ٩٥٪ فأكثر، ولم يُسجَّل له اتجاهٌ موجبٌ متّصل — لأنه لم يبقَ ما يصعده') : ''}</td>
        ${[0, 1, 2].map(i => `<td class="c n">${r.s ? unit(r.s[i], k) : '—'}</td>`).join('')}
        <td class="c n mut">${k.better === 'band' ? ar(k.band[0]) + '–' + ar(k.band[1]) : unit(k.target, k, 0)}</td>
        <td class="c">${spark(k, r.s)}</td>
        <td class="c">${r.official ? yn(r.met, 'نعم', 'لا') : '<span class="mut">—</span>'}</td>
        <td>${r.official ? pill('مصدرٌ رسميّ', 'g') : pill('غيرُ متوفّر رسمياً', 'r')}</td></tr>`;
    }))
    + (ceil.length ? note(`<b>أثرُ السقف — ${num(ceil.length, 'مؤشّرٌ واحد', 'مؤشّران', 'مؤشّراتٍ', 'مؤشّراً')} في هذه الحزمة.</b> بلغ ٩٥٪ فأكثر، ولم يُسجَّل له اتجاهٌ موجبٌ متّصل — <b>لا لتراجُع، بل لأنه لم يبقَ ما يصعده</b>. وشرطُ «الاتجاه الموجب لثلاث دورات» يعاقبه كما يعاقب المتراجع، فيتأهّل المتوسّطُ الصاعد ويسقط المتفوّقُ الثابت. هذه ثغرةٌ في المعيار لا في أداء الجهة، ومقترَحُ معالجتها — قراءةُ ما تجاوز ٩٥٪ «مستقرّاً عند التميّز» — مرفوعٌ إلى اللجنة العلمية ولم يُطبَّق في الحساب لأنه ليس في الدليل.`, 'a', 'warn') : '');
}

/* الاستمارة */
function formHtml(cid, sub) {
  const d = sub || DB.submissions[cid] || { sec: {}, files: [], at: null };
  const filled = FORM.filter(f => (d.sec[f.id] || '').trim().length > 40).length;
  const cover = Math.round(filled / FORM.length * 100);
  const need = FORM.length;

  return `
  <div class="rowj" style="margin-block-end:var(--s-4)">
    <div class="row" style="gap:var(--s-4)">
      <span class="tag"><i>الأقسام المكتملة</i><b class="num">${ar(filled)}/${ar(need)}</b></span>
      <span class="tag"><i>الأدلّة المرفوعة</i><b class="num">${ar(d.files.length)}</b></span>
    </div>
    ${d.at ? pill('أُرسِلت ' + dt(d.at), 'g') : btn('إرسال الاستمارة', `data-sub-send="${cid}"`, 'p')}
  </div>
  ${bar(cover, cover === 100 ? 'g' : 'ink')}
  <div class="hr"></div>
  <div class="form">${FORM.map(f => `
    <div class="fld">
      <label for="f-${f.id}">${esc(f.name)}
        ${f.adli !== '—' ? `<span class="pill pill--i" style="margin-inline-start:6px">يُقرأ بـ ${esc(f.adli)}</span>` : ''}</label>
      <em>${esc(f.q)}</em>
      <textarea id="f-${f.id}" data-sec="${f.id}" data-case="${cid}" placeholder="${esc(f.hint)}" ${d.at ? 'readonly' : ''}>${esc(d.sec[f.id] || '')}</textarea>
      <div class="sm mut">${ic('verdict')} ${esc(f.hint)}</div>
    </div>`).join('')}</div>
  <div class="hr"></div>
  <div class="up">
    <b style="font-size:12.5px">الأدلّة الداعمة</b>
    <p class="sm mut" style="margin:0">نصُّ الدليل: «أدلّةٌ داعمة لكلّ نتيجةٍ مُبلَّغٍ عنها». المنصّة لا تقبل إرسالَ الاستمارة قبل رفع دليلٍ واحدٍ على الأقلّ لكلّ نتيجةٍ في القسم الخامس.</p>
    ${d.at ? '' : `<div class="up__z" data-up="${cid}">${ic('clip')} أضِف دليلاً — محضرٌ، أو لقطةُ نظام، أو تقريرٌ مُعتمَد، أو سجلٌّ أصليّ</div>`}
    ${d.files.length ? d.files.map((f, i) => `<div class="up__f">${ic('file')}<b>${esc(f.n)}</b>
      <span>${esc(f.t)}</span>${d.at ? '' : `<button class="btn btn--sm" data-unfile="${cid}:${i}">حذف</button>`}</div>`).join('')
      : `<div class="empty" style="padding:var(--s-5)">${ic('clip')}<p>لا أدلّةَ بعد.</p></div>`}
  </div>`;
}

/* الزيارة الميدانية */
function visitHtml(cid, r) {
  const done = r.reviews && Object.keys(r.reviews).length;
  return `<div class="grid g-2">
    ${VISIT.map(v => `<div class="card card--flat">
      <div class="row" style="gap:6px;margin-block-end:4px">${ic('visit')}<b>${esc(v.name)}</b></div>
      <p class="sm mut" style="margin:0">${esc(v.q)}</p>
      ${done ? `<div class="row sm" style="margin-block-start:6px">
        <b class="num">${ar(Math.round(Object.values(r.reviews).reduce((a, x) => a + x.visit[v.k], 0) / Object.keys(r.reviews).length))}</b>
        <span class="mut">متوسّط الفريق من ١٠٠</span></div>` : ''}
    </div>`).join('')}
  </div>
  ${note('<b>الزيارةُ تحقُّقٌ لا استقبال.</b> بندُ «تتبُّع الرقم إلى مصدره» وحده يكشف أكثرَ ممّا يكشفه عرضٌ تقديميٌّ كامل: يُختار رقمٌ من الاستمارة عشوائياً، ويُطلَب سجلُّه الأصليّ. عدمُ القدرة على تتبّعه ليس نقصاً إدارياً — بل شكٌّ في النتيجة كلّها.', 'a', 'warn')}`;
}

/* التظلّم */
function appealBox(cid, r) {
  const mine = DB.appeals.filter(a => a.case === cid);
  const decided = ['honored', 'winner', 'out2', 'out1', 'ineligible', 'blocked'].includes(r.state);
  const w = appealWindow();
  const open = decided && w.st === 'open';
  const why = !decided ? 'لا يُتظلَّم على ملفٍّ لم يُبتّ فيه بعد.'
    : w.st === 'before' ? `تُفتح نافذة التظلّم بإعلان النتائج في ${dt(CYCLE.ceremony)}.`
    : `أُغلقت نافذة التظلّم في ${dt(CYCLE.appealEnds)}، ولا تُقبل تظلّمات جديدة.`;
  return `${mine.length ? mine.map(a => `<div class="card card--flat" style="border-color:var(--am-200)">
      <div class="rowj"><b>تظلُّمٌ مُسجَّل</b>${pill(a.status, a.status === 'مقبول' ? 'g' : a.status === 'مرفوض' ? 'r' : 'a')}</div>
      <p class="sm" style="margin-block:6px 0">${esc(a.text)}</p>
      <div class="sm mut">${dt(a.at)} — ${esc(a.by)}</div>
      ${a.decision ? `<div class="hr" style="margin-block:var(--s-3)"></div><div class="sm"><b>قرارُ اللجنة:</b> ${esc(a.decision)}</div>` : ''}
    </div>`).join('') : ''}
  ${open ? `<div class="form" style="margin-block-start:${mine.length ? 'var(--s-4)' : '0'}">
    <div class="fld"><label for="ap-${cid}">نصُّ التظلّم</label>
      <em>حدِّد الإجراء المُعترَض عليه ورقم البند، لا الشعور بالنتيجة. التظلّم يُنظَر إجرائياً: هل طُبِّقت القاعدة كما نُشرَت؟</em>
      <textarea id="ap-${cid}" placeholder="مثال: الدرجة الموحَّدة في بند «التطبيق» اعتُمدت دون محضر توحيدٍ رغم تباعُدٍ يتجاوز العتبة المنشورة."></textarea></div>
    <div class="row" style="justify-content:flex-end">${btn('تقديم التظلّم', `data-appeal="${cid}"`)}</div>
  </div>` : `<div class="empty">${ic('lock')}<p>${why}</p></div>`}`;
}
