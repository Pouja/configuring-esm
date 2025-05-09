# Everything You Need To Know About Treeshaking and ESM

With increasing support of ESM in Typescript [1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#ecmascript-module-support-in-nodejs)[2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#support-for-require-calls-in---moduleresolution-bundler-and---module-preserve)[3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html#support-for-require-of-ecmascript-modules-in---module-nodenext) and NodeJS [1](https://nodejs.org/en/blog/announcements/v20-release-announce#custom-esm-loader-hooks-nearing-stable)[2](https://nodejs.org/en/blog/announcements/v22-release-announce#support-requireing-synchronous-esm-graphs)[3](https://nodejs.org/en/blog/release/v23.0.0#requireesm-is-now-enabled-by-default), it becomes easier and easier to write your frontend or backed in ESM format.
It has better support for treeshaking when using [`esbuild`](https://esbuild.github.io/api/#tree-shaking) or [`webpack`](https://webpack.js.org/guides/tree-shaking/) and with complexity rising of your backend and frontend it is more then ever important to look at your bundle sizes. 
Even just recently AWS has announced that everyone, not just people using custom runtime environment, have to pay for [the INIT Duration](https://aws.amazon.com/blogs/compute/aws-lambda-standardizes-billing-for-init-phase/), making it also cost effective to have your AWS Lambda functions as small as possible.

I want to bring you through my journey of understanding difference between CommonJS and ESM and why it allows for better treeshaking. 
Looking at which typescript config rules and eslint rule might help to reduce it even further. 
Looking at what does get removed when treeshaking and what does not and why.
But most importantly regardless of which tips I give here and which ones you read in other posts: how you can measure the bundle size so you can iteratively decrease it.

## Table of Contents

1. [Module System](#module-system)
2. [Measuring](#measuring)
3. [CJS to ESM](#cjs-to-esm)
4. [CJS vs ESM](#cjs-vs-esm)
5. [ESM Dynamic Import](#esm-dynamic-import)
6. [Proper Imports](#proper-imports)
7. [Barrel Files](#barrel-files)
8. [Unused Code](#unused-code)

## TLDR;

* Set `module` and `moduleResolution` in your TS Config to `nodenext`
* Use `.mts` as file extensions or set `type` to `module` in your nearest `package.json`
* Avoid barrel files or set `sideEffects` to `false` in your nearest `package.json`
* Set `@typescript-eslint/no-unused-vars` to `error`
* Set `@typescript-eslint/consistent-type-imports` to `error`
* Update your `webpack`/esbuild config to also read `module` entry of your npm packages 

## Module System
To able to use functions or classes written in one file in another file requires a way of telling how the files should be linked.
In the days of gulp/grunt and jquery there was not much choice, we all wrote everything on the `window` object.
Everything was accessible by all objects and functions. We had to use closures to isolate `var` variables from another and prevent naming collisions.
It was basically just one large JavaScript file.
Quite the nightmare.

### CommonJS
Luckily people quickly started writing systems to separate them, not only at when you are writing your code but also at runtime.
One of the first one and one that still lives to today is CommonJS.
Everyone writing in plain NodeJS is probably already familiar with this syntax:

```javascript
const axios = require('axios');

function getHelloWorld() {
    return axios.get('https://hello.world');
}

module.exports = {
    getHelloWorld,
};
```

The fact that everything was loaded synchronously, which was not really an issue at that time when writing for servers, it was not really feasible for front-ends.
Therefore [RequireJS](https://requirejs.org/) was brought to live.
If you ever wondered how it looks, there is [an example repository](https://github.com/volojs/create-template) still living.
If you are more interested in the history, look up: AMD, [UMD](https://github.com/umdjs/umd), RequireJS.

> Small note: I also believe people just wanted to write to own module system, who can blame their enthusiasm. It was a create module system.

The problem with CommonJS is that the `require` function is a function.
That means the following is valid:

```javascript
const fs = require("fs");
const fs1 = require("f" + "s");
const fs2 = require(`${"f"}s`);
const fs3 = require(["f", "s"].join(""));
const modules = { fs: require("fs") };
const fs4 = modules["fs"];

function getFS() {
  function reallyGetIt() {
    return require("fs");
  }
  return reallyGetIt();
}
const fs6 = getFS();

const allTheSame = [fs, fs1, fs2, fs3, fs4, fs6].every((fsModule) => fsModule === require('fs'));
console.log(allTheSame); // true
```
_Please do not do this_

This is also why your javascript file is executed when referenced, because NodeJS has to know what it has to import.
That is the largest reason why `esbuild` or `webpack` can not treeshake properly. 
Because it can not do any static analysis to create a tree of how your program is linked together.
The same principle applies when using `module.exports`. 
Where ever you can use an object, you can export your function or variable.

Another reason CommonJS makes it hard but not impossible, is the freedom of how you reference other files or packages.
Given the following code:
```javascript
require('../libs/manager');
```
This could either be a `../libs/manager.js` file or `../libs/manager/index.js` or `../libs/manager/package.json`.
This freedom was quite useful in the early days of NPM, but it adds too much ambiguity for the developers.
There are more "quirks" to CommonJS, if you are interested in more details, a good start would be [the NodeJS documentation](https://nodejs.org/api/modules.html) itself.

### ESM
`require` Is not defined within [EcmaScript](https://tc39.es/ecma262/) and it is not natively implemented by any browser.
It is something of NodeJS itself built upon v8.
The same applies for the AMD, UMD and System module syntax.
EcmaScript was behind the ecosystem, but that was a great plus because it could look at all the existing module system and draft a better one.
Entering ESM. It has similar syntax to what Typescript does:

```typescript
import fs from 'fs';

export function readRootPackage() {
    return fs.readFileSync('./package.json', 'utf-8');
}
```

There is no way to tell if this is ESM or Typescript without looking at the file extension.
This also adds to confusion for developers that they are not sure if this will get compiled to a `require` or the native EcmaScript `import` operator.
The only way you know for sure what the output would be, is by compiling it.

What makes ESM so great that it allows treeshaking? The `import` is a operator.  
Meaning that other rules apply compared to `require` function of NodeJS.
The most important rule is that it only allows static strings:

```javascript
import fs from 'fs';
import fs1 from 'f' + 's'; // error
import fs2 from ['f' + 's'].join(''); // error
import fs3 from `${"f"}s`; // error
import fs4 from +'fs'; // error
if (process.env) {
    // import fs5 from 'fs'; // error
}

async function getFS() {
    return await import('fs'); // allowed
}
const fs6 = await getFS();

console.info(fs === fs6.default); // true
console.info(fs === fs2); // true
```

This allows anyone to perform static analysis and build a tree of how the program is linked together.
Furthermore to prevent ambiguity you either reference a package or a file.
That is why the file extensions is required.
This is also where people get confused when they are writing typescript but they have to use `.js` file extensions, luckily this is fixed by using `nodenext` as `moduleResolution`.

If you are interested in more details about esm:
* [Detailed explanation](https://exploringjs.com/js/book/ch_modules.html) written by [Dr. Axel Rauschmayer](https://dr-axel.de/).
  Also check out his [blog](https://2ality.com/), always very well written and comprehensive.
* Mozilla [explanation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) on JavaScript imports.
* NodeJS [documentation](https://nodejs.org/api/esm.html)
* [V8](https://v8.dev/features/modules) on ESM imports impact on the browser.
* [Language specification](https://262.ecma-international.org/15.0/index.html#sec-ecmascript-language-scripts-and-modules) on ESM by ECMAScript.

## Measuring
Before we dive in to how much difference it makes between CJS and ESM and how you can transition.
It is useful to know how you can measure it.

webpack And `esbuild` both support emitting a metafile, which contains data which npm packages are imported, why they are imported and which module system is used to import them.
With `webpack` you can use the `--profile` [flag](https://webpack.js.org/configuration/other-options/#profile).
With `esbuild` you can use the `--metafile=bundle.meta.json` [flag](https://esbuild.github.io/api/#build-metadata) or the property `{meta: true}` that will return the json object contains the meta data, which you can write to the file system yourself.
You can submit the meta file to https://esbuild.github.io/analyze/ and then you will get a visual representation on how everything is bundled.
You can let it mark visually which packages are interpreted as CommonJS and which ones as ESM.
This will give you the knowledge if you imported them correctly and if `esbuild` was able to find the ESM bundle of the npm package.

[add screenshot or gif on how to use the website]

## CJS to ESM
To show you the difference, I have created 2 projects, both have similar code but one is written for [CommonJS](https://github.com/Pouja/configuring-esm/tree/main/ts-cjs) and the other for [ESM](https://github.com/Pouja/configuring-esm/tree/main/ts-esm).
You can clone the repository and play with the different ways of importing a file and see what impact it will make.
This should also help you transitioning to ESM by looking at the differences.
I believe more in learning by doing and learning by reading.
So I hope this helps for you.

### `esbuild`
Both projects contain a `esbuild.config.(m)js` file.
Depending on your own project, this configuration is in most cases either generated or hidden from you.
The most important configurations are:
```javascript
{
    bundle: true,
    mainFields: ["module", "main"], // Tells which package.json entries it should look for
    platform: "node", // Tells if it should expect window object to be present, or the NodeJS internal packages
    format: "esm", // Tells if the output should be in ESM format or in CommonJS
    metafile: true, // If true, it will return a meta file object
    minify: true, // Will eliminate any unreachable statement, shorten all names and remove all whitespaces where possible
    tsconfig: 'tsconfig.json' // It only reads some properties from the tsconfig, see also TsconfigRaw in main.d.ts of `esbuild`
}
```

esbuild Has its own transpiler, so that is why only some properties are read from the tsconfig.
But the exception is when you use a plugin like `esbuild`-decorator, which does use all the settings from your tsconfig.
So you can not just configure your tsconfig to use CommonJS and then tell `esbuild` to output in ESM, you will most likely get some runtime errors.

The `mainFields` property is quite important.
Only a few modern libraries now output it properly.
By properly I mean using the `exports` field in the package.json, to tell NodeJS module resolver which file it should read depending on if you are using ESM or CommonJS.
If we take a look at a part of the package.json of `class-validator`:
```json
{
  "name": "class-validator",
  "sideEffects": false,
  "main": "./cjs/index.js",
  "module": "./esm5/index.js",
  "es2015": "./esm2015/index.js",
  "typings": "./types/index.d.ts",
}
```
NodeJS will by default only look at the `exports` field and if that is not present, which is the case for class-validator, it will use the `main` field.
So even if you do this:
```javascript
// index.mjs
import { validate } from 'class-validator';
```
NodeJS will look at `node_modules/class-validator/cjs/index.js` even though your file is in `.mjs` format and even if your package.json you have set `type` to `module`.
You can still tell `esbuild` to use the ESM output of class-validator by setting the `mainFields` property.

Use this information!
When inspecting and investigating your imports and you notice it uses the CommonJS variant of the package, even when they have ESM files.
Look at their package.json! If they do not emit any ESM file, your only options are: submitting a pull request or copy the code to your code base.

### package.json
The property `type` in the package.json is set to `module` for the ESM project and omitted CommonJS project, which defaults to `commonjs`.
You can actually choose how you will mark your project as ESM or CommonJS. 
When using plain javascript, you either use the `.mjs` extension for your files or you set the `type` property in the nearest package.json.
You can mix. You are allowed to use CommonJS files in ESM files, but not the other way around.

If you are using CommonJS and you need to use a package that only has ESM files, you can use the following "hack":
```javascript
function myFunc() {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  const TypeDoc = await dynamicImport('typedoc');
}
```

### tsconfig.json
This is the most confusing part.
I really had to read through the [module page](https://www.typescriptlang.org/docs/handbook/modules/reference.html) of typescript couple of times to understand what they are saying.
The most important configurations for transition of CJS to ESM are:
```json
{
    "compileOnSave": true,
    "compilerOptions": {
        "moduleResolution": "nodenext", // this tells typescript which algorithm/method it should use to resolve imports
        "module": "NodeNext", // This tells if you are using CommonJS, AMD, System, ESM or a mix of CommonJS and ESM which is nodenext
        "target": "ESNext", // This tells how the output should look like after you have compiled to javascript
    },
}
```

`nodenext` basically means that typescript will either resolve the imports by using NodeJS CommonJS module resolution technique or using the new ESM module resolution technique.
And it depends on the file extensions, using `.mts` will tell `typescript` to use ESM.
If you use `.ts` but the package.json has the property `type` set to `module` it will use ESM.
In all other cases it will use CommonJS.
Although typescript is quite lenient since 5.8.x on which module system it will use, it best to be consistent.

> Do not mix! You will get unexpected results when using frameworks that are consistent.

You can also set `moduleResolution` to `bundler`, but then you have to specify to which specific module system you want your javascript files compiled to.
Then it does not matter what file extension you use, it will always output to what ever module system you have picked.

When using `nodenext` value you can still output to both CommonJS format and ESM format, you only need to change the `format` property in `esbuild` and you have to make sure to not set the `type` property in the package.json file.

If you are not intending on publishing and if all your libraries/framework support ESM, which Jest does do quite well right now, I would recommend to setting the `type` property to `module` and use the `.mts` file extension.
You will notice  that you have to use `.mjs` when importing a relative file.
Do not worry, you are not importing a javascript file, Typescript will automatically search for any `.mts` file with the same module name.
It is confusing, people have [complained]() about this behavior, but it is what it is.

## CJS vs ESM
Now you know how you can transition, but how much will the difference be?

CommonJS:

![CJS](images/CJS-meta.png "Bundle size for CommonJS")

ESM:

![ESM](images/ESM-meta.png "Bundle size for ESM")

It is 20x smaller when using the same code.
If you generate the metafiles and upload it to `esbuild` page, you can reproduce this result.
You will notice that the biggest difference comes from libphonenumber-js not being present, because due to ESM, `esbuild` knows it can remove it from the bundle safely.

## ESM Dynamic Import
For the readers that were paying attention, I went through create details saying that using dynamic module names for `require` is one of the reasons treeshaking is not possible.
You could be wondering: "ESM supports `await import(moduleName)`, so how will that work?"
Great question!

ESM does allow the following:
```typescript
// on-ssm-event.ts
async function handler(event: ProxyApiGatewayEventv2): Promise<any> {
  const { Manager } = await import(event.superUnsafeThis);
}
```
`esbuild` will in this case do nothing special.
You are responsible yourself to make sure it resolves to something at runtime.
If you do expect them to be present when dynamically importing them then you need to reference them somewhere.

There are some other interesting results:
```typescript
// on-ssm-event.ts
async function handler(event: ProxyApiGatewayEventv2): Promise<any> {
    // esbuild will bundle all files that are reachable from one folder up
    const manager = await import('../' + event.superUnsafeThis);

    // esbuild will bundle both files
    const manager = await import(event.isS3Event ? '../lib/use-s3.js' : '../lib/use-sqs.js');

     // esbuild will bundle all files under the lib folder, not just the s3 and sqs one
    const manager = await import('../lib/' + (event.isS3Event ? 'use-s3.js' : 'use-sqs.js'));
}
```
You can play around with in [the example repository](https://github.com/Pouja/configuring-esm/blob/main/barrel-file/src/handlers/on-ssm-event.ts).

> Depending on your bundler you might get different results! Analyze the bundle.

## Proper Imports
Even when using CommonJS you can reduce your bundle size by looking at the import statements

Use `import type { MyClass} from './MyClass';` or `import { type MyClass} from './MyClass';` if you only use the import as a type.
All typescript `type` and `interface` do get stripped out by default.
But if you use something like `typeof MyClass` and you do not import it as a type, then `esbuild` will add that class to your bundle.
Using [@typescript-eslint/consistent-type-imports](https://typescript-eslint.io/rules/consistent-type-imports/) allows you to capture most of them.
This rule will not work on any file that uses decorators.
That is because under the hood the imported value might actually be used when setting the metadata of the decorated property or method.

Eliminate unused imports by detecting unused variables/functions that might use those.
You can detect those by using [@typescript-eslint/no-unused-vars](https://typescript-eslint.io/rules/no-unused-vars).

## Barrel files
Even with using proper imports, with a barrel file you can still end up with that package or file in your bundle. Why?

First of all, what is a barrel file? When you re-export everything from a folder within a `index.ts` that is called a barrel file.
An example of this:
```typescript
// index.ts
export * from './use-cloudwatch';
export * from './use-dynamodb';
export * from './use-lambda';
export * from './use-s3';
export * from './use-sqs';
export * from './use-ssm';
export * from './helpers/index';
```

All exported values within each of those files are re-exported by `index.ts`.
This makes it easier to import any value of any of the files.
No need to have a long listed import statement like: `import { mapToZod } from '../lib/helpers/zod-utilities';`, but you can write it as `import { mapToZod } from '../lib';`.

A lot of blog posts mark barrel files as evil.
But it is a bit nuanced.
It has impact on two things: runtime and bundle size.

### Runtime
As explained in the CommonJS section, each file is executed before imported and wrapped by NodeJS.
That means when you import a barrel file, NodeJS will go through each file mentioned there, then it will read each require call, load that file etc.
When your program is large enough, or you node_modules folder is large enough, this will impact any framework or library you are using.

Take `jest` for example, it will go through all those files before it even runs any test function.
I have seen cases where it took 20+ seconds before running the first file, even when most files were not even used.
But due to extensive usage of barrel files all those files were executed and transpiled.
Even when you use ESM, `jest` still has to transpile or compile your typescript files to javascript files.
By eliminating some of those barrel files, I was able to reduce the start time to 5 seconds.

If you use your barrel files sparingly or if you program is not large, you are good to go.

### Bundling
In the default case of `esbuild` and `webpack` it will not treeshake any unused re-exported value.
That is due to the possible side effects a file can have.

### Side Effects
What is considered a side effect?
Take the following [file](https://github.com/Pouja/configuring-esm/blob/main/barrel-file/src/lib/load-dotenv.ts):
```typescript
// load-dotenv.ts
import dotenv from "dotenv";

dotenv.config();
```
When you import that file: `import './load-dotenv';` it will read out the `.env` file and update `process.env`.
This is considered a side effect because you are altering the possible execution of the program by just importing the file.
You have more examples of side effects:
- `import 'reflect-metadata';` when you need to use `tsyringe`, it modifies the global `Reflect` object.
- `import 'zone.js';` when you use `angular`, overwrites all async calls with `zones`.

There is no sure way that `esbuild` or `webpack` can know that it can safely remove files when re-exporting them without giving any hints.
Both of them support [1](https://esbuild.github.io/api/#ignore-annotations)[2](https://webpack.js.org/guides/tree-shaking/#clarifying-tree-shaking-and-sideeffects) support the `sideEffects` property in the `package.json`.
When set to false it will safely remove any unused re-exported file.
But that will also remove `load-dotenv.ts`! So be careful when using that property.
It does not affect any other npm package you are using as a side effect, only the ones in your project.

If it is not possible to set the property `sideEffects` then you should prevent any re-exporting files or values.
That means no barrel files.
That also means no god files. God files is what I refer to values that import everything from everywhere as a single entry point.
If you define all your AWS Lambda handlers in one file, that is a god file.
If you define all the routes with all the components of your frontend page and do not chunk them, that is a god file.

### Alternative: Workspaces
A good solution in a large project is to have `pnpm` [workspaces](https://pnpm.io/pnpm-workspace_yaml), where you have internal libraries.
Then per library you can mark if all those files that are exported through the `package.json` file have side effects or not.
You can find an [example configuration](https://github.com/Pouja/configuring-esm/blob/main/monorepo-ts-esm-workspaces/packages/base-models/package.json)
```json
{
    "name": "@packages/base-models",
    "typesVersions": {
        "*": {
            "./enums/*": [
                "./src/enums/*"
            ],
            "./models/*": [
                "./src/models/*"
            ]
        }
    },
    "exports": {
        "./enums/*": "./src/enums/*",
        "./models/*": "./src/models/*"
    }
}
```
The exports field allows you to sub categorize your internal library.
The wild card `*` allows any subpath (0 or more levels deep) or any file.
If you want to limit it to one depth you have to set the subfolder to null: `"./enums/not-this-dir/": null`.
See [official NodeJS documentation](https://nodejs.org/api/packages.html#exports-sugar) on the specifications of `exports` field.

The `typesVersions` is only necessary if you use CommonJS as module resolution or if you want typescript to refer to `.d.ts` files that are not next to your `.(m)ts` files.

### Alternative: TSConfig Paths
Another solution, if you do not use internal libraries through the yarn workspaces or pnpm workspaces, is using [tsconfig path](https://www.typescriptlang.org/tsconfig/#paths). Taking the previous `package.json` example, you will write it as:
```json
{
  "compilerOptions": {
    "paths": {
      "@packages/base-models/enums/*": ["./src/enums/*"],
      "@packages/base-models/models/*": ["./src/models/*"],
    }
  }
}
```

### Demo
You can play with barrel files in [my example project](https://github.com/Pouja/configuring-esm/blob/main/barrel-file).
1. Clone the repository
2. `cd barrel-file`
3. `npm install`
4. Play with the barrel file, `sideEffects` property, side effect file `load-dotenv.ts`
5. Run `node `esbuild`.config.mjs` and see the effects.

## Unused Code
I have listed several things that `esbuild` might see as dead code depending on the setup of your project.
But what about unused code even when using ESM and no side effects?

Unused methods and properties of classes will not be treeshaking.
If you use a large npm package within a method, but you actually use the class but not that specific method, you will still end up with that npm package in your bundle.
This is where separation of concerns and cohesion come in.
Make sure to follow that paradigm.

Unused elements in the array.
In most cases this will not impact your bundle much.

Nested unused functions.
Only top level objects, primitives and functions are considered for treeshaking.

Unused properties in objects.
There might be some side effects, so it hard to determine if you can remove that code.

Unreachable statements when not using minification in `webpack` or in `esbuild`. 
If you have functions that are dependant on some build time environment variable, for example `if (process.env.NODE_ENV === 'production')`.
Or another example of this, is having a class that has different methods for different environment (browser or os).
Then make sure to enable minification.
Or you can use [labels](https://esbuild.github.io/api/#drop-labels) to achieve similar behavior.

> NOTE: There might be bundlers out there that can do better in certain scenarios. That is why measuring is key!

> I did [try](https://github.com/Pouja/configuring-esm/blob/main/barrel-file/terser.config.mjs) [rollup](https://rollupjs.org) with [terser](https://github.com/terser/terser) but I saw similar results

## Conclusion
I have listed some things to look out for.
This list might not be exhaustive, but the most important thing is: analyze!
Make sure that bundler you use has a way to convey which files and which npm packages were included.
This blog post should give you enough information to understand then why some files/code/packages were included.
From there you can start eliminating and changing the structure of your code.

Happy hunting and happy coding!
Thank you for reading.