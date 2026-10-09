#!/bin/sh
# Rebuilds index.html from the files in src/
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>body{margin:0}</style>\n'; sed -n '1,/^<\/style>$/p' src/head.html; printf '</head>\n<body>\n'; sed '1,/^<\/style>$/d' src/head.html; echo '<script src="https://unpkg.com/lucide@0.453.0/dist/umd/lucide.min.js"></script>'; echo '<script>'; cat src/core.js src/views.js; echo '</script>'; printf '</body>\n</html>\n'; } > index.html
