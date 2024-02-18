import assert from "assert";
import {Parser} from "../lib/Parser.js";

describe("Operators", function () {
    it("follows binary operators precedences", function () {
        const parser = new Parser("2 + 3 * 4");
        const root = parser.parse();
        assert.strictEqual(parser.diagnostics.length, 0);
        /** @type {import("../lib/Parser.js").BinaryExpression} */
        const expected = {
            kind: "BinaryExpression",
            operator: "+",
            lvalue: {
                kind: "NumberLiteral",
                literal: "2",
                value: {value: 2n, scale: 0n},
                start: {offset: 0, line: 0, character: 0},
                end: {offset: 1, line: 0, character: 1},
            },
            rvalue: {
                kind: "BinaryExpression",
                operator: "*",
                lvalue: {
                    kind: "NumberLiteral",
                    literal: "3",
                    value: {value: 3n, scale: 0n},
                    start: {offset: 4, line: 0, character: 4},
                    end: {offset: 5, line: 0, character: 5},
                },
                rvalue: {
                    kind: "NumberLiteral",
                    literal: "4",
                    value: {value: 4n, scale: 0n},
                    start: {offset: 8, line: 0, character: 8},
                    end: {offset: 9, line: 0, character: 9},
                },
                start: {offset: 4, line: 0, character: 4},
                end: {offset: 9, line: 0, character: 9},
                comment: undefined,
            },
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 9, line: 0, character: 9},
            comment: undefined,
        };
        assert.deepStrictEqual(root, expected);
    });
    it("follows binary and unary operators precedences", function () {
        const parser = new Parser("-a:0 + 3 * 4");
        const root = parser.parse();
        assert.strictEqual(parser.diagnostics.length, 0);
        /** @type {import("../lib/Parser.js").BinaryExpression} */
        const expected = {
            kind: "BinaryExpression",
            operator: "+",
            lvalue: {
                kind: "UnaryExpression",
                operator: "-",
                value: {
                    kind: "BinaryExpression",
                    operator: ":",
                    lvalue: {
                        kind: "Variable",
                        name: "a",
                        start: {offset: 1, line: 0, character: 1},
                        end: {offset: 2, line: 0, character: 2},
                    },
                    rvalue: {
                        kind: "NumberLiteral",
                        literal: "0",
                        value: {value: 0n, scale: 0n},
                        start: {offset: 3, line: 0, character: 3},
                        end: {offset: 4, line: 0, character: 4},
                    },
                    start: {offset: 1, line: 0, character: 1},
                    end: {offset: 4, line: 0, character: 4},
                    comment: undefined,
                },
                start: {offset: 0, line: 0, character: 0},
                end: {offset: 4, line: 0, character: 4},
            },
            rvalue: {
                kind: "BinaryExpression",
                operator: "*",
                lvalue: {
                    kind: "NumberLiteral",
                    literal: "3",
                    value: {value: 3n, scale: 0n},
                    start: {offset: 7, line: 0, character: 7},
                    end: {offset: 8, line: 0, character: 8},
                },
                rvalue: {
                    kind: "NumberLiteral",
                    literal: "4",
                    value: {value: 4n, scale: 0n},
                    start: {offset: 11, line: 0, character: 11},
                    end: {offset: 12, line: 0, character: 12},
                },
                start: {offset: 7, line: 0, character: 7},
                end: {offset: 12, line: 0, character: 12},
                comment: undefined,
            },
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 12, line: 0, character: 12},
            comment: undefined,
        };
        assert.deepStrictEqual(root, expected);
    });
});
