/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: ';',
    lvalue: {
        kind: 'BinaryExpression',
        operator: ';',
        lvalue: {
            kind: 'StringLiteral',
            literal: "'plain string'",
            value: 'plain string',
            start: {
                offset: 15,
                line: 1,
                character: 0,
            },
            end: {
                offset: 29,
                line: 1,
                character: 14,
            },
        },
        rvalue: {
            kind: 'StringLiteral',
            literal: "'escape sequences \\n \\t \\' \\\\ plain text'",
            value: "escape sequences \n \t ' \\ plain text",
            start: {
                offset: 31,
                line: 2,
                character: 0,
            },
            end: {
                offset: 72,
                line: 2,
                character: 41,
            },
        },
        comment: '// String test\n',
        start: {
            offset: 15,
            line: 1,
            character: 0,
        },
        end: {
            offset: 72,
            line: 2,
            character: 41,
        },
    },
    rvalue: {
        kind: 'StringLiteral',
        literal: "'string\nspanning\nmultiple\nlines'",
        value: 'string\nspanning\nmultiple\nlines',
        start: {
            offset: 74,
            line: 3,
            character: 0,
        },
        end: {
            offset: 106,
            line: 6,
            character: 6,
        },
    },
    comment: null,
    start: {
        offset: 15,
        line: 1,
        character: 0,
    },
    end: {
        offset: 106,
        line: 6,
        character: 6,
    },
};
