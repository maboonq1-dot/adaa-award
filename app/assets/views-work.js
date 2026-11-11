/* جائزة أداء الصحة — عملُ اللجان: المكتب، والملفّ، وبطاقة التسجيل، والتوحيد */

const ANCHOR_MID = [12, 42, 70, 92];
const me = () => PEOPLE.find(p => p.id === ME) || PEOPLE[0];
const myRole = () => me().role;

/* الملفّات المُسنَدة إليّ */
function myCases() {
  const id = ME, role = myRole();
  const out = [];
  CATS.forEach(cat => boards()[cat.key].qualified.forEach(r => {
    const a = assignedTo(r.c.id);
    if (role === 'eval'   && a.evals.includes(id)) out.push({ r, a, as: 'مُقيِّم' });
    if (role === 'expert' && a.expert === id)      out.push({ r, a, as: 'خبيرُ توحيد' });
    if (role === 'chair'  || role === 'appeals')   out.push({ r, a, as: role === 'chair' ? 'إشراف' : 'مراجعة' });
  }));
  return out;
}

/* ============ المكتب ============ */
function viewDesk() {
  const role = myRole(), R = ROLES[role];

  if (role === 'entity') {
    const cs = CASES.filter(c => c.entity === me().entity);
    return `${pageHead('ملفّات جهتي', esc(E(me().entity).name))}
      ${card(head('المشاركات') + (cs.length ? table([['المسار'], ['الحالة'], ['المرحلة 1', 'c'], ['المرحلة 2', 'c'], ['المركّبة', 'c'], ['', 'c']],
        cs.map(c => { const r = rowOf(c.id); return `<tr>
          <td><b>${esc(caseLabel(c))}</b></td><td>${stateBadge(r.state)}</td>
          <td class="c n">${fmt(r.s1s, 1)}</td><td class="c n">${fmt(r.s2s, 1)}</td><td class="c n"><b>${fmt(r.comp, 1)}</b></td>
          <td class="c"><a href="#/entity/${c.id}">افتح</a></td></tr>`; })) : empty('لا مشاركات.')))}`;
  }

  if (role === 'judge')   return viewJudging();
  if (role === 'appeals') return viewAppeals();
  if (role === 'sec')     return viewBoard();

  const mine = myCases();
  const pending = mine.filter(x => !(DB.reviews[x.r.c.id] || {})[ME]);
  const div = mine.filter(x => x.r.needsConsensus);

  return `
  ${pageHead('مكتبي · ' + R.name, R.desk,
    pill(COMMITTEES.find(c => c.id === R.comm)?.name || '—', 'g'))}

  <div class="grid g-4">
    ${stat(ar(mine.length), 'ملفٌّ مُسنَد', role === 'eval' ? 'مقيّمان لكل ملفّ' : 'ضمن نطاقي')}
    ${stat(ar(pending.length), 'بانتظار درجتي', pending.length ? 'لم تُرسَل بعد' : 'لا متأخّرات', pending.length ? 'red' : 'ink')}
    ${stat(ar(div.length), 'تباعُدٌ مفتوح', 'فوق ' + ar(CFG.divergence) + ' نقطة', div.length ? 'red' : '')}
    ${stat(ar(CATS.filter(c => boards()[c.key].confirmed).length), 'فئةٌ مُعتمَدة', 'من ' + ar(CATS.length))}
  </div>

  ${div.length ? card(head('يلزمه حوارُ توحيد', 'الدرجةُ لا تُعتمَد ما دام التباعُد مفتوحاً — والاعتمادُ فوقه ثغرةُ تظلّمٍ جاهزة.', pill('عاجل', 'r'))
    + table([['الجهة'], ['المسار'], ['مقيّم 1', 'c'], ['مقيّم 2', 'c'], ['الفارق', 'c'], ['', 'c']],
      div.map(({ r }) => {
        const evs = Object.values(r.reviews).filter(x => x.by.startsWith('U-EV'));
        return `<tr><td><span class="ent">${esc(E(r.c.entity).name)}</span></td>
          <td>${esc(caseLabel(r.c))}</td>
          <td class="c n">${fmt(reviewScore(evs[0]), 1)}</td><td class="c n">${fmt(reviewScore(evs[1]), 1)}</td>
          <td class="c n"><b style="color:var(--r-500)">${fmt(r.divergence, 1)}</b></td>
          <td class="c"><a href="#/consensus/${r.c.id}">افتح الحوار</a></td></tr>`;
      })) ) : ''}

  ${card(head('الملفّات المُسنَدة', role === 'eval'
      ? 'تُقيَّم مستقلّاً خلف حجاب: لا ترى درجة زميلك قبل إرسال درجتك.'
      : 'كلُّ ملفٍّ يحمل مقيّمَيْن وخبيراً — وأنت الطرفُ الثالث.')
    + (mine.length ? table([['الجهة'], ['المسار'], ['دوري'], ['درجتي', 'c'], ['حالة الملفّ'], ['', 'c']],
      mine.slice(0, 40).map(({ r, as }) => {
        const rv = (DB.reviews[r.c.id] || {})[ME];
        return `<tr><td><span class="ent">${esc(E(r.c.entity).name)}<em>${esc(SECTORS[E(r.c.entity).sector].name)}</em></span></td>
          <td>${esc(caseLabel(r.c))}</td><td>${pill(as, 'i')}</td>
          <td class="c n">${rv ? '<b>' + fmt(reviewScore(rv), 1) + '</b>' : '<span class="mut">—</span>'}</td>
          <td>${stateBadge(r.state)}${r.needsConsensus ? ' ' + pill('تباعُد', 'r') : ''}</td>
          <td class="c"><a href="#/case/${r.c.id}">${rv ? 'راجِع' : 'قيِّم'}</a></td></tr>`;
      })) : empty('لا ملفّات مُسنَدة إليك.')))}

  ${role === 'chair' ? chairPanel() : ''}
  `;
}

