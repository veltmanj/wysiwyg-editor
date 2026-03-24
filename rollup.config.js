import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/wysiwyg-editor.js',
      format: 'es',
    },
    {
      file: 'dist/wysiwyg-editor.umd.js',
      format: 'umd',
      name: 'WYSIWYGEditor',
    },
    {
      file: 'dist/wysiwyg-editor.min.js',
      format: 'es',
      plugins: [terser()],
    },
  ],
  plugins: [
    postcss({ extract: 'wysiwyg-editor.css', minimize: true }),
  ],
};
