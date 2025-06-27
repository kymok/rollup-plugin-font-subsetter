import { rollup } from 'rollup';
import { test, expect } from 'vitest';

import { fontSubsetter } from '../src';

const build = async () => {
  const bundle = await rollup({
    input: ['test/fixtures/index.ts', 'test/fixtures/FiraCode/FiraCode-Regular.woff2'],
    plugins: [fontSubsetter()],
  });
  await bundle.write({
    file: 'test/tmp-dist/bundle.js',
    format: 'cjs',
  });
}

test('bundle creation', async () => {
  await build();
  expect(true).toBe(true);
});