/** @file */

/**
 * @param {string} label
 * @param {number} [binaryOpPrecedence]
 * @param {number} [unaryOpPrecedence]
 * @returns {TokenType}
 */
function createTokenType(label, binaryOpPrecedence, unaryOpPrecedence) {
    return Object.freeze({ label, binaryOpPrecedence, unaryOpPrecedence });
}

/**
 * @enum {{
 *     readonly label: string;
 *     readonly binaryOpPrecedence: number | undefined;
 *     readonly unaryOpPrecedence: number | undefined;
 * }}
 */
export const TokenType = Object.freeze({
    /** Used to indicate an empty/non existent token. */
    None: createTokenType("none"),
    /**
     * A comment, ignored at runtime but may contain useful information for developers.
     *
     * Comments are matched greedily, all single line comments not separated by a blank line are
     * considered the same comment.
     *
     * ```js
     * // Line 1
     * // Line 2
     *
     * // Line 3
     * ```
     *
     * This example will produce two tokens with values:
     *
     * ```js
     * 'Line 1\nLine 2\n';
     * 'Line 3\n';
     * ```
     */
    Comment: createTokenType("comment"),
    /**
     * Decimal number literal, may be an integer or a floating point number.
     *
     * Floating point numbers are 64-bit (double in Java).
     *
     * Integers are also 64-bit (long in Java).
     */
    Number: createTokenType("number"),
    /** Hexadecimal integer literal */
    HexNumber: createTokenType("hexNumber"),
    /**
     * A string literal. Scarpet only allows single quotes as string delimiters.
     *
     * Supported escape sequences are `\n`, `\t`, `\'` and `\\`.
     */
    String: createTokenType("string"),
    /** A reference to a variable. */
    Variable: createTokenType("variable"),
    /**
     * A constant value.
     *
     * Currently `euler`, `pi`, `null`, `true` or `false`
     */
    Constant: createTokenType("constant"),
    /** A function call or declaration. */
    Function: createTokenType("function"),
    /** New line markers are only used in /script run to indicate EOL. */
    NewLineMarker: createTokenType("$"),
    OpenParen: createTokenType("("),
    CloseParen: createTokenType(")"),
    Comma: createTokenType(","),
    OpenBrack: createTokenType("["),
    CloseBrack: createTokenType("]"),
    OpenBrace: createTokenType("{"),
    CloseBrace: createTokenType("}"),
    Attribute: createTokenType(":", 80),
    Match: createTokenType("~", 80),
    Not: createTokenType("!", undefined, 60),
    Spread: createTokenType("...", undefined, 60),
    Pow: createTokenType("^", 40),
    Mul: createTokenType("*", 30),
    Div: createTokenType("/", 30),
    Mod: createTokenType("%", 30),
    Add: createTokenType("+", 20, 60),
    Sub: createTokenType("-", 20, 60),
    Gt: createTokenType(">", 10),
    GtEq: createTokenType(">=", 10),
    Lt: createTokenType("<", 10),
    LtEq: createTokenType("<=", 10),
    Equals: createTokenType("==", 7),
    NotEquals: createTokenType("!=", 7),
    And: createTokenType("&&", 5),
    Or: createTokenType("||", 4),
    Assign: createTokenType("=", 3),
    SwapAssign: createTokenType("<>", 3),
    AddAssign: createTokenType("+=", 3),
    Arrow: createTokenType("->", 2),
    Semicolon: createTokenType(";", 1),
});

/**
 * Infinite precision decimal number value.
 *
 * Scarpet numbers are represented by a `long` (64-bit signed integer) and a `double` (64-bit
 * floating point number). The `long` value is used for operations only if the number is an integer
 * (it has only zeros after the .) and if the operation is guaranteed to produce an integer (e.g.
 * division is always floating point).
 *
 * @typedef {object} NumericValue
 * @property {bigint} value Number value escluding the decimal point
 * @property {bigint} scale Number of decimal places
 */

/**
 * @typedef {object} Token
 * @property {TokenType} type
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 * @property {string | NumericValue | undefined} value
 * @property {number | undefined} syntaxError
 */

/**
 * @param {TokenType} type
 * @param {import('./diagnostic.js').Position} start
 * @param {import('./diagnostic.js').Position} end
 * @param {string | NumericValue} [value]
 * @param {number | undefined} [syntaxError]
 * @returns {Token}
 */
export function createToken(type, start, end, value, syntaxError) {
    return { type, start, end, value, syntaxError };
}

/**
 * A token which is empty/non existing. Also represents the end of a file.
 *
 * @type {Token}
 */
export const TOKEN_NONE = {
    type: TokenType.None,
    start: { offset: -1, line: 0, character: 0 },
    end: { offset: -1, line: 0, character: 0 },
    value: undefined,
    syntaxError: undefined,
};
