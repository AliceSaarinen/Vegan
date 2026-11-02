// Reseptimuunnoksen testit: korvikkeet, roolit, ohjeiden päivitys ja kielten pysyminen erillään.
'use strict';
const fs = require('fs'); const path = require('path');
module.exports = async function (app, filter) {
  if (filter && !/resep|recipe/.test(filter)) return { pass: 0, fail: 0 };
  const recs = fs.readFileSync(path.join(__dirname, 'recipes.txt'), 'utf8').split('\n=====\n');
  const R = {}; for (const t of recs) { const c = app.convertRecipe(t); R[c.r.title] = c; }
  let pass = 0, fail = 0;
  const steps = c => c.newSteps.map(x => x.html).join(' ');
  const sub = (c, re) => c.out.find(o => o.type === 'sub' && re.test(o.ln.name));
  const parts = o => o ? o.res.parts.map(p => p.name).join(' + ') : '';
  const t = (name, cond, info) => { if (cond) pass++; else { fail++; console.log('✗ Resepti: ' + name + (info ? '\n    ' + info : '')); } };
  const fiAnimal = /\b(jauheliha\w*|maito\w*|maido\w*|munat|munaa|muna|keltuai\w*|valkuai\w*|kerma\w*|voi\w*|pekoni\w*|lohi|lohen|liivat\w*)\b/i;

  let c = R['Kaalilaatikko'];
  t('kaalilaatikko: jauheliha korvattu', /kasvisjauheliha/.test(parts(sub(c, /jauheliha/))));
  t('kaalilaatikko: muna sidontaan', /pellava/.test(parts(sub(c, /kananmuna/))), parts(sub(c, /kananmuna/)));
  t('kaalilaatikko: ei leivonnainen', !c.ctx.baking);

  c = R['Pannukakku'];
  t('pannukakku: muna hyydyttää (ei aquafaba+leivinjauhe)', /tärkkelys/.test(parts(sub(c, /muna/))), parts(sub(c, /muna/)));
  t('pannukakku: ei etikkasääntöä eikä pidempää paistoaikaa', !c.combo && /25–30/.test(steps(c)), steps(c));
  c = R['Uunipannukakku'];
  t('uunipannukakku: muna hyydyttää', /tärkkelys/.test(parts(sub(c, /muna/))), parts(sub(c, /muna/)));

  c = R['Pasta carbonara'];
  t('carbonara: keltuaiset tärkkelysseokseksi', /tärkkelys/.test(parts(sub(c, /keltuai/))));
  t('carbonara: spagetti säilyy', !sub(c, /spagett/) || /spagett/.test(parts(sub(c, /spagett/))));

  c = R['Lohikeitto'];
  t('lohikeitto: liemi → kasvisliemessä', /kasvisliemessä/.test(steps(c)), steps(c));
  t('lohikeitto: sitruunamehu mukana', /sitruunamehu/.test(parts(sub(c, /lohta/))));

  c = R['Pancakes'];
  t('pancakes: kieli englanti', c.lang === 'en');
  t('pancakes: ohjeissa ei suomea', !/(margariini|soijajuoma|vaahterasiirappi|pellavaseos|aquafaban)/.test(steps(c)), steps(c));
  t('pancakes: buttermilk ja honey korvattu ohjeissa', /<mark>soy milk|<mark>maple syrup/.test(steps(c)) && !/\bbuttermilk\b(?![^<]*<\/mark>)/.test(steps(c).replace(/<mark>[^<]*<\/mark>/g, '')), steps(c));
  t('pancakes: 1 1/2 cups luettu oikein', (c.r.ing.find(i => /buttermilk/.test(i.name)) || {}).q === 1.5);
  t('pancakes: ei uunileivonnainen', !c.ctx.baking);
  const allParts = c.out.filter(o => o.res).flatMap(o => o.res.parts.map(p => p.name));
  t('pancakes: kaikki korvikkeiden nimet käännetty', allParts.every(n => app.run('ent(' + JSON.stringify(n) + ')') !== n || /^[a-z ]+$/.test(n)), allParts.filter(n => app.run('ent(' + JSON.stringify(n) + ')') === n).join(', '));

  c = R['Kladdkaka'];
  t('kladdkaka: ei kohotusta', !/leivinjauhe|bakpulver/.test(parts(sub(c, /ägg/))), parts(sub(c, /ägg/)));
  t('kladdkaka: ei pidempää paistoaikaa', !c.combo && /15 min/.test(steps(c)), steps(c));

  c = R['Brownies'];
  t('brownies: ei kohotusta', !/leivinjauhe/.test(parts(sub(c, /egg/))), parts(sub(c, /egg/)));

  c = R['Tiramisu'];
  t('tiramisu: ei leivonnainen', !c.ctx.baking);
  t('tiramisu: munat erotellaan', /aquafaba/.test(parts(sub(c, /muna/))) && /tärkkelys/.test(parts(sub(c, /muna/))), parts(sub(c, /muna/)));
  t('tiramisu: ohjeessa ei keltuaisia/valkuaisia', !/keltuai|valkuai/i.test(steps(c).replace(/<mark>[^<]*<\/mark>/g, '')), steps(c));

  c = R['Mousse au chocolat'];
  t('mousse: ohjeessa ei keltuaisia/valkuaisia', !/keltuai|valkuai/i.test(steps(c).replace(/<mark>[^<]*<\/mark>/g, '')), steps(c));

  c = R['Mustikkapiirakka'];
  const eggs = c.out.filter(o => o.type === 'sub' && /muna/.test(o.ln.name));
  t('mustikkapiirakka: täytteen muna hyydyttää', eggs.length === 2 && /tärkkelys/.test(parts(eggs[1])), eggs.map(parts).join(' | '));

  c = R['Fiskgryta'];
  t('fiskgryta: ruotsi', c.lang === 'sv');
  t('fiskgryta: ohjeet ruotsiksi', /<mark>(havregrädde|havregrädden)/.test(steps(c)) && /<mark>tofun?<\/mark>/.test(steps(c)), steps(c));

  // Yleinen: suomenkielisten ohjeiden jäljelle jääneet eläinperäiset sanat
  for (const [name, cc] of Object.entries(R)) {
    if (cc.lang !== 'fi' || !cc.changed) continue;
    const plain = steps(cc).replace(/<mark>[^<]*<\/mark>/g, ' ');
    const m = plain.match(fiAnimal);
    t(name + ': ohjeisiin ei jäänyt eläinperäistä sanaa', !m || /^(voi|voin)$/i.test(m[0]) || /tummaa suklaata/.test(m[0]), m && m[0] + ' — ' + plain);
  }
  return { pass, fail };
};
