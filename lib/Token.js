/**
 * @fileoverview
 *
 */

import {Position} from './Position.js';

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
    String: new TokenType('string'),
    Ident: new TokenType('ident'),
    Constant: new TokenType('constant'),
    NewLineMarker: new TokenType('$'),
    OpenParen: new TokenType('('),
    CloseParen: new TokenType(')'),
    Comma: new TokenType(','),
    OpenBrack: new TokenType('['),
    CloseBrack: new TokenType(']'),
    OpenBrace: new TokenType('{'),
    CloseBrace: new TokenType('}'),
    Operator: new TokenType('operator'),
    Colon: new TokenType(':', {binaryOpPrecedence: 80}),
    Tilde: new TokenType('~', {binaryOpPrecedence: 80}),
    Bang: new TokenType('!', {unaryOpPrecedence: 60}),
    Ellipsis: new TokenType('...', {unaryOpPrecedence: 60}),
    Caret: new TokenType('^', {binaryOpPrecedence: 40}),
    Asterisk: new TokenType('*', {binaryOpPrecedence: 30}),
    Slash: new TokenType('/', {binaryOpPrecedence: 30}),
    Percent: new TokenType('%', {binaryOpPrecedence: 30}),
    Plus: new TokenType('+', {binaryOpPrecedence: 20, unaryOpPrecedence: 60}),
    Minus: new TokenType('-', {binaryOpPrecedence: 20, unaryOpPrecedence: 60}),
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
