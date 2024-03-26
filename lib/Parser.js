import {Diagnostic, DiagnosticCode, DiagnosticSeverity} from "./diagnostic.js";
import {resolveExpression} from "./resolveExpression.js";
import {TOKEN_NONE, TokenType} from "./token.js";
import {Tokenizer} from "./Tokenizer.js";

/**
 * @callback TokenCallback
 * @param {import('./token.js').Token} token
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

/**
 * A parser for Scarpet.
 *
 * Since there is no formal specification for the Scarpet language, this parser was written based on
 * the [Scarpet documentation in gnembon/fabric-carpet][1] and on reading the original Java source
 * code in [gnembon/fabric-carpet][2].
 *
 * Scarpet's grammar is very simple but its simplicity makes it difficult to statically analyze.
 * Everything in scarpet is an expression and it always allows complex expressions, including
 * function parameters for example.
 *
 * ```scarpet
 * // Look mom, executing code inside a function parameters list!
 * fun(print('hi mom'); x) -> x + 2;
 * ```
 *
 * This is a perfectly valid, normal and not at all cursed example of a function definition.
 *
 * Scarpet's relaxed rules also make it possible to:
 *
 * ```scarpet
 * comma_spam = {,,, 'x' -> 'y',,,};;;
 * // same as
 * comma_spam = {'x' -> 'y'};
 * ```
 *
 * This parser tries its best to be consistent with Carpet Mod's behavior. However this parser may
 * be a bit more pedantic and may occasionally produce diagnostic errors or warnings on code that
 * executes just fine in Carpet Mod.
 *
 * The reverse however (a script parsing without diagnostics producing a parse error in Carpet Mod)
 * is generally an indication of a bug. Please report it on GitHub.
 *
 * [1]: https://github.com/gnembon/fabric-carpet/blob/ab79e76b51f084b39654e9833bd6369eefef94cc/docs/scarpet/Documentation.md
 *
 * [2]: https://github.com/gnembon/fabric-carpet
 */
export class Parser {
    /**
     * @param {string} input
     * @param {ParserOptions} [options={}] Default is `{}`
     */
    constructor(
        input,
        {allowComments, allowNewLineMarkers, onComment, onToken, diagnostics} = {},
    ) {
        /**
         * @private
         * @type {import('./token.js').Token}
         */
        this.prevToken = TOKEN_NONE;
        /**
         * @private
         * @type {import('./token.js').Token}
         */
        this.token = TOKEN_NONE;
        /**
         * @type {import('./token.js').Token[]}
         * @readonly
         */
        this.tokens = [];
        /**
         * @type {import('./token.js').Token[]}
         * @readonly
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
     * @returns {import('./token.js').Token}
     */
    nextToken() {
        if (this.token === TOKEN_NONE && this.prevToken !== TOKEN_NONE) return TOKEN_NONE;
        this.prevToken = this.token;
        this.token = this.tokenizer.nextToken();
        if (this.token !== TOKEN_NONE) {
            // reset `this`
            (0, this.onToken)(this.token);
            this.tokens.push(this.token);
            if (this.token.type === TokenType.Comment) {
                // reset `this`
                (0, this.onComment)(this.token);
                this.comments.push(this.token);
                return this.nextToken();
            }
            if (this.token.type === TokenType.NewLineMarker) {
                return this.nextToken();
            }
        }
        return this.token;
    }

    /**
     * @private
     * @param {TokenType} tokenType
     * @param {DiagnosticCode} [diagnostic]
     */
    parseExpected(tokenType, diagnostic = DiagnosticCode.UnexpectedToken) {
        this.nextToken();
        if (this.token === TOKEN_NONE) {
            this.unexpectedEof();
        } else if (this.token.type !== tokenType) {
            this.diagnostic(DiagnosticSeverity.Error, diagnostic);
        }
    }

    /**
     * @private
     * @param {TokenType} closeParen
     */
    parseParams(closeParen, inMap = false) {
        const params = [];
        while (this.nextToken() !== TOKEN_NONE) {
            let expr = this.parseExpression(undefined, inMap);
            if (expr !== undefined) params.push(expr);
            if (this.token === TOKEN_NONE) {
                this.unexpectedEof();
                break;
            }
            if (this.token.type === closeParen) {
                break;
            } else if (
                this.token.type === TokenType.CloseParen
                || this.token.type === TokenType.CloseBrack
                || this.token.type === TokenType.CloseBrace
            ) {
                this.diagnostic(DiagnosticSeverity.Warning, DiagnosticCode.MismatchedCloseParen);
                break;
            } else if (this.token.type !== TokenType.Comma) {
                this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
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
        const value = /** @type {string} */ (this.token.value);
        const nameEnd = this.token.end;
        this.parseExpected(TokenType.OpenParen);
        const params = this.parseParams(TokenType.CloseParen, value === "m");
        const end = this.token.end;
        this.nextToken();
        return {
            kind: "FunctionExpression",
            name: {
                value,
                start,
                end: nameEnd,
            },
            params,
            start,
            end,
        };
    }

    /**
     * @private
     * @returns {MapLiteral}
     */
    parseMapLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenType.CloseBrace, true);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: "MapLiteral", params, start, end};
    }

