import {Token, TokenType, TokenTypes} from './Token.js';
import {isDigit, isHexDigit, isLetter, isJavaWhitespace, getNumericValue} from './char.js';
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
        /**
         * @private
         * @type {Token}
         */
        this.prevToken = Token.NONE;
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

    /** @private */
    parseExp() {
        let exp = 0n;
        this.offset++;
        this.character++;
        let c = this.getChar();
        const isneg = c === 0x2d; /* - */
        if (isneg || c === 0x2b /* + */) {
            this.offset++;
            this.character++;
            c = this.getChar();
        }
        let digit = getNumericValue(c);
        while (digit === 0) {
            this.offset++;
            this.character++;
            c = this.getChar();
            digit = getNumericValue(c);
        }
        while (digit !== void 0) {
            exp = exp * 10n + BigInt(digit);
            this.offset++;
            this.character++;
            c = this.getChar();
            digit = getNumericValue(c);
        }
        if (isneg) exp = -exp;
        return exp;
    }

    /** @private */
    readNumber() {
        const pos = this.getPosition();
        let c = this.getChar();
        let value = 0n;
        // 0x hex literal prefix
        if (c === 0x30 /* 0 */ && (this.peekChar() | 0x20) /* SP */ === 0x78 /* x */) {
            this.offset += 2;
            this.character += 2;
            if (!isHexDigit((c = this.getChar()))) {
                const end = this.getPosition();
                this.diagnostic(
                    DiagnosticSeverity.Error,
                    DiagnosticCode.ExpectedHexDigit,
                    pos,
                    end,
                );
                return new Token(TokenTypes.HexNumber, pos, end, null, true);
            }
            do {
                value <<= 4n;
                value |= BigInt(c < 0x3a ? c - 0x30 : (c | 0x20) - 0x57);
                this.offset++;
                this.character++;
                c = this.getChar();
            } while (this.offset < this.input.length && isHexDigit(c));
            const end = this.getPosition();
            let signed = this.prevToken.type === TokenTypes.Sub ? -value : value;
            if (signed > LONG_MAX || signed < LONG_MIN)
                this.diagnostic(
                    DiagnosticSeverity.Information,
                    DiagnosticCode.LongLossOfPrecision,
                    pos,
                    end,
                );
            return (this.prevToken = new Token(TokenTypes.HexNumber, pos, end, {value, scale: 0n}));
        }
        // infinite precision decimal number parsing
        // with support for unicode decimal digits
        let precision = 0;
        let scale = 0n;
        let dot = false;
        while (this.offset < this.input.length) {
            const digit = getNumericValue(c);
            if (digit === 0) {
                if (precision === 0) {
                    precision = 1;
                } else if (value !== 0n) {
                    value *= 10n;
                    precision++;
                }
                if (dot) scale++;
            } else if (digit !== void 0) {
                if (precision !== 1 || value !== 0n) precision++;
                value = value * 10n + BigInt(digit);
                if (dot) scale++;
            } else if (c === 0x2e /* . */) {
                if (dot)
                    this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.MoreThanOnePoint, pos);
                dot = true;
            } else if (c === 0x65 /* e */ || c === 0x45 /* E */) {
                scale -= this.parseExp();
                while (scale < 0n) {
                    value *= 10n;
                    scale++;
                }
                break;
            } else {
                break;
            }
            this.offset++;
            this.character++;
            c = this.getChar();
        }
        const end = this.getPosition();
        // trim zeros (so numbers like 1.00000 appear as integers)
        while (scale !== 0n) {
            if (value % 10n !== 0n) break;
            value /= 10n;
            scale--;
        }
        // scarpet actually processes numbers together with their sign if they have it
        let signed = this.prevToken.type === TokenTypes.Sub ? -value : value;
        if (scale === 0n && (signed > LONG_MAX || signed < LONG_MIN)) {
            this.diagnostic(
                DiagnosticSeverity.Information,
                DiagnosticCode.LongLossOfPrecision,
                pos,
                end,
            );
        }
        if (scale !== 0n) {
            // TODO: add diagnostic for precision loss on floating point numbers
        }
        return (this.prevToken = new Token(TokenTypes.Number, pos, end, {value, scale}));
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
                    return (this.prevToken = new Token(
                        TokenTypes.String,
                        pos,
                        this.getPosition(),
                        value,
                        true,
                    ));
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
                return (this.prevToken = new Token(
                    TokenTypes.String,
                    pos,
                    this.getPosition(),
                    null,
                    true,
                ));
            }
            c = this.getChar();
        }
        value += this.input.slice(start, this.offset++);
        this.character++;
        return (this.prevToken = new Token(TokenTypes.String, pos, this.getPosition(), value));
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
        const end = this.getPosition();
        this.skipWhitespace();
        const tokenType =
            this.getChar() === 0x28 /* ( */
                ? TokenTypes.Function
                : constants.includes(value)
                  ? TokenTypes.Constant
                  : TokenTypes.Variable;
        return (this.prevToken = new Token(tokenType, pos, end, value));
    }

    /** @private */
    readComment() {
        const pos = this.getPosition();
        // match subsequent comments as the same comment since
        // scarpet only has single-line // comments
        let value = '';
        let end;
        do {
            // strip // from comments
            this.offset += 2;
            this.skipWhitespaceToLf();
            // quickly scan through to the end of the line
            const index = this.input.indexOf('\n', this.offset) + 1;
            value += this.input.slice(this.offset, index);
            this.offset = index;
            this.line++;
            this.character = 0;
            end = this.getPosition();
            // for indentation
            this.skipWhitespaceToLf();
        } while (
            this.offset < this.input.length &&
            this.getChar() === 0x2f /* / */ &&
            this.peekChar() === 0x2f
        );
        if (!this.allowComments)
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedComment, pos, end);
        // comments don't set prevToken
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
        return (this.prevToken = new Token(TokenTypes.Spread, pos, this.getPosition()));
    }

    /**
     * @private
     * @param {TokenType} tokenType
     */
    getOneCharToken(tokenType) {
        const pos = this.getPosition();
        this.offset++;
        this.character++;
        return (this.prevToken = new Token(tokenType, pos, this.getPosition()));
    }
    /**
     * @private
     * @param {TokenType} tokenType
     */
    getTwoCharToken(tokenType) {
        const pos = this.getPosition();
        this.offset += 2;
        this.character += 2;
        return (this.prevToken = new Token(tokenType, pos, this.getPosition()));
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
        return (this.prevToken = new Token(tokenType, pos, this.getPosition()));
    }
    /** @returns {Token} Reads the next token, or `Token.NONE` if end of file is reached. */
    nextToken() {
        this.skipWhitespace();
        if (this.offset >= this.input.length) {
            return (this.prevToken = Token.NONE);
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

const LONG_MAX = 9223372036854775807n;
const LONG_MIN = -9223372036854775808n;

const constants = ['euler', 'pi', 'null', 'true', 'false'];
