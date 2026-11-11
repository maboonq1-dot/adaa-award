/* جائزة أداء الصحة — لوحة الجائزة، وقاعة التحكيم، والحجب والتظلّم، والسجلّ */

/* ============ جدول ترتيبٍ مشترك ============ */
function boardTable(b, full = false) {
  const rows = b.rows.slice().sort((x, y) => {
    const o = { winner: 0, honored: 1, finalist: 2, qualified: 3, out2: 4, out1: 5, ineligible: 6, blocked: 7 };
    return (o[x.state] - o[y.state]) || (y.s1s - x.s1s);
  });
  if (!rows.length) return empty('لا مشاركات في هذا المسار.');

  return table([['#', 'c'], ['الجهة'], ['القطاع'], ['الحالة'], ['م1', 'c'], ['م2', 'c'], ['المركّبة', 'c'], ['التباعُد', 'c'], ['', 'c']],
    rows.map((r, i) => {
      const ent = E(r.c.entity);
      const cut = full && b.qualified.length && r.c.id === b.qualified[b.qualified.length - 1].c.id;
      const win = ['winner', 'honored'].includes(r.state);
      const out = ['out1', 'out2', 'ineligible'].includes(r.state);
      return `<tr class="${cut ? 'is-cut' : ''} ${win ? 'is-win' : ''} ${out ? 'is-out' : ''}">
        <td class="c"><span class="rk ${r.finalPos === 0 ? 'rk--top' : ''}">${r.rank2 ? ar(r.rank2) : r.rank1 ? ar(r.rank1) : '—'}</span></td>
        <td><span class="ent">${esc(ent.name)}<em>${esc(ent.region)}</em></span></td>
        <td class="sm mut">${esc(SECTORS[ent.sector].name)}</td>
        <td>${stateBadge(r.state)}</td>
        <td class="c n">${fmt(r.s1s, 1)}</td>
        <td class="c n">${fmt(r.s2s, 1)}</td>
        <td class="c n"><b>${fmt(r.comp, 1)}</b></td>
        <td class="c n">${r.divergence === null ? '—' : `<span style="color:${r.needsConsensus ? 'var(--r-500)' : 'var(--text-3)'}">${fmt(r.divergence, 1)}</span>`}</td>
        <td class="c"><a href="#/case/${r.c.id}">افتح</a></td></tr>`;
    }));
}

