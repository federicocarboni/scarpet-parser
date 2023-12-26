import {Position} from './Position.js';

let i = 0;
/**
 * Enumeration of possible diagnostics.
 *
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
    MismatchedCloseParen: i++,
    EmptyExpression: i++,
});

const DIAGNOSTIC_MESSAGES = Object.freeze([
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
    'Mismatched closing parenthesis, using parentheses like (} is confusing',
    'Empty expressions are not allowed, specify a null to suppress the error',
]);

/**
 * @typedef {object} Span
 * @property {Position} start
 * @property {Position} end
 */

export class Diagnostic {
    /**
     * @param {Diagnostics} diagnostic
     * @param {Span} span
     */
    constructor(diagnostic, span) {
        this.diagnostic = diagnostic;
        this.start = span.start;
        this.end = span.end;
    }

    /**
     * Get a friendly message describing the problem.
     */
    get message() {
        return DIAGNOSTIC_MESSAGES[this.diagnostic];
    }
}
