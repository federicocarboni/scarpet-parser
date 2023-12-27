import {Diagnostic, Diagnostics} from './diagnostics.js';
import {Token, TokenType, TokenTypes} from './Token.js';
import {Tokenizer} from './Tokenizer.js';
import {Position} from './Position.js';

/**
 * @callback TokenCallback
 * @param {Token} token
 * @returns {void}
 */

/**
 * @typedef {object} ParserOptions
 * @property {boolean?} [allowComments=true]
 * Comments are not allowed when running from a /script run command.
 * @property {boolean?} [allowNewLineMarkers=false]
 * New line markers are only allowed when running from a /script run command.
 * @property {TokenCallback?} [onComment]
 * This function will be called for every comment read from input.
 * @property {TokenCallback?} [onToken]
 * This function will be called for every token read from input.
 * @property {Diagnostic[]} [errors=[]]
 * @property {Diagnostic[]} [warnings=[]]
 */

export class Parser {
    /**
     *
     * @param {string} input
     * @param {ParserOptions} [options={}]
     */
    constructor(
        input,
        {
            allowComments,
            allowNewLineMarkers,
            onComment,
            onToken,
            errors,
            warnings,
        } = {},
    ) {
        /**
         * @type {Token}
         * @private
         */
        this.prevToken = Token.NONE;
        /**
         * @type {Token}
         * @private
         */
        this.token = Token.NONE;
        /**
         * @type {Token[]}
         * @private
         */
        this.tokens = [];
        /**
         * @type {Token[]}
         * @private
         */
        this.comments = [];
        /**
         * @type {Diagnostic[]}
         */
        this.errors = errors || [];
        /**
         * @type {Diagnostic[]}
         */
        this.warnings = warnings || [];
        /**
         * @readonly
         */
        this.input = String(input);
        /**
         * @private
         */
        this.tokenizer = new Tokenizer(this.input, {
            allowComments,
            allowNewLineMarkers,
            errors: this.errors,
            warnings: this.warnings,
        });
        /**
         * @private
         */
        this.onToken = onToken || nop;
        /**
         * @private
         */
        this.onComment = onComment || nop;
    }

    /**
     * @param {Diagnostics} diagnostic
     * @param {object} location
     * @param {Position} location.start
     * @param {Position} location.end
     * @private
     */
    error(diagnostic, location = this.token) {
        this.errors.push(new Diagnostic(diagnostic, location));
    }

    /** @private */
    unexpectedEof() {
        this.error(Diagnostics.UnexpectedEof, {
            start: this.prevToken.end,
            end: this.prevToken.end,
        });
    }

    /**
     * @param {Diagnostics} diagnostic
     * @param {object} location
     * @param {Position} location.start
     * @param {Position} location.end
     * @private
     */
    warning(diagnostic, location = this.token) {
        this.warnings.push(new Diagnostic(diagnostic, location));
    }

    /**
     * @private
     * @returns {Token?}
     */
    nextToken() {
        if (this.token === Token.NONE && this.prevToken !== Token.NONE)
            return null;
        this.prevToken = this.token;
        this.token = this.tokenizer.nextToken();
        if (this.token !== Token.NONE) {
            // reset `this`
            (0, this.onToken)(this.token);
            this.tokens.push(this.token);
            if (this.token.type === TokenTypes.Comment) {
                // reset `this`
                (0, this.onComment)(this.token);
                this.comments.push(this.token);
                return this.nextToken();
            }
        }
        return this.token;
    }

    /**
     *
     * @param {TokenType} tokenType
     * @param {Diagnostics} [diagnostic=null]
     * @private
     */
    parseExpected(tokenType, diagnostic = Diagnostics.UnexpectedToken) {
        this.nextToken();
        if (this.token === Token.NONE) {
            this.unexpectedEof();
        } else if (this.token.type !== tokenType) {
            this.error(diagnostic);
        }
    }

    /**
     * @param {Node} node
     * @returns {boolean} `true` if node is valid on the left hand side position
     * of an assignment; `false` otherwise.
     */
    isValidLHS(node) {
        return (
            node.kind === 'Variable' ||
            (node.kind === 'BinaryExpression' &&
                node.operator === ':' &&
                this.isValidLHS(node.lvalue))
        );
    }

