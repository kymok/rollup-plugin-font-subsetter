import { rollup } from 'rollup';
import { test, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

import { fontSubsetter } from '../src';

// Simple plugin to handle CSS imports and copy font assets
const cssPlugin = () => {
  return {
    name: 'css-handler',
    async load(id: string) {
      if (id.endsWith('.css')) {
        const css = await fs.readFile(id, 'utf-8');
        return {
          code: `export default ${JSON.stringify(css)}`,
          map: null
        };
      }
    },
    async generateBundle(this: any, _options: any, _bundle: any) {
      // Copy font file as asset
      const fontPath = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff2');
      const fontBuffer = await fs.readFile(fontPath);
      
      this.emitFile({
        type: 'asset',
        fileName: 'FiraCode-Regular.woff2',
        source: fontBuffer
      });
    }
  };
};

const build = async () => {
  const bundle = await rollup({
    input: 'test/fixtures/index.ts',
    plugins: [cssPlugin(), fontSubsetter()],
  });
  await bundle.write({
    dir: 'test/tmp-dist',
    format: 'cjs',
  });
}

test('subsetting', async () => {
  // Get original font size
  const originalFontPath = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff2');
  const originalFontStats = await fs.stat(originalFontPath);
  const originalSize = originalFontStats.size;

  await build();

  // Get subsetted font size
  const subsettedFontPath = path.join(__dirname, 'tmp-dist/FiraCode-Regular.woff2');
  const subsettedFontStats = await fs.stat(subsettedFontPath);
  const subsettedSize = subsettedFontStats.size;

  // Assert that the subsetted font is smaller
  expect(subsettedSize).toBeLessThan(originalSize);
  
  // Log the size reduction
  const reduction = ((originalSize - subsettedSize) / originalSize * 100).toFixed(2);
  console.log(`Font size reduced by ${reduction}%: ${originalSize} bytes → ${subsettedSize} bytes`);

  // Clean up
  await fs.rm(path.join(__dirname, 'tmp-dist'), { recursive: true, force: true });
});