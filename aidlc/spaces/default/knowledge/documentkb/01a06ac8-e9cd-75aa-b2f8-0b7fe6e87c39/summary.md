Operational how-to for producing raster favicon fallbacks from the project's favicon.svg, which itself uses OKLCH colors and adapts to the user's color scheme.

Gives four interchangeable routes to the same output set: a Node script using sharp to loop the sizes 16, 32, 180, 192 and 512; ImageMagick `magick` commands including combining the 16 and 32 px PNGs into favicon.ico; Inkscape CLI exports; and two online generators (RealFaviconGenerator, Favicon.io).

Specifies the expected result files alongside favicon.svg: favicon.ico for legacy browsers, favicon-16x16.png and favicon-32x32.png fallbacks, apple-touch-icon.png at 180x180 for iOS, and android-chrome-192x192.png plus android-chrome-512x512.png for Android/PWA.

Carries one behavioural caveat that matters for review: the generated PNGs bake in the light-theme rendering only. Automatic light/dark adaptation exists solely in the SVG favicon, and only in browsers that support SVG favicons (Chrome 80+, Firefox 41+, Safari 9+).

This is a manual, run-when-needed procedure — nothing in it is wired into the build or the test suite.