    /**
     *
     * @param {TokenType} closeParen
     * @private
     */
    parseParams(closeParen) {
        const params = [];
        while (this.nextToken() !== Token.NONE) {
            params.push(this.parseExpression());
            if (this.token === Token.NONE) {
                this.unexpectedEof();
                break;
            }
            if (this.token.type === closeParen) {
                break;
            } else if (
                this.token.type === TokenTypes.CloseParen ||
                this.token.type === TokenTypes.CloseBrack ||
                this.token.type === TokenTypes.CloseBrace
            ) {
                this.warning(Diagnostics.MismatchedCloseParen);
                break;
            }
        }
        return params;
    }

    /**
     * @returns {FunctionExpression}
     * @private
     */
    parseFunction() {
        const start = this.token.start;
        const name = /** @type {string} */ (this.token.value);
        this.parseExpected(TokenTypes.OpenParen);
        const params = this.parseParams(TokenTypes.CloseParen);
        const end = this.token?.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: 'FunctionExpression', name, params, start, end};
    }

    /**
     * @returns {MapLiteral}
     * @private
     */
    parseMapLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenTypes.CloseBrace);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: 'MapLiteral', params, start, end};
    }

    /**
     * @returns {ListLiteral}
     * @private
     */
    parseListLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenTypes.CloseBrack);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: 'ListLiteral', params, start, end};
    }

    /**
     * @returns {ParenthesisedExpression}
     * @private
     */
    parseParenthesisedExpr() {
        const start = this.token.start;
        this.nextToken();
        const value = this.parseExpression();
        const token = this.token;
        if (token === Token.NONE) {
            this.unexpectedEof();
        } else if (
            token.type === TokenTypes.CloseBrack ||
            token.type === TokenTypes.CloseBrace
        ) {
            this.warning(Diagnostics.MismatchedCloseParen);
            this.nextToken();
        } else if (token.type !== TokenTypes.CloseParen) {
            this.error(Diagnostics.UnexpectedToken);
        } else {
            this.nextToken();
        }
        if (value === null) {
            this.error(Diagnostics.EmptyExpression, {
                start,
                end: token?.end ?? this.prevToken.end,
            });
        }
        return {kind: 'ParenthesisedExpression', value, start, end: token.end};
    }

    /**
     *
     * @returns {FunctionExpression | StringLiteral | NumberLiteral | HexLiteral | Constant | Variable | ListLiteral | MapLiteral | ParenthesisedExpression | UnaryExpression | BinaryExpression | null}
     * @private
     */
    parsePrimaryExpression() {
        if (this.token === Token.NONE) {
            return null;
        }
        switch (this.token.type) {
            case TokenTypes.String: {
                /** @type {StringLiteral} */
                const node = {
                    kind: 'StringLiteral',
                    literal: this.input.slice(
                        this.token.start.pos,
                        this.token.end.pos,
                    ),
                    value: /** @type {string} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenTypes.Number: {
                /** @type {NumberLiteral} */
                const node = {
                    kind: 'NumberLiteral',
                    literal: this.input.slice(
                        this.token.start.pos,
                        this.token.end.pos,
                    ),
                    value: /** @type {number | bigint} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenTypes.HexNumber: {
                /** @type {HexLiteral} */
                const node = {
                    kind: 'HexLiteral',
                    literal: this.input.slice(
                        this.token.start.pos,
                        this.token.end.pos,
                    ),
                    value: /** @type {bigint} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenTypes.Constant: {
                /** @type {Constant} */
                const node = {
                    kind: 'Constant',
                    name: /** @type {*} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenTypes.Variable: {
                /** @type {Variable} */
                const node = {
                    kind: 'Variable',
                    name: /** @type {string} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenTypes.OpenBrack:
                return this.parseListLiteral();
            case TokenTypes.OpenBrace:
                return this.parseMapLiteral();
            case TokenTypes.Function:
                // if (this.token.value === 'm') {
                //     return this.parseMap();
                // } else if (this.token.value === 'l') {
                //     return this.parseList();
                // }
                return this.parseFunction();
            case TokenTypes.OpenParen:
                return this.parseParenthesisedExpr();
        }
        if (this.token.type.unaryOpPrecedence !== null)
            return this.parseUnaryExpression();
        return null;
    }

    /**
     * @returns {UnaryExpression}
     * @private
     */
    parseUnaryExpression() {
        const operator = this.token.type.label;
        const start = this.token.start;
        const precedence = this.token.type.unaryOpPrecedence;
        this.nextToken();
        const value = this.parseExpression(precedence);
        if (value === null) this.error(Diagnostics.UnexpectedToken);
        return {
            kind: 'UnaryExpression',
            operator,
            value,
            start,
            end: value?.end ?? this.prevToken.end,
        };
    }

    /**
     *
     * @returns {string?}
     * @private
     */
    getDocComment() {
        const len = this.comments.length;
        if (len === 0) return null;
        const comment = this.comments[len - 1];
        if (comment.end.row === this.token.start.row) {
            return /** @type {string} */ (comment.value);
        }
        return null;
    }

    /**
     *
     * @param {Node} lvalue
     * @returns {BinaryExpression}
     * @private
     */
    parseBinaryExpression(lvalue) {
        const comment = this.getDocComment();
        const type = this.token.type;
        const operator = this.token.type.label;
        const end = this.token.end;
        const binop = this.token.type.binaryOpPrecedence;
        this.nextToken();
        const rvalue = this.parseExpression(binop);
        // Trailing semicolons are allowed of course
        if (rvalue === null && type !== TokenTypes.Semicolon) {
            this.error(Diagnostics.UnexpectedToken);
        }
        return {
            kind: 'BinaryExpression',
            operator,
            lvalue,
            rvalue,
            comment,
            start: lvalue.start,
            end: rvalue?.end ?? end,
        };
    }

    /**
     * @param {number?} [precedence=null]
     * @private
     */
    parseExpression(precedence = null) {
        let node = this.parsePrimaryExpression();
        if (node === null) {
            return null;
        }
        while (
            this.token !== Token.NONE &&
            // @ts-ignore doesn't matter if they are null
            this.token.type.binaryOpPrecedence > precedence
        ) {
            node = this.parseBinaryExpression(node);
        }
        return node;
    }

    /**
     * Parse the whole script without stopping on errors.
     * @returns - The root node of the parsed Abstract Syntax Tree of the script
     * or `null` if the script is empty.
     */
    parse() {
        this.nextToken();
        let node = this.parseExpression();
        if (node === null) return null;
        while (this.token !== Token.NONE) {
            if (
                this.token.type === TokenTypes.CloseParen ||
                this.token.type === TokenTypes.CloseBrack ||
                this.token.type === TokenTypes.CloseBrace
            ) {
                this.error(Diagnostics.UnmatchedCloseParen);
                // Try to ignore the unmatched parenthesis
                this.nextToken();
            } else {
                this.error(Diagnostics.MissingSemicolon);
            }
            node = this.parseBinaryExpression(node);
        }
        return node;
    }
}

const nop = () => {};

/** @typedef {BinaryExpression | UnaryExpression | ParenthesisedExpression | FunctionExpression | StringLiteral | NumberLiteral | HexLiteral | Variable | Constant | MapLiteral | ListLiteral} Node */

/**
 * @typedef {object} ParenthesisedExpression
 * @property {'ParenthesisedExpression'} kind
 * @property {Node?} value
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} BinaryExpression
 * @property {'BinaryExpression'} kind
 * @property {string} operator
 * The operator to apply to the
 * @property {Node} lvalue
 * Expression on the left side of the operator.
 * @property {Node?} rvalue
 * Expression on the right side of the operator.
 * @property {string?} comment
 * Documentation comments and the like. Scarpet only supports single line
 * comments, this stores the whole block of comment which is not separated
 * by whitespace.
 *
 * ```
 * // comments not separated by empty lines are treated as the same
 * // comment so this comment will not show up in the doc comment of
 * // function f
 *
 * // both of these lines will show
 * // up as comment of function f
 * f(a) -> null;
 * ```
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} UnaryExpression
 * @property {'UnaryExpression'} kind
 * @property {string} operator
 * @property {Node?} value
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} FunctionExpression
 * @property {'FunctionExpression'} kind
 * @property {string} name
 * @property {Array<Node?>} params
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} Variable
 * @property {'Variable'} kind
 * @property {string} name
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} Constant
 * @property {'Constant'} kind
 * @property {string} name
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} StringLiteral
 * @property {'StringLiteral'} kind
 * @property {string} literal
 * @property {string} value
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} NumberLiteral
 * @property {'NumberLiteral'} kind
 * @property {string} literal
 * @property {number | bigint} value
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} HexLiteral
 * @property {'HexLiteral'} kind
 * @property {string} literal
 * @property {bigint} value
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} MapLiteral
 * @property {'MapLiteral'} kind
 * @property {Array<Node?>} params
 * @property {Position} start
 * @property {Position} end
 */

/**
 * @typedef {object} ListLiteral
 * @property {'ListLiteral'} kind
 * @property {Array<Node?>} params
 * @property {Position} start
 * @property {Position} end
 */
