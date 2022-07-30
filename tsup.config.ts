import {defineConfig}  from 'tsup'

export default defineConfig([
    {
        entry: ['src/generate.ts'],
        format: 'cjs',
    },
    {
        entry: ['src/data.ts'],
        external: ['../.generate/data'],
        dts: true,
        format: 'esm',
    }
])
  