/* ============ لوحة الجائزة ============ */
function viewBoard() {
  const st = cycleStats(), b = boards();
  const maxAll = Math.max(...CATS.map(c => b[c.key].counts.all));

  return `
  ${pageHead('لوحة الجائزة', 'حالةُ الدورة الثامنة في مسارٍ واحد: من سجّل، ومن اجتاز الأهليّة، ومن تأهّل، ومن بلغ التحكيم، ومن فاز. والتصفيةُ تجري داخل <b>الفئة</b> لا المسار.',
    link('النتائج المعلنة', '#/results', 'gold') + link('السجلّ', '#/log') + link('الحجب والتظلّم', '#/appeals'))}

  <div class="grid g-6">
    ${stat(ar(st.entities), 'جهةٌ مُسجَّلة')}
    ${stat(ar(st.cases), 'ملفّ مشاركة', ar(st.cats) + ' فئات')}
    ${stat(ar(st.eligible), 'اجتاز الأهليّة', pc(st.eligible / st.cases * 100, 0), 'ink')}
    ${stat(ar(st.qualified), 'متأهّلٌ للمرحلة 2', 'أفضل 10/فئة', 'ink')}
    ${stat(ar(st.finalists), 'بلغ التحكيم', 'أفضل 5/فئة', 'gold')}
    ${stat(ar(st.diverging), 'تباعُدٌ مفتوح', st.diverging ? 'يوقف الاعتماد' : 'لا شيء', st.diverging ? 'red' : '')}
  </div>

  ${card(head('القِمع في الفئات العشر', 'العرضُ الأفقيّ يقيس عدد المسجّلين، والدرجاتُ اللونيّة تقيس عمق التصفية. لكلّ فئةٍ ترتيبُها وفائزُها.')
    + TRACKS.map(t => {
        const tt = trackTotals(t.id);
        return `<div style="margin-block-end:var(--s-4)">
          <div class="rowj" style="margin-block-end:6px">
            <a href="#/track/${t.id}" style="display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:13px;color:inherit;text-decoration:none">${trackIc(t.id)}${esc(t.name)}</a>
            <span class="sm mut">${ar(tt.all)} مُسجَّلاً · ${ar(tt.eligible)} مؤهَّلاً${t.cats.length > 1 ? ' · ' + num(t.cats.length, '', 'فئتان', 'فئاتٍ', 'فئةً') : ''}</span>
          </div>
          <div class="funnel">${t.cats.map(cat => {
            const bb = b[cat.key], c = bb.counts;
            const seg = [[bb.confirmed ? 3 : 0, 4], [c.finalists - (bb.confirmed ? 3 : 0), 3], [c.qualified - c.finalists, 2], [c.eligible - c.qualified, 1], [c.all - c.eligible, 0]];
            return `<div class="fn fn--k fn--seg">
              <div class="fn__l"><a href="#/cat/${cat.key}" style="color:inherit;text-decoration:none">${esc(t.cats.length > 1 ? cat.short : 'الفئة العامة')}</a>
                <em>${esc(cat.unit === 'cluster' ? 'تجمّعات' : cat.unit === 'hospital' ? 'منشآت مفردة' : 'تجمّعاتٌ ومنشآت')} · ${ar(c.all)} مُسجَّلاً</em></div>
              <div class="fn__t">
                ${seg.map(([n, i]) => n > 0 ? `<i style="flex:${n};background:${['var(--n-300)', 'var(--ink-200)', 'var(--ink-400)', 'var(--ink-700)', 'linear-gradient(90deg,var(--au-500),var(--au-300))'][i]}" title="${['خارج الأهليّة', 'خرج بعد م1', 'خرج بعد م2', 'بلغ التحكيم', 'مُكرَّم'][i]}: ${n}"></i>` : '').join('')}
                <i style="flex:${Math.max(0, maxAll - c.all)};background:transparent"></i>
              </div>
              <div class="fn__n">${bb.confirmed ? `<span style="color:var(--au-600)">${ar(3)}</span>` : `<span class="mut">${ar(c.finalists)}</span>`}</div>
            </div>`;
          }).join('')}</div></div>`;
      }).join('')
    + `<div class="dv__lg" style="margin-block-start:var(--s-3)">
      <span><i style="background:var(--au-400)"></i>مُكرَّم</span>
      <span><i style="background:var(--ink-700)"></i>بلغ التحكيم</span>
      <span><i style="background:var(--ink-400)"></i>خرج بعد المرحلة 2</span>
      <span><i style="background:var(--ink-200)"></i>خرج بعد المرحلة 1</span>
      <span><i style="background:var(--n-300)"></i>لم يجتز الأهليّة</span>
    </div>`)}

  ${card(head('الترتيب الكامل', `${nCase(st.cases)} · مرتَّبةٌ بالحالة ثم بالدرجة`,
      `<select class="top__sel" data-bfilter>
        <option value="">كلُّ الفئات</option>
        ${CATS.map(c => `<option value="${c.key}" ${BFILTER === c.key ? 'selected' : ''}>${esc(catLabel(c.key))}</option>`).join('')}
      </select>`)
    + (BFILTER ? boardTable(b[BFILTER], true) : allTable()))}
  `;
}

