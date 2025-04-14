import { build } from "esbuild";
import assert from 'node:assert';
import { writeFileSync } from 'node:fs';

export async function buildApp(entryPoints) {
    assert(Array.isArray(entryPoints), 'entryPoints must be an array');
    assert(entryPoints.length > 0, 'entryPoints must be non-empty');
    assert(entryPoints.every((entryPoint) => typeof entryPoint === 'string'), 'All entrypoints must be a string');
    
    try {
        const { metafile } = await build({
            bundle: true,
            entryPoints,
            mainFields: ["module", "main"],
            platform: "node",
            format: "esm",
            metafile: true,
            outdir: "dist",
            color: true,
            logLevel: 'info',
            tsconfig: 'tsconfig.json'
        });
        writeFileSync('./dist/metafile.json', JSON.stringify(metafile, null, 2), 'utf-8');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}