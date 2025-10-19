import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/simple-test-card.js',
    format: 'iife',
    name: 'SimpleTestCard',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      target: 'ES2020',
      module: 'ESNext',
      declaration: false
    }),
    terser({
      ecma: 2020,
      module: false,
      compress: { passes: 2 }
    }),
    filesize()
  ]
};
