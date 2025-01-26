import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url'; // To handle asset imports

export default {
  input: "src/MarkdownEditor.tsx",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.es.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      extract: true,
    }),
    url({
      include: ['**/*.svg', '**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'], // Include font and SVG assets
      limit: 0, // No limit to file size for assets
      publicPath: '/assets/', // You can set a custom path where the assets should be served
      emitFiles: true, // Ensure that assets are copied over during the build
    }),
  ],
};
