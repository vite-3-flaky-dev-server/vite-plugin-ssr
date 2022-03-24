export { extractExportNamesPlugin }
export { getExtractExportNamesCode }
export { extractExportNamesRE }

import type { Plugin } from 'vite'
import { parseEsModules, getExportNames } from './parseEsModules'
import { isSSR_options, removeSourceMap } from './utils'

const extractExportNamesRE = /(\?|&)extractExportNames(?:&|$)/

function extractExportNamesPlugin(): Plugin {
  return {
    name: 'vite-plugin-ssr:extractExportNames',
    enforce: 'post',
    async transform(src, id, options) {
      if (extractExportNamesRE.test(id)) {
        const isServerSide = isSSR_options(options)
        const isClientSide = !isServerSide
        const code = await getExtractExportNamesCode(src, isClientSide)
        return code
      }
    },
  } as Plugin
}

async function getExtractExportNamesCode(src: string, isClientSide: boolean) {
  const esModules = await parseEsModules(src)
  const exportNames = getExportNames(esModules)
  const code = getCode(exportNames, isClientSide)
  return removeSourceMap(code)
}

function getCode(exportNames: string[], isClientSide: boolean) {
  let code = ''
  code += '\n'
  code += `export let exportNames = [${exportNames.map((n) => JSON.stringify(n)).join(', ')}];`
  if (isClientSide) {
    code += '\n'
    code += 'if (import.meta.hot) import.meta.hot.accept((mod) =>{exportNames=mod.exportNames});'
  }
  return code
}