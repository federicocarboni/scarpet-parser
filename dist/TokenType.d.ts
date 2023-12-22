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
    constructor(label: string, options?: TokenTypeOptions);
    /** @readonly */
    readonly label: string;
    /** @readonly */
    readonly prefix: boolean;
    /** @readonly */
    readonly binaryOpPrecedence: number | null;
}
export type TokenTypes = TokenType;
/** @enum {TokenType} */
export const TokenTypes: Readonly<{
    Comment: TokenType;
    Number: TokenType;
    String: TokenType;
    Ident: TokenType;
    Constant: TokenType;
    OpenParen: TokenType;
    CloseParen: TokenType;
    Comma: TokenType;
    OpenBrack: TokenType;
    CloseBrack: TokenType;
    OpenBrace: TokenType;
    CloseBrace: TokenType;
    Operator: TokenType;
}>;
export type Constants = 'euler' | 'pi' | 'null' | 'true' | 'false';
/**
 * @enum {'euler' | 'pi' | 'null' | 'true' | 'false'}
 */
export const Constants: Readonly<{
    Euler: "euler";
    Pi: "pi";
    Null: "null";
    True: "true";
    False: "false";
}>;
export type TokenTypeOptions = {
    prefix?: boolean | undefined;
    binaryOpPrecedence?: number | null | undefined;
};
