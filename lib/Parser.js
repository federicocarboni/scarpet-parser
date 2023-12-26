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
} from './Node.js';
import {DiagnosticKind} from './diagnostics.js';
import {Token, TokenType, TokenTypes} from './Token.js';
import {Tokenizer} from './Tokenizer.js';

/**
 * @typedef {object} ParserOptions
 * @property {Tokenizer?} [tokenizer]
 * @property {((token: Token) => void)?} [onComment]
 * @property {((token: Token) => void)?} [onToken]
 */

const nop = () => {};

export class Parser {
    /**
     *
     * @param {string} input
     * @param {ParserOptions} [options={}]
     */
    constructor(input, {tokenizer, onComment, onToken} = {}) {
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
        this.input = String(input);
        this.tokenizer = tokenizer ?? new Tokenizer(input);
        /** @private @readonly */
        this.onToken = onToken ?? nop;
        /** @private @readonly */
        this.onComment = onComment ?? nop;
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
        /** @type {import('./diagnostics.js').Diagnostic[]} */
        this.errors = [];
        /** @type {import('./diagnostics.js').Diagnostic[]} */
        this.warnings = [];
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
     * @param {DiagnosticKind} [diagnostic=null]
     */
    parseExpected(tokenType, advance = true, diagnostic = null) {
        const token = advance ? this.nextToken() : this.token;
        if (token === null) {
            this.errors.push({
                kind: DiagnosticKind.UnexpectedEof,
                start: this.prevToken?.end,
                end: this.prevToken?.end,
            });
        } else if (token.type !== tokenType) {
            this.errors.push({
                kind: diagnostic || DiagnosticKind.UnexpectedToken,
                start: token.start,
                end: token.end,
            });
        }
    }

    parseFunction() {
        const start = this.token.start;
        const name = /** @type {string} */ (this.token.value);
        this.parseExpected(TokenTypes.OpenParen);
        const params = [];
        while (
            this.nextToken() !== null &&
            this.token.type !== TokenTypes.CloseParen
        ) {
            params.push(this.parseExpression());
            if (
                this.token === null ||
                this.token.type === TokenTypes.CloseParen ||
                this.token.type === TokenTypes.CloseBrack ||
                this.token.type === TokenTypes.CloseBrace
            )
                break;
        }
        this.nextToken();
        return new FunctionExpression(
            name,
            params,
            null,
            start,
            this.token?.end ?? this.prevToken?.end,
        );
    }

    parseParenthesisedExpr() {
        const start = this.token.start;
        this.nextToken();
        const expr = this.parseExpression();
        this.parseExpected(TokenTypes.CloseParen, false);
        this.nextToken();
        return new ParenthesisedExpression(expr, start, this.token.end);
    }

    parsePrimaryExpression() {
        if (this.token === null) {
            // this.errors.push({
            //     kind: DiagnosticKind.UnexpectedEof,
            //     start: this.prevToken.end,
            //     end: this.prevToken.end,
            // });
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
     * @param {Node} lvalue
     */
    parseBinaryExpression(lvalue) {
        const type = this.token.type;
        const operator = this.token.type.label;
        const end = this.token.end;
        const binop = this.token.type.binaryOpPrecedence;
        this.nextToken();
        const rvalue = this.parseExpression(binop);
        if (rvalue === null && type !== TokenTypes.Semicolon) {
            this.errors.push({
                kind: DiagnosticKind.UnexpectedEof,
                start: end,
                end,
            });
        }
        return new BinaryExpression(
            operator,
            lvalue,
            rvalue,
            lvalue.start,
            rvalue?.end ?? end,
        );
    }

    /**
     * @param {number} [precedence=null]
     */
    parseExpression(precedence = null) {
        let node = this.parsePrimaryExpression();
        if (!node) return null;
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
