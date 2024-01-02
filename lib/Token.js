/** @file */

/**
 * @private
 * @typedef {object} TokenTypeOptions
 * @property {boolean} [prefix=false] Default is `false`
 * @property {number | null} [binaryOpPrecedence=null] Default is `null`
 * @property {number | null} [unaryOpPrecedence=null] Default is `null`
 */

export class TokenType {
    /**
     * @param label {string}
     * @param options {TokenTypeOptions}
     * @internal
     */
    constructor(label, options = {}) {
        /** @readonly */
        this.label = label;
        /** @readonly */
        // this.prefix = !!options.prefix;
        /** @readonly */
        this.binaryOpPrecedence = options.binaryOpPrecedence || null;
        /** @readonly */
        this.unaryOpPrecedence = options.unaryOpPrecedence || null;
        Object.freeze(this);
    }
}

/** @enum {TokenType} */
export const TokenTypes = Object.freeze({
    /**
     * A comment, ignored at runtime but may contain useful information for developers.
     *
     * Comments are matched greedily, all single line comments not separated by a blank line are
     * considered the same comment.
     *
     *     // Line 1
     *     // Line 2
     *
     *     // Line 3
     *
     * This example will produce two tokens with values:
     *
     *     '// Line 1\n//Line 2\n';
     *     '// Line 3\n';
     */
    Comment: new TokenType('comment'),
    /**
     * Decimal number literal, may be an integer or a floating point number.
     *
     * Floating point numbers are 64-bit (double in Java).
     *
     * Integers are also 64-bit (long in Java).
     */
    Number: new TokenType('number'),
    /** Hexadecimal integer literal */
    HexNumber: new TokenType('hexNumber'),
    /**
     * A string literal. Scarpet only allows single quotes as string delimiters.
     *
     * Supported escape sequences are `\n`, `\t`, `\'` and `\\`.
     */
    String: new TokenType('string'),
    /** A reference to a variable. */
    Variable: new TokenType('variable'),
    /**
     * A constant value.
     *
     * Currently `euler`, `pi`, `null`, `true` or `false`
     */
    Constant: new TokenType('constant'),
    /** A function call or declaration. */
    Function: new TokenType('function'),
    /** New line markers are only used in /script run to indicate EOL. */
    NewLineMarker: new TokenType('$'),
    OpenParen: new TokenType('('),
    CloseParen: new TokenType(')'),
    Comma: new TokenType(','),
    OpenBrack: new TokenType('['),
    CloseBrack: new TokenType(']'),
    OpenBrace: new TokenType('{'),
    CloseBrace: new TokenType('}'),
    Attribute: new TokenType(':', {binaryOpPrecedence: 80}),
    Match: new TokenType('~', {binaryOpPrecedence: 80}),
    Not: new TokenType('!', {unaryOpPrecedence: 60}),
    Spread: new TokenType('...', {unaryOpPrecedence: 60}),
    Pow: new TokenType('^', {binaryOpPrecedence: 40}),
    Mul: new TokenType('*', {binaryOpPrecedence: 30}),
    Div: new TokenType('/', {binaryOpPrecedence: 30}),
    Mod: new TokenType('%', {binaryOpPrecedence: 30}),
    Add: new TokenType('+', {binaryOpPrecedence: 20, unaryOpPrecedence: 60}),
    Sub: new TokenType('-', {binaryOpPrecedence: 20, unaryOpPrecedence: 60}),
    Gt: new TokenType('>', {binaryOpPrecedence: 10}),
    GtEq: new TokenType('>=', {binaryOpPrecedence: 10}),
    Lt: new TokenType('<', {binaryOpPrecedence: 10}),
    LtEq: new TokenType('<=', {binaryOpPrecedence: 10}),
    Equals: new TokenType('==', {binaryOpPrecedence: 7}),
    NotEquals: new TokenType('!=', {binaryOpPrecedence: 7}),
    And: new TokenType('&&', {binaryOpPrecedence: 5}),
    Or: new TokenType('||', {binaryOpPrecedence: 4}),
    Assign: new TokenType('=', {binaryOpPrecedence: 3}),
    SwapAssign: new TokenType('<>', {binaryOpPrecedence: 3}),
    AddAssign: new TokenType('+=', {binaryOpPrecedence: 3}),
    Arrow: new TokenType('->', {binaryOpPrecedence: 2}),
    Semicolon: new TokenType(';', {binaryOpPrecedence: 1}),
    /** Used to indicate an empty/non existent token. */
    None: new TokenType('none'),
});

export const Operators = Object.freeze({
    ':': TokenTypes.Attribute,
    '~': TokenTypes.Match,
    '!': TokenTypes.Not,
    '...': TokenTypes.Spread,
    '^': TokenTypes.Pow,
    '*': TokenTypes.Mul,
    '/': TokenTypes.Div,
    '%': TokenTypes.Mod,
    '+': TokenTypes.Add,
    '-': TokenTypes.Sub,
    '>': TokenTypes.Gt,
    '>=': TokenTypes.GtEq,
    '<': TokenTypes.Lt,
    '<=': TokenTypes.LtEq,
    '==': TokenTypes.Equals,
    '!=': TokenTypes.NotEquals,
    '&&': TokenTypes.And,
    '||': TokenTypes.Or,
    '=': TokenTypes.Assign,
    '<>': TokenTypes.SwapAssign,
    '+=': TokenTypes.AddAssign,
    '->': TokenTypes.Arrow,
    ';': TokenTypes.Semicolon,
});

/**
 * Infinite precision decimal number value.
 *
 * Scarpet numbers are represented by a `long` (64-bit signed integer) or a `double` (64-bit
 * floating point number). The `long` value is used for operations only if the number is an integer
 * (it has only zeros after the .) and if the operation is guaranteed to produce an integer (e.g.
 * division is always floating point).
 *
 * @typedef {object} NumericValue
 * @property {bigint} value Number value escluding the decimal point
 * @property {bigint} scale Number of decimal places
 */

export class Token {
    /**
     * @param {TokenType} type
     * @param {import('./diagnostic.js').Position} start
     * @param {import('./diagnostic.js').Position} end
     * @param {string | NumericValue | null} [value]
     */
    constructor(type, start, end, value, invalid = false) {
        /**
         * @type {TokenType}
         * @readonly
         */
        this.type = type;
        /** @readonly */
        this.start = start;
        /** @readonly */
        this.end = end;
        /** @readonly */
        this.value = value;
        /**
         * `true` if the tokenizer encountered a syntax error while reading this token. The token
         * may be incomplete/invalid.
         *
         * @readonly
         */
        this.invalid = invalid;
    }
}
/** A token which is empty/non existing. Also represents the end of a file. */
Token.NONE = new Token(
    TokenTypes.None,
    {offset: -1, line: 0, character: 0},
    {offset: -1, line: 0, character: 0},
    null,
    false,
);