/* لوحةُ رئيس اللجنة العلمية */
function chairPanel() {
  return card(head('اعتمادُ نتائج المرحلتين', 'رئيسُ اللجنة العلمية لا يمنح درجةً — يتحقّق من أن كلّ ملفٍّ استوفى شرطَ الاعتماد قبل رفعه إلى التحكيم.')
    + table([['المسار · الفئة'], ['متأهّل', 'c'], ['مُقيَّم', 'c'], ['تباعُدٌ مفتوح', 'c'], ['جاهزٌ للرفع', 'c'], ['', 'c']],
      CATS.map(cat => {
        const b = boards()[cat.key];
        const ready = b.counts.diverging === 0 && b.counts.scored >= Math.min(b.counts.qualified, STAGES[1].cut);
        return `<tr><td><b>${esc(catLabel(cat.key))}</b></td>
          <td class="c n">${ar(b.counts.qualified)}</td><td class="c n">${ar(b.counts.scored)}</td>
          <td class="c n">${b.counts.diverging ? '<b style="color:var(--r-500)">' + ar(b.counts.diverging) + '</b>' : ar(0)}</td>
          <td class="c">${yn(ready, 'جاهز', 'غيرُ جاهز')}</td>
          <td class="c"><a href="#/cat/${cat.key}">افتح</a></td></tr>`;
      }))
    + note('<b>شرطُ الرفع.</b> لا تُرفَع فئةٌ إلى لجنة التحكيم وفيها تباعُدٌ مفتوح. هذه ليست بيروقراطية: لجنةُ التحكيم تعتمد <b>ترتيباً</b>، وترتيبٌ مبنيٌّ على درجةٍ لم تُوحَّد هو ترتيبٌ بلا سند.', 'a', 'shield'));
}

