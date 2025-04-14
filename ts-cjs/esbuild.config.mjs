import { build } from "esbuild";
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (!args[0]) {
    throw new Error('Provide entrypiont');
}

try {
    const { metafile } = await build({
        bundle: true,
        entryPoints: [args[0]],
        mainFields: ["main"],
        platform: "node",
        format: 'cjs',
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