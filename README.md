# rollup-plugin-font-subsetter

A Rollup plugin that subsets fonts at bundle time based on page contents.

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

* Does not work with dynamic content.
* May not work well with obfuscation.
