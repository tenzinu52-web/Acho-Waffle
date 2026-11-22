#!/bin/sh
# Recompile the Tailwind CSS. Run this after changing classes in the pages or in assets/*.js.
cd "$(dirname "$0")" && npx --no-install tailwindcss -c tailwind.config.js -i input.css -o ../assets/site.css --minify
