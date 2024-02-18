import assert from "assert";

import {DiagnosticCode} from "../lib/diagnostic.js";
import {createToken, TokenType} from "../lib/token.js";
import {Tokenizer} from "../lib/Tokenizer.js";
import {assertFirstToken, assertToken} from "./driver.js";

describe("Decimal number literal", function() {
    it("parses 0", function() {
        assertFirstToken(
            "0",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 1, line: 0, character: 1},
                {value: 0n, scale: 0n},
            ),
        );
        assertFirstToken(
            "0.00",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 4, line: 0, character: 4},
                {value: 0n, scale: 0n},
            ),
        );
    });
    it("parses -12345.12345", function() {
        const tokenizer = new Tokenizer("-12345.1234500");
        assert.strictEqual(tokenizer.nextToken().type, TokenType.Sub);
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assertToken(
            token,
            createToken(
                TokenType.Number,
                {offset: 1, line: 0, character: 1},
                {offset: 14, line: 0, character: 14},
                {value: 1234512345n, scale: 5n},
            ),
        );
    });
    it("parses unicode number", function() {
        assertFirstToken(
            "０１２３４",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 5, line: 0, character: 5},
                {value: 1234n, scale: 0n},
            ),
        );
    });
    it("parses int scientific notation 123e+7", function() {
        assertFirstToken(
            "123E07",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 6, line: 0, character: 6},
                {value: 1230000000n, scale: 0n},
            ),
        );
        assertFirstToken(
            "123e+07",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 7, line: 0, character: 7},
                {value: 1230000000n, scale: 0n},
            ),
        );
    });
    it("parses float scientific notation 123e-7", function() {
        assertFirstToken(
            "123e-07",
            createToken(
                TokenType.Number,
                {offset: 0, line: 0, character: 0},
                {offset: 7, line: 0, character: 7},
                {value: 123n, scale: 7n},
            ),
        );
    });
    it("diagnosticates loss of precision", function() {
        const tokenizer = new Tokenizer("9223372036854775808");
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 19, line: 0, character: 19},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.LongLossOfPrecision);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assertToken(
            token,
            createToken(TokenType.Number, expectedRange.start, expectedRange.end, {
                value: 9223372036854775808n,
                scale: 0n,
            }),
        );
    });
    it("diagnosticates more than one point", function() {
        const tokenizer = new Tokenizer("123.2.2");
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 5, line: 0, character: 5},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.MoreThanOnePoint);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assertToken(
            token,
            createToken(
                TokenType.Number,
                expectedRange.start,
                {offset: 7, line: 0, character: 7},
                {value: 12322n, scale: 2n},
            ),
        );
    });
});

describe("Hex number literal", function() {
    it("parses 0x0", function() {
        assertFirstToken(
            "0x0",
            createToken(
                TokenType.HexNumber,
                {offset: 0, line: 0, character: 0},
                {offset: 3, line: 0, character: 3},
                {value: 0n, scale: 0n},
            ),
        );
    });
    it("parses 0xDeADbEeF", function() {
        assertFirstToken(
            "0xDeADbEeF",
            createToken(
                TokenType.HexNumber,
                {offset: 0, line: 0, character: 0},
                {offset: 10, line: 0, character: 10},
                {value: 0xdeadbeefn, scale: 0n},
            ),
        );
    });
    it("parses negative number -0x8000000000000000", function() {
        const tokenizer = new Tokenizer("-0x8000000000000000");
        let token = tokenizer.nextToken();
        assert.strictEqual(token.type, TokenType.Sub);
        token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.HexNumber);
        assert.deepStrictEqual(token.value, {value: 0x8000000000000000n, scale: 0n});
        assert.deepStrictEqual(token.start, {offset: 1, line: 0, character: 1});
        assert.deepStrictEqual(token.end, {offset: 19, line: 0, character: 19});
    });
    it("diagnosticates loss of precision positive", function() {
        const tokenizer = new Tokenizer("0x8000000000000000");
        const token = tokenizer.nextToken();
        const expectedRange = {
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 18, line: 0, character: 18},
        };
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.LongLossOfPrecision);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, expectedRange);
        assertToken(
            token,
            createToken(TokenType.HexNumber, expectedRange.start, expectedRange.end, {
                value: 0x8000000000000000n,
                scale: 0n,
            }),
        );
    });
    it("diagnosticates loss of precision negative", function() {
        const tokenizer = new Tokenizer("-0x8000000000000001");
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
        assertToken(
            token,
            createToken(TokenType.HexNumber, expectedRange.start, expectedRange.end, {
                value: 0x8000000000000001n,
                scale: 0n,
            }),
        );
    });
    it("diagnosticates missing digits 0x", function() {
        const tokenizer = new Tokenizer("0x");
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
