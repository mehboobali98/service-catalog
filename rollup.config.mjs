// rollup.config.mjs
import copy from 'rollup-plugin-copy';
import clear from 'rollup-plugin-clear';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/service_catalog.js',
  output: [
    {
      name:   'ServiceCatalog.js',
      file:   'dist/bundle.js',
      format: 'umd'
    },
    {
      name:   'ServiceCatalog.min.js',
      file:   'dist/bundle.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [
    clear({
      targets: ['dist/'],
      // optional, whether clear the directores when rollup recompile on --watch mode.
      watch: true, // default: false
    }),
    copy({
      targets: [
        { src: 'i18n',    dest: 'dist/public' },
        { src: 'assets/*',  dest: 'dist/public' }
      ]
    })
  ]
};
