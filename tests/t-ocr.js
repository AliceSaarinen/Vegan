// Tekstintunnistuksen korjauksen testi: testiluettelot vääristetään tunnistukselle tyypillisillä virheillä
// (rn↔m, l↔1↔i, 0↔o, ä→a, cl↔d, ii↔u, puuttuva kirjain) ja ajetaan korjauksen läpi.
// Turvallisuusehto: luettelo, joka ei ole vegaaninen, ei saa koskaan näyttää vihreää tulosta.
// Lisäksi mitataan, kuinka usein korjaus palauttaa oikean tuloksen ilman käyttäjän vahvistusta.
'use strict';
const fs = require('fs'); const path = require('path');
module.exports = async function (app, filter) {
  if (filter && !/ocr|tunnist/.test(filter)) return { pass: 0, fail: 0 };
  const lines = fs.readFileSync(path.join(__dirname, 'cases.txt'), 'utf8').split('\n')
    .filter(l => /^(ok|bad|warn|!ok|!bad)\s*\|/.test(l)).map(l => { const i = l.indexOf('|'); return { exp: l.slice(0, i).trim(), text: l.slice(i + 1).trim() }; });
  let seed = 777; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const RULES = [[/m/, 'rn'], [/i/, 'l'], [/l/, '1'], [/o/, '0'], [/ä/, 'a'], [/ö/, 'o'], [/d/, 'cl'], [/u/, 'ii'], [/e/, 'c'], [/h/, 'li'], [/[a-zäö]/, '']];
  const corrupt = (t, conf) => t.replace(/[\p{L}]{4,}/gu, w => {
    if (rnd() > 0.3) return w;
    const r = RULES[Math.floor(rnd() * RULES.length)]; const out = w.replace(r[0], r[1]);
    if (out !== w) conf.set(out.toLowerCase(), 30 + Math.floor(rnd() * 40));
    return out;
  });
  let pass = 0, fail = 0, total = 0, sameNoReview = 0, review = 0; const bad = [];
  for (let round = 0; round < 4; round++) for (const c of lines) {
    const conf = new Map(); const noisy = corrupt(c.text, conf); if (noisy === c.text) continue;
    total++;
    const r = app.run('ocrCorrect(' + JSON.stringify(noisy) + ',{conf:new Map(' + JSON.stringify([...conf]) + ')})');
    const a = app.analyze(r.text);
    const shown = r.spans.length && a.verdict !== 'bad' ? 'review' : a.verdict;
    const orig = app.analyze(c.text).verdict;
    if (shown === 'review') review++; else if (shown === orig) sameNoReview++;
    if (shown === 'ok' && orig !== 'ok') { fail++; if (bad.length < 25) bad.push(`"${noisy}" → korjattu "${r.text}" → Vegaaninen (oikea: ${orig})`); }
    else pass++;
  }
  if (bad.length) console.log('✗ Tunnistusvirheet: ' + fail + ' väärää vihreää\n    ' + bad.join('\n    '));
  console.log(`✓ Tunnistusvirheet: ${total} vääristettyä luetteloa, oikea tulos suoraan ${Math.round(100 * sameNoReview / total)} %, vahvistettavaa ${Math.round(100 * review / total)} %, väärä vihreä ${fail}`);
  return { pass, fail };
};
