export const diagnostics = [
    {
        code: 10,
        range: {
            start: {
                offset: 72,
                line: 5,
                character: 1,
            },
            end: {
                offset: 73,
                line: 5,
                character: 2,
            },
        },
    },
    {
        code: 10,
        range: {
            start: {
                offset: 105,
                line: 9,
                character: 1,
            },
            end: {
                offset: 106,
                line: 9,
                character: 2,
            },
        },
    },
];

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
                    kind: 'MapLiteral',
                    params: [
                        {
                            kind: 'BinaryExpression',
                            operator: '->',
                            lvalue: {
                                kind: 'StringLiteral',
                                literal: "'key1'",
                                value: 'key1',
                                start: {
                                    offset: 24,
                                    line: 2,
                                    character: 4,
                                },
                                end: {
                                    offset: 30,
                                    line: 2,
                                    character: 10,
                                },
                            },
                            rvalue: {
                                kind: 'StringLiteral',
                                literal: "'value1'",
                                value: 'value1',
                                start: {
                                    offset: 34,
                                    line: 2,
                                    character: 14,
                                },
                                end: {
                                    offset: 42,
                                    line: 2,
                                    character: 22,
                                },
                            },
                            comment: null,
                            start: {
                                offset: 24,
                                line: 2,
                                character: 4,
                            },
                            end: {
                                offset: 42,
                                line: 2,
                                character: 22,
                            },
                        },
                        {
                            kind: 'BinaryExpression',
                            operator: '->',
                            lvalue: {
                                kind: 'StringLiteral',
                                literal: "'key2'",
                                value: 'key2',
                                start: {
                                    offset: 48,
                                    line: 3,
                                    character: 4,
                                },
                                end: {
                                    offset: 54,
                                    line: 3,
                                    character: 10,
                                },
                            },
                            rvalue: {
                                kind: 'StringLiteral',
                                literal: "'value2'",
                                value: 'value2',
                                start: {
                                    offset: 58,
                                    line: 3,
                                    character: 14,
                                },
                                end: {
                                    offset: 66,
                                    line: 3,
                                    character: 22,
                                },
                            },
                            comment: null,
                            start: {
                                offset: 48,
                                line: 3,
                                character: 4,
                            },
                            end: {
                                offset: 66,
                                line: 3,
                                character: 22,
                            },
                        },
                        null,
                    ],
                    start: {
                        offset: 18,
                        line: 1,
                        character: 0,
                    },
                    end: {
                        offset: 69,
                        line: 4,
                        character: 1,
                    },
                },
                rvalue: {
                    kind: 'MapLiteral',
                    params: [null],
                    start: {
                        offset: 71,
                        line: 5,
                        character: 0,
                    },
                    end: {
                        offset: 73,
                        line: 5,
                        character: 2,
                    },
                },
                comment: null,
                start: {
                    offset: 18,
                    line: 1,
                    character: 0,
                },
                end: {
                    offset: 73,
                    line: 5,
                    character: 2,
                },
            },
            rvalue: {
                kind: 'ListLiteral',
                params: [
                    {
                        kind: 'StringLiteral',
                        literal: "'value1'",
                        value: 'value1',
                        start: {
                            offset: 81,
                            line: 7,
                            character: 4,
                        },
                        end: {
                            offset: 89,
                            line: 7,
                            character: 12,
                        },
                    },
                    {
                        kind: 'StringLiteral',
                        literal: "'value2'",
                        value: 'value2',
                        start: {
                            offset: 91,
                            line: 7,
                            character: 14,
                        },
                        end: {
                            offset: 99,
                            line: 7,
                            character: 22,
                        },
                    },
                    null,
                ],
                start: {
                    offset: 75,
                    line: 6,
                    character: 0,
                },
                end: {
                    offset: 102,
                    line: 8,
                    character: 1,
                },
            },
            comment: null,
            start: {
                offset: 18,
                line: 1,
                character: 0,
            },
            end: {
                offset: 102,
                line: 8,
                character: 1,
            },
        },
        rvalue: {
            kind: 'ListLiteral',
            params: [null],
            start: {
                offset: 104,
                line: 9,
                character: 0,
            },
            end: {
                offset: 106,
                line: 9,
                character: 2,
            },
        },
        comment: null,
        start: {
            offset: 18,
            line: 1,
            character: 0,
        },
        end: {
            offset: 106,
            line: 9,
            character: 2,
        },
    },
    rvalue: null,
    comment: null,
    start: {
        offset: 18,
        line: 1,
        character: 0,
    },
    end: {
        offset: 107,
        line: 9,
        character: 3,
    },
};
