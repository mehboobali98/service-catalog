// rollup.config.mjs
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/service_catalog.js',
  output: [
    {
      name:   'ServiceCatalog bundle.js',
      file:   'dist/bundle.js',
      format: 'umd'
    },
    {
      name:   'ServiceCatalog bundle.min.js',
      file:   'dist/bundle.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ]
};