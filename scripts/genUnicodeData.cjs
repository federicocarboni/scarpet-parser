/* eslint-disable */

'use strict';

const fs = require('fs');
const pkg = require('../package.json');
const dependencies = Object.keys(pkg.devDependencies);

// Should be unicode-13.0.0 since that's what Minecraft JRE (Java 17) supports.
const unicodeVersion = dependencies.find((name) =>
    /^@unicode\/unicode-\d/.test(name),
);

const letters = require(
    unicodeVersion + '/General_Category/Letter/code-points.js',
).filter((code) => code <= 0xffff);

const unicodeDecimalDigits = require(
    unicodeVersion + '/General_Category/Decimal_Number/code-points.js',
).filter((code) => code <= 0xffff);

const unicodeWhitespace = require(
    unicodeVersion + '/Binary_Property/White_Space/code-points.js',
).filter((code) => code <= 0xffff);

const javaExtraSpace = [
    0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1c, 0x1d, 0x1e, 0x1f,
];
const javaNonSpace = [0x00a0, 0x2007, 0x202f];

const javaWhitespace = unique([
    ...javaExtraSpace,
    ...unicodeWhitespace.filter((code) => !javaNonSpace.includes(code)),
]);

// Disable tooling for unicode.js to avoid running unnecessary checks on a large
// file. JSON.parse in the resulting code slightly speeds up first load.
fs.writeFileSync(
    'lib/unicode.js',
    `\
/* eslint-disable */
// @ts-nocheck
/**
 * @file
 * Generated using ${unicodeVersion}.
 *
 * DO NOT modify manually.
 * @see {@link ../scripts/genUnicodeData.cjs}
 */
/** @type {Set<number>} */
export const LETTER_CHAR_CODES = new Set(JSON.parse(${sourcify(letters)}));
/** @type {Set<number>} */
export const JAVA_WHITESPACE_CHAR_CODES = new Set(JSON.parse(${sourcify(
        javaWhitespace,
    )}));
/** @type {Set<number>} */
export const DECIMAL_DIGIT_CHAR_CODES = new Set(JSON.parse(${sourcify(
        unicodeDecimalDigits,
    )}));
`,
);

function sourcify(values) {
    return JSON.stringify(JSON.stringify(values));
}

function unique(values) {
    return [...new Set(values)];
}
