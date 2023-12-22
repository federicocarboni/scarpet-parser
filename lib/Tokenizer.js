import {Position} from './Position.js';
import {TokenType, TokenTypes} from './TokenType.js';
import {isDigit, isHexDigit, isWhitespace} from './chars.js';

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
        this.allowComments = !!(options.allowComments ?? true);
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
    pushError(reason, pos = this.getPosition()) {
        this.errors.push(new TokenError(reason, pos));
    }

    /** @private */
    skipWhitespace() {
        let c;
        while (
            this.pos < this.input.length &&
            isWhitespace((c = this.getChar()))
        ) {
            this.pos++;
            if (c === 0x0a /* \n */) {
                this.row++;
                this.col = 0;
            }
        }
    }

    /** @private */
    readNumber() {
        const pos = this.getPosition();
        let c = this.getChar();
        this.pos++;
        let intValue = 0n;
        let value = 0;
        let exp = 0;
        let expSign = 1;
        let decimalDigits = 0;
        let isUnicode = false;
        let isExp = false;
        if (
            c === 0x30 /* 0 */ &&
            (this.getChar() | 0x20) /* SP */ === 0x78 /* x */
        ) {
            this.pos++;
            if (!isHexDigit((c = this.getChar()))) {
                this.pushError(TokenErrorReason.ExpectedDigit);
                return new Token(TokenTypes.Number, pos, null, true);
            }
            while (this.pos < this.input.length && isHexDigit(c)) {
                intValue <<= 4n;
                intValue |= BigInt(c < 0x3a ? c - 0x30 : (c | 0x20) - 0x57);
                this.pos++;
                c = this.getChar();
            }
            return new Token(TokenTypes.Number, pos, intValue);
        }
        while (this.pos < this.input.length) {
            if (isDigit(c)) {
                // unicode digits are fully supported by scapet but not by this
                // tokenizer... yet...
                if (c > 127) {
                    this.pushError(TokenErrorReason.UnicodeDigit)
                    isUnicode = true;
                } else {
                    if (isExp) {
                        exp *= 10;
                        exp += c - 0x30;
                    } else if (decimalDigits) {
                        value += (c - 0x30) / decimalDigits;
                        decimalDigits *= 10;
                    } else {
                        intValue *= 10n;
                        intValue += BigInt(c - 0x30);
                    }
                }
            } else if (!decimalDigits && c === 0x2e /* . */) {
                decimalDigits = 10;
                if (intValue > Number.MAX_SAFE_INTEGER)
                    this.pushError(TokenErrorReason.LossOfPrecision, pos);
                value = Number(intValue);
            } else if (!isExp && (c | 0x20) /* SP */ === 0x65 /* e */) {
                isExp = true;
                this.pos++;
                c = this.getChar();
                if (c === 0x2d /* - */) {
                    expSign = -1;
                    if (!decimalDigits) {
                        decimalDigits = 10;
                        if (intValue > Number.MAX_SAFE_INTEGER)
                            this.pushError(
                                TokenErrorReason.LossOfPrecision,
                                pos,
                            );
                        value = Number(intValue);
                    }
                } else if (c !== 0x2b /* + */) {
                    this.pos--;
                }
            } else {
                break;
            }
            this.pos++;
            c = this.getChar();
        }
        /** @type {number | bigint} */
        let finalValue;
        if (isExp) {
            if (decimalDigits) {
                finalValue = value ** (exp * expSign);
            } else {
                finalValue = intValue ** BigInt(exp);
            }
        } else if (decimalDigits) {
            finalValue = value;
        } else {
            finalValue = intValue;
        }
        return new Token(
            TokenTypes.Number,
            pos,
            !isUnicode ? finalValue : null,
            isUnicode,
        );
    }

    /** @private */
    readString() {
        const pos = this.getPosition();
        // skip '
        this.pos++;
        let c = this.getChar();
        let start = this.pos;
        let value = '';
        while (c !== 0x27 /* ' */) {
            if (c === 0x5c /* \ */) {
                // found an escape sequence
                value += this.input.slice(start, this.pos++);
                start = this.pos + 1;
                if (this.pos >= this.input.length) {
                    this.pushError(TokenErrorReason.UnexpectedEof);
                    return null;
                }
                c = this.getChar();
                if (c === 0x6e /* n */) {
                    value += '\n';
                } else if (c === 0x74 /* t */) {
                    value += '\t';
                } else if (c === 0x27 /* ' */) {
                    value += "'";
                } else if (c === 0x5c /* \ */) {
                    value += '\\';
                } else {
                    this.pos--;
                    this.pushError(TokenErrorReason.UnsupportedEscape);
                }
            }
            this.pos++;
            // newlines are allowed in scarpet strings
            if (c === 0x0a /* \n */) {
                this.row++;
                this.col = 0;
            }
            if (this.pos >= this.input.length) {
                this.pushError(TokenErrorReason.UnexpectedEof);
                return null;
            }
            c = this.getChar();
        }
        value += this.input.slice(start, this.pos);
        return new Token(TokenTypes.String, pos, value);
    }

    /** @returns {Token?} */
    nextToken() {
        this.skipWhitespace();
        if (this.pos >= this.input.length) return null;

        let c = this.getChar();
        if (isDigit(c)) {
            return this.readNumber();
        } else if (c === 0x27 /* ' */) {
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
    constructor(type, pos, value, incomplete = false) {
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
        /** @readonly */
        this.incomplete = incomplete;
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
    UnicodeDigit: 'unicode digits are strongly discouraged',
    LossOfPrecision: 'number is too big to be represented correctly',
    UnexpectedEof: 'unexpected eof',
    UnsupportedEscape: 'unsupported escape sequence',
});
