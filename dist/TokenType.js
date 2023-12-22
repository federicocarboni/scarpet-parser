/**
 * @fileoverview
 *
 */
/**
 * @typedef {object} TokenTypeOptions
 * @property {boolean} [prefix=false]
 * @property {number?} [binaryOpPrecedence=null]
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
    OpenParen: new TokenType('('),
    CloseParen: new TokenType(')'),
    Comma: new TokenType(','),
    OpenBrack: new TokenType('['),
    CloseBrack: new TokenType(']'),
    OpenBrace: new TokenType('{'),
    CloseBrace: new TokenType('}'),
    Operator: new TokenType('operator'),
    // AttributeOp: new TokenType('~:', {binaryOpPrecedence: 80}),
    // UnaryOp: new TokenType('+-!...', {binaryOpPrecedence: 60}),
    // ExponentOp: new TokenType('^', {binaryOpPrecedence: 40}),
    // MultiplicationOp: new TokenType('*/%', {binaryOpPrecedence: 30}),
    // AdditionOp: new TokenType('+-', {binaryOpPrecedence: 20}),
    // ComparisonOp: new TokenType('>=><=<', {binaryOpPrecedence: 10}),
    // EqualityOp: new TokenType('==!=', {binaryOpPrecedence: 7}),
    // AndOperator: new TokenType('&&', {binaryOpPrecedence: 5}),
    // OrOperator: new TokenType('||', {binaryOpPrecedence: 4}),
    // Assignment: new TokenType('=<>', {binaryOpPrecedence: 3}),
    // Arrow: new TokenType('->', {binaryOpPrecedence: 2}),
    // Semicolon: new TokenType(';', {binaryOpPrecedence: 1}),
});
/**
 * @enum {'euler' | 'pi' | 'null' | 'true' | 'false'}
 */
export const Constants = Object.freeze({
    Euler: 'euler',
    Pi: 'pi',
    Null: 'null',
    True: 'true',
    False: 'false',
});
