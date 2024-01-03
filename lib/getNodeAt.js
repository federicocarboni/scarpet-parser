/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @returns {import('./Parser').Node | undefined}
 */
export function getNodeAt(node, offset) {
    if (node.start.offset <= offset && node.end.offset > offset) {
        switch (node.kind) {
            case 'Parameter':
            case 'RestParameter':
            case 'OuterParameter':
            case 'Constant':
            case 'Variable':
            case 'HexLiteral':
            case 'NumberLiteral':
            case 'StringLiteral':
                return node;
            case 'FunctionDeclaration':
                if (
                    node.name !== null &&
                    node.name.start.offset <= offset &&
                    node.name.end.offset > offset
                ) {
                    return node;
                }
                for (const param of node.params) {
                    const node = getNodeAt(param, offset);
                    if (node !== void 0) return node;
                }
                if (node.rest !== null) {
                    const rest = getNodeAt(node.rest, offset);
                    if (rest !== null) return rest;
                }
                for (const param of node.outerParams) {
                    const node = getNodeAt(param, offset);
                    if (node !== void 0) return node;
                }
                if (node.body !== null) return getNodeAt(node.body, offset);
                break;
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
                if (l !== void 0 || node.rvalue === null) return l;
                const r = getNodeAt(node.rvalue, offset);
                if (r !== void 0) return r;
                break
            }
            case 'ParenthesisedExpression':
            case 'UnaryExpression':
                if (node.value !== null)
                    return getNodeAt(node.value, offset);
                break;
        }
    }
    return void 0;
}
