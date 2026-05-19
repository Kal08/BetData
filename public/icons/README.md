# PWA Icons

Add `icon-192.png` and `icon-512.png` here (192×192 and 512×512 PNG).

You can generate them from any logo using https://realfavicongenerator.net/ or:

```bash
# Example with ImageMagick (if installed)
convert -size 512x512 xc:'#6366f1' -fill white -gravity center -pointsize 72 -annotate 0 'BD' public/icons/icon-512.png
convert public/icons/icon-512.png -resize 192x192 public/icons/icon-192.png
```

Until icons exist, the PWA may still install but show a generic icon.
