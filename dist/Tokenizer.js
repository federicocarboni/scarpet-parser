import { Position } from './Position.js';
import { TokenType, TokenTypes } from './TokenType.js';
import { isDigit, isWhitespace } from './chars.js';
/**
 * @typedef {object} TokenizerOptions
 * @prop {boolean?} [allowComments=true]
 * @prop {boolean?} [allowNewLineMarkers=false]
 */
export class Tokenizer {
    /**
     *
     * @param input {string}
     * @param options {TokenizerOptions}
     */
    constructor(input, options = {}) {
        var _a;
        /** @private */
        this.pos = 0;
        /** @private */
        this.row = 0;
        /** @private */
        this.col = 0;
        /** @type {TokenError[]} @public */
        this.errors = [];
        /** @private */
        this.input = String(input);
        /** @private */
        this.allowComments = !!((_a = options.allowComments) !== null && _a !== void 0 ? _a : true);
        /** @private */
        this.allowNewLineMarkers = !!options.allowNewLineMarkers;
    }
    /**
     * @private
     * @returns {Position}
     */
    getPosition() {
        return new Position(this.pos, this.row, this.col);
    }
    /** @private */
    getChar() {
        // intentionally not using codePointAt because Carpet Mod does not support
        // supplementary plane characters
        return this.input.charCodeAt(this.pos);
    }
    /**
     * @param reason {TokenErrorReason}
     * @private
     */
    pushError(reason) {
        this.errors.push(new TokenError(reason, this.getPosition()));
    }
    /** @private */
    skipWhitespace() {
        let c;
        while (this.pos < this.input.length && isWhitespace(c = this.getChar())) {
            this.pos++;
            if (c === 0x0A /* \n */) {
                this.row++;
                this.col = 0;
            }
        }
    }
    /** @private */
    readNumber() {
        let c = this.getChar();
        return null;
    }
    /** @private */
    readString() {
        // skip '
        this.pos++;
        let c = this.getChar();
        let start = this.pos;
        let value = '';
        while (c !== 0x27 /* ' */) {
            if (c === 0x5C /* \ */) {
                // found an escape sequence
                value += this.input.slice(start, this.pos++);
                start = this.pos + 1;
                if (this.pos >= this.input.length) {
                    this.pushError(TokenErrorReason.UnexpectedEof);
                    return null;
                }
                c = this.getChar();
                if (c === 0x6E /* n */) {
                    value += '\n';
                }
                else if (c === 0x74 /* t */) {
                    value += '\t';
                }
                else if (c === 0x27 /* ' */) {
                    value += "'";
                }
                else if (c === 0x5C /* \ */) {
                    value += '\\';
                }
                else {
                    this.pos--;
                    this.pushError(TokenErrorReason.UnsupportedEscape);
                }
            }
            this.pos++;
            // newlines are allowed in scarpet strings
            if (c === 0x0A /* \n */) {
                this.row++;
                this.col = 0;
            }
            if (this.pos >= this.input.length) {
                this.pushError(TokenErrorReason.UnexpectedEof);
                return null;
            }
            c = this.getChar();
        }
        return null;
    }
    /** @returns {Token?} */
    nextToken() {
        this.skipWhitespace();
        if (this.pos >= this.input.length)
            return null;
        let c = this.getChar();
        if (isDigit(c)) {
            return this.readNumber();
        }
        else if (c === 0x27 /* ' */) {
            return this.readString();
        }
        return null;
    }
}
export class Token {
    /**
     *
     * @param type {TokenType}
     * @param pos {Position}
     * @param [value] {string | number | bigint | null}
     */
    constructor(type, pos, value) {
        /** @readonly */
        this.type = type;
        /** @readonly */
        this.pos = pos.pos;
        /** @readonly */
        this.row = pos.row;
        /** @readonly */
        this.col = pos.col;
        /** @readonly */
        this.value = value;
    }
}
export class TokenError {
    /**
     *
     * @param reason {TokenErrorReason}
     * @param pos {Position}
     */
    constructor(reason, pos) {
        /** @readonly */
        this.reason = reason;
        /** @readonly */
        this.pos = pos.pos;
        /** @readonly */
        this.row = pos.row;
        /** @readonly */
        this.col = pos.col;
    }
}
/**
 * @enum {string}
 */
export const TokenErrorReason = Object.freeze({
    ExpectedDigit: 'expected digit',
    UnexpectedEof: 'unexpected eof',
    UnsupportedEscape: 'unsupported escape sequence'
});