    /**
     * @private
     * @returns {ListLiteral}
     */
    parseListLiteral() {
        const start = this.token.start;
        const params = this.parseParams(TokenType.CloseBrack);
        const end = this.token.end ?? this.prevToken.end;
        this.nextToken();
        return {kind: "ListLiteral", params, start, end};
    }

    /**
     * @private
     * @returns {ParenthesisedExpression}
     */
    parseParenthesisedExpression() {
        const start = this.token.start;
        this.nextToken();
        const value = this.parseExpression();
        const token = this.token;
        if (token === TOKEN_NONE) {
            this.unexpectedEof();
        } else if (token.type === TokenType.CloseBrack || token.type === TokenType.CloseBrace) {
            this.diagnostic(DiagnosticSeverity.Warning, DiagnosticCode.MismatchedCloseParen);
            this.nextToken();
        } else if (token.type !== TokenType.CloseParen) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
        } else {
            this.nextToken();
        }
        if (value === undefined) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.EmptyExpression, {
                start,
                end: token?.end ?? this.prevToken.end,
            });
        }
        return {kind: "ParenthesisedExpression", value, start, end: token.end};
    }

    /**
     * @private
     * @returns {Node | undefined}
     */
    parsePrimaryExpression() {
        if (this.token === TOKEN_NONE) {
            return undefined;
        }
        switch (this.token.type) {
            case TokenType.String: {
                /** @type {StringLiteral} */
                const node = {
                    kind: "StringLiteral",
                    value: /** @type {string} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenType.Number: {
                /** @type {NumberLiteral} */
                const node = {
                    kind: "NumberLiteral",
                    literal: this.input.slice(this.token.start.offset, this.token.end.offset),
                    value: /** @type {import('./token.js').NumericValue} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenType.HexNumber: {
                /** @type {HexLiteral} */
                const node = {
                    kind: "HexLiteral",
                    literal: this.input.slice(this.token.start.offset, this.token.end.offset),
                    value: /** @type {import('./token.js').NumericValue} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenType.Constant: {
                /** @type {Constant} */
                const node = {
                    kind: "Constant",
                    name: /** @type {any} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenType.Variable: {
                /** @type {Variable} */
                const node = {
                    kind: "Variable",
                    name: /** @type {string} */ (this.token.value),
                    start: this.token.start,
                    end: this.token.end,
                };
                this.nextToken();
                return node;
            }
            case TokenType.OpenBrack:
                return this.parseListLiteral();
            case TokenType.OpenBrace:
                return this.parseMapLiteral();
            case TokenType.Function:
                // if (this.token.value === 'm') {
                //     return this.parseMap();
                // } else if (this.token.value === 'l') {
                //     return this.parseList();
                // }
                return this.parseFunction();
            case TokenType.OpenParen:
                return this.parseParenthesisedExpression();
        }
        if (this.token.type.unaryOpPrecedence !== undefined) return this.parseUnaryExpression();
        return undefined;
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
        if (value === undefined) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.EmptyExpression);
        } else if (value.kind === "UnaryExpression") {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.DoubleUnaryExpression);
        }
        return {
            kind: "UnaryExpression",
            operator,
            value,
            start,
            end: value?.end ?? this.prevToken.end,
        };
    }

    /**
     * @private
     * @param {Node} node
     * @returns {string | undefined}
     */
    getDocumentation(node) {
        const len = this.comments.length;
        if (len === 0) return undefined;
        const comment = this.comments[len - 1];
        if (comment.end.line === node.start.line) {
            return /** @type {string} */ (comment.value);
        }
        return undefined;
    }

    /**
     * @private
     * @param {Node} lvalue
     * @returns {BinaryExpression | FunctionDeclaration}
     */
    parseBinaryExpression(lvalue, inMap = false) {
        const comment = this.getDocumentation(lvalue);
        const token = this.token;
        this.nextToken();
        const rvalue = this.parseExpression(token.type.binaryOpPrecedence);
        // ignore trailing semicolons
        if (rvalue === undefined && token.type !== TokenType.Semicolon) {
            this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.UnexpectedToken);
        }
        // inside maps function declarations are not allowed
        if (token.type === TokenType.Arrow && !inMap) {
            const resolved = resolveExpression(lvalue);
            if (resolved === undefined || resolved.kind !== "FunctionExpression") {
                this.diagnostic(
                    DiagnosticSeverity.Error,
                    DiagnosticCode.InvalidFunctionSignature,
                    lvalue,
                );
            } else if (resolved !== lvalue) {
                this.diagnostic(
                    DiagnosticSeverity.Warning,
                    DiagnosticCode.ConfusingFunctionSignature,
                    lvalue,
                );
            }
            // TODO(#4): error on invalid parameters
            return {
                kind: "FunctionDeclaration",
                signature: lvalue,
                body: rvalue,
                comment,
                start: lvalue.start,
                end: rvalue?.end ?? token.end,
            };
        } else if (
            token.type === TokenType.Assign
            || token.type === TokenType.AddAssign
            || token.type === TokenType.SwapAssign
        ) {
            const variable = resolveExpression(lvalue);
            if (variable !== undefined && variable !== lvalue) {
                this.diagnostic(
                    DiagnosticSeverity.Warning,
                    DiagnosticCode.ConfusingVariableAssignment,
                    lvalue,
                );
            }
            // TODO(#5): error on invalid assignment
        }
        return {
            kind: "BinaryExpression",
            operator: token.type.label,
            lvalue,
            rvalue,
            comment,
            start: lvalue.start,
            end: rvalue?.end ?? token.end,
        };
    }

    /**
     * @private
     * @param {number} [precedence]
     */
    parseExpression(precedence = 0, inMap = false) {
        let node = this.parsePrimaryExpression();
        if (node === undefined) {
            return undefined;
        }
        while (this.token !== TOKEN_NONE) {
            if (this.token.type.binaryOpPrecedence === undefined) {
                if (
                    this.token.type !== TokenType.CloseParen
                    && this.token.type !== TokenType.CloseBrack
                    && this.token.type !== TokenType.CloseBrace
                    && this.token.type !== TokenType.Comma
                ) {
                    this.diagnostic(DiagnosticSeverity.Error, DiagnosticCode.MissingSemicolon);
                    node = this.parseMissingSemicolon(node, inMap);
                } else {
                    break;
                }
            } else if (this.token.type.binaryOpPrecedence > precedence) {
                node = this.parseBinaryExpression(node, inMap);
            } else {
                break;
            }
        }
        return node;
    }

    /**
     * @private
     * @param {Node} lvalue
     * @returns {BinaryExpression}
     */
    parseMissingSemicolon(lvalue, inMap = false) {
        const rvalue = this.parseExpression(TokenType.Semicolon.binaryOpPrecedence, inMap);
        return {
            kind: "BinaryExpression",
            operator: ";",
            lvalue,
            rvalue,
            start: lvalue.start,
            end: rvalue?.end ?? lvalue.end,
            comment: undefined,
        };
    }

    /**
     * Parse the whole script without stopping on errors.
     *
     * @returns The root node of the parsed Abstract Syntax Tree of the script or `undefined` if the
     *   script is empty.
     */
    parse() {
        this.nextToken();
        return this.parseExpression();
    }
}

