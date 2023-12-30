/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: ';',
    lvalue: {
        kind: 'BinaryExpression',
        operator: '->',
        lvalue: {
            kind: 'FunctionExpression',
            name: '__config',
            params: [null],
            start: {
                offset: 66,
                line: 3,
                character: 0,
            },
            end: {
                offset: 76,
                line: 3,
                character: 10,
            },
        },
        rvalue: {
            kind: 'ParenthesisedExpression',
            value: {
                kind: 'FunctionExpression',
                name: 'm',
                params: [
                    {
                        kind: 'FunctionExpression',
                        name: 'l',
                        params: [
                            {
                                kind: 'StringLiteral',
                                literal: "'stay_loaded'",
                                value: 'stay_loaded',
                                start: {
                                    offset: 96,
                                    line: 5,
                                    character: 8,
                                },
                                end: {
                                    offset: 109,
                                    line: 5,
                                    character: 21,
                                },
                            },
                            {
                                kind: 'StringLiteral',
                                literal: "'true'",
                                value: 'true',
                                start: {
                                    offset: 110,
                                    line: 5,
                                    character: 22,
                                },
                                end: {
                                    offset: 116,
                                    line: 5,
                                    character: 28,
                                },
                            },
                        ],
                        start: {
                            offset: 94,
                            line: 5,
                            character: 6,
                        },
                        end: {
                            offset: 117,
                            line: 5,
                            character: 29,
                        },
                    },
                ],
                start: {
                    offset: 85,
                    line: 4,
                    character: 3,
                },
                end: {
                    offset: 122,
                    line: 6,
                    character: 4,
                },
            },
            start: {
                offset: 80,
                line: 3,
                character: 14,
            },
            end: {
                offset: 124,
                line: 7,
                character: 1,
            },
        },
        comment: '// stay loaded\n',
        start: {
            offset: 66,
            line: 3,
            character: 0,
        },
        end: {
            offset: 124,
            line: 7,
            character: 1,
        },
    },
    rvalue: {
        kind: 'BinaryExpression',
        operator: '->',
        lvalue: {
            kind: 'FunctionExpression',
            name: '__on_player_dies',
            params: [
                {
                    kind: 'Variable',
                    name: 'player',
                    start: {
                        offset: 144,
                        line: 9,
                        character: 17,
                    },
                    end: {
                        offset: 150,
                        line: 9,
                        character: 23,
                    },
                },
            ],
            start: {
                offset: 127,
                line: 9,
                character: 0,
            },
            end: {
                offset: 151,
                line: 9,
                character: 24,
            },
        },
        rvalue: {
            kind: 'ParenthesisedExpression',
            value: {
                kind: 'BinaryExpression',
                operator: ';',
                lvalue: {
                    kind: 'FunctionExpression',
                    name: 'if',
                    params: [
                        {
                            kind: 'BinaryExpression',
                            operator: '<=',
                            lvalue: {
                                kind: 'FunctionExpression',
                                name: 'rand',
                                params: [
                                    {
                                        kind: 'NumberLiteral',
                                        literal: '1',
                                        value: 1n,
                                        start: {
                                            offset: 167,
                                            line: 10,
                                            character: 10,
                                        },
                                        end: {
                                            offset: 168,
                                            line: 10,
                                            character: 11,
                                        },
                                    },
                                ],
                                start: {
                                    offset: 162,
                                    line: 10,
                                    character: 5,
                                },
                                end: {
                                    offset: 169,
                                    line: 10,
                                    character: 12,
                                },
                            },
                            rvalue: {
                                kind: 'NumberLiteral',
                                literal: '0.3',
                                value: 0.3,
                                start: {
                                    offset: 173,
                                    line: 10,
                                    character: 16,
                                },
                                end: {
                                    offset: 176,
                                    line: 10,
                                    character: 19,
                                },
                            },
                            comment: null,
                            start: {
                                offset: 162,
                                line: 10,
                                character: 5,
                            },
                            end: {
                                offset: 176,
                                line: 10,
                                character: 19,
                            },
                        },
                        {
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
                                            kind: 'BinaryExpression',
                                            operator: ';',
                                            lvalue: {
                                                kind: 'BinaryExpression',
                                                operator: ';',
                                                lvalue: {
                                                    kind: 'BinaryExpression',
                                                    operator: '=',
                                                    lvalue: {
                                                        kind: 'Variable',
                                                        name: 'xv',
                                                        start: {
                                                            offset: 182,
                                                            line: 11,
                                                            character: 4,
                                                        },
                                                        end: {
                                                            offset: 185,
                                                            line: 11,
                                                            character: 7,
                                                        },
                                                    },
                                                    rvalue: {
                                                        kind: 'BinaryExpression',
                                                        operator: '-',
                                                        lvalue: {
                                                            kind: 'FunctionExpression',
                                                            name: 'rand',
                                                            params: [
                                                                {
                                                                    kind: 'NumberLiteral',
                                                                    literal: '0.5',
                                                                    value: 0.5,
                                                                    start: {
                                                                        offset: 192,
                                                                        line: 11,
                                                                        character: 14,
                                                                    },
                                                                    end: {
                                                                        offset: 195,
                                                                        line: 11,
                                                                        character: 17,
                                                                    },
                                                                },
                                                            ],
                                                            start: {
                                                                offset: 187,
                                                                line: 11,
                                                                character: 9,
                                                            },
                                                            end: {
                                                                offset: 196,
                                                                line: 11,
                                                                character: 18,
                                                            },
                                                        },
                                                        rvalue: {
                                                            kind: 'NumberLiteral',
                                                            literal: '0.25',
                                                            value: 0.25,
                                                            start: {
                                                                offset: 197,
                                                                line: 11,
                                                                character: 19,
                                                            },
                                                            end: {
                                                                offset: 201,
                                                                line: 11,
                                                                character: 23,
                                                            },
                                                        },
                                                        comment: null,
                                                        start: {
                                                            offset: 187,
                                                            line: 11,
                                                            character: 9,
                                                        },
                                                        end: {
                                                            offset: 201,
                                                            line: 11,
                                                            character: 23,
                                                        },
                                                    },
                                                    comment: null,
                                                    start: {
                                                        offset: 182,
                                                        line: 11,
                                                        character: 4,
                                                    },
                                                    end: {
                                                        offset: 201,
                                                        line: 11,
                                                        character: 23,
                                                    },
                                                },
                                                rvalue: {
                                                    kind: 'BinaryExpression',
                                                    operator: '=',
                                                    lvalue: {
                                                        kind: 'Variable',
                                                        name: 'yv',
                                                        start: {
                                                            offset: 207,
                                                            line: 12,
                                                            character: 4,
                                                        },
                                                        end: {
                                                            offset: 210,
                                                            line: 12,
                                                            character: 7,
                                                        },
                                                    },
                                                    rvalue: {
                                                        kind: 'FunctionExpression',
                                                        name: 'rand',
                                                        params: [
                                                            {
                                                                kind: 'NumberLiteral',
                                                                literal: '0.5',
                                                                value: 0.5,
                                                                start: {
                                                                    offset: 217,
                                                                    line: 12,
                                                                    character: 14,
                                                                },
                                                                end: {
                                                                    offset: 220,
                                                                    line: 12,
                                                                    character: 17,
                                                                },
                                                            },
                                                        ],
                                                        start: {
                                                            offset: 212,
                                                            line: 12,
                                                            character: 9,
                                                        },
                                                        end: {
                                                            offset: 221,
                                                            line: 12,
                                                            character: 18,
                                                        },
                                                    },
                                                    comment: null,
                                                    start: {
                                                        offset: 207,
                                                        line: 12,
                                                        character: 4,
                                                    },
                                                    end: {
                                                        offset: 221,
                                                        line: 12,
                                                        character: 18,
                                                    },
                                                },
                                                comment: null,
                                                start: {
                                                    offset: 182,
                                                    line: 11,
                                                    character: 4,
                                                },
                                                end: {
                                                    offset: 221,
                                                    line: 12,
                                                    character: 18,
                                                },
                                            },
                                            rvalue: {
                                                kind: 'BinaryExpression',
                                                operator: '=',
                                                lvalue: {
                                                    kind: 'Variable',
                                                    name: 'zv',
                                                    start: {
                                                        offset: 227,
                                                        line: 13,
                                                        character: 4,
                                                    },
                                                    end: {
                                                        offset: 230,
                                                        line: 13,
                                                        character: 7,
                                                    },
                                                },
                                                rvalue: {
                                                    kind: 'BinaryExpression',
                                                    operator: '-',
                                                    lvalue: {
                                                        kind: 'FunctionExpression',
                                                        name: 'rand',
                                                        params: [
                                                            {
                                                                kind: 'NumberLiteral',
                                                                literal: '0.5',
                                                                value: 0.5,
                                                                start: {
                                                                    offset: 237,
                                                                    line: 13,
                                                                    character: 14,
                                                                },
                                                                end: {
                                                                    offset: 240,
                                                                    line: 13,
                                                                    character: 17,
                                                                },
                                                            },
                                                        ],
                                                        start: {
                                                            offset: 232,
                                                            line: 13,
                                                            character: 9,
                                                        },
                                                        end: {
                                                            offset: 241,
                                                            line: 13,
                                                            character: 18,
                                                        },
                                                    },
                                                    rvalue: {
                                                        kind: 'NumberLiteral',
                                                        literal: '0.25',
                                                        value: 0.25,
                                                        start: {
                                                            offset: 242,
                                                            line: 13,
                                                            character: 19,
                                                        },
                                                        end: {
                                                            offset: 246,
                                                            line: 13,
                                                            character: 23,
                                                        },
                                                    },
                                                    comment: null,
                                                    start: {
                                                        offset: 232,
                                                        line: 13,
                                                        character: 9,
                                                    },
                                                    end: {
                                                        offset: 246,
                                                        line: 13,
                                                        character: 23,
                                                    },
                                                },
                                                comment: null,
                                                start: {
                                                    offset: 227,
                                                    line: 13,
                                                    character: 4,
                                                },
                                                end: {
                                                    offset: 246,
                                                    line: 13,
                                                    character: 23,
                                                },
                                            },
                                            comment: null,
                                            start: {
                                                offset: 182,
                                                line: 11,
                                                character: 4,
                                            },
                                            end: {
                                                offset: 246,
                                                line: 13,
                                                character: 23,
                                            },
                                        },
                                        rvalue: {
                                            kind: 'BinaryExpression',
                                            operator: '=',
                                            lvalue: {
                                                kind: 'Variable',
                                                name: 'motion',
                                                start: {
                                                    offset: 253,
                                                    line: 15,
                                                    character: 4,
                                                },
                                                end: {
                                                    offset: 260,
                                                    line: 15,
                                                    character: 11,
                                                },
                                            },
                                            rvalue: {
                                                kind: 'BinaryExpression',
                                                operator: '+',
                                                lvalue: {
                                                    kind: 'BinaryExpression',
                                                    operator: '+',
                                                    lvalue: {
                                                        kind: 'BinaryExpression',
                                                        operator: '+',
                                                        lvalue: {
                                                            kind: 'BinaryExpression',
                                                            operator: '+',
                                                            lvalue: {
                                                                kind: 'BinaryExpression',
                                                                operator: '+',
                                                                lvalue: {
                                                                    kind: 'BinaryExpression',
                                                                    operator: '+',
                                                                    lvalue: {
                                                                        kind: 'BinaryExpression',
                                                                        operator: '+',
                                                                        lvalue: {
                                                                            kind: 'StringLiteral',
                                                                            literal: "'['",
                                                                            value: '[',
                                                                            start: {
                                                                                offset: 262,
                                                                                line: 15,
                                                                                character: 13,
                                                                            },
                                                                            end: {
                                                                                offset: 265,
                                                                                line: 15,
                                                                                character: 16,
                                                                            },
                                                                        },
                                                                        rvalue: {
                                                                            kind: 'Variable',
                                                                            name: 'xv',
                                                                            start: {
                                                                                offset: 268,
                                                                                line: 15,
                                                                                character: 19,
                                                                            },
                                                                            end: {
                                                                                offset: 271,
                                                                                line: 15,
                                                                                character: 22,
                                                                            },
                                                                        },
                                                                        comment: null,
                                                                        start: {
                                                                            offset: 262,
                                                                            line: 15,
                                                                            character: 13,
                                                                        },
                                                                        end: {
                                                                            offset: 271,
                                                                            line: 15,
                                                                            character: 22,
                                                                        },
                                                                    },
                                                                    rvalue: {
                                                                        kind: 'StringLiteral',
                                                                        literal: "'d, '",
                                                                        value: 'd, ',
                                                                        start: {
                                                                            offset: 273,
                                                                            line: 15,
                                                                            character: 24,
                                                                        },
                                                                        end: {
                                                                            offset: 278,
                                                                            line: 15,
                                                                            character: 29,
                                                                        },
                                                                    },
                                                                    comment: null,
                                                                    start: {
                                                                        offset: 262,
                                                                        line: 15,
                                                                        character: 13,
                                                                    },
                                                                    end: {
                                                                        offset: 278,
                                                                        line: 15,
                                                                        character: 29,
                                                                    },
                                                                },
                                                                rvalue: {
                                                                    kind: 'Variable',
                                                                    name: 'yv',
                                                                    start: {
                                                                        offset: 281,
                                                                        line: 15,
                                                                        character: 32,
                                                                    },
                                                                    end: {
                                                                        offset: 284,
                                                                        line: 15,
                                                                        character: 35,
                                                                    },
                                                                },
                                                                comment: null,
                                                                start: {
                                                                    offset: 262,
                                                                    line: 15,
                                                                    character: 13,
                                                                },
                                                                end: {
                                                                    offset: 284,
                                                                    line: 15,
                                                                    character: 35,
                                                                },
                                                            },
                                                            rvalue: {
                                                                kind: 'StringLiteral',
                                                                literal: "'d, '",
                                                                value: 'd, ',
                                                                start: {
                                                                    offset: 286,
                                                                    line: 15,
                                                                    character: 37,
                                                                },
                                                                end: {
                                                                    offset: 291,
                                                                    line: 15,
                                                                    character: 42,
                                                                },
                                                            },
                                                            comment: null,
                                                            start: {
                                                                offset: 262,
                                                                line: 15,
                                                                character: 13,
                                                            },
                                                            end: {
                                                                offset: 291,
                                                                line: 15,
                                                                character: 42,
                                                            },
                                                        },
                                                        rvalue: {
                                                            kind: 'Variable',
                                                            name: 'zv',
                                                            start: {
                                                                offset: 294,
                                                                line: 15,
                                                                character: 45,
                                                            },
                                                            end: {
                                                                offset: 297,
                                                                line: 15,
                                                                character: 48,
                                                            },
                                                        },
                                                        comment: null,
                                                        start: {
                                                            offset: 262,
                                                            line: 15,
                                                            character: 13,
                                                        },
                                                        end: {
                                                            offset: 297,
                                                            line: 15,
                                                            character: 48,
                                                        },
                                                    },
                                                    rvalue: {
                                                        kind: 'StringLiteral',
                                                        literal: "'d'",
                                                        value: 'd',
                                                        start: {
                                                            offset: 299,
                                                            line: 15,
                                                            character: 50,
                                                        },
                                                        end: {
                                                            offset: 302,
                                                            line: 15,
                                                            character: 53,
                                                        },
                                                    },
                                                    comment: null,
                                                    start: {
                                                        offset: 262,
                                                        line: 15,
                                                        character: 13,
                                                    },
                                                    end: {
                                                        offset: 302,
                                                        line: 15,
                                                        character: 53,
                                                    },
                                                },
                                                rvalue: {
                                                    kind: 'StringLiteral',
                                                    literal: "']'",
                                                    value: ']',
                                                    start: {
                                                        offset: 305,
                                                        line: 15,
                                                        character: 56,
                                                    },
                                                    end: {
                                                        offset: 308,
                                                        line: 15,
                                                        character: 59,
                                                    },
                                                },
                                                comment: null,
                                                start: {
                                                    offset: 262,
                                                    line: 15,
                                                    character: 13,
                                                },
                                                end: {
                                                    offset: 308,
                                                    line: 15,
                                                    character: 59,
                                                },
                                            },
                                            comment: null,
                                            start: {
                                                offset: 253,
                                                line: 15,
                                                character: 4,
                                            },
                                            end: {
                                                offset: 308,
                                                line: 15,
                                                character: 59,
                                            },
                                        },
                                        comment: null,
                                        start: {
                                            offset: 182,
                                            line: 11,
                                            character: 4,
                                        },
                                        end: {
                                            offset: 308,
                                            line: 15,
                                            character: 59,
                                        },
                                    },
                                    rvalue: {
                                        kind: 'BinaryExpression',
                                        operator: '=',
                                        lvalue: {
                                            kind: 'Variable',
                                            name: 'data',
                                            start: {
                                                offset: 314,
                                                line: 16,
                                                character: 4,
                                            },
                                            end: {
                                                offset: 319,
                                                line: 16,
                                                character: 9,
                                            },
                                        },
                                        rvalue: {
                                            kind: 'BinaryExpression',
                                            operator: '+',
                                            lvalue: {
                                                kind: 'BinaryExpression',
                                                operator: '+',
                                                lvalue: {
                                                    kind: 'BinaryExpression',
                                                    operator: '+',
                                                    lvalue: {
                                                        kind: 'BinaryExpression',
                                                        operator: '+',
                                                        lvalue: {
                                                            kind: 'StringLiteral',
                                                            literal: "'{Motion: '",
                                                            value: '{Motion: ',
                                                            start: {
                                                                offset: 321,
                                                                line: 16,
                                                                character: 11,
                                                            },
                                                            end: {
                                                                offset: 332,
                                                                line: 16,
                                                                character: 22,
                                                            },
                                                        },
                                                        rvalue: {
                                                            kind: 'Variable',
                                                            name: 'motion',
                                                            start: {
                                                                offset: 335,
                                                                line: 16,
                                                                character: 25,
                                                            },
                                                            end: {
                                                                offset: 342,
                                                                line: 16,
                                                                character: 32,
                                                            },
                                                        },
                                                        comment: null,
                                                        start: {
                                                            offset: 321,
                                                            line: 16,
                                                            character: 11,
                                                        },
                                                        end: {
                                                            offset: 342,
                                                            line: 16,
                                                            character: 32,
                                                        },
                                                    },
                                                    rvalue: {
                                                        kind: 'StringLiteral',
                                                        literal:
                                                            '\', Item: {id: "minecraft:player_head", Count:1b, tag:{SkullOwner: "\'',
                                                        value: ', Item: {id: "minecraft:player_head", Count:1b, tag:{SkullOwner: "',
                                                        start: {
                                                            offset: 344,
                                                            line: 16,
                                                            character: 34,
                                                        },
                                                        end: {
                                                            offset: 412,
                                                            line: 16,
                                                            character: 102,
                                                        },
                                                    },
                                                    comment: null,
                                                    start: {
                                                        offset: 321,
                                                        line: 16,
                                                        character: 11,
                                                    },
                                                    end: {
                                                        offset: 412,
                                                        line: 16,
                                                        character: 102,
                                                    },
                                                },
                                                rvalue: {
                                                    kind: 'Variable',
                                                    name: 'player',
                                                    start: {
                                                        offset: 415,
                                                        line: 16,
                                                        character: 105,
                                                    },
                                                    end: {
                                                        offset: 422,
                                                        line: 16,
                                                        character: 112,
                                                    },
                                                },
                                                comment: null,
                                                start: {
                                                    offset: 321,
                                                    line: 16,
                                                    character: 11,
                                                },
                                                end: {
                                                    offset: 422,
                                                    line: 16,
                                                    character: 112,
                                                },
                                            },
                                            rvalue: {
                                                kind: 'StringLiteral',
                                                literal: "'\"}}}, PickupDelay: 3s'",
                                                value: '"}}}, PickupDelay: 3s',
                                                start: {
                                                    offset: 424,
                                                    line: 16,
                                                    character: 114,
                                                },
                                                end: {
                                                    offset: 447,
                                                    line: 16,
                                                    character: 137,
                                                },
                                            },
                                            comment: null,
                                            start: {
                                                offset: 321,
                                                line: 16,
                                                character: 11,
                                            },
                                            end: {
                                                offset: 447,
                                                line: 16,
                                                character: 137,
                                            },
                                        },
                                        comment: null,
                                        start: {
                                            offset: 314,
                                            line: 16,
                                            character: 4,
                                        },
                                        end: {
                                            offset: 447,
                                            line: 16,
                                            character: 137,
                                        },
                                    },
                                    comment: null,
                                    start: {
                                        offset: 182,
                                        line: 11,
                                        character: 4,
                                    },
                                    end: {
                                        offset: 447,
                                        line: 16,
                                        character: 137,
                                    },
                                },
                                rvalue: {
                                    kind: 'FunctionExpression',
                                    name: 'spawn',
                                    params: [
                                        {
                                            kind: 'StringLiteral',
                                            literal: "'item'",
                                            value: 'item',
                                            start: {
                                                offset: 459,
                                                line: 17,
                                                character: 10,
                                            },
                                            end: {
                                                offset: 465,
                                                line: 17,
                                                character: 16,
                                            },
                                        },
                                        {
                                            kind: 'FunctionExpression',
                                            name: 'pos',
                                            params: [
                                                {
                                                    kind: 'Variable',
                                                    name: 'player',
                                                    start: {
                                                        offset: 471,
                                                        line: 17,
                                                        character: 22,
                                                    },
                                                    end: {
                                                        offset: 477,
                                                        line: 17,
                                                        character: 28,
                                                    },
                                                },
                                            ],
                                            start: {
                                                offset: 467,
                                                line: 17,
                                                character: 18,
                                            },
                                            end: {
                                                offset: 478,
                                                line: 17,
                                                character: 29,
                                            },
                                        },
                                        {
                                            kind: 'Variable',
                                            name: 'data',
                                            start: {
                                                offset: 480,
                                                line: 17,
                                                character: 31,
                                            },
                                            end: {
                                                offset: 484,
                                                line: 17,
                                                character: 35,
                                            },
                                        },
                                    ],
                                    start: {
                                        offset: 453,
                                        line: 17,
                                        character: 4,
                                    },
                                    end: {
                                        offset: 485,
                                        line: 17,
                                        character: 36,
                                    },
                                },
                                comment: null,
                                start: {
                                    offset: 182,
                                    line: 11,
                                    character: 4,
                                },
                                end: {
                                    offset: 485,
                                    line: 17,
                                    character: 36,
                                },
                            },
                            rvalue: null,
                            comment: null,
                            start: {
                                offset: 182,
                                line: 11,
                                character: 4,
                            },
                            end: {
                                offset: 486,
                                line: 17,
                                character: 37,
                            },
                        },
                    ],
                    start: {
                        offset: 159,
                        line: 10,
                        character: 2,
                    },
                    end: {
                        offset: 490,
                        line: 18,
                        character: 3,
                    },
                },
                rvalue: null,
                comment: null,
                start: {
                    offset: 159,
                    line: 10,
                    character: 2,
                },
                end: {
                    offset: 491,
                    line: 18,
                    character: 4,
                },
            },
            start: {
                offset: 155,
                line: 9,
                character: 28,
            },
            end: {
                offset: 493,
                line: 19,
                character: 1,
            },
        },
        comment: null,
        start: {
            offset: 127,
            line: 9,
            character: 0,
        },
        end: {
            offset: 493,
            line: 19,
            character: 1,
        },
    },
    comment: null,
    start: {
        offset: 66,
        line: 3,
        character: 0,
    },
    end: {
        offset: 493,
        line: 19,
        character: 1,
    },
};