/* ============ ملفّ المشاركة كما تراه اللجان ============ */
function viewCase(cid) {
  const c = CASE(cid); if (!c) return viewDesk();
  const r = rowOf(cid); if (!r) return viewDesk();
  const ent = E(c.entity), a = assignedTo(cid);
  const role = myRole();
  const mineRv = (DB.reviews[cid] || {})[ME];
  const canScore = (role === 'eval' && a.evals.includes(ME)) || (role === 'expert' && a.expert === ME);
  const seeOthers = role !== 'eval' || !!mineRv;   // الحجاب
  const seeWho = role !== 'judge';                // لجنةُ التحكيم تُقيّم الدرجة لا قائلَها

  const sub = DB.submissions[cid];

  return `
  ${pageHead(ent.name, `${esc(caseLabel(c, true))} · ملفُّ مشاركة <span class="num" dir="ltr">${esc(cid)}</span>`,
    stateBadge(r.state) + (r.needsConsensus ? pill('تباعُدٌ مفتوح', 'r') : ''),
    `<a href="#/desk">مكتبي</a> ${ic('arrow')} ملفّ`)}

  <div class="split">
    <div class="stack">
      ${card(head('نتائج المؤشّرات · المرحلة الأولى', 'مصدرُها المصادر الرسمية — لا تُعدَّل في المنصّة ولا تُقبَل مراجعتُها إلا بتصحيحٍ من المصدر.',
        `<span class="tag"><i>الدرجة</i><b class="num">${fmt(r.s1s, 1)}</b></span>`)
        + letciBreak(r.s1))}

      ${card(head('استمارة المشاركة', sub ? 'أُرسِلت في ' + dt(sub.at) : 'لم تُرسَل بعد.')
        + (sub ? FORM.map(f => `<div style="margin-block-end:var(--s-4)">
            <div class="row" style="gap:6px;margin-block-end:4px"><b>${esc(f.name)}</b>${f.adli !== '—' ? pill(f.adli, 'i') : ''}</div>
            <p class="sm" style="margin:0;color:var(--text-2)">${esc(sub.sec[f.id] || '') || '<span class="mut">— لم يُملأ —</span>'}</p>
          </div>`).join('') + (sub.files.length ? `<div class="hr"></div><b class="sm">الأدلّة</b>
            ${sub.files.map(f => `<div class="up__f">${ic('file')}<b>${esc(f.n)}</b><span>${esc(f.t)}</span></div>`).join('')}` : '')
          : empty('لم ترفع الجهةُ استمارتها بعد. التقييمُ يبقى مفتوحاً ولا يُحتسَب حتى تصل.')))}

      ${canScore ? card(head('بطاقة التسجيل — درجتي', mineRv ? 'مُرسَلة. التعديلُ يُسجَّل في السجلّ.' : 'اختر المرسى الوصفيّ لكل بُعد. المراسي تُثبِّت المعنى بين المقيّمين.',
          mineRv ? pill('أُرسِلت ' + dt(mineRv.at), 'g') : pill('لم تُرسَل', 'a'))
        + scorecard(cid)) : ''}
    </div>

    <div class="stack">
      ${card(head('الإسناد')
        + `<div class="stack">
          ${a.evals.map((u, i) => `<div class="rowj">${seeWho ? chip(u, 'مُقيِّم ' + ar(i + 1)) : chip({ name: 'مُقيِّم ' + ar(i + 1) }, 'الهويّة محجوبة عن لجنة التحكيم')}
            ${seeOthers && (DB.reviews[cid] || {})[u] ? `<b class="num">${fmt(reviewScore(DB.reviews[cid][u]), 1)}</b>`
              : `<span class="pill">${(DB.reviews[cid] || {})[u] ? (u === ME ? 'درجتي' : 'خلف الحجاب') : 'لم تُرسَل'}</span>`}</div>`).join('')}
          <div class="rowj">${seeWho ? chip(a.expert, 'خبير اللجنة العلمية') : chip({ name: 'خبير اللجنة العلمية' }, 'الهويّة محجوبة عن لجنة التحكيم')}
            ${seeOthers && (DB.reviews[cid] || {})[a.expert] ? `<b class="num">${fmt(reviewScore(DB.reviews[cid][a.expert]), 1)}</b>` : '<span class="pill">—</span>'}</div>
        </div>
        ${!seeWho ? note('<b>هويّةُ المُقيِّم محجوبةٌ عنك.</b> لجنةُ التحكيم تُراجع الدرجةَ ومبرَّرها، لا قائلَها — كي لا يُقاس الملفُّ بمكانة مَن قيّمه.', 'i', 'lock') : ''}
        ${!seeOthers ? note('<b>الحجاب مُفعَّل.</b> لن ترى درجةَ زميلك قبل إرسال درجتك. التقييمُ المزدوج يفقد قيمته لحظةَ يرى الثاني حكمَ الأول.', 'a', 'lock') : ''}
        <div class="hr"></div>
        <div class="sm mut">${ic('shield')} تعارضُ المصالح: استُبعِد من الإسناد كلُّ مُقيِّمٍ ينتمي إلى <b>${esc(ent.name)}</b>.</div>`)}

      ${card(head('الدرجات')
        + `<div class="row" style="gap:var(--s-5);justify-content:space-around;padding-block:var(--s-3)">
            ${dial(r.s1s, 68, 'المرحلة 1')}${dial(r.s2s, 68, 'المرحلة 2')}${dial(r.comp, 78, 'المركّبة')}</div>
          <div class="hr"></div>
          ${kv([['مصدر درجة المرحلة 2', esc(r.s2source)],
                ['التباعُد', r.divergence === null ? '<span class="mut">لم تكتمل درجتا المقيّمَيْن</span>' : `<b class="num" style="color:${r.divergence > CFG.divergence ? 'var(--r-500)' : 'inherit'}">${fmt(r.divergence, 1)}</b> نقطة · العتبة ${ar(CFG.divergence)}`],
                ['المرتبة في الفئة', r.rank2 ? ar(r.rank2) : r.rank1 ? ar(r.rank1) + ' (بالمرحلة 1)' : '—'],
                ['الوزن', `${pc(CFG.w1 * 100, 0)} + ${pc(CFG.w2 * 100, 0)}`]])}
          ${r.needsConsensus ? `<div class="hr"></div>${link('افتح حوار التوحيد', '#/consensus/' + cid, 'red')}` : ''}`)}

      ${card(head('السجلّ') + logHtml(cid, 6))}
    </div>
  </div>`;
}

