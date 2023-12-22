/**
 * @typedef {object} TokenizerOptions
 * @prop {boolean?} [allowComments=true]
 * @prop {boolean?} [allowNewLineMarkers=false]
 */
export class Tokenizer {
    /**
     *
     * @param input {string}
     * @param options {TokenizerOptions}
     */
    constructor(input: string, options?: TokenizerOptions);
    /** @private */
    private pos;
    /** @private */
    private row;
    /** @private */
    private col;
    /** @type {TokenError[]} @public */
    public errors: TokenError[];
    /** @private */
    private input;
    /** @private */
    private allowComments;
    /** @private */
    private allowNewLineMarkers;
    /**
     * @private
     * @returns {Position}
     */
    private getPosition;
    /** @private */
    private getChar;
    /**
     * @param reason {TokenErrorReason}
     * @private
     */
    private pushError;
    /** @private */
    private skipWhitespace;
    /** @private */
    private readNumber;
    /** @private */
    private readString;
    /** @returns {Token?} */
    nextToken(): Token | null;
}
export class Token {
    /**
     *
     * @param type {TokenType}
     * @param pos {Position}
     * @param [value] {string | number | bigint | null}
     */
    constructor(type: TokenType, pos: Position, value?: string | number | bigint | null | undefined);
    /** @readonly */
    readonly type: TokenType;
    /** @readonly */
    readonly pos: number;
    /** @readonly */
    readonly row: number;
    /** @readonly */
    readonly col: number;
    /** @readonly */
    readonly value: string | number | bigint | null | undefined;
}
export class TokenError {
    /**
     *
     * @param reason {TokenErrorReason}
     * @param pos {Position}
     */
    constructor(reason: TokenErrorReason, pos: Position);
    /** @readonly */
    readonly reason: string;
    /** @readonly */
    readonly pos: number;
    /** @readonly */
    readonly row: number;
    /** @readonly */
    readonly col: number;
}
export type TokenErrorReason = string;
/**
 * @enum {string}
 */
export const TokenErrorReason: Readonly<{
    ExpectedDigit: "expected digit";
    UnexpectedEof: "unexpected eof";
    UnsupportedEscape: "unsupported escape sequence";
}>;
export type TokenizerOptions = {
    allowComments?: boolean | null | undefined;
    allowNewLineMarkers?: boolean | null | undefined;
};
import { TokenType } from './TokenType.js';
import { Position } from './Position.js';
