import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/chatbot-widget.js',
    format: 'iife',
    name: 'ChatbotWidget',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    postcss({
      extract: false,
      inject: false,
      minimize: true,
      plugins: [autoprefixer()],
      extensions: ['.css', '.scss', '.sass'],
      use: ['sass']
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['defaults', 'not IE 11']
          },
          modules: false
        }]
      ]
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    })
  ],
  external: []
};