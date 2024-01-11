/**
 * Position in a source document expressed as zero-based UTF-16 character offsets.
 *
 * This definition is compatible with the Language Server Protocol, but adds `offset`.
 *
 * @typedef {object} Position
 * @property {number} offset Character offset in the source code (zero-based).
 * @property {number} line Line position in the source code (zero-based).
 * @property {number} character Character offset on a line in the source code (zero-based).
 */

/**
 * Range in a source document.
 *
 * @typedef {object} Range
 * @property {Position} start
 * @property {Position} end
 */

/**
 * A diagnostic message compatible with [LSP `Diagnostic`][1].
 *
 * [1]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic
 */
export class Diagnostic {
    /**
     * @param {DiagnosticSeverity} severity
     * @param {Range} range
     * @param {DiagnosticCode} code
     * @internal
     */
    constructor(severity, range, code) {
        this.range = {start: range.start, end: range.end};
        this.severity = severity;
        this.code = code;
        this.source = 'scarpet';
        this.message = DIAGNOSTIC_MESSAGES[code];
    }
}

/**
 * Enumeration of possible diagnostics.
 *
 * @enum {number}
 */
export const DiagnosticCode = Object.freeze({
    // General
    UnexpectedEof: 0,
    UnexpectedToken: 1,
    UnknownOperator: 2,
    // Number literals
    ExpectedHexDigit: 3,
    ExpectedDecimalDigit: 4,
    LongLossOfPrecision: 5,
    DoubleLossOfPrecision: 6,
    MoreThanOnePoint: 7,
    NoExponentDigits: 8,
    UnicodeDigit: 9,
    // String literal
    UnknownEscapeSequence: 10,
    // Tokenizer options
    UnexpectedNewLineMarker: 11,
    UnexpectedComment: 12,
    // Functions
    MismatchedCloseParen: 13,
    UnmatchedCloseParen: 14,
    EmptyExpression: 15,
    MissingSemicolon: 16,
    InvalidArrowOperator: 17,
    InvalidFunctionSignature: 18,
    RestParameterAlreadyDefined: 19,
    OuterTakesOneVariable: 20,
    AssignToConstant: 21,
    CannotAssign: 22,
    AssignToSystemVariable: 23,
    ConfusingFunctionSignature: 24,
    ConfusingVariableAssignment: 25,
});

const DIAGNOSTIC_MESSAGES = Object.freeze([
    'Unexpected end of file (is it truncated?)',
    'Unexpected token',
    'Unknown operator',
    'Expected hexadecimal digit after 0x (did you mean 0x0?)',
    'Expected decimal digit',
    'Number literals greater than 2^63-1 (or less than -2^63) lose precision at runtime',
    'Number literal loses precision at runtime',
    'Number literal contains more than one decimal point',
    'Number literal exponent has no digits',
    'Number literal contains non ASCII digit',
    "Invalid escape sequence (only `\\n`, `\\t`, `\\'` and `\\\\` are supported)",
    'Unexpected new line marker $ (not allowed in script files)',
    'Unexpected comment // (not allowed in /script run)',
    'Mismatched closing parenthesis, using parentheses like (} is confusing',
    'Unmatched closing parenthesis',
    'Empty expressions are not allowed, specify null to suppress the error',
    'Missing semicolon',
    'Expected a function signature before the ->',
    'Function signatures can only contain parameters or rest parameters',
    'Variable argument (...args) parameter is already defined',
    'Outer expects a single variable',
    'Cannot assign a new value to a constant',
    'Can only assign to variables and attributes',
    'System variables _, _i, _a, _x, _y, _z and _trace are readonly',
    'Confusing function signature, use a simpler function signature',
    'Confusing variable assign, use a simpler expression on the left-hand side',
]);

/** @enum {1 | 2 | 3 | 4} */
export const DiagnosticSeverity = Object.freeze({
    Error: 1,
    Warning: 2,
    Information: 3,
    Hint: 4,
});
