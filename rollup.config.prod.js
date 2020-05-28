import babel from 'rollup-plugin-babel';
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/dev.promise.bundle.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      }),
      commonjs(),
      replace({"process.env.NODE_ENV": JSON.stringify("development")})
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/prod.promise.bundle.js',
      format: 'umd',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      }),
      commonjs(),
      replace({"process.env.NODE_ENV": JSON.stringify("production")}),
      uglify()
    ]
  }
]