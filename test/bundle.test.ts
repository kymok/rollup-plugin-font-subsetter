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
      // Copy font files as assets
      const woff2Path = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff2');
      const woff2Buffer = await fs.readFile(woff2Path);
      
      const woffPath = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff');
      const woffBuffer = await fs.readFile(woffPath);
      
      this.emitFile({
        type: 'asset',
        fileName: 'FiraCode-Regular.woff2',
        source: woff2Buffer
      });
      
      this.emitFile({
        type: 'asset',
        fileName: 'FiraCode-Regular.woff',
        source: woffBuffer
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
  // Get original font sizes
  const originalWoff2Path = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff2');
  const originalWoff2Stats = await fs.stat(originalWoff2Path);
  const originalWoff2Size = originalWoff2Stats.size;
  
  const originalWoffPath = path.join(__dirname, 'fixtures/FiraCode/FiraCode-Regular.woff');
  const originalWoffStats = await fs.stat(originalWoffPath);
  const originalWoffSize = originalWoffStats.size;

  await build();

  // Get subsetted font sizes
  const subsettedWoff2Path = path.join(__dirname, 'tmp-dist/FiraCode-Regular.woff2');
  const subsettedWoff2Stats = await fs.stat(subsettedWoff2Path);
  const subsettedWoff2Size = subsettedWoff2Stats.size;
  
  const subsettedWoffPath = path.join(__dirname, 'tmp-dist/FiraCode-Regular.woff');
  const subsettedWoffStats = await fs.stat(subsettedWoffPath);
  const subsettedWoffSize = subsettedWoffStats.size;

  // Assert that the subsetted fonts are smaller
  expect(subsettedWoff2Size).toBeLessThan(originalWoff2Size);
  expect(subsettedWoffSize).toBeLessThan(originalWoffSize);
  
  // Log the size reductions
  const woff2Reduction = ((originalWoff2Size - subsettedWoff2Size) / originalWoff2Size * 100).toFixed(2);
  const woffReduction = ((originalWoffSize - subsettedWoffSize) / originalWoffSize * 100).toFixed(2);
  console.log(`WOFF2 size reduced by ${woff2Reduction}%: ${originalWoff2Size} bytes → ${subsettedWoff2Size} bytes`);
  console.log(`WOFF size reduced by ${woffReduction}%: ${originalWoffSize} bytes → ${subsettedWoffSize} bytes`);

  // Clean up
  // await fs.rm(path.join(__dirname, 'tmp-dist'), { recursive: true, force: true });
});
