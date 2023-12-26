import {Position} from './Position.js';
import {CONSTANTS, Token, TokenType, TokenTypes} from './Token.js';
import {isDigit, isHexDigit, isLetter, isWhitespace} from './char.js';

/**
 * @typedef {object} TokenizerOptions
 * @property {boolean?} [allowComments=true]
 * @property {boolean?} [allowNewLineMarkers=false]
 */

export class Tokenizer {
    /**
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
        /** @type {TokenError[]} */
        this.errors = [];
        /** @private */
        this.input = String(input);
        /** @private */
        this.allowComments = options.allowComments != false;
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

    /** @private */
    peekChar() {
        return this.input.charCodeAt(this.pos + 1);
    }

    /**
     * This tokenizer will not blow up on incorrect syntax and will just store
     * every error that it encounters.
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
        let intValue = 0n;
        let value = 0;
        let exp = 0;
        let expSign = 1;
        let decimalDigits = 0;
        let isUnicode = false;
        let isExp = false;
        if (
            c === 0x30 /* 0 */ &&
            (this.peekChar() | 0x20) /* SP */ === 0x78 /* x */
        ) {
            this.pos += 2;
            if (!isHexDigit((c = this.getChar()))) {
                this.pushError(TokenErrorReason.ExpectedDigit);
                return new Token(
                    TokenTypes.HexNumber,
                    pos,
                    this.getPosition(),
                    null,
                    true,
                );
            }
            do {
                intValue <<= 4n;
                intValue |= BigInt(c < 0x3a ? c - 0x30 : (c | 0x20) - 0x57);
                this.pos++;
                c = this.getChar();
            } while (this.pos < this.input.length && isHexDigit(c));
            return new Token(
                TokenTypes.HexNumber,
                pos,
                this.getPosition(),
                intValue,
            );
        }
        // TODO: verify that this parser is the same as Carpet Mod
        while (this.pos < this.input.length) {
            if (isDigit(c)) {
                // unicode digits are fully supported by scapet but not by this
                // tokenizer... yet...
                if (c > 127) {
                    this.pushError(TokenErrorReason.UnicodeDigit);
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
                finalValue = value * 10 ** (exp * expSign);
            } else {
                finalValue = intValue * 10n ** BigInt(exp);
            }
        } else if (decimalDigits) {
            finalValue = value;
        } else {
            finalValue = intValue;
        }
        return new Token(
            TokenTypes.Number,
            pos,
            this.getPosition(),
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
                    return new Token(
                        TokenTypes.String,
                        pos,
                        this.getPosition(),
                        value,
                        true,
                    );
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
                value += this.input.slice(start, this.pos);
                return new Token(
                    TokenTypes.String,
                    pos,
                    this.getPosition(),
                    null,
                    true,
                );
            }
            c = this.getChar();
        }
        value += this.input.slice(start, this.pos++);
        return new Token(TokenTypes.String, pos, this.getPosition(), value);
    }

    /** @private */
    readIdent() {
        const pos = this.getPosition();
        this.pos++;
        let c;
        while (
            this.pos < this.input.length &&
            (isLetter((c = this.getChar())) || c === 0x5f /* _ */ || isDigit(c))
        ) {
            this.pos++;
        }
        const value = this.input.slice(pos.pos, this.pos);
        this.skipWhitespace();
        const tokenType =
            this.getChar() === 0x28 /* ( */
                ? TokenTypes.Function
                : CONSTANTS.has(value)
                  ? TokenTypes.Constant
                  : TokenTypes.Variable;
        return new Token(tokenType, pos, this.getPosition(), value);
    }

    /** @private */
    readComment() {
        if (!this.allowComments)
            this.pushError(TokenErrorReason.UnexpectedComment);
        const pos = this.getPosition();
        let value = '';
        do {
            const index = this.input.indexOf('\n', this.pos) + 1;
            value += this.input.slice(this.pos, index);
            this.pos = index;
        } while (
            this.pos < this.input.length &&
            this.getChar() === 0x2f /* / */ &&
            this.peekChar() === 0x2f
        );
        return new Token(TokenTypes.Comment, pos, this.getPosition(), value);
    }

    /** @private */
    readEllipsis() {
        const pos = this.getPosition();
        this.pos++;
        if (this.getChar() != 0x2e /* . */ || this.peekChar() != 0x2e) {
            this.pushError(TokenErrorReason.ExpectedEllipsis);
        } else {
            this.pos += 2;
        }
        return new Token(TokenTypes.Spread, pos, this.getPosition());
    }

    /**
     *
     * @param tokenType {TokenType}
     * @private
     */
    getOneCharToken(tokenType) {
        const pos = this.getPosition();
        this.pos++;
        return new Token(tokenType, pos, this.getPosition());
    }
    /**
     *
     * @param tokenType {TokenType}
     * @private
     */
    getTwoCharToken(tokenType) {
        const pos = this.getPosition();
        this.pos += 2;
        return new Token(tokenType, pos, this.getPosition());
    }
    /**
     *
     * @param tokenType {TokenType}
     * @param char {number}
     * @private
     */
    getBooleanOp(tokenType, char) {
        const pos = this.getPosition();
        if (this.peekChar() !== char) {
            this.pushError(TokenErrorReason.ExpectedBooleanOperator);
        } else {
            this.pos++;
        }
        this.pos++;
        return new Token(tokenType, pos, this.getPosition());
    }

    /** @returns {Token?} */
    nextToken() {
        this.skipWhitespace();
        if (this.pos >= this.input.length) {
            return null;
        }

        let c = this.getChar();
        switch (c) {
            case 0x27 /* ' */:
                return this.readString();
            case 0x24 /* $ */:
                if (!this.allowNewLineMarkers)
                    this.pushError(TokenErrorReason.UnexpectedNewLineMarker);
                return this.getOneCharToken(TokenTypes.NewLineMarker);
            // single character operators
            case 0x3b /* ; */:
                return this.getOneCharToken(TokenTypes.Semicolon);
            case 0x2c /* , */:
                return this.getOneCharToken(TokenTypes.Comma);
            case 0x3a /* : */:
                return this.getOneCharToken(TokenTypes.Colon);
            case 0x7e /* ~ */:
                return this.getOneCharToken(TokenTypes.Tilde);
            case 0x21 /* ! */:
                if (this.peekChar() === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.NotEquals);
                }
                return this.getOneCharToken(TokenTypes.Not);
            case 0x2e /* . */:
                return this.readEllipsis();
            case 0x2f /* / */:
                if (this.peekChar() === 0x2f /* / */) {
                    return this.readComment();
                }
                return this.getOneCharToken(TokenTypes.Div);
            case 0x2b /* + */:
                if (this.peekChar() === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.AddAssign);
                }
                return this.getOneCharToken(TokenTypes.Add);
            case 0x2d /* - */:
                if (this.peekChar() === 0x3e /* > */) {
                    return this.getTwoCharToken(TokenTypes.Arrow);
                }
                return this.getOneCharToken(TokenTypes.Sub);
            case 0x3c /* < */: {
                const next = this.peekChar();
                if (next === 0x3e /* > */) {
                    return this.getTwoCharToken(TokenTypes.SwapAssign);
                } else if (next === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.LtEq);
                }
                return this.getOneCharToken(TokenTypes.Lt);
            }
            case 0x3e /* > */:
                if (this.peekChar() === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.GtEq);
                }
                return this.getOneCharToken(TokenTypes.Gt);
            case 0x3d /* = */:
                if (this.peekChar() === 0x3d) {
                    return this.getTwoCharToken(TokenTypes.Equals);
                }
                return this.getOneCharToken(TokenTypes.Assign);
            case 0x5e /* ^ */:
                return this.getOneCharToken(TokenTypes.Pow);
            case 0x2a /* * */:
                return this.getOneCharToken(TokenTypes.Mul);
            case 0x25 /* % */:
                return this.getOneCharToken(TokenTypes.Mod);
            case 0x26 /* & */:
                return this.getBooleanOp(TokenTypes.And, 0x26);
            case 0x7c /* | */:
                return this.getBooleanOp(TokenTypes.Or, 0x7c);
            case 0x28 /* ( */:
                return this.getOneCharToken(TokenTypes.OpenParen);
            case 0x29 /* ) */:
                return this.getOneCharToken(TokenTypes.CloseParen);
            case 0x5b /* [ */:
                return this.getOneCharToken(TokenTypes.OpenBrack);
            case 0x5d /* ] */:
                return this.getOneCharToken(TokenTypes.CloseBrack);
            case 0x7b /* { */:
                return this.getOneCharToken(TokenTypes.OpenBrace);
            case 0x7d /* } */:
                return this.getOneCharToken(TokenTypes.CloseBrace);
        }
        if (isDigit(c)) {
            return this.readNumber();
        } else if (c === 0x5f /* _ */ || isLetter(c)) {
            return this.readIdent();
        } else {
            this.pushError(TokenErrorReason.UnexpectedChar);
            this.pos++;
            return this.nextToken();
        }
    }
}

export class TokenError extends Error {
    /**
     * @param reason {TokenErrorReason}
     * @param pos {Position}
     */
    constructor(reason, pos) {
        super(reason);
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
    UnexpectedNewLineMarker: 'new line markers are not allowed in .sc files',
    UnexpectedChar: 'unexpected char',
    ExpectedEllipsis: 'expected ...',
    ExpectedBooleanOperator: '',
    UnexpectedComment: 'unexpected comment',
});
