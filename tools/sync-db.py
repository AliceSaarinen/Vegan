#!/usr/bin/env python3
"""Kopioi tools/db-ext.js:n sisällön index.html:ään (korvaa edellisen version)."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf8')
ext = (root / 'tools' / 'db-ext.js').read_text(encoding='utf8').rstrip() + '\n'
marker = '/* =====================================================================\n   LAAJENNETTU TIETOKANTA'
a = html.index(marker)
b = html.index('const E_V = `', a)
html = html[:a] + ext + html[b:]
(root / 'index.html').write_text(html, encoding='utf8')
print('ok')
