# vite-plugin-font-subsetter

A Vite plugin that subsets fonts at bundle time based on page contents.

## Usage

create a `vite.config.js` and import the plugin.

```js
// vite.config.js
import { fontSubsetter } from "vite-plugin-font-subsetter";

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