/* ============ صفحةُ فئة ============ */
function viewCat(key) {
  const cat = C(key); if (!cat) return viewBoard();
  const t = T(cat.track), b = boards()[key];
  const st = STAGES;
  const funnel = [
    ['سجّل في الفئة', b.counts.all, 0, 'تسجيلٌ مفتوحٌ لكلّ ' + (cat.unit === 'cluster' ? 'التجمّعات' : cat.unit === 'hospital' ? 'المنشآت المفردة' : 'الجهات')],
    ['اجتاز الأهليّة', b.counts.eligible, 1, 'ثلاثةُ شروطٍ قاطعة'],
    [st[0].cutLabel, b.counts.qualified, 2, 'المرحلة الأولى · مؤشّرات الأداء'],
    [st[1].cutLabel, b.counts.finalists, 3, 'المرحلة الثانية · تقييم الأنظمة'],
    [st[2].cutLabel, b.confirmed ? 3 : 0, 4, 'المرحلة الثالثة · التحكيم']
  ];
  const max = b.counts.all || 1;

  return `
  ${pageHead(t.cats.length > 1 ? cat.name : t.name, t.aim,
    pill(cat.unit === 'cluster' ? 'وحدةُ التنافس: التجمّع الصحيّ' : cat.unit === 'hospital' ? 'وحدةُ التنافس: المنشأة المفردة' : 'وحدةُ التنافس: تجمّعاتٌ ومنشآت', 'i')
    + link('كلُّ فئات المسار', '#/track/' + t.id),
    `<a href="#/board">لوحة الجائزة</a> ${ic('arrow')} <a href="#/track/${t.id}">${esc(t.short)}</a> ${ic('arrow')} ${esc(cat.short)}`)}

  ${card(head('القِمع', 'التصفيةُ تجري داخل الفئة — فالمنافسة بين نظراء يُقاسون بالحزمة نفسها.')
    + `<div class="funnel">${funnel.map(([l, n, i, sub]) => `
      <div class="fn fn--${i}">
        <div class="fn__l">${esc(l)}<em>${esc(sub)}</em></div>
        <div class="fn__t"><i style="inline-size:${(n / max * 100).toFixed(1)}%"></i></div>
        <div class="fn__n">${ar(n)}</div>
      </div>`).join('')}</div>
    ${b.counts.eligible < st[0].cut
      ? note(`<b>حالةٌ يجب أن تُعلَن لا أن تُغطّى.</b> عددُ المؤهّلين في هذه الفئة ${ar(b.counts.eligible)} — أقلُّ من عتبة «أفضل ${ar(st[0].cut)}». المنصّة لا تُكمِل العددَ بجهاتٍ غير مؤهّلة: تأهّل من استوفى.`, 'a', 'warn')
      : ''}`)}

  ${card(head('حزمة المؤشّرات', `${num(cat.kpis.length, 'مؤشّرٌ واحد', 'مؤشّران', 'مؤشّراتٍ', 'مؤشّراً')} خاصّةٌ بالفئة، وثلاثةٌ مشتركةٌ تُقاس في كلّ الفئات.`)
    + table([['المؤشّر'], ['المستهدَف الوطنيّ', 'c'], ['الاتجاه', 'c'], ['قراءةُ الأفضل']],
      kpisOf(key).map(k => {
        const shared = SHARED.some(x => x.id === k.id);
        return `<tr>
          <td><b>${esc(k.name)}</b> ${shared ? pill('مشترك', 'i') : ''}</td>
          <td class="c n">${k.better === 'band' ? ar(k.band[0]) + '–' + ar(k.band[1]) : unit(k.target, k, k.unit === 'يوم' ? 1 : 0)}</td>
          <td class="c">${ic(k.better === 'down' ? 'down' : k.better === 'band' ? 'flat' : 'up')}</td>
          <td class="mut sm">${k.better === 'band' ? 'نطاقٌ ذو حدَّين — الأقلّ سعةٌ معطّلة، والأكثر نظامٌ بلا احتياطي'
            : k.better === 'down' ? 'كلّما قلَّ كان أفضل' : 'كلّما زاد كان أفضل'}</td></tr>`;
      })))}

  ${CAN.board.includes(myRole())
    ? card(head('الترتيب', `${nCase(b.counts.all)} في هذه الفئة · ${ar(b.counts.eligible)} اجتاز الأهليّة`) + boardTable(b, true))
    : card(head('الترتيب', 'محجوبٌ عن دورك الحاليّ.')
        + note('المُقيِّمُ الذي يعرف موقعَ الجهة قبل أن يضع درجتَه يُقيِّم الموقعَ لا الملفّ. بندٌ في مصفوفة الصلاحيات، مفروضٌ هنا لا مكتوبٌ فقط.', 'i', 'lock'))}
  `;
}

