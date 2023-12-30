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
                operator: '>=',
                lvalue: {
                    kind: 'NumberLiteral',
                    literal: '1',
                    value: 1n,
                    start: {
                        offset: 24,
                        line: 1,
                        character: 0,
                    },
                    end: {
                        offset: 25,
                        line: 1,
                        character: 1,
                    },
                },
                rvalue: {
                    kind: 'NumberLiteral',
                    literal: '2',
                    value: 2n,
                    start: {
                        offset: 29,
                        line: 1,
                        character: 5,
                    },
                    end: {
                        offset: 30,
                        line: 1,
                        character: 6,
                    },
                },
                comment: '// Comparison operators\n',
                start: {
                    offset: 24,
                    line: 1,
                    character: 0,
                },
                end: {
                    offset: 30,
                    line: 1,
                    character: 6,
                },
            },
            rvalue: {
                kind: 'BinaryExpression',
                operator: '>',
                lvalue: {
                    kind: 'NumberLiteral',
                    literal: '3',
                    value: 3n,
                    start: {
                        offset: 32,
                        line: 2,
                        character: 0,
                    },
                    end: {
                        offset: 33,
                        line: 2,
                        character: 1,
                    },
                },
                rvalue: {
                    kind: 'NumberLiteral',
                    literal: '4',
                    value: 4n,
                    start: {
                        offset: 36,
                        line: 2,
                        character: 4,
                    },
                    end: {
                        offset: 37,
                        line: 2,
                        character: 5,
                    },
                },
                comment: null,
                start: {
                    offset: 32,
                    line: 2,
                    character: 0,
                },
                end: {
                    offset: 37,
                    line: 2,
                    character: 5,
                },
            },
            comment: '// Comparison operators\n',
            start: {
                offset: 24,
                line: 1,
                character: 0,
            },
            end: {
                offset: 37,
                line: 2,
                character: 5,
            },
        },
        rvalue: {
            kind: 'BinaryExpression',
            operator: '<=',
            lvalue: {
                kind: 'NumberLiteral',
                literal: '5',
                value: 5n,
                start: {
                    offset: 39,
                    line: 3,
                    character: 0,
                },
                end: {
                    offset: 40,
                    line: 3,
                    character: 1,
                },
            },
            rvalue: {
                kind: 'NumberLiteral',
                literal: '6',
                value: 6n,
                start: {
                    offset: 44,
                    line: 3,
                    character: 5,
                },
                end: {
                    offset: 45,
                    line: 3,
                    character: 6,
                },
            },
            comment: null,
            start: {
                offset: 39,
                line: 3,
                character: 0,
            },
            end: {
                offset: 45,
                line: 3,
                character: 6,
            },
        },
        comment: null,
        start: {
            offset: 24,
            line: 1,
            character: 0,
        },
        end: {
            offset: 45,
            line: 3,
            character: 6,
        },
    },
    rvalue: {
        kind: 'BinaryExpression',
        operator: '<',
        lvalue: {
            kind: 'NumberLiteral',
            literal: '7',
            value: 7n,
            start: {
                offset: 47,
                line: 4,
                character: 0,
            },
            end: {
                offset: 48,
                line: 4,
                character: 1,
            },
        },
        rvalue: {
            kind: 'NumberLiteral',
            literal: '8',
            value: 8n,
            start: {
                offset: 51,
                line: 4,
                character: 4,
            },
            end: {
                offset: 52,
                line: 4,
                character: 5,
            },
        },
        comment: null,
        start: {
            offset: 47,
            line: 4,
            character: 0,
        },
        end: {
            offset: 52,
            line: 4,
            character: 5,
        },
    },
    comment: null,
    start: {
        offset: 24,
        line: 1,
        character: 0,
    },
    end: {
        offset: 52,
        line: 4,
        character: 5,
    },
};
