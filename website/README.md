# html.style marketing site

Complete static drop-in. Copy **every file** into `website/` on
[github.com/bstoppel/html.style](https://github.com/bstoppel/html.style),
replacing the current files. Relative URLs — this is the folder behind
[html.style](https://html.style/). `docs.html` and `components.html`
redirect so old links keep working.

| File | Role |
| --- | --- |
| index.html | Home |
| getting-started.html | Install |
| style.html | Tokens, layers, atoms |
| elements.html | hs-* catalog + live demos |
| extend.html | Extension ladder |
| cookbook.html | Article / settings / pricing |
| compare.html | vs Pico, Open Props, Web Awesome, Tailwind, daisyUI |
| agents.html | CEM, llms.txt, system prompt |
| support.html | 2026.1 browser floor |
| docs.html / components.html | Redirects for older links |
| custom-elements.json | CEM for agents and editors |
| llms.txt | Agent index |

Refresh `css/html.style.css`, `js/`, and `custom-elements.json` from library
`dist/` when you cut a release — copy `dist/custom-elements.json` verbatim,
never hand-edit it, or it drifts from what the npm package actually ships.
