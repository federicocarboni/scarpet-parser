/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @returns {import('./Parser.js').Node | undefined}
 */
export function getNodeAt(node, offset) {
    if (node.start.offset <= offset && node.end.offset > offset) {
        switch (node.kind) {
            case 'Constant':
            case 'Variable':
            case 'HexLiteral':
            case 'NumberLiteral':
            case 'StringLiteral':
                return node;
            case 'FunctionDeclaration': {
                const sig = getNodeAt(node.signature, offset);
                if (sig !== void 0) return sig;
                if (node.body !== void 0) return getNodeAt(node.body, offset);
                break;
            }
            case 'FunctionExpression':
                if (
                    node.name !== null &&
                    node.name.start.offset <= offset &&
                    node.name.end.offset > offset
                ) {
                    return node;
                }
            // fallthrough
            case 'MapLiteral':
            case 'ListLiteral':
                for (const param of node.params) {
                    if (param === null) continue;
                    const node = getNodeAt(param, offset);
                    if (node !== void 0) return node;
                }
                break;
            case 'BinaryExpression': {
                const l = getNodeAt(node.lvalue, offset);
                if (l !== void 0 || node.rvalue === void 0) return l;
                const r = getNodeAt(node.rvalue, offset);
                if (r !== void 0) return r;
                break;
            }
            case 'ParenthesisedExpression':
            case 'UnaryExpression':
                if (node.value !== void 0) return getNodeAt(node.value, offset);
                break;
        }
    }
    return void 0;
}
