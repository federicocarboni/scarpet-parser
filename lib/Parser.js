import {Diagnostic, DiagnosticCode, DiagnosticSeverity} from './diagnostic.js';
import {Token, TokenType, TokenTypes} from './Token.js';
import {Tokenizer} from './Tokenizer.js';

/**
 * @callback TokenCallback
 * @param {Token} token
 * @returns {void}
 */

/**
 * @typedef {object} ParserOptions
 * @property {boolean | null} [allowComments=true] Comments are not allowed when running from a
 *   /script run command. Default is `true`
 * @property {boolean | null} [allowNewLineMarkers=false] New line markers are only allowed when
 *   running from a /script run command. Default is `false`
 * @property {TokenCallback | null} [onComment] This function will be called for every comment read
 *   from input.
 * @property {TokenCallback | null} [onToken] This function will be called for every token read from
 *   input.
 * @property {Diagnostic[]} [diagnostics=[]] Default is `[]`
 */

export class Parser {
    /**
     * @param {string} input
     * @param {ParserOptions} [options={}] Default is `{}`
     */
    constructor(input, {allowComments, allowNewLineMarkers, onComment, onToken, diagnostics} = {}) {
        /**
         * @private
         * @type {Token}
         */
        this.prevToken = Token.NONE;
        /**
         * @private
         * @type {Token}
         */
        this.token = Token.NONE;
        /**
         * @private
         * @type {Token[]}
         */
        this.tokens = [];
        /**
         * @private
         * @type {Token[]}
         */
        this.comments = [];
        /** @type {Diagnostic[]} */
        this.diagnostics = diagnostics || [];
        /** @readonly */
        this.input = String(input);
        /** @private */
        this.tokenizer = new Tokenizer(this.input, {
            allowComments,
            allowNewLineMarkers,
            diagnostics: this.diagnostics,
        });
        /** @private */
        this.onToken = onToken || nop;
        /** @private */
        this.onComment = onComment || nop;
    }

    /**
     * @private
     * @param {DiagnosticSeverity} severity
     * @param {DiagnosticCode} code
     * @param {import('./diagnostic.js').Range} range
     */
    diagnostic(severity, code, range = this.token) {
        this.diagnostics.push(new Diagnostic(severity, range, code));
    }

