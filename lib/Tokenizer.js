import {Token, TokenType, TokenTypes} from './Token.js';
import {isDigit, isHexDigit, isLetter, isJavaWhitespace} from './char.js';
import {Diagnostic, DiagnosticCode, DiagnosticSeverity} from './diagnostic.js';

/**
 * @typedef {object} TokenizerOptions
 * @property {boolean | null} [allowComments=true] Default is `true`
 * @property {boolean | null} [allowNewLineMarkers=false] Default is `false`
 * @property {Diagnostic[]} [diagnostics=[]] Default is `[]`
 */

/**
 * Tokenizer for Scarpet scripts and commands.
 *
 * Based on [gnembon/fabric-carpet Tokenizer.java][1] but more powerful as it allows to retain more
 * information about the actual code.
 *
 * [1]: https://github.com/gnembon/fabric-carpet/blob/277872b33cb5e8569e1fbb48cf86dc03057d8978/src/main/java/carpet/script/Tokenizer.java
 *
 * [2]: https://github.com/gnembon/fabric-carpet/blob/master/src/main/java/carpet/script/value/NumericValue.java#L216
 */
export class Tokenizer {
    /**
     * @param {string} input - Source script to split into tokens.
     * @param {TokenizerOptions} [options={}] Default is `{}`
     */
    constructor(input, {diagnostics, allowComments, allowNewLineMarkers} = {}) {
        /** @readonly */
        this.input = String(input);
        /** @readonly */
        this.diagnostics = diagnostics || [];
        /**
         * `true` if comments are allowed. When set to `false` the tokenizer may still produce
         * comment tokens but it will also push an error diagnostic.
         *
         * Comments are not allowed when running from a /script run command.
         *
         * @readonly
         */
        this.allowComments = allowComments !== false;
        /**
         * `true` if new line markers are allowed. When set to `false` the tokenizer may still
         * produce new line marker tokens but it will also push an error diagnostic.
         *
         * New line markers ($) are only allowed when running from a /script run command.
         *
         * @readonly
         */
        this.allowNewLineMarkers = !!allowNewLineMarkers;
        /** @private */
        this.offset = 0;
        /** @private */
        this.line = 0;
        /** @private */
        this.character = 0;
    }

    /**
     * @private
     * @returns {import('./diagnostic.js').Position} Current position in `input`.
     */
    getPosition() {
        return {offset: this.offset, line: this.line, character: this.character};
    }

    /**
     * @private
     * @returns Current character in `input`.
     */
    getChar() {
        // intentionally not using codePointAt because Carpet Mod does not support supplementary
        // characters
        return this.input.charCodeAt(this.offset);
    }

    /**
     * @private
     * @returns Next character in `input` or `NaN` if EOF is reached first.
     */
    peekChar() {
        return this.input.charCodeAt(this.offset + 1);
    }

    /**
     * This tokenizer will not blow up on incorrect syntax and will just store every error that it
     * encounters.
     *
     * @private
     * @param {DiagnosticSeverity} severity - Diagnostic to report.
     * @param {DiagnosticCode} code - Diagnostic to report.
     */
    diagnostic(severity, code, start = this.getPosition(), end = this.getPosition()) {
        this.diagnostics.push(new Diagnostic(severity, {start, end}, code));
    }

    /** @private */
    skipWhitespace() {
        let c;
        while (this.offset < this.input.length && isJavaWhitespace((c = this.getChar()))) {
            this.offset++;
            this.character++;
            if (c === 0x0a /* \n */) {
                this.line++;
                this.character = 0;
            }
        }
    }

    /** @private */
    skipWhitespaceToLf() {
        let c;
        while (
            this.offset < this.input.length &&
            isJavaWhitespace((c = this.getChar())) &&
            c !== 0x0a /* \n */
        ) {
            this.offset++;
            this.character++;
        }
    }

