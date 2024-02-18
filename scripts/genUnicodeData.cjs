"use strict";

const fs = require("fs");
const assert = require("assert");

// Importing unicode-properties at runtime would load into memory the whole Unicode Database which
// is large and slow, so we just use it here to build a custom map for our required information.
const unicodeProperties = require("unicode-properties");

const pkg = require("../package.json");

const dependencies = Object.keys(pkg.devDependencies);
// Should be unicode-13.0.0 since that's what the current Minecraft JRE (Java 17) supports.
const unicodePkg = dependencies.find((name) => /^@unicode\/unicode-\d/.test(name));

/**
 * @typedef {object} UnicodeRange
 * @property {number} begin
 * @property {number} end
 * @property {number} length
 */

// Filter out code points above the UTF-16 single char code max 0xFFFF,
// Scarpet does not support supplementary characters so we don't either.
const nonSupplementary = (code) => code <= 0xffff;

const unicodeLetterRanges = /** @type {UnicodeRange[]} */
    (require(unicodePkg + "/General_Category/Letter/ranges.js"))
        .filter(({begin}) => nonSupplementary(begin))
        // The letter set is really large so we add it in ranges [begin, length, begin, length, ...]
        // Using length instead of end because it saves almost 1kB of space.
        // When reconstructing the set from the ranges we just loop in chunks of two and add char codes
        // from `begin` (inclusive) to `begin + length` (non inclusive).
        .flatMap(({begin, length}) => [begin, length]);

const unicodeDecimalRanges = /** @type {UnicodeRange[]} */
    (require(unicodePkg + "/General_Category/Decimal_Number/ranges.js"))
        .filter(({begin}) => nonSupplementary(begin))
        // The decimal number set is also pretty large so we add it in ranges of length 10.
        // [begin, begin, ...] is then reconstructed adding the 10 charCodes starting from begin and
        // associated to their iteration number.
        .map(({begin, end, length}) => {
            // Verify all assumptions are correct.
            assert.strictEqual(length, 10);
            for (let c = begin, n = 0; c < end; c++, n++) {
                assert.strictEqual(unicodeProperties.getNumericValue(c), n);
            }
            return begin;
        });

/** @type {number[]} */
const unicodeWhitespace = require(
    unicodePkg + "/Binary_Property/White_Space/code-points.js",
).filter(nonSupplementary);

// Java has its own rules for which characters are considered whitespace
const javaExtraSpace = [0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1c, 0x1d, 0x1e, 0x1f];
const javaNonSpace = [0x00a0, 0x2007, 0x202f];

const javaWhitespace = Array.from(
    new Set([
        ...javaExtraSpace,
        ...unicodeWhitespace.filter((code) => !javaNonSpace.includes(code)),
    ]),
);

const stringify = (value) => JSON.stringify(JSON.stringify(value));

// Disable tooling for unicode.js to avoid running unnecessary checks on a large
// file. JSON.parse in the resulting code slightly speeds up first load. Add ranges programmatically
// to reduce file size.
const unicodeFile = `\
// This file is auto-generated, DO NOT EDIT MANUALLY!
/**
 * @file Unicode data generated using \`${unicodePkg}\` and \`unicode-properties\`.
 *
 * This file only contains Unicode data relevant for Scarpet (Letter, Decimal_Number and Java
 * whitespace), so supplementary code points are not supported.
 */
/* eslint-disable */
// dprint-ignore-file
// @ts-nocheck
function __fromCodeRanges(r) {
    let s = new Set();
    for (let i = 0, l = r.length; i < l; i += 2)
        for (let c = r[i], e = r[i] + r[i + 1]; c < e; c++)
            s.add(c);
    return s;
}
function __mapFromStartCodes(r) {
    let m = new Map();
    for (let s of r)
        for (let c = s, n = 0; n < 10; c++, n++)
            m.set(c, n);
    return m;
}
/** @type {Set<number>} */
export const LETTER_CHAR_CODES = /* @__PURE__ */ __fromCodeRanges(/* @__PURE__ */ JSON.parse(${
    stringify(unicodeLetterRanges)
}));
/** @type {number[]} */
export const JAVA_WHITESPACE_CHAR_CODES = /* @__PURE__ */ JSON.parse(${stringify(javaWhitespace)});
/** @type {Map<number, number>} */
export const DECIMAL_DIGIT_CHAR_CODES = /* @__PURE__ */ __mapFromStartCodes(/* @__PURE__ */ JSON.parse(${
    stringify(unicodeDecimalRanges)
}));
`;

fs.writeFileSync("lib/unicode.js", unicodeFile);

// Verify generated data for correctness.

const unicodeDecimalNumbers = /** @type {number[]} */ (require(
    unicodePkg + "/General_Category/Decimal_Number/code-points.js",
)).filter(nonSupplementary);

const unicodeLetters = /** @type {number[]} */ (require(
    unicodePkg + "/General_Category/Letter/code-points.js",
)).filter(nonSupplementary);

// Can still use dynamic import in commonjs.
import("../lib/unicode.js").then(({LETTER_CHAR_CODES, DECIMAL_DIGIT_CHAR_CODES}) => {
    assert.strictEqual(LETTER_CHAR_CODES.size, unicodeLetters.length);
    LETTER_CHAR_CODES.forEach((charCode) => {
        assert(unicodeLetters.includes(charCode));
    });
    assert.strictEqual(DECIMAL_DIGIT_CHAR_CODES.size, unicodeDecimalNumbers.length);
    DECIMAL_DIGIT_CHAR_CODES.forEach((value, charCode) => {
        assert(unicodeDecimalNumbers.includes(charCode));
        assert.strictEqual(value, unicodeProperties.getNumericValue(charCode));
    });
});