/* تفصيل LeTCI للمرحلة الأولى */
function letciBreak(s1) {
  const w = CFG.letci;
  return `<div class="stack">${LETCI.map(d => {
    const v = s1.parts[d.k];
    return `<div class="dv__row" style="grid-template-columns:150px 1fr 88px">
      <div><b class="sm">${esc(d.name)}</b><div class="sm mut">${esc(d.en)} · وزن ${pc(w[d.k] * 100, 0)}</div></div>
      ${bar(v)}
      <div class="dv__n">${fmt(v, 1)}</div></div>`;
  }).join('')}
  <div class="hr" style="margin-block:var(--s-2)"></div>
  <div class="dv__row" style="grid-template-columns:150px 1fr 88px">
    <b class="sm">الدرجة المرجَّحة</b>${bar(s1.score, 'g')}<div class="dv__n"><b>${fmt(s1.score, 1)}</b></div></div></div>`;
}

/* ============ بطاقة التسجيل ============ */
function scorecard(cid) {
  const rv = (DB.reviews[cid] || {})[ME] || { adli: {}, letci: {}, visit: {}, note: '' };
  const sent = !!((DB.reviews[cid] || {})[ME] || {}).at;

  const group = (dims, key, title, weight) => `
    <div class="rowj" style="margin-block:var(--s-4) var(--s-2)">
      <b>${esc(title)}</b>${pill('وزن ' + pc(weight * 100, 0), 'i')}</div>
    <div class="rub">${dims.map(d => {
      const v = rv[key][d.k];
      const sel = v === undefined ? -1 : ANCHOR_MID.reduce((b, m, i) => Math.abs(m - v) < Math.abs(ANCHOR_MID[b] - v) ? i : b, 0);
      return `<div class="rub__row">
        <div class="rub__h"><span class="rub__k">${esc(d.k)}</span><b>${esc(d.name)}</b>
          <span class="sm mut">${esc(d.en || '')}</span>
          <span class="rub__val">${v === undefined ? '—' : ar(v)}</span></div>
        <div class="rub__q">${esc(d.q)}</div>
        <div class="rub__anch">${d.anchors.map((a, i) => `
          <button type="button" aria-pressed="${sel === i}" ${sent ? 'disabled' : ''}
            data-sc="${cid}|${key}|${d.k}|${ANCHOR_MID[i]}">
            <i>${ar([0, 30, 60, 85][i])}–${ar([25, 55, 80, 100][i])}</i>${esc(a)}</button>`).join('')}</div>
      </div>`;
    }).join('')}</div>`;

  // لكلّ مجموعةٍ فحصُها: المفتاح I مشتركٌ بين ADLI وLeTCI، والفحصُ المختلط كان يقبل بُعداً ناقصاً
  const complete = ADLI.every(d => d.k in rv.adli)
    && LETCI.every(d => d.k in rv.letci)
    && VISIT.every(d => d.k in rv.visit);

  return `
  ${group(ADLI, 'adli', 'العمليات · ADLI', CFG.s2.adli)}
  ${group(LETCI, 'letci', 'النتائج · LeTCI', CFG.s2.letci)}
  ${group(VISIT.map(v => ({ ...v, anchors: ['لم يُتحقَّق', 'تحقُّقٌ جزئيّ', 'تحقُّقٌ كامل', 'تحقُّقٌ كاملٌ مع دليلٍ إضافيّ'] })), 'visit', 'الزيارة الميدانية', CFG.s2.visit)}
  <div class="hr"></div>
  <div class="fld"><label for="nt-${cid}">مبرَّرُ الدرجة</label>
    <em>يُقرأ في حوار التوحيد وفي التظلّم. درجةٌ بلا مبرَّرٍ لا تصمد أمام اعتراض.</em>
    <textarea id="nt-${cid}" data-note="${cid}" ${sent ? 'readonly' : ''}>${esc(rv.note || '')}</textarea></div>
  <div class="rowj">
    <span class="sm mut">${complete ? 'كلُّ الأبعاد مُسجَّلة.' : 'أكمِل كلّ الأبعاد قبل الإرسال.'}</span>
    ${sent ? pill('أُرسِلت — التعديل يُسجَّل', 'g')
           : btn('إرسالُ درجتي', `data-sc-send="${cid}" ${complete ? '' : 'disabled'}`, 'p')}
  </div>`;
}

