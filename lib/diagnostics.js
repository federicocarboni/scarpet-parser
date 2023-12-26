import {Position} from './Position.js';
import { Token } from './Token.js';

/**
 * @enum {string}
 */
export const DiagnosticKind = Object.freeze({
    ExpectedLHS: '',
    UnexpectedEof: 'Unexpected end of file',
    UnexpectedToken: 'Unexpected token',
    UnexpectedNewLineMarker: 'Unexpected end of line marker $ (not allowed in script files)',
    ExpectedHexDigit: 'Expected hexadecimal digit after 0x',
    UnexpectedComment: 'Unexpected comment (not allowed in /script run)',
    DeprecatedFunction: ''
});
let i = 0;
/**
 * @enum {number}
 */
export const Diagnostics = Object.freeze({
    UnexpectedEof: i++,
    UnexpectedToken: i++,
    UnknownOperator: i++,
    ExpectedHexDigit: i++,
    ExpectedDecimalDigit: i++,
    LossOfPrecision: i++,
    UnicodeDigit: i++,
});

export const DIAGNOSTIC_MESSAGES = [
    'Unexpected end of file (is it truncated?)',
    'Unexpected token',
    'Unknown operator',
];

export class Diagnostic {
    /**
     *
     * @param {Diagnostics} diagnostic
     * @param {Token | [Position, Position]} token
     */
    constructor(diagnostic, token) {}
}

// /**
//  * @typedef {object} Diagnostic
//  * @property {DiagnosticKind} kind
//  * @property {Position} start
//  * @property {Position} end
//  */
