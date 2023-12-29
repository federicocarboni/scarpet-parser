import {
    DECIMAL_DIGIT_CHAR_CODES,
    JAVA_WHITESPACE_CHAR_CODES,
    LETTER_CHAR_CODES,
} from './unicode.js';

/**
 * Returns whether `c` is a whitespace character according to Java
 * [`Character.isWhitespace(char)`][1].
 *
 * Like the reference Java method supplementary characters are not supported.
 *
 * [1]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Character.html#isWhitespace(char)
 *
 * @param {number} c - Char code (`\u0000-\uFFFF`)
 * @returns - `true` if the character is a Java whitespace character; `false` otherwise.
 */
export function isJavaWhitespace(c) {
    // the whitespace set is much smaller than the others, no need to split
    // ASCII and Unicode checks
    return JAVA_WHITESPACE_CHAR_CODES.has(c);
}

/**
 * Returns whether `c` is an ASCII hexadecimal digit. `0-9a-fA-F`
 *
 * @param {number} c - Char code (`\u0000-\uFFFF`)
 */
export function isHexDigit(c) {
    return (
        (0x30 /* 0 */ <= c && c <= 0x39) /* 9 */ ||
        (0x41 /* A */ <= c && c <= 0x46) /* F */ ||
        (0x61 /* a */ <= c && c <= 0x66) /* f */
    );
}

/**
 * Returns whether `c` is a decimal digit character (should closely match Java's
 * [`Character.isDigit(char)`][1]).
 *
 * Like the reference Java method supplementary characters are not supported.
 *
 * [1]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Character.html#isDigit(char)
 *
 * @param {number} c - Char code (`\u0000-\uFFFF`)
 */
export function isDigit(c) {
    // fast-path for ASCII digits and set inclusion check for unicode chars
    return (0x30 /* 0 */ <= c && c <= 0x39) /* 9 */ || (c > 127 && DECIMAL_DIGIT_CHAR_CODES.has(c));
}

/**
 * Returns whether `c` is a letter character (should closely match Java's
 * [`Character.isLetter(char)`][1]).
 *
 * Like the reference Java method supplementary characters are not supported.
 *
 * [1]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Character.html#isLetter(char)
 *
 * @param {number} c - Char code (`\u0000-\uFFFF`)
 */
export function isLetter(c) {
    // fast-path for ASCII letters and set inclusion check for unicode chars
    return (
        (0x61 /* a */ <= c && c <= 0x7a) /* z */ ||
        (0x41 /* A */ <= c && c <= 0x5a) /* Z */ ||
        (c > 127 && LETTER_CHAR_CODES.has(c))
    );
}