    // TODO: make sure number parsing is the same as in Carpet Mod which uses Java's `BigInteger`
    // and `BigDecimal` constructors
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
        if (c === 0x30 /* 0 */ && (this.peekChar() | 0x20) /* SP */ === 0x78 /* x */) {
            this.offset += 2;
            if (!isHexDigit((c = this.getChar()))) {
                this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.ExpectedHexDigit);
                return new Token(TokenTypes.HexNumber, pos, this.getPosition(), null, true);
            }
            do {
                intValue <<= 4n;
                intValue |= BigInt(c < 0x3a ? c - 0x30 : (c | 0x20) - 0x57);
                this.offset++;
                this.character++;
                c = this.getChar();
            } while (this.offset < this.input.length && isHexDigit(c));
            return new Token(TokenTypes.HexNumber, pos, this.getPosition(), intValue);
        }
        // TODO: verify that this parser is the same as Carpet Mod
        while (this.offset < this.input.length) {
            if (isDigit(c)) {
                // unicode digits are fully supported by scapet but not by this
                // tokenizer... yet...
                if (c > 127) {
                    this.diagnostic(DiagnosticSeverity.Information, DiagnosticCode.UnicodeDigit);
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
                    this.diagnostic(
                        DiagnosticSeverity.Information,
                        DiagnosticCode.LossOfPrecision,
                        pos,
                    );
                value = Number(intValue);
            } else if (!isExp && (c | 0x20) /* SP */ === 0x65 /* e */) {
                isExp = true;
                this.offset++;
                this.character++;
                c = this.getChar();
                if (c === 0x2d /* - */) {
                    expSign = -1;
                    if (!decimalDigits) {
                        decimalDigits = 10;
                        if (intValue > Number.MAX_SAFE_INTEGER)
                            this.diagnostic(
                                DiagnosticSeverity.Information,
                                DiagnosticCode.LossOfPrecision,
                                pos,
                            );
                        value = Number(intValue);
                    }
                } else if (c !== 0x2b /* + */) {
                    this.offset--;
                }
            } else {
                break;
            }
            this.offset++;
            this.character++;
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
        this.offset++;
        this.character++;
        let c = this.getChar();
        let start = this.offset;
        let value = '';
        while (c !== 0x27 /* ' */) {
            if (c === 0x5c /* \ */) {
                // found an escape sequence
                value += this.input.slice(start, this.offset++);
                this.character++;
                start = this.offset + 1;
                if (this.offset >= this.input.length) {
                    this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedEof);
                    return new Token(TokenTypes.String, pos, this.getPosition(), value, true);
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
                    this.offset--;
                    this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnknownEscapeSequence);
                }
            }
            this.offset++;
            this.character++;
            // newlines are allowed in scarpet strings
            if (c === 0x0a /* \n */) {
                this.line++;
                this.character = 0;
            }
            if (this.offset >= this.input.length) {
                this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedEof);
                value += this.input.slice(start, this.offset);
                return new Token(TokenTypes.String, pos, this.getPosition(), null, true);
            }
            c = this.getChar();
        }
        value += this.input.slice(start, this.offset++);
        this.character++;
        return new Token(TokenTypes.String, pos, this.getPosition(), value);
    }

    /** @private */
    readIdent() {
        const pos = this.getPosition();
        this.offset++;
        this.character++;
        let c;
        while (
            this.offset < this.input.length &&
            (isLetter((c = this.getChar())) || c === 0x5f /* _ */ || isDigit(c))
        ) {
            this.offset++;
            this.character++;
        }
        const value = this.input.slice(pos.offset, this.offset);
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
        const pos = this.getPosition();
        // match subsequent comments as the same comment
        let value = '';
        do {
            // quickly scan through to the end of the line
            const index = this.input.indexOf('\n', this.offset) + 1;
            value += this.input.slice(this.offset, index);
            this.offset = index;
            this.line++;
            this.character = 0;
            // skip indentation whitespace
            this.skipWhitespaceToLf();
        } while (
            this.offset < this.input.length &&
            this.getChar() === 0x2f /* / */ &&
            this.peekChar() === 0x2f
        );
        const end = this.getPosition();
        if (!this.allowComments)
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedComment, pos, end);
        return new Token(TokenTypes.Comment, pos, end, value);
    }

    /** @private */
    readEllipsis() {
        const pos = this.getPosition();
        this.offset++;
        this.character++;
        if (this.getChar() !== 0x2e /* . */ || this.peekChar() !== 0x2e) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnknownOperator, pos);
            return this.nextToken();
        } else {
            this.offset += 2;
        }
        return new Token(TokenTypes.Spread, pos, this.getPosition());
    }

    /**
     * @private
     * @param {TokenType} tokenType
     */
    getOneCharToken(tokenType) {
        const pos = this.getPosition();
        this.offset++;
        this.character++;
        return new Token(tokenType, pos, this.getPosition());
    }
    /**
     * @private
     * @param {TokenType} tokenType
     */
    getTwoCharToken(tokenType) {
        const pos = this.getPosition();
        this.offset += 2;
        this.character += 2;
        return new Token(tokenType, pos, this.getPosition());
    }
    /**
     * @private
     * @param {TokenType} tokenType
     * @param {number} char
     */
    getBooleanOp(tokenType, char) {
        const pos = this.getPosition();
        if (this.peekChar() !== char) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnknownOperator);
            return this.nextToken();
        } else {
            this.offset++;
            this.character++;
        }
        this.offset++;
        this.character++;
        return new Token(tokenType, pos, this.getPosition());
    }
    /** @returns {Token} Reads the next token, or `Token.NONE` if end of file is reached. */
    nextToken() {
        this.skipWhitespace();
        if (this.offset >= this.input.length) {
            return Token.NONE;
        }

        let c = this.getChar();
        switch (c) {
            case 0x27 /* ' */:
                return this.readString();
            case 0x24 /* $ */:
                if (!this.allowNewLineMarkers)
                    this.diagnostic(
                        DiagnosticSeverity.Error,
                        DiagnosticCode.UnexpectedNewLineMarker,
                    );
                return this.getOneCharToken(TokenTypes.NewLineMarker);
            // single character tokens
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
            case 0x3b /* ; */:
                return this.getOneCharToken(TokenTypes.Semicolon);
            case 0x2c /* , */:
                return this.getOneCharToken(TokenTypes.Comma);
            case 0x3a /* : */:
                return this.getOneCharToken(TokenTypes.Attribute);
            case 0x7e /* ~ */:
                return this.getOneCharToken(TokenTypes.Match);
            case 0x21 /* ! */:
                if (this.peekChar() === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.NotEquals);
                }
                return this.getOneCharToken(TokenTypes.Not);
            case 0x2e /* . */:
                return this.readEllipsis();
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
            case 0x2f /* / */:
                if (this.peekChar() === 0x2f /* / */) {
                    return this.readComment();
                }
                return this.getOneCharToken(TokenTypes.Div);
            case 0x2b /* + */:
                // + is the only operator with an assignment shorthand +=
                if (this.peekChar() === 0x3d /* = */) {
                    return this.getTwoCharToken(TokenTypes.AddAssign);
                }
                return this.getOneCharToken(TokenTypes.Add);
            case 0x2d /* - */:
                if (this.peekChar() === 0x3e /* > */) {
                    return this.getTwoCharToken(TokenTypes.Arrow);
                }
                return this.getOneCharToken(TokenTypes.Sub);
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
        }
        if (isDigit(c)) {
            return this.readNumber();
        } else if (c === 0x5f /* _ */ || isLetter(c)) {
            return this.readIdent();
        } else {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
            this.offset++;
            this.character++;
            return this.nextToken();
        }
    }
}

export const CONSTANTS = new Set(['euler', 'pi', 'null', 'true', 'false']);
