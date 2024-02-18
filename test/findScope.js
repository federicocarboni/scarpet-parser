import assert from "assert";
import {findAllVariableReferences} from "../lib/findAllReferences.js";
import {findScope} from "../lib/findScope.js";
import {findReachableVariables, getNodeAt, parseScript} from "../lib/lib.js";

describe("Find references", function () {
    it("findReachableVariables", function () {
        const root = parseScript("f(x) -> (g = 2;x=2;x=2;null);f1(x) -> null;f2(x) -> null;");
        if (root === undefined) assert(false);
        /** @type {import("../lib/Parser.js").FunctionDeclaration[]} */
        const decl = [];
        findScope(root, 19, decl);
        console.log(findReachableVariables(root, 19));
    });
    it("findAllReferences", function () {
        const ast = parseScript(`\
name = 2;
print(name);
x = name;
f(outer(name)) -> print(name);
`);
        assert(ast);
        const reference = getNodeAt(ast, 2);
        assert(reference);
        assert(reference.kind === "Variable");
        const references = findAllVariableReferences(ast, reference);
        console.log(references);
    });
});
