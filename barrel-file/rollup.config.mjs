import fs from 'node:fs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pluginJson from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { bundleStats } from 'rollup-plugin-bundle-stats';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

const entryPoints = fs.readdirSync('./out-tsc/handlers', {
    encoding: 'utf-8',
    recursive: false,
    withFileTypes: true,
}).filter((file) => file.isFile() === true && file.name.endsWith('.js'))
    .map((file) => `./out-tsc/handlers/${file.name}`);

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: entryPoints,
    output: {
        name: 'handler',
        dir: `./dist/rollup`,
        sourcemap: true,
        format: 'esm',
        
    },
    treeshake: {
        preset: 'smallest'
    },
    plugins: [nodeResolve(), pluginJson(), bundleStats(), dynamicImportVars(),commonjs()]
}

export default config;