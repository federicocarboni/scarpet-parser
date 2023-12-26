/**
 * @fileoverview
 *
 */

import {Position} from './Position.js';

export class Token {
    /**
     *
     * @param type {TokenType}
     * @param start {Position}
     * @param end {Position}
     * @param [value] {string | number | bigint | null}
     */
    constructor(type, start, end, value, incomplete = false) {
        /** @readonly */
        this.type = type;
        /** @readonly */
        this.start = start;
        /** @readonly */
        this.end = end;
        /** @readonly */
        this.value = value;
        /** @readonly */
        this.incomplete = incomplete;
    }
}

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
    Comment: new TokenType('comment'),
    Number: new TokenType('number'),
    /** hexadecimal number literal */
    HexNumber: new TokenType('hexNumber'),
    String: new TokenType('string'),
    Variable: new TokenType('ident'),
    Constant: new TokenType('constant'),
    Function: new TokenType('function'),
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
});

export const CONSTANTS = new Set(['euler', 'pi', 'null', 'true', 'false']);
