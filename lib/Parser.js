import {
    Constant,
    HexLiteral,
    MapLiteral,
    Node,
    NumberLiteral,
    StringLiteral,
    UnaryExpression,
    Variable,
    BinaryExpression,
    FunctionExpression,
    ParenthesisedExpression,
    ListLiteral,
} from './Node.js';
import {Diagnostic, Diagnostics} from './diagnostics.js';
import {Token, TokenType, TokenTypes} from './Token.js';
import {Tokenizer} from './Tokenizer.js';

/**
 * @typedef {object} ParserOptions
 * @property {boolean?} [allowComments=true]
 * Comments are not allowed when running from a /script run command.
 * @property {boolean?} [allowNewLineMarkers=false]
 * New line markers are only allowed when running from a /script run command.
 * @property {((token: Token) => void)?} [onComment]
 * This function will be called for every comment read from input.
 * @property {((token: Token) => void)?} [onToken]
 * This function will be called for every token read from input.
 */

const nop = () => {};

export class Parser {
    /**
     *
     * @param {string} input
     * @param {ParserOptions} [options={}]
     */
    constructor(
        input,
        {allowComments, allowNewLineMarkers, onComment, onToken} = {},
    ) {
        /**
         * @type {Token?}
         * @private
         */
        this.prevToken = null;
        /**
         * @type {Token?}
         * @private
         */
        this.token = null;
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
        this.errors = [];
        /**
         * @type {Diagnostic[]}
         */
        this.warnings = [];
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
     * @param {import('./diagnostics.js').Span} location
     */
    error(diagnostic, location = this.token) {
        this.errors.push(new Diagnostic(diagnostic, location));
    }

    unexpectedEof() {
        this.error(Diagnostics.UnexpectedEof, {
            start: this.prevToken.end,
            end: this.prevToken.end,
        });
    }

    /**
     * @param {Diagnostics} diagnostic
     * @param {import('./diagnostics.js').Span} location
     */
    warning(diagnostic, location = this.token) {
        this.warnings.push(new Diagnostic(diagnostic, location));
    }

    /**
     * @private
     * @returns {Token?}
     */
    nextToken() {
        if (this.token === null && this.prevToken !== null) return null;
        this.prevToken = this.token;
        this.token = this.tokenizer.nextToken();
        if (this.token !== null) {
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
     */
    parseExpected(tokenType, diagnostic = Diagnostics.UnexpectedToken) {
        this.nextToken();
        if (this.token === null) {
            this.unexpectedEof();
        } else if (this.token.type !== tokenType) {
            this.error(diagnostic);
        }
    }

    /**
     *
     * @param {TokenType} closeParen
     */
    parseParams(closeParen) {
        const params = [];
        while (this.nextToken() !== null) {
            params.push(this.parseExpression());
            if (this.token === null) {
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

    parseFunction() {
        const start = this.token.start;
        const name = /** @type {string} */ (this.token.value);
        this.parseExpected(TokenTypes.OpenParen);
        const params = this.parseParams(TokenTypes.CloseParen);
        const token = this.token;
        this.nextToken();
        return new FunctionExpression(
            name,
            params,
            start,
            token?.end ?? this.prevToken.end,
        );
    }

    parseMapLiteral() {
        const start = this.token.start;
        const values = this.parseParams(TokenTypes.CloseBrace);
        const token = this.token;
        this.nextToken();
        return new MapLiteral(values, start, token?.end ?? this.prevToken.end);
    }

    parseListLiteral() {
        const start = this.token.start;
        const values = this.parseParams(TokenTypes.CloseBrack);
        const token = this.token;
        this.nextToken();
        return new ListLiteral(values, start, token?.end ?? this.prevToken.end);
    }

    parseParenthesisedExpr() {
        const start = this.token.start;
        this.nextToken();
        const value = this.parseExpression();
        const token = this.token;
        if (token === null) {
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
        return new ParenthesisedExpression(
            value,
            start,
            token?.end ?? this.prevToken.end,
        );
    }

    parsePrimaryExpression() {
        if (this.token === null) {
            return null;
        }
        switch (this.token.type) {
            case TokenTypes.String: {
                const node = new StringLiteral(
                    /** @type {string} */ (this.token.value),
                    this.token.start,
                    this.token.end,
                );
                this.nextToken();
                return node;
            }
            case TokenTypes.Number: {
                const node = new NumberLiteral(
                    /** @type {number | bigint} */ (this.token.value),
                    this.token.start,
                    this.token.end,
                );
                this.nextToken();
                return node;
            }
            case TokenTypes.HexNumber: {
                const node = new HexLiteral(
                    /** @type {bigint} */ (this.token.value),
                    this.token.start,
                    this.token.end,
                );
                this.nextToken();
                return node;
            }
            case TokenTypes.Constant: {
                const node = new Constant(
                    /** @type {*} */ (this.token.value),
                    this.token.start,
                    this.token.end,
                );
                this.nextToken();
                return node;
            }
            case TokenTypes.Variable: {
                const node = new Variable(
                    /** @type {string} */ (this.token.value),
                    this.token.start,
                    this.token.end,
                );
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

    parseUnaryExpression() {
        const operator = this.token.type.label;
        const start = this.token.start;
        const precedence = this.token.type.unaryOpPrecedence;
        this.nextToken();
        const value = this.parseExpression(precedence);
        return new UnaryExpression(operator, value, start, value.end);
    }

    /**
     *
     * @returns {string}
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
     */
    parseBinaryExpression(lvalue) {
        const comment = this.getDocComment();
        const type = this.token.type;
        const operator = this.token.type.label;
        const end = this.token.end;
        const binop = this.token.type.binaryOpPrecedence;
        this.nextToken();
        const rvalue = this.parseExpression(binop);
        if (rvalue === null && type !== TokenTypes.Semicolon) {
            this.error(Diagnostics.UnexpectedToken);
        }
        return new BinaryExpression(
            operator,
            lvalue,
            rvalue,
            comment,
            lvalue.start,
            rvalue?.end ?? end,
        );
    }

    /**
     * @param {number} [precedence=null]
     */
    parseExpression(precedence = null) {
        let node = this.parsePrimaryExpression();
        if (node === null) {
            return null;
        }
        while (
            this.token !== null &&
            ((precedence === null &&
                this.token.type.binaryOpPrecedence !== null) ||
                this.token.type.binaryOpPrecedence > precedence)
        ) {
            node = this.parseBinaryExpression(node);
        }
        return node;
    }

    parse() {
        this.nextToken();
        return this.parseExpression();
    }
}
