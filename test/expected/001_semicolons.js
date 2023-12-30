/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: ';',
    lvalue: {
        kind: 'BinaryExpression',
        operator: ';',
        lvalue: {
            kind: 'ParenthesisedExpression',
            value: {
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
                                kind: 'Constant',
                                name: 'null',
                                start: {
                                    offset: 43,
                                    line: 2,
                                    character: 4,
                                },
                                end: {
                                    offset: 47,
                                    line: 2,
                                    character: 8,
                                },
                            },
                            rvalue: {
                                kind: 'Constant',
                                name: 'null',
                                start: {
                                    offset: 53,
                                    line: 3,
                                    character: 4,
                                },
                                end: {
                                    offset: 57,
                                    line: 3,
                                    character: 8,
                                },
                            },
                            comment: null,
                            start: {
                                offset: 43,
                                line: 2,
                                character: 4,
                            },
                            end: {
                                offset: 57,
                                line: 3,
                                character: 8,
                            },
                        },
                        rvalue: null,
                        comment: null,
                        start: {
                            offset: 43,
                            line: 2,
                            character: 4,
                        },
                        end: {
                            offset: 58,
                            line: 3,
                            character: 9,
                        },
                    },
                    rvalue: null,
                    comment: null,
                    start: {
                        offset: 43,
                        line: 2,
                        character: 4,
                    },
                    end: {
                        offset: 59,
                        line: 3,
                        character: 10,
                    },
                },
                rvalue: null,
                comment: null,
                start: {
                    offset: 43,
                    line: 2,
                    character: 4,
                },
                end: {
                    offset: 60,
                    line: 3,
                    character: 11,
                },
            },
            start: {
                offset: 37,
                line: 1,
                character: 0,
            },
            end: {
                offset: 62,
                line: 4,
                character: 1,
            },
        },
        rvalue: {
            kind: 'FunctionExpression',
            name: 'f',
            params: [
                {
                    kind: 'BinaryExpression',
                    operator: ';',
                    lvalue: {
                        kind: 'Constant',
                        name: 'null',
                        start: {
                            offset: 72,
                            line: 7,
                            character: 4,
                        },
                        end: {
                            offset: 76,
                            line: 7,
                            character: 8,
                        },
                    },
                    rvalue: null,
                    comment: null,
                    start: {
                        offset: 72,
                        line: 7,
                        character: 4,
                    },
                    end: {
                        offset: 77,
                        line: 7,
                        character: 9,
                    },
                },
                {
                    kind: 'BinaryExpression',
                    operator: ';',
                    lvalue: {
                        kind: 'Constant',
                        name: 'null',
                        start: {
                            offset: 83,
                            line: 8,
                            character: 4,
                        },
                        end: {
                            offset: 87,
                            line: 8,
                            character: 8,
                        },
                    },
                    rvalue: null,
                    comment: null,
                    start: {
                        offset: 83,
                        line: 8,
                        character: 4,
                    },
                    end: {
                        offset: 88,
                        line: 8,
                        character: 9,
                    },
                },
                null,
            ],
            start: {
                offset: 65,
                line: 6,
                character: 0,
            },
            end: {
                offset: 91,
                line: 9,
                character: 1,
            },
        },
        comment: null,
        start: {
            offset: 37,
            line: 1,
            character: 0,
        },
        end: {
            offset: 91,
            line: 9,
            character: 1,
        },
    },
    rvalue: null,
    comment: null,
    start: {
        offset: 37,
        line: 1,
        character: 0,
    },
    end: {
        offset: 92,
        line: 9,
        character: 2,
    },
};
