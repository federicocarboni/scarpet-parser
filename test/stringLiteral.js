import assert from 'assert';
import {Tokenizer} from '../lib/Tokenizer.js';
import {TokenType} from '../lib/token.js';

describe('String literal', function () {
    it('parses simple literal', function () {
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
        assert.strictEqual(token.value, 'hello world');
    });
    it('parses literal with newlines', function () {
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
        assert.strictEqual(token.value, 'hello\r\nworld');
    });
    it('parses escapes in literal', function () {
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
        assert.strictEqual(token.value, '\n\t\'\\');
    });
});
