// Ajaa index.html:n sovelluslogiikan Nodessa ilman selainta (DOM korvataan tyhjillä olioilla).
// Käyttö: const app = await require('./harness')();  → app.analyze(...), app.convertRecipe(...) jne.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function fakeEl() {
  const store = { hidden: false, value: '', innerHTML: '', textContent: '', dataset: {}, style: {}, files: [] };
  const fn = function () { return proxy; };
  const proxy = new Proxy(fn, {
    get(t, k) {
      if (k in store) return store[k];
      if (k === Symbol.toPrimitive) return () => '';
      if (k === 'querySelectorAll') return () => [];
      if (k === 'querySelector') return () => fakeEl();
      if (k === 'getContext') return () => fakeEl();
      if (k === 'classList') return { contains: () => false, add() {}, remove() {}, toggle() {} };
      return fakeEl();
    },
    set(t, k, v) { store[k] = v; return true; },
    apply() { return fakeEl(); },
  });
  return proxy;
}

module.exports = async function load() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const main = scripts[scripts.length - 1];
  const ls = {};
  const ctx = {
    console, setTimeout: () => 0, clearTimeout() {}, URL: { createObjectURL: () => '', revokeObjectURL() {} },
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); }, removeItem: k => { delete ls[k]; } },
    document: new Proxy({}, { get: (t, k) => (k === 'querySelectorAll' ? () => [] : k === 'addEventListener' ? () => {} : k === 'querySelector' ? () => fakeEl() : fakeEl()) }),
    location: { hash: '', protocol: 'file:', origin: 'file://' },
    history: { replaceState() {} },
    navigator: {},
    fetch: async p => {
      const f = path.join(ROOT, String(p));
      if (!fs.existsSync(f)) return { ok: false, json: async () => ({}) };
      return { ok: true, json: async () => JSON.parse(fs.readFileSync(f, 'utf8')) };
    },
    Image: function () {}, AbortController: function () { this.signal = {}; this.abort = () => {}; },
  };
  ctx.window = ctx;
  ctx.window.addEventListener = () => {};
  ctx.scrollTo = () => {};
  vm.createContext(ctx);
  vm.runInContext(main, ctx, { filename: 'index.html' });
  await vm.runInContext('loadOffTaxonomy()', ctx);
  await vm.runInContext('loadInci()', ctx);
  const exp = vm.runInContext('({analyze,convertRecipe,classifyTerm,detectLang,normTerm,validEan,extractIngredients,lineIngScore,MAP,SVMAP,ENTRIES,PLANT_ENTRY,parseRecipe,cleanText,splitTop})', ctx);
  exp.ctx = ctx;
  exp.run = code => vm.runInContext(code, ctx);
  return exp;
};