// const systemVariables = ['_', '_i', '_a', '_x', '_y', '_z', '_trace'];

const nop = () => {};

/**
 * @typedef {BinaryExpression
 *     | UnaryExpression
 *     | ParenthesisedExpression
 *     | FunctionExpression
 *     | FunctionDeclaration
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
 * @property {Node | undefined} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} BinaryExpression
 * @property {'BinaryExpression'} kind
 * @property {string} operator The operator to apply to lvalue and rvalue.
 * @property {Node} lvalue Expression on the left side of the operator.
 * @property {Node | undefined} rvalue Expression on the right side of the operator.
 * @property {string | undefined} comment Documentation comments and the like. Scarpet only supports
 *   single line comments, this stores the whole block of comment which is not separated by
 *   whitespace.
 *
 *   ```
 *   // comments not separated by non comment lines are treated as the same
 *   // comment so this comment will not show up in the doc comment of
 *   // function f
 *
 *   // both of these lines will show
 *   // up as comment of function f
 *   f(a) -> null;
 * ```
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} UnaryExpression
 * @property {'UnaryExpression'} kind
 * @property {string} operator
 * @property {Node | undefined} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} FunctionExpression
 * @property {'FunctionExpression'} kind
 * @property {object} name
 * @property {string} name.value
 * @property {import('./diagnostic.js').Position} name.start
 * @property {import('./diagnostic.js').Position} name.end
 * @property {Node[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} FunctionDeclaration
 * @property {'FunctionDeclaration'} kind
 * @property {Node} signature
 * @property {Node | undefined} body
 * @property {string | undefined} comment
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
 * @property {string} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} NumberLiteral
 * @property {'NumberLiteral'} kind
 * @property {string} literal
 * @property {import('./token.js').NumericValue} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} HexLiteral
 * @property {'HexLiteral'} kind
 * @property {string} literal
 * @property {import('./token.js').NumericValue} value
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} MapLiteral
 * @property {'MapLiteral'} kind
 * @property {Node[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */

/**
 * @typedef {object} ListLiteral
 * @property {'ListLiteral'} kind
 * @property {Node[]} params
 * @property {import('./diagnostic.js').Position} start
 * @property {import('./diagnostic.js').Position} end
 */