function allTable() {
  const rows = [];
  CATS.forEach(c => boards()[c.key].rows.forEach(r => rows.push(r)));
  const o = { winner: 0, honored: 1, finalist: 2, qualified: 3, out2: 4, out1: 5, ineligible: 6, blocked: 7 };
  rows.sort((x, y) => (o[x.state] - o[y.state]) || ((y.comp ?? y.s1s) - (x.comp ?? x.s1s)));
  return table([['الجهة'], ['المسار · الفئة'], ['الحالة'], ['م1', 'c'], ['م2', 'c'], ['المركّبة', 'c'], ['', 'c']],
    rows.slice(0, 60).map(r => {
      const ent = E(r.c.entity), win = ['winner', 'honored'].includes(r.state);
      return `<tr class="${win ? 'is-win' : ''} ${['out1', 'out2', 'ineligible'].includes(r.state) ? 'is-out' : ''}">
        <td><span class="ent">${esc(ent.name)}<em>${esc(SECTORS[ent.sector].name)}</em></span></td>
        <td class="sm">${esc(caseLabel(r.c))}</td>
        <td>${stateBadge(r.state)}</td>
        <td class="c n">${fmt(r.s1s, 1)}</td><td class="c n">${fmt(r.s2s, 1)}</td>
        <td class="c n"><b>${fmt(r.comp, 1)}</b></td>
        <td class="c"><a href="#/case/${r.c.id}">افتح</a></td></tr>`;
    })) + `<p class="sm mut" style="margin-block-start:var(--s-3)">تُعرَض أوّلُ 60 صفّاً — اختر فئةً لترى ترتيبَها كاملاً.</p>`;
}

/* ============ قاعة التحكيم ============ */
function viewJudging() {
  const b = boards();
  const isChair = ME === 'U-JD1';

  return `
  ${pageHead('قاعة التحكيم · المرحلة الثالثة',
    'مراجعةٌ نهائية من لجنة التحكيم لتأكيد الجهات الفائزة واعتماد أوجه التكريم. اللجنةُ لا تُعيد التقييم — تتحقّق من سلامة العملية وتعتمد الترتيب أو تعدّله بمبرَّرٍ مُسجَّل.',
    pill(isChair ? 'رئيس اللجنة' : 'عضو', isChair ? 'au' : 'i'))}

  ${note('<b>ما الذي أمام اللجنة؟</b> خمسةُ ملفّاتٍ لكلّ <b>فئة</b> — لا لكلّ مسار، فمسارٌ ذو ثلاث فئاتٍ تُعرَض عليه خمسةَ عشرَ ملفّاً وثلاثةُ تتويجاتٍ منفصلة، ولكلٍّ درجةٌ مركّبة نصفُها من مؤشّراتٍ رسمية ونصفُها من تقييمٍ بشريٍّ مُوحَّد. الترتيبُ المعروض هو ناتجُ الحساب — وصلاحيةُ اللجنة أن تعتمده أو تُخالفه، بشرطِ مبرَّرٍ يُسجَّل ويُقرأ في التظلّم.', 'i', 'gavel')}

  ${TRACKS.map(t => t.cats.map(cat => judgeCat(t, cat, b[cat.key], isChair)).join('')).join('')}
  `;
}

