// Demotuotteet (demo.json): sovelluksen oma analyysi jokaiselle tuotteelle verrattuna käsin tarkistettuun tulokseen.
'use strict';
const fs = require('fs'); const path = require('path');
module.exports = async function (app, filter) {
  if (filter && !/demo/.test(filter)) return { pass: 0, fail: 0 };
  const demo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'demo.json'), 'utf8')).products;
  let pass = 0, fail = 0;
  for (const [ean, d] of Object.entries(demo)) {
    const a = app.analyze(d.ingredients, d.name);
    const unk = a.unknown.map(x => x.label);
    const ok = a.verdict === d.expected && (d.expected === 'warn' ? (a.prob != null || d.partial || d.allowUnknown) : true) && (d.expected !== 'warn' || d.partial || d.allowUnknown || !unk.length);
    if (ok) { pass++; continue; }
    fail++;
    console.log(`✗ [Demo] ${d.name} (${ean}): odotettiin ${d.expected}, saatiin ${a.verdict}${a.verdict === 'ok' && d.expected !== 'ok' ? '  ← VÄÄRÄ VIHREÄ' : ''}${unk.length ? '\n    tuntemattomat: ' + unk.join(' | ') : ''}`);
  }
  console.log(`✓ Demotuotteet: ${pass}/${pass + fail} oikein`);
  return { pass, fail };
};
