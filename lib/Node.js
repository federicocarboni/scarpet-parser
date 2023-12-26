import {Position} from './Position.js';

/** @abstract */
export class Node {
    /**
     * @param kind {string}
     * @param start {Position}
     * @param end  {Position}
     */
    constructor(kind, start, end) {
        /** @readonly */
        this.kind = kind;
        /** @readonly */
        this.start = start;
        /** @readonly */
        this.end = end;
    }
}

export class MapLiteral extends Node {
    /**
     * @param values {Map<Node, Node>}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(values, start, end) {
        super('MapLiteral', start, end);
        this.values = values;
    }
}

export class ListLiteral extends Node {
    /**
     * @param values {Node[]}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(values, start, end) {
        super('ListLiteral', start, end);
        this.values = values;
    }
}

export class StringLiteral extends Node {
    /**
     * @param value {string}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(value, start, end) {
        super('StringLiteral', start, end);
        this.value = value;
    }
}

export class NumberLiteral extends Node {
    /**
     * @param value {number | bigint}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(value, start, end) {
        super('NumberLiteral', start, end);
        this.value = value;
    }
}

export class HexLiteral extends Node {
    /**
     * @param value {bigint}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(value, start, end) {
        super('HexLiteral', start, end);
        this.value = value;
    }
}

export class UnaryExpression extends Node {
    /**
     * @param operator {'+' | '-' | '!' | '...' | string}
     * @param value {Node}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(operator, value, start, end) {
        super('UnaryExpression', start, end);
        this.operator = operator;
        this.value = value;
    }
}

export class BinaryExpression extends Node {
    /**
     * @param operator {string}
     * @param lvalue {Node}
     * @param rvalue {Node}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(operator, lvalue, rvalue, start, end) {
        super('BinaryExpression', start, end);
        this.operator = operator;
        this.lvalue = lvalue;
        this.rvalue = rvalue;
    }
}

export class Assignment extends Node {
    /**
     * @param operator {string}
     * @param lvalue {Node}
     * @param rvalue {Node}
     * @param comment {string?}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(operator, lvalue, rvalue, comment, start, end) {
        super('Assignment', start, end);
        this.operator = operator;
        this.lvalue = lvalue;
        this.rvalue = rvalue;
        /**
         * @see {@link FunctionExpression~comment}
         */
        this.comment = comment;
    }
}

export class Variable extends Node {
    /**
     * @param name {string}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(name, start, end) {
        super('Variable', start, end);
        this.name = name;
    }
}

export class Constant extends Node {
    /**
     * @param name {'euler' | 'pi' | 'null' | 'true' | 'false'}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(name, start, end) {
        super('Constant', start, end);
        this.name = name;
    }
}

export class FunctionExpression extends Node {
    /**
     * @param name {string}
     * @param params {Node[]}
     * @param comment {string?}
     * @param start {Position}
     * @param end {Position}
     */
    constructor(name, params, comment, start, end) {
        super('FunctionExpression', start, end);
        this.name = name;
        this.params = params;
        /**
         * Documentation comments and the like. Scarpet only supports single line
         * comments, this stores the whole block of comment which is not separated
         * by whitespace.
         *
         * ```
         * // comments not separated by empty lines are treated as the same
         * // comment so this comment will not show up in the doc comment of
         * // function f
         *
         * // documentation for function f
         * // documentation for parameter a
         * f(a) -> null;
         * ```
         * @readonly
         */
        this.comment = comment;
    }
}

export class ParenthesisedExpression extends Node {
    /**
     *
     * @param {Node} value
     * @param {Position} start
     * @param {Position} end
     */
    constructor(value, start, end) {
        super('ParenthesisedExpression', start, end);
        this.value = value;
    }
}
