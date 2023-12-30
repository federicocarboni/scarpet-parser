/** @type {import('../../lib/Parser.js').Node} */
export const root = {
    kind: 'BinaryExpression',
    operator: '&&',
    lvalue: {
        kind: 'UnaryExpression',
        operator: '!',
        value: {
            kind: 'BinaryExpression',
            operator: ':',
            lvalue: {
                kind: 'Variable',
                name: 'id',
                start: {
                    offset: 35,
                    line: 1,
                    character: 1,
                },
                end: {
                    offset: 37,
                    line: 1,
                    character: 3,
                },
            },
            rvalue: {
                kind: 'Variable',
                name: 'attr',
                start: {
                    offset: 38,
                    line: 1,
                    character: 4,
                },
                end: {
                    offset: 43,
                    line: 1,
                    character: 9,
                },
            },
            comment: '// Unary Operator precedence test\n',
            start: {
                offset: 35,
                line: 1,
                character: 1,
            },
            end: {
                offset: 43,
                line: 1,
                character: 9,
            },
        },
        start: {
            offset: 34,
            line: 1,
            character: 0,
        },
        end: {
            offset: 43,
            line: 1,
            character: 9,
        },
    },
    rvalue: {
        kind: 'Constant',
        name: 'true',
        start: {
            offset: 46,
            line: 1,
            character: 12,
        },
        end: {
            offset: 50,
            line: 1,
            character: 16,
        },
    },
    comment: '// Unary Operator precedence test\n',
    start: {
        offset: 34,
        line: 1,
        character: 0,
    },
    end: {
        offset: 50,
        line: 1,
        character: 16,
    },
};
