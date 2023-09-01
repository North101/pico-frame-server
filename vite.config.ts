import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { FilterPattern } from '@rollup/pluginutils'
import react from '@vitejs/plugin-react'
import rollup from 'rollup'
import { PluginOption, defineConfig } from 'vite'

interface ViteExpressBuilder extends rollup.RollupOptions {
  output?: rollup.OutputOptions
  exclude?: FilterPattern
  external?: (string | RegExp)[] | string | RegExp
}

const viteExpressBuilder = ({
  input = './src/server/main.ts',
  output = {
    dir: './dist/server',
    format: 'cjs',
  },
  exclude = './src/client/**',
  external = [],
  plugins = [],
  ...rest
}: ViteExpressBuilder = {}): PluginOption => {
  return {
    name: 'Vite Express Builder',
    async writeBundle() {
      const config = await rollup.rollup({
        input: input,
        external: [
          'express',
          'vite-express',
          ...Array.isArray(external) ? external : [external],
        ],
        plugins: [
          typescript({
            module: 'ESNext',
            exclude: exclude,
          }),
          ...Array.isArray(plugins) ? plugins : [plugins],
        ],
        ...rest,
      })
      await config.write(output)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist/client',
  },
  plugins: [
    react(),
    viteExpressBuilder({
      external: [
        '@googleapis/drive',
        'dotenv-flow/config',
        'fs/promises',
        'node-cron',
        'path',
        'path',
        'sharp',
      ],
      plugins: [
        json(),
      ],
    }),
  ],
})
