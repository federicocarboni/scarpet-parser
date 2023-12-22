import {
    DECIMAL_DIGIT_CODE_POINTS,
    LETTER_CODE_POINTS,
    WHITESPACE_CODE_POINTS,
} from './unicode.js';

/**
 * Returns whether `c` is a whitespace character (should closely match Java's
 * `Character.isWhitespace()`).
 * @param c {number}
 */
export function isWhitespace(c) {
    // the whitespace set is much smaller than the others
    return WHITESPACE_CODE_POINTS.includes(c);
}

/**
 * Returns whether `c` is a hexadecimal digit. 0-9 a-f A-F
 * @param c {number}
 */
export function isHexDigit(c) {
    return (
        (0x30 <= c && c <= 0x39) ||
        (0x41 <= c && c <= 0x46) ||
        (0x61 <= c && c <= 0x66)
    );
}

/**
 * Returns whether `c` is a digit character (should closely match Java's
 * `Character.isDigit()`).
 * @param c {number}
 */
export function isDigit(c) {
    // fast-path for ASCII digits and set inclusion check for unicode chars
    return (
        (0x30 <= c && c <= 0x39) ||
        (c > 127 && DECIMAL_DIGIT_CODE_POINTS.has(c))
    );
}

/**
 * Returns whether `c` is a letter character (should closely match Java's
 * `Character.isLetter()`).
 * @param c {number}
 */
export function isLetter(c) {
    // fast-path for ASCII letters and set inclusion check for unicode chars
    return (
        (0x61 /* a */ <= c && c <= 0x7a) /* z */ ||
        (0x41 /* A */ <= c && c <= 0x5a) /* Z */ ||
        (c > 127 && LETTER_CODE_POINTS.has(c))
    );
}
