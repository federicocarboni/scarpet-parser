import {readFileSync, readdirSync} from 'fs';
import path from 'path';

import {parseScript} from '../lib/lib.js';
import assert from 'assert';

/**
 * @param {any} key
 * @param {any} value
 * @returns {any}
 */
function reviver(key, value) {
    if (key !== 'value' || typeof value !== 'string') return value;
    try {
        return BigInt(value);
    } catch {
        return value;
    }
}

describe('parser test cases', function () {
    const testCasesDir = 'test/cases';
    const testExpectedDir = 'test/expected';
    const testCases = readdirSync(testCasesDir);
    for (const testCaseFile of testCases) {
        if (!testCaseFile.endsWith('.sc')) continue;
        const basename = path.basename(testCaseFile, '.sc');
        const input = readFileSync(path.join(testCasesDir, testCaseFile), 'utf8');
        const expected = JSON.parse(
            readFileSync(path.join(testExpectedDir, basename + '.json'), 'utf8'),
            reviver,
        );
        it(basename, function () {
            const opts = {errors: [], warnings: []};
            const root = parseScript(input, opts);
            const actual = structuredClone({...opts, root});
            assert.deepStrictEqual(actual, expected);
        });
    }
});
