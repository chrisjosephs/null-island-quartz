# darkmode (vendored)

A copy of [`@quartz-community/darkmode`](https://github.com/quartz-community/darkmode) v0.1.0, changed in one place: first-time visitors get **dark** mode instead of whatever their device prefers. Once a reader clicks the toggle, their choice is remembered as before.

The change is the first line of `src/components/scripts/darkmode.inline.ts`, and the same line in the minified string inside `dist/index.js` and `dist/components/index.js` (`var r="dark"`). The upstream package has no build step we run here, so `dist/` was patched directly.

To update from upstream: copy the new `dist/` over this one and re-apply that one-line change in both files.