/* ============ حوار التوحيد ============ */
function viewConsensus(cid) {
  const c = CASE(cid); if (!c) return viewDesk();
  const r = rowOf(cid); if (!r) return viewDesk();
  const a = assignedTo(cid);
  const rv = DB.reviews[cid] || {};
  const evs = a.evals.map(u => rv[u]).filter(Boolean);
  const ex = rv[a.expert];
  const cons = DB.consensus[cid];
  const canDo = ['expert', 'chair'].includes(myRole());

  if (evs.length < 2) return `${pageHead('حوار التوحيد')}${card(empty('لم تكتمل درجتا المقيّمَيْن بعد.'))}`;

  const rows = [
    ...ADLI.map(d => ({ d, key: 'adli' })),
    ...LETCI.map(d => ({ d, key: 'letci' })),
    ...VISIT.map(d => ({ d, key: 'visit' }))
  ].map(({ d, key }) => {
    const A = evs[0][key][d.k], B = evs[1][key][d.k], X = ex ? ex[key][d.k] : null;
    return { d, key, A, B, X, gap: Math.abs(A - B) };
  });
  const wide = rows.filter(x => x.gap > CFG.dimGap);

  return `
  ${pageHead('حوار التوحيد', `${esc(E(c.entity).name)} · ${esc(caseLabel(c))} — تباعُدٌ قدرُه <b class="num">${fmt(r.divergence, 1)}</b> نقطة، والعتبة ${ar(CFG.divergence)}.`,
    cons ? pill('مُوحَّدة', 'g') : pill('مفتوح', 'r'),
    `<a href="#/case/${cid}">الملفّ</a> ${ic('arrow')} التوحيد`)}

  ${note('<b>التباعُدُ ليس خطأً يُخفى.</b> فرقٌ واسعٌ بين مقيّمَيْن قرآ الملفّ نفسه يعني أن البند نفسه يحتمل قراءتين — إمّا لأن الدليل ناقص، أو لأن المرسى الوصفيّ غامض. الحوارُ يفصل بين الحالتين، والمبرَّرُ المكتوب هو ما يُقرأ في التظلّم بعد أشهر.', 'i', 'split')}

  <div class="split">
    <div class="stack">
      ${card(head('الأبعاد المتباعدة',
          wide.length ? `${num(wide.length, 'بُعدٌ واحد', 'بُعدان', 'أبعادٍ', 'بُعداً')} تباعَدَ فيه المقيّمان بأكثر من خطوةِ مرسًى — خلافٌ في قراءة البند، ويُناقَش أوّلاً.`
                      : 'لا بُعدَ تباعَدَ فيه المقيّمان بأكثر من خطوةِ مرسًى واحدة: التباعُدُ متراكمٌ من فروقٍ صغيرة متّسقة الاتجاه — وهذه شدّةُ مُقيِّمٍ لا خلافُ قراءة، وهي أصعبُ الحالتين.')
        + `<div class="dv">
          ${rows.map(x => {
            const lo = Math.min(x.A, x.B), hi = Math.max(x.A, x.B);
            return `<div class="dv__row" style="${x.gap > CFG.divergence ? 'background:var(--r-50);border-radius:var(--r-xs);padding-block:3px' : ''}">
              <div><b class="sm">${esc(x.d.name)}</b><div class="sm mut">${esc(x.key === 'adli' ? 'عمليات' : x.key === 'letci' ? 'نتائج' : 'زيارة')} · ${esc(x.d.k)}</div></div>
              <div class="dv__t">
                <s style="inset-inline-start:${lo}%;inline-size:${hi - lo}%"></s>
                <b class="a" style="inset-inline-start:${x.A}%"></b>
                <b class="b" style="inset-inline-start:${x.B}%"></b>
                ${x.X !== null ? `<b class="c" style="inset-inline-start:${x.X}%"></b>` : ''}
              </div>
              <div class="dv__n" style="color:${x.gap > CFG.dimGap ? 'var(--r-500)' : 'inherit'}">${ar(x.gap)}</div>
            </div>`;
          }).join('')}
          <div class="dv__lg"><span><i style="background:var(--ink-500)"></i>مقيّم 1</span>
            <span><i style="background:var(--au-500)"></i>مقيّم 2</span>
            <span><i style="background:var(--g-600)"></i>خبير اللجنة العلمية</span>
            <span><i style="background:var(--r-200)"></i>مدى التباعُد</span></div>
        </div>`)}

      ${card(head('مبرَّرات المقيّمين', 'تُقرأ قبل أيّ نقاشٍ في الرقم — فالخلافُ في القراءة لا في الحساب.')
        + [...evs.map((v, i) => ({ v, l: 'مُقيِّم ' + ar(i + 1) })), ...(ex ? [{ v: ex, l: 'خبير اللجنة العلمية' }] : [])]
          .map(({ v, l }) => `<div class="card card--flat" style="margin-block-end:var(--s-2)">
            <div class="rowj" style="margin-block-end:4px">${myRole() === 'judge' ? chip({ name: l }, 'الهويّة محجوبة') : chip(v.by, l)}<b class="num">${fmt(reviewScore(v), 1)}</b></div>
            <p class="sm mut" style="margin:0">${esc(v.note) || '<em>لم يُكتَب مبرَّر — وهذه في ذاتها ملاحظةٌ على جودة التقييم.</em>'}</p>
          </div>`).join(''))}
    </div>

    <div class="stack">
      ${card(head('الدرجة الموحَّدة', cons ? 'اعتُمِدت.' : canDo ? 'تُسجَّل بعد الحوار، ومعها مبرَّرٌ إلزاميّ.' : 'يُديرها خبيرُ اللجنة العلمية أو رئيسها.')
        + (cons ? `<div class="row" style="justify-content:center;padding-block:var(--s-3)">${dial(reviewScore(cons), 84, 'الموحَّدة')}</div>
            ${kv([['وحَّدها', esc((PEOPLE.find(p => p.id === cons.by) || {}).name || cons.by)], ['التاريخ', dt(cons.at)]])}
            <div class="hr"></div><b class="sm">المبرَّر</b><p class="sm mut">${esc(cons.rationale)}</p>`
          : canDo ? `
            <p class="sm mut">تُقترَح البدايةُ من متوسّط المقيّمَيْن، ولا تُعتمَد إلا بمبرَّر.</p>
            <div class="row" style="justify-content:center;padding-block:var(--s-3)">${dial((reviewScore(evs[0]) + reviewScore(evs[1])) / 2, 84, 'المقترَحة')}</div>
            <div class="fld"><label for="cs-r">مبرَّرُ التوحيد <span>*</span></label>
              <em>ما الذي حسم الخلاف: دليلٌ جديد، أم قراءةٌ مصحّحة للمرسى، أم نقصٌ في الاستمارة؟</em>
              <textarea id="cs-r" placeholder="مثال: اتّفق المقيّمان بعد مراجعة المحضر رقم 4 على أن التطبيق يشمل ثلاث وحداتٍ لا خمساً، فاستقرّ البُعد D عند 60."></textarea></div>
            <div class="row" style="justify-content:flex-end">${btn('اعتمادُ الدرجة الموحَّدة', `data-cons="${cid}"`, 'p')}</div>`
          : note('هذه الصفحة للاطّلاع فقط بدورك الحاليّ. تسجيلُ التوحيد صلاحيةُ خبير اللجنة العلمية ورئيسها.', 'n', 'lock')))}

      ${card(head('أثرُ التوحيد على الترتيب', 'التباعُدُ لا يُغيِّر درجةً فحسب — قد يُغيِّر مَن يبلغ الخمسة.')
        + (() => {
            const b = boards()[c.key];
            const all = b.qualified.filter(x => x.comp !== null).sort((a2, b2) => b2.comp - a2.comp);
            const near = all.slice(0, 7);
            const self = all.find(x => x.c.id === cid);
            if (self && !near.includes(self)) near.push(self);
            const cut = STAGES[1].cut;
            return table([['#', 'c'], ['الجهة'], ['المركّبة', 'c']],
              near.map((x, i) => `<tr class="${x.c.id === cid ? 'is-win' : ''} ${(x.rank2 || 0) > cut ? 'is-out' : ''}">
                <td class="c"><span class="rk ${x.rank2 === 1 ? 'rk--top' : ''}">${ar(x.rank2 || '—')}</span></td>
                <td>${esc(E(x.c.entity).name)}${x.c.id === cid ? ' ' + pill('هذا الملفّ', 'i') : ''}</td>
                <td class="c n">${fmt(x.comp, 1)}</td></tr>`))
              + `<p class="sm mut" style="margin-block-start:var(--s-2)">الخطُّ الفاصل بعد المرتبة ${ar(cut)} — وما دونه خارج المرحلة الثالثة.</p>`;
          })())}
    </div>
  </div>`;
}

/* السجلّ */
function logHtml(cid, n = 12) {
  const rows = DB.log.filter(l => !cid || l.on === cid).slice(0, n);
  if (!rows.length) return `<div class="empty" style="padding:var(--s-5)">${ic('log')}<p>لا حركاتٍ مُسجَّلة بعد في هذه الجلسة.</p></div>`;
  return `<div class="stack">${rows.map(l => `
    <div class="row sm" style="gap:var(--s-3);align-items:flex-start">
      <span class="mut num" style="min-inline-size:96px">${esc(l.at)}</span>
      <div><b>${esc(l.act)}</b> <span class="mut">— ${esc(l.who)}</span>
        ${l.detail ? `<div class="mut">${esc(l.detail)}</div>` : ''}</div></div>`).join('')}</div>`;
}
