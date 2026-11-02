#!/usr/bin/env node
// Regressiotestit: node tests/run.js   (valinnainen hakusana suodattaa tapaukset)
'use strict';
const fs = require('fs');
const path = require('path');
const load = require('./harness');

(async () => {
  const app = await load();
  const filter = process.argv[2] || '';
  let pass = 0, fail = 0, falseGreen = 0;
  const lines = fs.readFileSync(path.join(__dirname, 'cases.txt'), 'utf8').split('\n');
  let section = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('##')) { section = line.replace(/^#+\s*-*\s*/, ''); continue; }
    if (line.startsWith('#')) continue;
    const i = line.indexOf('|');
    const exp = line.slice(0, i).trim(), input = line.slice(i + 1).trim();
    if (filter && !input.toLowerCase().includes(filter.toLowerCase()) && !section.toLowerCase().includes(filter.toLowerCase())) continue;
    const a = app.analyze(input);
    const v = a.verdict;
    const ok = exp === '!ok' ? v !== 'ok' && v !== 'none' : exp === '!bad' ? v !== 'bad' && v !== 'none' : v === exp;
    if (ok) { pass++; continue; }
    fail++;
    if (v === 'ok' && exp !== 'ok') falseGreen++;
    const items = a.items.map(x => `${x.label}:${x.entry ? x.entry.cls : '?'}${x.fuzzy ? '~' + x.fuzzy : ''}`).join('; ');
    console.log(`✗ [${section}] odotettiin ${exp}, saatiin ${v}${v === 'ok' && exp !== 'ok' ? '  ← VÄÄRÄ VIHREÄ' : ''}\n    ${input}\n    ${items}`);
  }
  let extra = 0;
  for (const f of fs.readdirSync(__dirname).filter(f => /^t-.*\.js$/.test(f))) {
    const r = await require(path.join(__dirname, f))(app, filter);
    pass += r.pass; fail += r.fail; extra += r.fail;
  }
  console.log(`\n${pass} läpi, ${fail} epäonnistui${falseGreen ? `, joista ${falseGreen} väärää vihreää` : ''}.`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
