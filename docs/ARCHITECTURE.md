# Architecture

The site is plain HTML, CSS and JavaScript — no framework and no build step.

## CSS

`css/main.css` imports the files in a fixed order: tokens → base → layout → animations → components → sections → responsive.
All colours live in `css/variables.css`; the light theme overrides the same variables under `[data-theme="light"]`.

## JavaScript

Each file under `js/modules/` exposes one object with an `init()` function, and `js/main.js` starts them in order.
Modules only talk to the page through `js/utils/dom.js`.

`js/core/identity-engine.js` holds all the generator logic. It has no DOM access, so it is loaded the same way in the browser and in the Node tests (UMD wrapper).

```
generate({ name, activity, style, description })
  → { colors[4], fonts{heading, body}, logo{shape, initials}, description }
logoSvg(identity) → SVG string
```

## Adding an activity or a style

Add an entry to `ACTIVITIES` or `STYLES` in the engine — the select boxes are filled from these objects automatically.
