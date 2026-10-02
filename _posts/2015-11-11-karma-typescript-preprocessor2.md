---
layout: post
topic: Tooling
title: "karma-typescript-preprocessor2: running TypeScript tests in Karma without temp files"
excerpt: How a small Karma plugin compiled TypeScript in memory with gulp-typescript and a single tsconfig.json, and why its name ends with a 2.
modified: 2015-11-11
tags: [karma, typescript, testing, npm, javascript]
comments: true
---

{% include toc.html %}

In 2015, if you had TypeScript code and browser tests, you needed some glue in between. This post
is about the glue I wrote: [karma-typescript-preprocessor2](https://github.com/klaygomes/karma-typescript-preprocessor2).
You will see what it solved, how to configure it, and how it worked inside.

> A note on timing: I'm filing this post on the day version 1.0.0 went to npm, November 11th, 2015,
but I'm writing it looking back, so I will also tell you where the project ended up.

## First, a few words

- **Test runner**: a program that finds your tests, runs them and reports what passed and what
failed. [Karma](https://github.com/karma-runner/karma) is a test runner that runs your JavaScript
tests inside real browsers.
- **Transpile**: translate code from one language to another at the same level. TypeScript is
transpiled to JavaScript, because browsers only understand JavaScript.
- **Preprocessor**: in Karma, a plugin that transforms each file before it is sent to the browser.
Here, it takes a `.ts` file and hands Karma the `.js` version.

## The problem

Karma can't run a `.ts` file, so something has to compile it first.

A preprocessor for that already existed on npm: `karma-typescript-preprocessor`, published by
Sergey Todyshev in 2013, described as "a karma-runner plugin to compile typescript files on the
fly". Mine is not a fork of it; the git history starts from scratch. But the name was taken, so I
added a **2** at the end. The README even says it: "note number **2** at the end". Both plugins
register the same `typescript` preprocessor name and read the same `typescriptPreprocessor`
section of `karma.conf.js`.

What mine does differently is written in the first line of its README:

> Transpile files in memory using gulp-typescript. No temp files are generated.

## How to use it

Install it as a dev dependency:

```
$ npm install karma-typescript-preprocessor2 --save-dev
```

Then point Karma at it. This is the full example from the README:

{% highlight javascript %}
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      '**/*.ts'   // Preprocessor will convert Typescript to Javascript
    ],
    preprocessors: {
      '**/*.ts': ['typescript', 'sourcemap']   // Use karma-sourcemap-loader
    },
    typescriptPreprocessor: {
      // options passed to typescript compiler
      tsconfigPath: './tsconfig.json', // *obligatory
      compilerOptions: { // *optional
        removeComments: false
      },
      // Options passed to gulp-sourcemaps to create sourcemaps
      sourcemapOptions: {includeContent: true, sourceRoot: '/src'},
      // ignore all files that ends with .d.ts (this files will not be served)
      ignorePath: function(path){
       return /\.d\.ts$/.test(path);
      },
      // transforming the filenames
      // you can pass more than one, they will be execute in order
      transformPath: [function(path) { // *optional
        return path.replace(/\.ts$/, '.js');
      }, function(path) {
         return path.replace(/[\/\\]test[\/\\]/i, '/'); // remove directory test and change to /
      }]
    }
  });
};
{% endhighlight %}

The short version of each option:

- `tsconfigPath` is required. The plugin refuses to start without it.
- `compilerOptions` lets you override (or add) anything from `tsconfig.json`.
- `ignorePath` skips files you don't want served, like `.d.ts` definition files.
- `transformPath` renames the virtual path Karma sees; the example strips a `test` folder so specs
can import modules from `src`.
- `sourcemapOptions` is passed to gulp-sourcemaps.

## The one opinion it had

The plugin only accepts configuration through `tsconfig.json`. In the README's words, "a lot of
problems with typos and references are completely solved, as compiler will use same `basedir` to
resolve files".

## How it worked inside

The whole plugin is a single `index.js`. Three ideas carry it:

1. **Compile the project, not the file.** When Karma starts, the plugin calls
`ts.createProject(tsconfigPath, compilerOptions)` from
[gulp-typescript](https://www.npmjs.com/package/gulp-typescript) and compiles everything once.
The output goes into a writable stream that keeps each compiled file in an in-memory buffer. Nothing
touches the disk. The README credits gulp-typescript's incremental compilation for fast rebuilds.
2. **A tiny state machine.** The plugin is `idle`, `compiling` or `compilationCompleted`. If Karma
asks for a file while a compilation is running, the request waits in a queue. When compilation
ends, the queue is drained and each file is served from the buffer.
3. **Recompile on change.** Karma marks a changed file with a `sha`. When the plugin sees it, it
queues the request and triggers a new compilation.

## My first pull request

This was my first open-source project, and I was really happy the day another contributor sent me a pull
request. It was [#2](https://github.com/klaygomes/karma-typescript-preprocessor2/pull/2), opened by
[@rich-j](https://github.com/rich-j) on February 7th, 2016, and merged the next day. It added
sourcemap support through gulp-sourcemaps, because gulp-typescript ignores the sourcemap settings in
`tsconfig.json`, and it made `tsconfigPath` relative to Karma's `basePath`.

A few months later, [@lelandmiller](https://github.com/lelandmiller) sent
[#3](https://github.com/klaygomes/karma-typescript-preprocessor2/pull/3), merged on May 21st, 2016.
It compared files by full path instead of file name, so two files with the same name in different
folders stopped colliding.

## Where it ended up

The last version on [npm](https://www.npmjs.com/package/karma-typescript-preprocessor2) is 1.2.1,
from June 19th, 2016. The repository got a few more commits until 2017 (a refactor and a fix for
default compiler options), but they were never published. If you read `master` today, be aware it
does not match what npm serves: `index.js` requires `lodash.assignin` while `package.json` lists
`lodash.assign`, and the `transformPath` check throws when you pass an array.

The ecosystem moved on too: Karma's own README now says "Karma is deprecated and is not accepting
new features or general bug fixes".

## What I take from it

Two decisions still feel right to me: keeping compiled output in memory, so there is nothing to
clean up, and letting `tsconfig.json` be the single source of truth for the compiler.

The code is about 200 lines and MIT licensed. If you are curious how a Karma plugin is wired
together (the `$inject` array, the factory, the `done` callback), it is a quick read.
[Take a look on GitHub](https://github.com/klaygomes/karma-typescript-preprocessor2), and if you
still have an old project running it, I would love to hear about it in the comments.
