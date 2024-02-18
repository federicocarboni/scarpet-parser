import assert from "assert";
import {Parser} from "../lib/Parser.js";

describe("Function expressions", function () {
    it("parses function expressions", function () {
        const parser = new Parser("func(,,x,,y,,)");
        const root = parser.parse();
        /** @type {import("../lib/Parser.js").FunctionExpression} */
        const expected = {
            kind: "FunctionExpression",
            params: [
                {
                    kind: "Variable",
                    name: "x",
                    start: {offset: 7, line: 0, character: 7},
                    end: {offset: 8, line: 0, character: 8},
                },
                {
                    kind: "Variable",
                    name: "y",
                    start: {offset: 10, line: 0, character: 10},
                    end: {offset: 11, line: 0, character: 11},
                },
            ],
            name: {
                value: "func",
                start: {offset: 0, line: 0, character: 0},
                end: {offset: 4, line: 0, character: 4},
            },
            start: {offset: 0, line: 0, character: 0},
            end: {offset: 14, line: 0, character: 14},
        };
        assert.deepStrictEqual(root, expected);
    });
});
