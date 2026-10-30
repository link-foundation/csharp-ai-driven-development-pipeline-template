#!/usr/bin/env node
// Run under node --throw-deprecation against the pinned download-artifact bundle.
// Uses two bytes, no extraction/network/credentials, and deliberately fails on DEP0005.
import { readFileSync } from 'node:fs';
import { Transform } from 'node:stream';
import util from 'node:util';
import vm from 'node:vm';
const source = readFileSync(process.argv[2], 'utf8');
const start = source.indexOf('function MatcherStream(patternDesc, matchFn)');
const end = source.indexOf('module.exports = MatcherStream;', start);
if (start < 0 || end < 0) throw Error('Pinned MatcherStream implementation not found');
const context = { Transform, util, Buffer, module: { exports: undefined } };
vm.runInNewContext(
  source.slice(start, end + 'module.exports = MatcherStream;'.length),
  context,
);
const matcher = new context.module.exports('PK');
matcher.end(Buffer.from('PK'));
