/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: ';',
    lvalue: {
        kind: 'BinaryExpression',
        operator: ';',
        lvalue: {
            kind: 'BinaryExpression',
            operator: ';',
            lvalue: {
                kind: 'BinaryExpression',
                operator: ';',
                lvalue: {
                    kind: 'NumberLiteral',
                    literal: '12345',
                    value: 12345n,
                    start: {
                        offset: 16,
                        line: 1,
                        character: 0,
                    },
                    end: {
                        offset: 21,
                        line: 1,
                        character: 5,
                    },
                },
                rvalue: {
                    kind: 'NumberLiteral',
                    literal: '123.45',
                    value: 123.45,
                    start: {
                        offset: 23,
                        line: 2,
                        character: 0,
                    },
                    end: {
                        offset: 29,
                        line: 2,
                        character: 6,
                    },
                },
                comment: '// Numbers test\n',
                start: {
                    offset: 16,
                    line: 1,
                    character: 0,
                },
                end: {
                    offset: 29,
                    line: 2,
                    character: 6,
                },
            },
            rvalue: {
                kind: 'NumberLiteral',
                literal: '123e12',
                value: 123000000000000n,
                start: {
                    offset: 31,
                    line: 3,
                    character: 0,
                },
                end: {
                    offset: 37,
                    line: 3,
                    character: 7,
                },
            },
            comment: null,
            start: {
                offset: 16,
                line: 1,
                character: 0,
            },
            end: {
                offset: 37,
                line: 3,
                character: 7,
            },
        },
        rvalue: {
            kind: 'NumberLiteral',
            literal: '123e+12',
            value: 123000000000000n,
            start: {
                offset: 39,
                line: 4,
                character: 0,
            },
            end: {
                offset: 46,
                line: 4,
                character: 7,
            },
        },
        comment: null,
        start: {
            offset: 16,
            line: 1,
            character: 0,
        },
        end: {
            offset: 46,
            line: 4,
            character: 7,
        },
    },
    rvalue: {
        kind: 'NumberLiteral',
        literal: '123e-12',
        value: 1.23e-10,
        start: {
            offset: 48,
            line: 5,
            character: 0,
        },
        end: {
            offset: 55,
            line: 5,
            character: 7,
        },
    },
    comment: null,
    start: {
        offset: 16,
        line: 1,
        character: 0,
    },
    end: {
        offset: 55,
        line: 5,
        character: 7,
    },
};
