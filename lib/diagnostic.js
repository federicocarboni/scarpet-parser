let i = 0;
/**
 * Enumeration of possible diagnostics.
 *
 * @enum {number}
 */
export const DiagnosticCode = Object.freeze({
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
    UnmatchedCloseParen: i++,
    EmptyExpression: i++,
    MissingSemicolon: i++,
});

const DIAGNOSTIC_MESSAGES = Object.freeze([
    'Unexpected end of file (is it truncated?)',
    'Unexpected token',
    'Unknown operator',
    'Expected hexadecimal digit after 0x (did you mean 0x0?)',
    'Expected decimal digit',
    'Number literals greater or equal to 2^63 (or less than -2^63) cause loss of precision at runtime',
    'Number literal contains non ASCII digit',
    "Invalid escape sequence (only `\\n`, `\\t`, `\\'` and `\\\\` are supported)",
    'Unexpected new line marker $ (not allowed in script files)',
    'Unexpected comment // (not allowed in /script run)',
    'Mismatched closing parenthesis, using parentheses like (} is confusing',
    'Unmatched closing parenthesis',
    'Empty expressions are not allowed, specify a null to suppress the error',
    'Missing semicolon',
]);

/** @enum {1 | 2 | 3 | 4} */
export const DiagnosticSeverity = Object.freeze({
    Error: 1,
    Warning: 2,
    Information: 3,
    Hint: 4,
});


export class Diagnostic {
    /**
     * @param {DiagnosticSeverity} severity
     * @param {import('./Token.js').Range} range
     * @param {DiagnosticCode} code
     */
    constructor(severity, range, code) {
        this.range = {start: range.start, end: range.end};
        this.severity = severity;
        this.code = code;
        this.source = 'scarpet';
    }

    /** Get a friendly message describing the problem. */
    get message() {
        return DIAGNOSTIC_MESSAGES[this.code];
    }
}
