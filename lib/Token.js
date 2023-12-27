/**
 * @fileoverview
 *
 */

import {Position} from './Position.js';

/**
 * @typedef {object} TokenTypeOptions
 * @property {boolean} [prefix=false]
 * @property {number?} [binaryOpPrecedence=null]
 * @property {number?} [unaryOpPrecedence=null]
 */

/**
 *
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
        this.prefix = !!options.prefix;
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
     * A comment, ignored at runtime but may contain useful information for
     * developers.
     *
     * Comments are matched greedily, all single line comments not separated by
     * a blank line are considered the same comment.
     *
     * @example
     * ```
     * // Line 1
     * // Line 2
     *
     * // Line 3
     * ```
     *
     * This example will produce a two tokens with value:
     *
     * ```
     * "// Line 1\n//Line 2\n"
     * "// Line 3\n"
     * ```
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
    /**
     * A reference to a variable.
     */
    Variable: new TokenType('variable'),
    /**
     * A constant value.
     *
     * `euler`, `pi`, `null`, `true` or `false`
     */
    Constant: new TokenType('constant'),
    /**
     * A function call or declaration.
     */
    Function: new TokenType('function'),
    /**
     * New line markers are only used in /script run to indicate EOL.
     */
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

export const CONSTANTS = new Set(['euler', 'pi', 'null', 'true', 'false']);

export class Token {
    /**
     *
     * @param {TokenType} type
     * @param {Position} start
     * @param {Position} end
     * @param {string | number | bigint | null} [value]
     */
    constructor(type, start, end, value, invalid = false) {
        /** @type {TokenType} @readonly */
        this.type = type;
        /** @readonly */
        this.start = start;
        /** @readonly */
        this.end = end;
        /** @readonly */
        this.value = value;
        /**
         * `true` if the tokenizer encountered a syntax error while reading this
         * token. The token may be incomplete/invalid.
         * @readonly
         */
        this.invalid = invalid;
    }
}
/**
 * A token which is empty/non existing. Also represents the end of a file.
 */
Token.NONE = new Token(TokenTypes.None, new Position(-1, 0, 0), new Position(-1, 0, 0));