function judgeCat(t, cat, b, isChair) {
  const key = cat.key;
  const fin = b.finalists;
  if (!fin.length) return card(head(catLabel(key, true)) + empty('لم يبلغ هذه الفئةَ متأهّلون بعد.'));

  const myBallot = (DB.ballots[key] || {})[ME];
  const ids = fin.map(r => r.c.id);
  const order = myBallot || ids.slice();
  const bal = DB.ballots[key] || {};
  const cast = Object.keys(bal).length;
  const judges = PEOPLE.filter(p => p.role === 'judge').length;

  const pts = {}; ids.forEach(i => pts[i] = 0);
  Object.values(bal).forEach(l => l.forEach((id, i) => { if (pts[id] !== undefined) pts[id] += ids.length - i; }));
  const tally = ids.slice().sort((a, c) => pts[c] - pts[a]);
  const conf = DB.confirmed[key];

  return card(head(catLabel(key, true),
      conf ? `اعتُمِد في ${dt(conf.at)} — ${esc(conf.rationale)}` : `${ar(cast)} من ${ar(judges)} محكّمين أدلَوا ببطاقاتهم.`,
      conf ? pill('مُعتمَد', 'g') : cast === judges ? pill('جاهزٌ للاعتماد', 'a') : pill('بانتظار البطاقات', ''), 'judge-' + key)
    + `<div class="split" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
      <div>
        <b class="sm">بطاقتي — رتِّب الخمسة</b>
        <p class="sm mut">الترتيبُ الأوّليّ هو ترتيبُ الدرجة المركّبة. حرِّكه إن رأيتَ ما لا يلتقطه الرقم — واكتب سببَك.</p>
        <div class="stack" style="margin-block-start:var(--s-3)">
          ${order.map((id, i) => {
            const r = fin.find(x => x.c.id === id);
            return `<div class="row" style="gap:var(--s-2);padding:7px var(--s-3);border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface)">
              <span class="rk ${i === 0 ? 'rk--top' : ''}">${ar(i + 1)}</span>
              <div style="flex:1;min-inline-size:0"><span class="ent">${esc(E(r.c.entity).name)}</span></div>
              <span class="num sm mut">${fmt(r.comp, 1)}</span>
              ${conf ? '' : `<button class="btn btn--sm" data-bal="${key}|${i}|-1" ${i === 0 ? 'disabled' : ''}>▲</button>
              <button class="btn btn--sm" data-bal="${key}|${i}|1" ${i === order.length - 1 ? 'disabled' : ''}>▼</button>`}
            </div>`;
          }).join('')}
        </div>
        ${conf ? '' : `<div class="row" style="justify-content:flex-end;margin-block-start:var(--s-3)">
          ${btn(myBallot ? 'تحديثُ بطاقتي' : 'إيداعُ بطاقتي', `data-bal-send="${key}"`, 'p')}</div>`}
      </div>

      <div>
        <b class="sm">المحصّلة</b>
        <p class="sm mut">تُحسَب بنقاط بوردا: المركزُ الأول من كلّ بطاقةٍ ${ar(ids.length)} نقاط، والأخير نقطةٌ واحدة.</p>
        ${cast ? table([['#', 'c'], ['الجهة'], ['نقاط', 'c'], ['المركّبة', 'c'], ['التكريم', 'c']],
          (conf ? conf.order : tally).map((id, i) => {
            const r = fin.find(x => x.c.id === id);
            return `<tr class="${i < 3 && conf ? 'is-win' : ''}">
              <td class="c"><span class="rk ${i === 0 ? 'rk--top' : ''}">${ar(i + 1)}</span></td>
              <td>${esc(E(r.c.entity).name)}</td>
              <td class="c n">${ar(pts[id] || 0)}</td>
              <td class="c n">${fmt(r.comp, 1)}</td>
              <td class="c">${conf && i < 3 ? `<span class="bdg bdg--gold">${ic('medal')}${esc(HONORS[i].name)}</span>` : '<span class="mut">—</span>'}</td></tr>`;
          })) : empty('لم تُودَع بطاقاتٌ بعد.')}
        ${!conf && isChair && b.counts.diverging ? note(`<b>الاعتمادُ موقوف.</b> في هذه الفئة ${ar(b.counts.diverging)} ملفّاً بتباعُدٍ مفتوحٍ بين المقيّمَيْن. لجنةُ التحكيم تعتمد <b>ترتيباً</b>، وترتيبٌ مبنيٌّ على درجةٍ لم تُوحَّد هو ترتيبٌ بلا سند. تُغلَق الحوارات من مكتب اللجنة العلمية أوّلاً.`, 'r', 'shield') : ''}
        ${!conf && isChair && cast && !b.counts.diverging ? `
          <div class="fld" style="margin-block-start:var(--s-3)"><label for="cf-${key}">مبرَّرُ الاعتماد <span>*</span></label>
            <em>إن خالف الاعتمادُ محصّلةَ البطاقات فالمبرَّرُ شرطُ صحّة، لا صيغةٌ إنشائية.</em>
            <textarea id="cf-${key}" placeholder="مثال: اعتُمِدت المحصّلة كما هي بعد التحقّق من اكتمال محاضر التوحيد في الملفّات الخمسة."></textarea></div>
          <div class="row" style="justify-content:flex-end">${btn('اعتمادُ الفائزين وأوجه التكريم', `data-confirm="${key}"`, 'gold')}</div>` : ''}
        ${!conf && !isChair ? note('الاعتمادُ صلاحيةُ رئيس لجنة التحكيم وحده. بطاقتك تدخل المحصّلة.', 'n', 'lock') : ''}
        ${conf ? note(`<b>اعتُمِد.</b> ${esc(conf.rationale)}`, 'g', 'check') : ''}
      </div>
    </div>`, conf ? 'card--gold' : '');
}

