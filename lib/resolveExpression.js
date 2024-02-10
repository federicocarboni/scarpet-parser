/**
 * Certain aspects of the Scarpet language allow arbitrary expression where most other programming
 * languages only accept identifiers, or other specific tokens. This function resolves an expression
 * down to its 'result' node.
 *
 * @param {import('./Parser.js').Node} node
 * @returns {import('./Parser.js').Node | undefined} The result node of the expression (i.e. the
 *   last expression in a ; binary expression). `undefined` is returned if the node is an empty
 *   expression (a syntax error).
 */
export function resolveExpression(node) {
    switch (node.kind) {
        case "BinaryExpression":
            if (node.operator === ";") {
                return node.rvalue !== undefined
                    ? resolveExpression(node.rvalue)
                    : resolveExpression(node.lvalue);
            }
            return node;
        case "ParenthesisedExpression":
            if (node.value !== undefined) return resolveExpression(node.value);
            return undefined;
        default:
            return node;
    }
}
