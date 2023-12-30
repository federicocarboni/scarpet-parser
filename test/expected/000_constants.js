import {Diagnostic} from '../../lib/diagnostic.js';

/** @type {Diagnostic[]} */
export const errors = [];

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
                    kind: 'Constant',
                    name: 'euler',
                    start: {
                        offset: 4,
                        line: 1,
                        character: 0,
                    },
                    end: {
                        offset: 9,
                        line: 1,
                        character: 5,
                    },
                },
                rvalue: {
                    kind: 'Constant',
                    name: 'pi',
                    start: {
                        offset: 10,
                        line: 1,
                        character: 6,
                    },
                    end: {
                        offset: 12,
                        line: 1,
                        character: 8,
                    },
                },
                comment: '// \n',
                start: {
                    offset: 4,
                    line: 1,
                    character: 0,
                },
                end: {
                    offset: 12,
                    line: 1,
                    character: 8,
                },
            },
            rvalue: {
                kind: 'Constant',
                name: 'null',
                start: {
                    offset: 13,
                    line: 1,
                    character: 9,
                },
                end: {
                    offset: 17,
                    line: 1,
                    character: 13,
                },
            },
            comment: '// \n',
            start: {
                offset: 4,
                line: 1,
                character: 0,
            },
            end: {
                offset: 17,
                line: 1,
                character: 13,
            },
        },
        rvalue: {
            kind: 'Constant',
            name: 'true',
            start: {
                offset: 18,
                line: 1,
                character: 14,
            },
            end: {
                offset: 22,
                line: 1,
                character: 18,
            },
        },
        comment: '// \n',
        start: {
            offset: 4,
            line: 1,
            character: 0,
        },
        end: {
            offset: 22,
            line: 1,
            character: 18,
        },
    },
    rvalue: {
        kind: 'Constant',
        name: 'false',
        start: {
            offset: 23,
            line: 1,
            character: 19,
        },
        end: {
            offset: 28,
            line: 1,
            character: 24,
        },
    },
    comment: '// \n',
    start: {
        offset: 4,
        line: 1,
        character: 0,
    },
    end: {
        offset: 28,
        line: 1,
        character: 24,
    },
};
