import assert from "assert";

import {Tokenizer} from "../lib/Tokenizer.js";

/**
 * @param {string} input
 * @param {import('../lib/token.js').Token} expected
 */
export function assertFirstToken(input, expected) {
    const tokenizer = new Tokenizer(input);
    const actual = tokenizer.nextToken();
    assert.strictEqual(tokenizer.diagnostics.length, 0);
    assertToken(actual, expected);
}

/**
 * @param {import('../lib/token.js').Token} actual
 * @param {import('../lib/token.js').Token} expected
 */
export function assertToken(actual, expected) {
    assert.strictEqual(actual.type, expected.type);
    assert.deepStrictEqual(actual.start, expected.start);
    assert.deepStrictEqual(actual.end, expected.end);
    assert.deepStrictEqual(actual.value, expected.value);
    assert.strictEqual(actual.syntaxError, expected.syntaxError);
}
