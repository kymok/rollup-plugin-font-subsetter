# rollup-plugin-font-subsetter

A Rollup plugin that subsets fonts at build time based on source code (html, css, js/ts) contents. Suitable for static sites and applications where the character set is known at build time.

## Installation

```bash
npm install rollup-plugin-font-subsetter --save-dev
```

## Usage

create a `rollup.config.js` and import the plugin.

```js
// rollup.config.js
import { fontSubsetter } from "rollup-plugin-font-subsetter";

export default defineConfig({
  plugins: [
    fontSubsetter(),
  ]
})
```

## How it works

The plugin subsets `.woff2` font files for character set computed from `.htm/.html`, `.css`, `.js` files in resulting bundle. This plugin is using [subset-font](https://github.com/papandreou/subset-font) under the hood.

### Limitations

* Does not work with dynamic content since dynamic content includes characters that are not known at build time.
* May not work well with obfuscated code since it may not be able to extract all characters used in the code.
