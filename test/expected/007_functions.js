/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: ';',
    lvalue: {
        kind: 'BinaryExpression',
        operator: ';',
        lvalue: {
            kind: 'BinaryExpression',
            operator: '->',
            lvalue: {
                kind: 'FunctionExpression',
                name: 'func',
                params: [
                    {
                        kind: 'Variable',
                        name: 'param1',
                        start: {
                            offset: 50,
                            line: 2,
                            character: 5,
                        },
                        end: {
                            offset: 56,
                            line: 2,
                            character: 11,
                        },
                    },
                    {
                        kind: 'Variable',
                        name: 'param2',
                        start: {
                            offset: 58,
                            line: 2,
                            character: 13,
                        },
                        end: {
                            offset: 64,
                            line: 2,
                            character: 19,
                        },
                    },
                    {
                        kind: 'FunctionExpression',
                        name: 'outer',
                        params: [
                            {
                                kind: 'Variable',
                                name: 'outer_param',
                                start: {
                                    offset: 72,
                                    line: 2,
                                    character: 27,
                                },
                                end: {
                                    offset: 83,
                                    line: 2,
                                    character: 38,
                                },
                            },
                        ],
                        start: {
                            offset: 66,
                            line: 2,
                            character: 21,
                        },
                        end: {
                            offset: 84,
                            line: 2,
                            character: 39,
                        },
                    },
                ],
                start: {
                    offset: 45,
                    line: 2,
                    character: 0,
                },
                end: {
                    offset: 85,
                    line: 2,
                    character: 40,
                },
            },
            rvalue: {
                kind: 'ParenthesisedExpression',
                value: {
                    kind: 'Constant',
                    name: 'null',
                    start: {
                        offset: 95,
                        line: 3,
                        character: 4,
                    },
                    end: {
                        offset: 100,
                        line: 4,
                        character: 0,
                    },
                },
                start: {
                    offset: 89,
                    line: 2,
                    character: 44,
                },
                end: {
                    offset: 101,
                    line: 4,
                    character: 1,
                },
            },
            comment: '// Function calls and definitions\n// comment\n',
            start: {
                offset: 45,
                line: 2,
                character: 0,
            },
            end: {
                offset: 101,
                line: 4,
                character: 1,
            },
        },
        rvalue: {
            kind: 'FunctionExpression',
            name: 'func',
            params: [
                {
                    kind: 'NumberLiteral',
                    literal: '1',
                    value: 1n,
                    start: {
                        offset: 129,
                        line: 7,
                        character: 5,
                    },
                    end: {
                        offset: 130,
                        line: 7,
                        character: 6,
                    },
                },
                {
                    kind: 'NumberLiteral',
                    literal: '2',
                    value: 2n,
                    start: {
                        offset: 132,
                        line: 7,
                        character: 8,
                    },
                    end: {
                        offset: 133,
                        line: 7,
                        character: 9,
                    },
                },
                null,
            ],
            start: {
                offset: 124,
                line: 7,
                character: 0,
            },
            end: {
                offset: 135,
                line: 7,
                character: 11,
            },
        },
        comment: null,
        start: {
            offset: 45,
            line: 2,
            character: 0,
        },
        end: {
            offset: 135,
            line: 7,
            character: 11,
        },
    },
    rvalue: null,
    comment: '// optional comma ,\n',
    start: {
        offset: 45,
        line: 2,
        character: 0,
    },
    end: {
        offset: 136,
        line: 7,
        character: 12,
    },
};
