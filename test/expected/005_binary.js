/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: '+',
    lvalue: {
        kind: 'NumberLiteral',
        literal: '1',
        value: 1n,
        start: {
            offset: 35,
            line: 1,
            character: 0,
        },
        end: {
            offset: 36,
            line: 1,
            character: 1,
        },
    },
    rvalue: {
        kind: 'BinaryExpression',
        operator: '%',
        lvalue: {
            kind: 'BinaryExpression',
            operator: '/',
            lvalue: {
                kind: 'BinaryExpression',
                operator: '*',
                lvalue: {
                    kind: 'ParenthesisedExpression',
                    value: {
                        kind: 'BinaryExpression',
                        operator: '+',
                        lvalue: {
                            kind: 'NumberLiteral',
                            literal: '2',
                            value: 2n,
                            start: {
                                offset: 40,
                                line: 1,
                                character: 5,
                            },
                            end: {
                                offset: 41,
                                line: 1,
                                character: 6,
                            },
                        },
                        rvalue: {
                            kind: 'NumberLiteral',
                            literal: '3',
                            value: 3n,
                            start: {
                                offset: 44,
                                line: 1,
                                character: 9,
                            },
                            end: {
                                offset: 45,
                                line: 1,
                                character: 10,
                            },
                        },
                        comment: '// Binary Operator precedence test\n',
                        start: {
                            offset: 40,
                            line: 1,
                            character: 5,
                        },
                        end: {
                            offset: 45,
                            line: 1,
                            character: 10,
                        },
                    },
                    start: {
                        offset: 39,
                        line: 1,
                        character: 4,
                    },
                    end: {
                        offset: 46,
                        line: 1,
                        character: 11,
                    },
                },
                rvalue: {
                    kind: 'BinaryExpression',
                    operator: '^',
                    lvalue: {
                        kind: 'NumberLiteral',
                        literal: '4',
                        value: 4n,
                        start: {
                            offset: 49,
                            line: 1,
                            character: 14,
                        },
                        end: {
                            offset: 50,
                            line: 1,
                            character: 15,
                        },
                    },
                    rvalue: {
                        kind: 'NumberLiteral',
                        literal: '5',
                        value: 5n,
                        start: {
                            offset: 53,
                            line: 1,
                            character: 18,
                        },
                        end: {
                            offset: 54,
                            line: 1,
                            character: 19,
                        },
                    },
                    comment: '// Binary Operator precedence test\n',
                    start: {
                        offset: 49,
                        line: 1,
                        character: 14,
                    },
                    end: {
                        offset: 54,
                        line: 1,
                        character: 19,
                    },
                },
                comment: '// Binary Operator precedence test\n',
                start: {
                    offset: 39,
                    line: 1,
                    character: 4,
                },
                end: {
                    offset: 54,
                    line: 1,
                    character: 19,
                },
            },
            rvalue: {
                kind: 'NumberLiteral',
                literal: '2',
                value: 2n,
                start: {
                    offset: 57,
                    line: 1,
                    character: 22,
                },
                end: {
                    offset: 58,
                    line: 1,
                    character: 23,
                },
            },
            comment: '// Binary Operator precedence test\n',
            start: {
                offset: 39,
                line: 1,
                character: 4,
            },
            end: {
                offset: 58,
                line: 1,
                character: 23,
            },
        },
        rvalue: {
            kind: 'NumberLiteral',
            literal: '3',
            value: 3n,
            start: {
                offset: 61,
                line: 1,
                character: 26,
            },
            end: {
                offset: 62,
                line: 1,
                character: 27,
            },
        },
        comment: '// Binary Operator precedence test\n',
        start: {
            offset: 39,
            line: 1,
            character: 4,
        },
        end: {
            offset: 62,
            line: 1,
            character: 27,
        },
    },
    comment: '// Binary Operator precedence test\n',
    start: {
        offset: 35,
        line: 1,
        character: 0,
    },
    end: {
        offset: 62,
        line: 1,
        character: 27,
    },
};
