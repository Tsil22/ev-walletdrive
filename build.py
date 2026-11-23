"""Φτιάχνει τον φάκελο docs/ (σελίδα GitHub Pages και περιεχόμενο της εφαρμογής Android) από το src/ev-voithos.html.

python3 build.py            -> docs/ για τη σελίδα (οι τιμές από την ίδια διεύθυνση)
python3 build.py --android  -> docs/ για την εφαρμογή (οι τιμές από τη σελίδα GitHub Pages)
"""
import re, sys, shutil, hashlib, os

PAGES = "https://tsil22.github.io/ev-walletdrive/"
android = "--android" in sys.argv

src = open("src/ev-voithos.html", encoding="utf8").read()
src = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>\n?', "", src)
src = src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")

head = """<!doctype html>
<html lang="el"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f9d5a">
<meta name="description" content="Πόσο σου κοστίζει το ηλεκτρικό σου: φορτίσεις, τιμές δικτύων, διαδρομές.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="stylesheet" href="fonts/manrope.css">
<script src="shim.js"></script>
"""
i = src.index("<style>")
j = src.index("</style>") + len("</style>")
html = head + src[:j] + "\n</head><body>\n" + src[j:] + "\n</body></html>\n"
open("docs/index.html", "w", encoding="utf8").write(html)

shim = open("shim.js", encoding="utf8").read()
if android:
    shim = shim.replace('var DATA_URL="";', 'var DATA_URL="%s";' % PAGES)
open("docs/shim.js", "w", encoding="utf8").write(shim)

# έκδοση της cache του service worker = αποτύπωμα της σελίδας, ώστε κάθε αλλαγή να φτάνει στα κινητά
ver = hashlib.sha1((html + shim).encode()).hexdigest()[:10]
sw = open("src/sw.js", encoding="utf8").read().replace("__VER__", ver)
open("docs/sw.js", "w", encoding="utf8").write(sw)
print("docs/index.html", len(html), "bytes, sw", ver, "android" if android else "pages")