    /** @private */
    unexpectedEof() {
        this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedEof, {
            start: this.prevToken.end,
            end: this.prevToken.end,
        });
    }

    /**
     * @private
     * @returns {Token | null}
     */
    nextToken() {
        if (this.token === Token.NONE && this.prevToken !== Token.NONE) return null;
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
     * @private
     * @param {TokenType} tokenType
     * @param {DiagnosticCode} [diagnostic=null] Default is `null`
     */
    parseExpected(tokenType, diagnostic = DiagnosticCode.UnexpectedToken) {
        this.nextToken();
        if (this.token === Token.NONE) {
            this.unexpectedEof();
        } else if (this.token.type !== tokenType) {
            this.diagnostic(DiagnosticSeverity.Error, diagnostic);
        }
    }

    /**
     * @param {Node} node
     * @returns {boolean} `true` if node is valid on the left hand side position of an assignment;
     *   `false` otherwise.
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
     * @private
     * @param {TokenType} closeParen
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
                this.diagnostic(DiagnosticSeverity.Warning, DiagnosticCode.MismatchedCloseParen);
                break;
            }
        }
        return params;
    }

    /**
     * @private
     * @returns {FunctionExpression}
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
     * @private
     * @returns {MapLiteral}
     */
    parseMapLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenTypes.CloseBrace);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: 'MapLiteral', params, start, end};
    }

    /**
     * @private
     * @returns {ListLiteral}
     */
    parseListLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenTypes.CloseBrack);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: 'ListLiteral', params, start, end};
    }

    /**
     * @private
     * @returns {ParenthesisedExpression}
     */
    parseParenthesisedExpr() {
        const start = this.token.start;
        this.nextToken();
        const value = this.parseExpression();
        const token = this.token;
        if (token === Token.NONE) {
            this.unexpectedEof();
        } else if (token.type === TokenTypes.CloseBrack || token.type === TokenTypes.CloseBrace) {
            this.diagnostic(DiagnosticSeverity.Warning, DiagnosticCode.MismatchedCloseParen);
            this.nextToken();
        } else if (token.type !== TokenTypes.CloseParen) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
        } else {
            this.nextToken();
        }
        if (value === null) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.EmptyExpression, {
                start,
                end: token?.end ?? this.prevToken.end,
            });
        }
        return {kind: 'ParenthesisedExpression', value, start, end: token.end};
    }

    /**
     * @private
     * @returns {FunctionExpression
     *     | StringLiteral
     *     | NumberLiteral
     *     | HexLiteral
     *     | Constant
     *     | Variable
     *     | ListLiteral
     *     | MapLiteral
     *     | ParenthesisedExpression
     *     | UnaryExpression
     *     | BinaryExpression
     *     | null}
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
                    literal: this.input.slice(this.token.start.offset, this.token.end.offset),
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
                    literal: this.input.slice(this.token.start.offset, this.token.end.offset),
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
                    literal: this.input.slice(this.token.start.offset, this.token.end.offset),
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
                    name: /** @type {any} */ (this.token.value),
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
        if (this.token.type.unaryOpPrecedence !== null) return this.parseUnaryExpression();
        return null;
    }

    /**
     * @private
     * @returns {UnaryExpression}
     */
    parseUnaryExpression() {
        const operator = this.token.type.label;
        const start = this.token.start;
        const precedence = this.token.type.unaryOpPrecedence;
        this.nextToken();
        const value = this.parseExpression(precedence);
        if (value === null)
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
        return {
            kind: 'UnaryExpression',
            operator,
            value,
            start,
            end: value?.end ?? this.prevToken.end,
        };
    }

    /**
     * @private
     * @returns {string | null}
     */
    getDocComment() {
        const len = this.comments.length;
        if (len === 0) return null;
        const comment = this.comments[len - 1];
        if (comment.end.line === this.token.start.line) {
            return /** @type {string} */ (comment.value);
        }
        return null;
    }

    /**
     * @private
     * @param {Node} lvalue
     * @returns {BinaryExpression}
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
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
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
     * @private
     * @param {number | null} [precedence=null] Default is `null`
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
     *
     * @returns The root node of the parsed Abstract Syntax Tree of the script or `null` if the
     *   script is empty.
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
                this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnmatchedCloseParen);
                // Try to ignore the unmatched parenthesis
                this.nextToken();
            } else {
                this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.MissingSemicolon);
            }
            node = this.parseBinaryExpression(node);
        }
        return node;
    }
}

const nop = () => {};

/**
 * @typedef {BinaryExpression
 *     | UnaryExpression
 *     | ParenthesisedExpression
 *     | FunctionExpression
 *     | StringLiteral
 *     | NumberLiteral
 *     | HexLiteral
 *     | Variable
 *     | Constant
 *     | MapLiteral
 *     | ListLiteral} Node
 */

/**
 * @typedef {object} ParenthesisedExpression
 * @property {'ParenthesisedExpression'} kind
 * @property {Node | null} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} BinaryExpression
 * @property {'BinaryExpression'} kind
 * @property {string} operator The operator to apply to lvalue and rvalue.
 * @property {Node} lvalue Expression on the left side of the operator.
 * @property {Node | null} rvalue Expression on the right side of the operator.
 * @property {string | null} comment Documentation comments and the like. Scarpet only supports
 *   single line comments, this stores the whole block of comment which is not separated by
 *   whitespace.
 *
 *       // comments not separated by non comment lines are treated as the same
 *       // comment so this comment will not show up in the doc comment of
 *       // function f
 *
 *       // both of these lines will show
 *       // up as comment of function f
 *       f(a) -> null;
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} UnaryExpression
 * @property {'UnaryExpression'} kind
 * @property {string} operator
 * @property {Node | null} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} FunctionExpression
 * @property {'FunctionExpression'} kind
 * @property {string} name
 * @property {(Node | null)[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} Variable
 * @property {'Variable'} kind
 * @property {string} name
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} Constant
 * @property {'Constant'} kind
 * @property {string} name
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} StringLiteral
 * @property {'StringLiteral'} kind
 * @property {string} literal
 * @property {string} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} NumberLiteral
 * @property {'NumberLiteral'} kind
 * @property {string} literal
 * @property {number | bigint} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} HexLiteral
 * @property {'HexLiteral'} kind
 * @property {string} literal
 * @property {bigint} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} MapLiteral
 * @property {'MapLiteral'} kind
 * @property {(Node | null)[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} ListLiteral
 * @property {'ListLiteral'} kind
 * @property {(Node | null)[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */
