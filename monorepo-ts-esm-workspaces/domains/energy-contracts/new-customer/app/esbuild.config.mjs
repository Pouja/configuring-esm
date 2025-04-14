import { buildApp } from '@configurations/esbuild/base.mjs'

await buildApp([import.meta.dirname + '/src/handler.ts']);