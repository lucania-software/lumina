import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";

/** @type {import("rollup").RollupOptions} */
export default {
    input: "./source/index.ts",
    output: {
        file: "./build/index.js",
        format: "umd",
        name: "Lumina"
    },
    plugins: [
        string({ include: "**/*.wgsl" }),
        nodeResolve({
            browser: true,
            extensions: [".ts"]
        }),
        typescript({ tsconfig: "./tsconfig.json" }),
        commonjs(),
        replace({ preventAssignment: true })
    ]
};