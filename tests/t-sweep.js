// Laajat automaattiset tarkistukset koko tietokannalle.
// 1) Jokainen eläinperäiseksi kirjattu nimi (oma tietokanta, ruotsin sanasto, OFF, INCI) ei saa antaa vihreää,
//    ei sellaisenaan, taivutettuna, etuliitteen kanssa eikä luettelon keskellä.
// 2) Yhden merkin kirjoitusvirhe eläinperäisessä nimessä ei saa antaa vihreää.
// 3) Tuntematon alkuosa + vegaaninen pääsana ei saa antaa vihreää.
'use strict';
module.exports = async function (app, filter) {
  if (filter && !/sweep|lakaisu/.test(filter)) return { pass: 0, fail: 0 };
  let pass = 0, fail = 0; const bad = [];
  const seen = new Set();
  const A = [];
  for (const [k, e] of app.MAP) if (e && e.cls === 'A' && !seen.has(k)) { seen.add(k); A.push(k); }
  for (const [k, e] of app.SVMAP) if (e && e.cls === 'A' && !seen.has(k)) { seen.add(k); A.push('sv:' + k); }
  const check = (txt, why) => {
    const a = app.analyze(txt);
    if (a.verdict === 'ok') { fail++; if (bad.length < 60) bad.push(`${why}: "${txt}" → Vegaaninen`); } else pass++;
  };
  // satunnaisuus toistettavaksi
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const letters = 'abdefghijklmnoprstuvyäö';
  for (const raw of A) {
    const sv = raw.startsWith('sv:'); const t = sv ? raw.slice(3) : raw;
    if (sv) { check('vatten, socker, ' + t + ', salt', 'ruotsi'); continue; }
    check(t, 'sellaisenaan');
    check('vesi, sokeri, ' + t + ', suola', 'luettelossa');
    if (/^[a-zåäö]+$/.test(t) && t.length >= 4) {
      check('luomu' + t, 'etuliite');
      check('sokeri, ' + t + 'a, suola', 'taivutus');
    }
    if (t.length >= 6 && /^[a-zåäö ]+$/.test(t) && rnd() < 0.5) {
      const i = 1 + Math.floor(rnd() * (t.length - 2));
      const typo = rnd() < 0.5 ? t.slice(0, i) + t.slice(i + 1) : t.slice(0, i) + letters[Math.floor(rnd() * letters.length)] + t.slice(i + 1);
      if (typo !== t && !app.MAP.has(typo)) check('sokeri, ' + typo + ', suola', 'kirjoitusvirhe');
    }
  }
  for (const head of ['öljy', 'rasva', 'jauhe', 'uute', 'oil', 'extract', 'powder', 'fat', 'olja', 'fett', 'pulver'])
    for (const pre of ['blorp', 'zixa', 'qwerty', 'kraft', 'mink', 'snig', 'vorgo'])
      check('sokeri, ' + pre + (/[a-z]$/.test(head) && /^(oil|extract|powder|fat)$/.test(head) ? ' ' : '') + head + ', suola', 'tuntematon alkuosa');
  if (bad.length) console.log('✗ Lakaisu: ' + fail + ' väärää vihreää\n    ' + bad.join('\n    '));
  else console.log(`✓ Lakaisu: ${pass} eläinperäistä tapausta, ei yhtään väärää vihreää`);
  return { pass, fail };
};
