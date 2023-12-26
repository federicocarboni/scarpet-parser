import {Position} from './Position.js';

let i = 0;
/**
 * @enum {number}
 */
export const Diagnostics = Object.freeze({
    // General
    UnexpectedEof: i++,
    UnexpectedToken: i++,
    UnknownOperator: i++,
    // Number literals
    ExpectedHexDigit: i++,
    ExpectedDecimalDigit: i++,
    LossOfPrecision: i++,
    UnicodeDigit: i++,
    // String literal
    UnknownEscapeSequence: i++,
    // Tokenizer options
    UnexpectedNewLineMarker: i++,
    UnexpectedComment: i++,
    // Functions
    UnmatchedCloseParen: i++,
});

export const DIAGNOSTIC_MESSAGES = [
    'Unexpected end of file (is it truncated?)',
    'Unexpected token',
    'Unknown operator',
    'Expected hexadecimal digit after 0x (did you mean 0x0?)',
    'Expected decimal digit',
    'Number literals greater or equal to 2^64 cause loss of precision at runtime',
    'Number literal contains non ASCII digit',
    'Invalid escape sequence (only `\\n`, `\\t`, `\\\'` and `\\\\` are supported)',
    'Unexpected new line marker $ (not allowed in script files)',
    'Unexpected comment // (not allowed in /script run)',
    'Unmatched closing parenthesis, using parentheses (} or (] is confusing',
];

/**
 * @typedef {object} Location
 * @property {Position} start
 * @property {Position} end
 */

export class Diagnostic {
    /**
     *
     * @param {Diagnostics} diagnostic
     * @param {Location} location
     */
    constructor(diagnostic, location) {
        this.diagnostic = diagnostic;
        this.start = location.start;
        this.end = location.end;
    }
}
