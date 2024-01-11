/**
 * @param {import('./Parser.js').Node} node
 * @returns {import('./Parser.js').Node | undefined}
 */
export function resolveExpression(node) {
    switch (node.kind) {
        case 'BinaryExpression':
            if (node.operator === ';') {
                return node.rvalue !== void 0
                    ? resolveExpression(node.rvalue)
                    : resolveExpression(node.lvalue);
            }
            return node;
        case 'ParenthesisedExpression':
            if (node.value !== void 0) return resolveExpression(node.value);
            return void 0;
        default:
            return node;
    }
}
