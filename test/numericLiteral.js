import assert from 'assert';

import {DiagnosticCode} from '../lib/diagnostic.js';
import {Tokenizer} from '../lib/Tokenizer.js';
import {TokenType} from '../lib/token.js';

describe('Decimal number literal', function () {
    it('should parse 0', function () {
        let tokenizer = new Tokenizer('0');
        let token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 0n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 1, line: 0, character: 1});
        tokenizer = new Tokenizer('0.00');
        token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 0n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 4, line: 0, character: 4});
    });
    it('should parse -12345.12345', function () {
        const tokenizer = new Tokenizer('-12345.1234500');
        assert.strictEqual(tokenizer.nextToken().type, TokenType.Sub);
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 1234512345n, scale: 5n});
        assert.deepStrictEqual(token.start, {offset: 1, line: 0, character: 1});
        assert.deepStrictEqual(token.end, {offset: 14, line: 0, character: 14});
    });
    it('should parse unicode number', function () {
        const tokenizer = new Tokenizer('０１２３４');
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 1234n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 5, line: 0, character: 5});
    });
    it('should parse int scientific notation 123e+7', function () {
        let tokenizer = new Tokenizer('123E07');
        let token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 1230000000n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 6, line: 0, character: 6});
        tokenizer = new Tokenizer('123e+07');
        token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 1230000000n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 7, line: 0, character: 7});
    });
    it('should parse float scientific notation 123e-7', function () {
        const tokenizer = new Tokenizer('123e-07');
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 123n, scale: 7n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 7, line: 0, character: 7});
    });
    it('should push diagnostic on loss of precision', function () {
        const tokenizer = new Tokenizer('9223372036854775808');
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 19, line: 0, character: 19},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.LongLossOfPrecision);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 9223372036854775808n, scale: 0n});
        assert.deepStrictEqual(token.start, expectedRange.start);
        assert.deepStrictEqual(token.end, expectedRange.end);
    });
    it('should push diagnostic on more than one point', function () {
        const tokenizer = new Tokenizer('123.2.2');
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 5, line: 0, character: 5},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.MoreThanOnePoint);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assert.strictEqual(token.type, TokenType.Number);
        assert.deepStrictEqual(token.value, {value: 12322n, scale: 2n});
        assert.deepStrictEqual(token.start, expectedRange.start);
        assert.deepStrictEqual(token.end, {offset: 7, line: 0, character: 7});
    });
});

describe('Hex number literal', function () {
    it('should parse 0x0', function () {
        const tokenizer = new Tokenizer('0x0');
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 3, line: 0, character: 3});
    });
    it('should parse 0xDeADbEeF', function () {
        const tokenizer = new Tokenizer('0xDeADbEeF');
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0xdeadbeefn, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 0, line: 0, character: 0});
        assert.deepStrictEqual(token.end, {offset: 10, line: 0, character: 10});
    });
    it('should parse negative number -0x8000000000000000', function () {
        const tokenizer = new Tokenizer('-0x8000000000000000');
        let token = tokenizer.nextToken();
        assert.strictEqual(token.type, TokenType.Sub);
        token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0x8000000000000000n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 1, line: 0, character: 1});
        assert.deepStrictEqual(token.end, {offset: 19, line: 0, character: 19});
    });
    it('should push diagnostic on loss of precision positive', function () {
        const tokenizer = new Tokenizer('0x8000000000000000');
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 18, line: 0, character: 18},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.LongLossOfPrecision);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0x8000000000000000n, scale: 0n});
        assert.deepStrictEqual(token.start, expectedRange.start);
        assert.deepStrictEqual(token.end, expectedRange.end);
    });
    it('should push diagnostic on loss of precision negative', function () {
        const tokenizer = new Tokenizer('-0x8000000000000001');
        let token = tokenizer.nextToken();
        assert.strictEqual(token.type, TokenType.Sub);
        token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 1, line: 0, character: 1},
            end: {offset: 19, line: 0, character: 19},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.LongLossOfPrecision);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0x8000000000000001n, scale: 0n});
        assert.deepStrictEqual(token.start, expectedRange.start);
        assert.deepStrictEqual(token.end, expectedRange.end);
    });
    it('should push diagnostic on missing digits 0x', function () {
        const tokenizer = new Tokenizer('0x');
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 2, line: 0, character: 2},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.ExpectedHexDigit);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.start, expectedRange.start);
        assert.deepStrictEqual(token.end, expectedRange.end);
    });
});