/* حالةُ النافذة تُحسَب من تاريخ اليوم — «مفتوحة الآن» نصّاً ثابتاً كذبةٌ بعد 21 أكتوبر */
function appealNote() {
  const w = appealWindow();
  if (w.st === 'open') {
    const left = w.days === 0 ? 'واليوم آخرُ يوم'
      : 'وبقي ' + num(w.days, 'يومٌ واحد', 'يومان', 'أيام', 'يوماً');
    return note(`<b>النافذة مفتوحة الآن.</b> أُعلنت النتائج في ${dt(CYCLE.ceremony)}، وتنتهي المدة في ${dt(CYCLE.appealEnds)}، ${left}.`, 'a', 'warn');
  }
  if (w.st === 'before')
    return note(`<b>النافذة لم تُفتح بعد.</b> تبدأ بإعلان النتائج في ${dt(CYCLE.ceremony)}.`, 'n', 'lock');
  return note(`<b>أُغلقت النافذة.</b> انتهت المدة في ${dt(CYCLE.appealEnds)}، قبل ${num(w.days, 'يومٍ واحد', 'يومين', 'أيام', 'يوماً')}. لا تُقبل تظلّمات جديدة، ويبقى للجنة أن تبتّ فيما قُدِّم قبل الإغلاق.`, 'n', 'lock');
}

