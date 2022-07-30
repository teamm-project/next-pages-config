import {defineConfig}  from 'tsup'

export default defineConfig({
    entry: ['src/data.ts', 'src/index.ts', 'src/generate.ts'],
    external: ['../.generate/data'],
    dts: true,
    format: ['esm']
})
  