import { build } from "esbuild";
import { writeFileSync } from 'node:fs';
import fs from 'node:fs';

const entryPoints = fs.readdirSync('./src/handlers', {
    encoding: 'utf-8',
    recursive: false,
    withFileTypes: true,
}).filter((file) => file.isFile() === true)
    .map((file) => `./src/handlers/${file.name}`);

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