/* ============ الحجب والتظلّم ============ */
function viewAppeals() {
  const blocked = Object.keys(OVERRIDE).map(id => rowOf(id)).filter(Boolean);
  const can = ['appeals', 'sec'].includes(myRole());

  return `
  ${pageHead('الحجب والتظلّم',
    `تتولّى اللجنةُ النظرَ في حالات الحجب والتظلّمات، والتحقّق من سلامة الإجراءات وفق الضوابط المعتمدة. تُقدَّم التظلّمات خلال ${ar(CYCLE.appealWeeks)} أسابيع من تاريخ حفل الجائزة وإعلان النتائج.`)}

  <div class="grid g-4">
    ${stat(ar(blocked.length), 'ملفٌّ محجوب', '', blocked.length ? 'red' : '')}
    ${stat(ar(DB.appeals.length), 'تظلُّمٌ مُقدَّم')}
    ${stat(ar(DB.appeals.filter(a => a.status === 'قيد النظر').length), 'قيد النظر', '', 'ink')}
    ${stat(ar(CYCLE.appealWeeks), 'أسابيع النافذة', 'من ' + dt(CYCLE.ceremony))}
  </div>

  ${appealNote()}

  ${card(head('نافذة التظلّم', 'المدّةُ تبدأ من تاريخ حفل الجائزة وإعلان النتائج، لا من تاريخ التبليغ الفرديّ.')
    + kv([
      ['بداية النافذة', dt(CYCLE.ceremony)],
      ['نهايتها', dt(CYCLE.appealEnds)],
      ['القناة', `<span class="num" dir="ltr">${CYCLE.email}</span>`],
      ['ما يُنظَر فيه', 'سلامةُ الإجراء: هل طُبِّقت القاعدة المنشورة كما نُشِرت؟'],
      ['ما لا يُنظَر فيه', 'إعادةُ التقييم الموضوعيّ — التظلّمُ ليس فرصةَ تقييمٍ ثانية.']
    ]))}

  ${card(head('الملفّات المحجوبة', 'الحجبُ إجراءٌ استثنائيّ، ويبقى الملفُّ ظاهراً في اللوحة بحالته — الحذفُ الصامت يُفسِد الأثر.')
    + (blocked.length ? table([['الجهة'], ['المسار'], ['الحالة قبل الحجب'], ['', 'c']],
      blocked.map(r => `<tr><td><span class="ent">${esc(E(r.c.entity).name)}</span></td>
        <td>${esc(caseLabel(r.c))}</td>
        <td>${pill('كان ضمن المتأهّلين', 'a')}</td>
        <td class="c"><a href="#/entity/${r.c.id}">الملفّ</a></td></tr>`)) : empty('لا ملفّات محجوبة.')))}

  ${card(head('التظلّمات', can ? 'لك أن تبتّ في التظلّم بقرارٍ مُسبَّب.' : 'تُعرَض للاطّلاع بدورك الحاليّ.')
    + (DB.appeals.length ? DB.appeals.map((a, i) => `
      <div class="card card--flat" style="margin-block-end:var(--s-2);border-color:${a.status === 'قيد النظر' ? 'var(--am-200)' : 'var(--line)'}">
        <div class="rowj">
          <div><b>${esc(E(CASE(a.case).entity).name)}</b> <span class="mut sm">· ${esc(caseLabel(CASE(a.case)))}</span></div>
          ${pill(a.status, a.status === 'مقبول' ? 'g' : a.status === 'مرفوض' ? 'r' : 'a')}
        </div>
        <p class="sm" style="margin-block:6px">${esc(a.text)}</p>
        <div class="sm mut">${dt(a.at)} — ${esc(a.by)}</div>
        ${a.decision ? `<div class="hr" style="margin-block:var(--s-3)"></div>
          <div class="sm"><b>قرارُ اللجنة:</b> ${esc(a.decision)}</div>` : can ? `
          <div class="hr" style="margin-block:var(--s-3)"></div>
          <div class="fld"><label for="dc-${i}">قرارٌ مُسبَّب</label>
            <textarea id="dc-${i}" placeholder="اذكر البند الإجرائيّ الذي بُنِي عليه القرار."></textarea></div>
          <div class="row" style="justify-content:flex-end">
            ${btn('قبولُ التظلّم', `data-apdec="${i}|مقبول"`, 'p')}
            ${btn('رفضُ التظلّم', `data-apdec="${i}|مرفوض"`, 'red')}</div>` : ''}
      </div>`).join('') : empty('لا تظلّماتٍ مُقدَّمة في هذه الجلسة.')))}
  `;
}

/* ============ السجلّ ============ */
function viewLog() {
  return `
  ${pageHead('السجلّ', 'كلُّ تغييرٍ في حالةِ ملفٍّ يحمل: مَن، ومتى، وبأيّ صلاحية، وعلى أيّ مستند. السجلُّ لا يُمحى، وهو أوّلُ ما تطلبه لجنةُ التظلّم.')}
  ${card(head(`${num(DB.log.length, 'حركةٌ واحدة', 'حركتان', 'حركاتٍ', 'حركةً')} في هذه الجلسة`,
      'النموذجُ يبدأ بسجلٍّ فارغ: كلُّ ما تراه هنا فعلتَه أنت الآن — وهذا مقصود.', '', 'log')
    + logHtml(null, 100))}
  `;
}
