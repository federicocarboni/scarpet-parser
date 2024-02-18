import assert from "assert";
import {DiagnosticCode} from "../lib/diagnostic.js";
import {createToken, TokenType} from "../lib/token.js";
import {Tokenizer} from "../lib/Tokenizer.js";
import {assertToken} from "./driver.js";

describe("String literal", function () {
    it("parses simple literal", function () {
        const tokenizer = new Tokenizer("'hello world'");
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.String);
        assert.strictEqual(token.start.offset, 0);
        assert.strictEqual(token.start.line, 0);
        assert.strictEqual(token.start.character, 0);
        assert.strictEqual(token.end.offset, 13);
        assert.strictEqual(token.end.line, 0);
        assert.strictEqual(token.end.character, 13);
        assert.strictEqual(token.value, "hello world");
    });
    it("parses literal with newlines", function () {
        const tokenizer = new Tokenizer("'hello\r\nworld'");
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.String);
        assert.strictEqual(token.start.offset, 0);
        assert.strictEqual(token.start.line, 0);
        assert.strictEqual(token.start.character, 0);
        assert.strictEqual(token.end.offset, 14);
        assert.strictEqual(token.end.line, 1);
        assert.strictEqual(token.end.character, 6);
        assert.strictEqual(token.value, "hello\r\nworld");
    });
    it("parses escapes in literal", function () {
        const tokenizer = new Tokenizer("'\\n\\t\\'\\\\'");
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 0);
        assert.strictEqual(token.type, TokenType.String);
        assert.strictEqual(token.start.offset, 0);
        assert.strictEqual(token.start.line, 0);
        assert.strictEqual(token.start.character, 0);
        assert.strictEqual(token.end.offset, 10);
        assert.strictEqual(token.end.line, 0);
        assert.strictEqual(token.end.character, 10);
        assert.strictEqual(token.value, "\n\t'\\");
    });
    it("diagnosticates invalid escape sequences", function () {
        const tokenizer = new Tokenizer("'\\r'");
        const token = tokenizer.nextToken();
        assert.strictEqual(tokenizer.diagnostics.length, 1);
        assert.strictEqual(tokenizer.diagnostics[0].code, DiagnosticCode.UnknownEscapeSequence);
        assert.deepStrictEqual(tokenizer.diagnostics[0].range, {
            start: {
                offset: 1,
                line: 0,
                character: 1,
            },
            end: {
                offset: 2,
                line: 0,
                character: 2,
            },
        });
        assertToken(
            token,
            createToken(
                TokenType.String,
                {offset: 0, line: 0, character: 0},
                {offset: 4, line: 0, character: 4},
                "\\r",
            ),
        );
    });
});
