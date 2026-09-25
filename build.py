#!/usr/bin/env python3
"""يجمع المنصّة في ملفٍّ واحد قابلٍ للمشاركة:
   docs/index.html          ← لصفحات GitHub: مستقلّ، يُفتَح من القرص أو من الويب
   dist/adaa-artifact.html  ← لنشر Artifact: بلا doctype/html/head/body لأن المضيف يغلّفه"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
APP  = os.path.join(ROOT, "app")
DIST = os.path.join(ROOT, "dist")

def read(rel):
    return open(os.path.join(APP, rel), encoding="utf-8").read()

html = read("index.html")
html = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">',
              lambda m: "<style>\n" + read(m.group(1)) + "\n</style>", html)
html = re.sub(r'<script src="(assets/[^"]+)"></script>',
              lambda m: "<script>\n" + read(m.group(1)) + "\n</script>", html)

DOCS = os.path.join(ROOT, "docs")
os.makedirs(DIST, exist_ok=True)
os.makedirs(DOCS, exist_ok=True)
open(os.path.join(DOCS, "index.html"), "w", encoding="utf-8").write(html)
# يمنع Jekyll من معالجة المجلّد ويخدم الملفّ كما هو
open(os.path.join(DOCS, ".nojekyll"), "w").write("")

# نسخةُ النشر: العنوان أوّلاً، ثم الخطوط والأنماط، ثم المحتوى والشيفرة
title = re.search(r"<title>(.*?)</title>", html).group(1)
head  = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body  = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
head  = re.sub(r"<meta[^>]*>\s*", "", head)              # المضيف يضع charset وviewport
head  = re.sub(r"<title>.*?</title>\s*", "", head)
# عنوانُ النشر اسمٌ لا شرح: المعرضُ يعرضه بين صفحاتٍ كثيرة
art   = "<title>جائزة أداء الصحة</title>\n" + head.strip() + "\n" + body.strip() + "\n"
open(os.path.join(DIST, "adaa-artifact.html"), "w", encoding="utf-8").write(art)

for path in (os.path.join(DOCS, "index.html"), os.path.join(DIST, "adaa-artifact.html")):
    rel = os.path.relpath(path, ROOT)
    print(f"{rel}  ·  {os.path.getsize(path)/1024:.0f} كيلوبايت")
