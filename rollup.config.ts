import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const inputs = ['index', 'data'].map(input => [
  {
    input: `src/${input}.ts`,
    plugins: [esbuild()],
    external: ['../.next-pages-config'],
    output: [
      {
        file: `dist/${input}.js`,
        format: 'esm',
      },
    ]
  },
  {
    input: `src/${input}.ts`,
    plugins: [dts()],
    output: {
      file: `dist/${input}.d.ts`,
      format: 'es',
    },
  }
])

export default inputs.flat()