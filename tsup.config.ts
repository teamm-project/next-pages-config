import {defineConfig}  from 'tsup'

export default defineConfig([
    {
        entry: ['src/generate.ts'],
        format: 'cjs',
    },
    {
        entry: ['src/data.ts'],
        external: ['../.generate/data.mjs'],
        dts: true,
        format: 'esm',
    }
])
  