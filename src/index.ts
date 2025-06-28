import { OutputOptions } from 'rollup'
import type { AssetInfo, ChunkInfo } from './rollup-types.js'
import subsetFont from 'subset-font'

const IsAssetInfo = (info: AssetInfo | ChunkInfo): info is AssetInfo => {
  return info.type === 'asset'
}

const extractCharacterSet = (info: AssetInfo | ChunkInfo): Set<string> => {
  if (IsAssetInfo(info)) {
    if (typeof (info.source) === 'string') {
      return new Set(info.source)
    }
    else {
      return new Set()
    }
  }
  return new Set(info.code)
}

type PluginOptions = {
  verbose?: boolean,
}

const defaultPluginOptions: PluginOptions = {
  verbose: false,
}

async function generateBundle(
  options: OutputOptions,
  bundle: { [fileName: string]: AssetInfo | ChunkInfo },
  pluginOptions: PluginOptions
) {
  // list files
  const fontFiles = Object.keys(bundle).filter((fileName) => {
    return fileName.match(/\.woff2?$/)
  })
  const sourceFiles = Object.keys(bundle).filter((fileName) => {
    return fileName.match(/\.(js|css|htm|html)$/)
  })
  if (pluginOptions?.verbose) {
    console.log("subsetting font")
    console.log("subset target:", fontFiles)
    console.log("subset based on:", sourceFiles)
  }

  // compute glyph set
  const glyphSet = sourceFiles.map(
    (fileName) => extractCharacterSet(bundle[fileName])
  ).reduce(
    (acc, set) => new Set([...acc, ...set]), new Set<string>()
  );
  const glyphSetString = Array.from(glyphSet).join('')
  if (pluginOptions?.verbose) {
    console.log("glyph set size:", glyphSet.size);
  }

  // subset fonts
  for (const fileName of fontFiles) {
    const font = bundle[fileName]
    if (IsAssetInfo(font) && typeof (font.source) !== 'string') {
      // Determine target format from filename
      const targetFormat = fileName.endsWith('.woff2') ? 'woff2' : 'woff'
      const subset = await subsetFont(
        Buffer.from(font.source),
        glyphSetString,
        { targetFormat }
      )
      font.source = new Uint8Array(subset)
    }
  }
}

export function fontSubsetter(options?: PluginOptions) {
  const pluginOptions = { ...defaultPluginOptions, ...options }
  return {
    name: "font-subsetter",
    generateBundle: (
      options: OutputOptions,
      bundle: { [fileName: string]: AssetInfo | ChunkInfo }
    ) => generateBundle(options, bundle, pluginOptions)
  }
}