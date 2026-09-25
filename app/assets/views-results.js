/* ============================================================
   نتائج الدورة الثامنة — بياناتٌ حقيقية
   ------------------------------------------------------------
   مصدرُها الإعلانُ الرسميّ لوزارة الصحة في حفل الجائزة.
   تُعرَض بوصفها كذلك، ولا تُخلَط بأرقام المحاكاة: لا درجةَ منشورة
   لأيّ فائز — لأن الدرجات لم تُعلَن، وعرضُ درجةٍ مُخترَعة بجانب اسمٍ
   حقيقيّ أسوأُ من ألّا يُعرَض شيء.
   ============================================================ */

/** كلُّ التتويجات مسطّحةً: {name, eid, track, cat, rank} */
function flatWins() {
  const out = [];
  RESULTS.tracks.forEach(t => t.cats.forEach(c =>
    c.winners.forEach(([name, eid], i) => out.push({ name, eid, track: t.track, cat: c.cat, rank: i + 1 }))));
  return out;
}

function viewResults() {
  const wins = flatWins();

  /* التوزيع القطاعيّ — يُحسَب من الأسماء لا يُكتَب */
  const bySector = {};
  wins.forEach(w => { const e = E(w.eid); if (e) bySector[e.sector] = (bySector[e.sector] || 0) + 1; });
  const sectorRows = Object.entries(bySector).sort((a, b) => b[1] - a[1]);

  /* المتوَّجون أكثرَ من مرّة */
  const tally = {};
  wins.forEach(w => { (tally[w.eid] = tally[w.eid] || []).push(w); });
  const repeat = Object.entries(tally).filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  /* حجمُ كلّ مسار في التتويج */
  const perTrack = RESULTS.tracks.map(t => ({
    t: T(t.track),
    cats: t.cats.length,
    n: t.cats.reduce((a, c) => a + c.winners.length, 0)
  }));

  return `
  ${pageHead('نتائج الدورة الثامنة', RESULTS.headline + ' — أُعلِنت في ' + dt(RESULTS.day) + '.',
    pill('بياناتٌ حقيقية', 'g') + link('لوحة المنصّة', '#/board'))}

  ${note(`<b>هذه الصفحةُ وحدها ليست محاكاة.</b> أسماءُ الفائزين والمسارات والفئات والأوسمة مأخوذةٌ من ${esc(RESULTS.source)}.
    وما تراه في بقيّة المنصّة من درجاتٍ وترتيبٍ ومؤشّراتٍ محاكاةٌ للتشغيل. لذلك <b>لا تجد هنا درجةً لأيّ فائز</b>:
    الدرجاتُ لم تُعلَن، ووضعُ رقمٍ مُخترَعٍ بجانب اسمٍ حقيقيّ أسوأُ من ألّا يُعرَض شيء.`, 'g', 'shield')}

  <div class="grid g-4">
    ${stat(ar(RESULT_COUNT), 'جهةً تُوِّجت', 'في ' + ar(CATS.length) + ' فئات', 'gold')}
    ${stat(ar(TRACKS.length), 'مسارات للتميّز', ar(CATS.length) + ' فئةً داخلها')}
    ${stat(ar(RESULTS.medals.length), 'أوسمةٌ مسمّاة', 'عبر المسارات', 'gold')}
    ${stat(ar(new Set(wins.map(w => w.eid)).size), 'جهةً مختلفة', ar(repeat.length) + ' منها تكرّرت', 'ink')}
  </div>

  ${card(head('الأوسمة الثلاثة', 'تُمنَح على أبعادٍ منظوميّة تعبر المسارات كلَّها — لا داخل مسار. وذهبت ثلاثتُها إلى جهاتٍ أمّ لا إلى منشأةٍ متنافسة.')
    + `<div class="honor">${RESULTS.medals.map(m => {
        const md = MEDALS.find(x => x.id === m.medal);
        const e = E(m.eid);
        return `<div class="hn">
          <div class="hn__m">${esc(md.no)}</div>
          <div style="min-inline-size:0">
            <b>${esc(md.name)}</b>
            <em style="margin-block:4px 0;color:var(--text)">${esc(m.winner)}</em>
            <div class="hn__s">${esc(md.desc)}</div>
            ${e ? `<div class="sm mut" style="margin-block-start:4px">${esc(SECTORS[e.sector].name)} · ${esc(e.region)}</div>` : ''}
          </div></div>`;
      }).join('')}</div>
    ${note('<b>ما الذي يقوله اختيارُ الأوسمة؟</b> اثنان من الثلاثة على <b>التجربة</b> — تجربة الموظف وتجربة المريض — وواحدٌ على <b>نضج إدارة الأداء</b>. أي أن أعلى تكريمٍ في الجائزة لا يُمنَح على مؤشّرٍ سريريّ، بل على ما يحمل المؤشّرات: النظام، ومن يشغّله، ومن يتلقّاه.', 'i', 'verdict')}`)}

  ${card(head('التتويج في المسارات الستّة', 'الترتيبُ داخل الفئة كما أُعلِن.')
    + RESULTS.tracks.map(rt => {
        const t = T(rt.track);
        const multi = rt.cats.length > 1;
        return `<div style="margin-block-end:var(--s-5)">
          <div class="rowj" style="margin-block-end:var(--s-3)">
            <div class="row" style="gap:8px">${ic('track')}<b style="font-size:14px">${esc(t.name)}</b></div>
            <div class="row sm">${pill(num(rt.cats.reduce((a, c) => a + c.winners.length, 0), '', 'جهتان', 'جهاتٍ', 'جهةً'), 'au')}
              ${multi ? pill(ar(rt.cats.length) + ' فئات', 'i') : ''}
              <a class="btn btn--sm" href="#/track/${t.id}">في المنصّة</a></div>
          </div>
          ${rt.cats.map(rc => {
            const cat = C(t.id + ':' + rc.cat);
            return `<div class="card card--flat" style="margin-block-end:var(--s-2)">
              ${multi ? `<div class="rowj" style="margin-block-end:var(--s-2)">
                <b class="sm">${esc(cat ? cat.name : rc.cat)}</b>
                <a class="sm" href="#/cat/${t.id}:${rc.cat}">فئتُها في المنصّة</a></div>` : ''}
              ${table([['#', 'c'], ['الجهة'], ['القطاع'], ['المنطقة']],
                rc.winners.map(([name, eid], i) => {
                  const e = E(eid);
                  return `<tr class="${i === 0 ? 'is-win' : ''}">
                    <td class="c"><span class="rk ${i === 0 ? 'rk--top' : ''}">${ar(i + 1)}</span></td>
                    <td><b>${esc(name)}</b></td>
                    <td class="sm mut">${e ? esc(SECTORS[e.sector].name) : '—'}</td>
                    <td class="sm mut">${e ? esc(e.region) : '—'}</td></tr>`;
                }))}
            </div>`;
          }).join('')}
        </div>`;
      }).join('')
    + note(`<b>حجمُ التتويج ليس واحداً.</b> ${perTrack.map(x => esc(x.t.short) + ' ' + ar(x.n)).join(' · ')}.
      رعايةُ الأمومة توّجت جهتين لا ثلاثاً، وإنقاذُ الأرواح توّج خمساً في ثلاث فئات.
      فالعتبةُ ليست «ثلاثة لكلّ مسار» — بل <b>حتى ثلاثة لكلّ فئة، ولا يُكمَل العددُ بمن لم يستحقّ</b>.
      وهذا بالضبط ما تفعله المنصّة حين يقلّ المؤهّلون عن العتبة.`, 'i', 'verdict'))}

  ${card(head('قراءةٌ في النتيجة', 'ثلاثةُ أشياء تقولها الأسماء ولا يقولها العدد.')
    + `<div class="grid g-3">
      <div class="card card--flat">
        <b class="sm">التوزيع القطاعيّ</b>
        <div class="stack" style="margin-block-start:var(--s-3)">
          ${sectorRows.map(([k, v]) => `<div class="dv__row" style="grid-template-columns:130px 1fr 34px">
            <span class="sm">${esc(SECTORS[k].name)}</span>${bar(v / RESULT_COUNT * 100, k === 'moh' ? 'g' : 'ink')}
            <span class="dv__n">${ar(v)}</span></div>`).join('')}
        </div>
        <p class="sm mut" style="margin-block-start:var(--s-3)">القطاعُ الخاصّ والعسكريّ والأرامكو حاضرون في التتويج —
          وهذا يصحّح ما افترضتُه قبل النتيجة، كما في «الحكم».</p>
      </div>

      <div class="card card--flat">
        <b class="sm">مَن تكرّر</b>
        ${repeat.length ? `<div class="stack" style="margin-block-start:var(--s-3)">
          ${repeat.map(([eid, list]) => `<div>
            <b class="sm">${esc(E(eid) ? E(eid).name : eid)}</b>
            <div class="sm mut">${list.map(w => esc(catLabel(w.track + ':' + w.cat)) + ' · المرتبة ' + ar(w.rank)).join('<br>')}</div>
          </div>`).join('')}</div>` : '<p class="sm mut">لا جهةَ تكرّرت.</p>'}
        <p class="sm mut" style="margin-block-start:var(--s-3)">التكرارُ عبر فئاتٍ مختلفة دليلُ <b>نضجٍ منظوميّ</b> لا تفوّقٍ في خدمةٍ واحدة —
          وهو ما تقيسه المرحلةُ الثانية بـ ADLI.</p>
      </div>

      <div class="card card--flat">
        <b class="sm">وحدةُ التنافس</b>
        <div class="stack" style="margin-block-start:var(--s-3)">
          ${[['منشأةٌ مفردة', wins.filter(w => E(w.eid) && E(w.eid).kind === 'hospital').length],
             ['تجمّعٌ صحيّ', wins.filter(w => E(w.eid) && E(w.eid).kind === 'cluster').length]]
            .map(([l, v]) => `<div class="dv__row" style="grid-template-columns:130px 1fr 34px">
              <span class="sm">${esc(l)}</span>${bar(v / RESULT_COUNT * 100)}<span class="dv__n">${ar(v)}</span></div>`).join('')}
        </div>
        <p class="sm mut" style="margin-block-start:var(--s-3)">التجمّعاتُ تفوز في الرعاية الأولية والإقلاع عن التبغ،
          والمنشآتُ المفردة في إنقاذ الأرواح والطوارئ والأمومة والكفاءة. <b>وحدةُ التنافس تتبع طبيعةَ الخدمة لا الهيكل الإداريّ.</b></p>
      </div>
    </div>`)}

  ${card(head('ما الذي غيّرته هذه النتيجة في المنصّة؟', 'ثلاثةُ تصحيحاتٍ بنيوية — لا بياناتٌ أُضيفت فحسب.', pill('أُجري', 'g'))
    + `<div class="stack">
      ${[['مستوى الفئة لم يكن موجوداً',
          'كان النموذج: جهة × <b>مسار</b>. والنتيجة تُظهر أن مسار إنقاذ الأرواح توّج خمساً في ثلاث فئات — ولو كانت التصفيةُ على مستوى المسار لتوّج ثلاثاً فقط.',
          'صار النموذج: جهة × <b>فئة</b>، والعتبات ١٠←٥←٣ تُطبَّق داخل الفئة، ولكلّ فئةٍ حزمةُ مؤشّراتها ومقيّموها وقاعةُ تحكيمها.'],
         ['وحدةُ التنافس كانت واحدة',
          'كان كلُّ مشاركٍ «جهةً». والنتيجة تُظهر أن التجمّعات تتنافس في الرعاية الأولية، والمستشفياتِ المفردة في إنقاذ الأرواح والطوارئ والأمومة.',
          'صار لكلّ جهةٍ نوعٌ (تجمّع · منشأة مفردة · جهةٌ أمّ)، ولكلّ فئةٍ وحدةُ تنافسٍ تقبل نوعاً بعينه. والجهةُ الأمّ لا تدخل مساراً — تُمنَح وساماً.'],
         ['الأوسمة كانت عامّة',
          'قدّرتُ من الدليل أنها «أوسمةٌ للإنجاز الاستثنائيّ» بلا مسمّى. والنتيجة تُظهر <b>ثلاثةَ أوسمةٍ مسمّاةٍ ثابتة</b>.',
          'اعتُمِدت المسمّيات الثلاثة: نضج إدارة الأداء · تحسين تجربة الموظفين · التميّز في تجربة المريض. وهي تعبر المسارات ولا تقع داخلها.']]
        .map(([t, was, now], i) => `<div class="card card--flat">
          <div class="row" style="gap:var(--s-3);align-items:flex-start">
            <span class="rub__k">${ar(i + 1)}</span>
            <div style="flex:1;min-inline-size:0">
              <b>${esc(t)}</b>
              <p class="sm mut" style="margin-block:4px">${was}</p>
              <div class="sm" style="color:var(--g-700)">${ic('check')} ${now}</div>
            </div></div></div>`).join('')}
    </div>
    ${note('<b>وتصحيحٌ رابع في الحكم لا في الشيفرة.</b> كتبتُ قبل النتيجة أن شرط «المصدر الرسميّ» يُسقِط أغلبَ ملفّات القطاعين الخاصّ والعسكريّ. النتيجةُ تدحض إطلاقَ العبارة: مستشفى الدكتور سليمان فقيه، والمواساة بالجبيل، وجونز هوبكنز أرامكو، ومستشفيا القوات المسلحة بجدة وجازان — كلُّهم في قائمة المتوَّجين. الصوابُ أن الربط الجزئيّ <b>عقبةٌ تُعالَج باتفاقية تبادل بيانات</b>، لا سقفٌ يمنع الفوز. وقد صُحِّح النصُّ في صفحة الحكم.', 'a', 'warn')}`)}
  `;
}
