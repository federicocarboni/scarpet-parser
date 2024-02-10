/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @param {import('./Parser.js').FunctionExpression | undefined} lastFunction
 * @returns {[import('./Parser.js').FunctionExpression, number] | undefined}
 */
export function getCallAt(node, offset, lastFunction = undefined, index = 0) {
    if (node.start.offset <= offset && node.end.offset > offset) {
        switch (node.kind) {
            case "Constant":
            case "Variable":
            case "HexLiteral":
            case "NumberLiteral":
            case "StringLiteral":
                if (lastFunction !== undefined) return [lastFunction, index];
                break;
            case "BinaryExpression": {
                const l = getCallAt(node.lvalue, offset, lastFunction, index);
                if (l !== undefined) return l;
                if (node.rvalue !== undefined) {
                    return getCallAt(node.rvalue, offset, lastFunction, index);
                }
                break;
            }
            case "UnaryExpression":
            case "ParenthesisedExpression":
                if (node.value !== undefined) {
                    return getCallAt(node.value, offset, lastFunction, index);
                }
                break;
            case "FunctionDeclaration": {
                // const l = getCallAt(node.signature, offset, lastFunction, index);
                // if (l !== undefined) return l;
                if (node.body !== undefined) {
                    return getCallAt(node.body, offset, lastFunction, index);
                }
                break;
            }
            case "MapLiteral":
            case "ListLiteral":
                for (const param of node.params) {
                    const v = getCallAt(param, offset, lastFunction, index);
                    if (v !== undefined) return v;
                }
                break;
            case "FunctionExpression":
                for (const [i, param] of node.params.entries()) {
                    const v = getCallAt(param, offset, node, i);
                    if (v !== undefined) return v;
                }
                return [node, 0];
            default:
        }
    }
    return undefined;
}

/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @returns {import('./Parser.js').Node | undefined}
 */
export function getNodeAt(node, offset) {
    if (node.start.offset <= offset && node.end.offset > offset) {
        switch (node.kind) {
            case "Constant":
            case "Variable":
            case "HexLiteral":
            case "NumberLiteral":
            case "StringLiteral":
                return node;
            case "FunctionDeclaration": {
                const sig = getNodeAt(node.signature, offset);
                if (sig !== undefined) return sig;
                if (node.body !== undefined) return getNodeAt(node.body, offset);
                break;
            }
            case "FunctionExpression":
                if (node.name.start.offset <= offset && node.name.end.offset > offset) {
                    return node;
                }
            // fallthrough
            case "MapLiteral":
            case "ListLiteral":
                for (const param of node.params) {
                    const node = getNodeAt(param, offset);
                    if (node !== undefined) return node;
                }
                break;
            case "BinaryExpression": {
                const l = getNodeAt(node.lvalue, offset);
                if (l !== undefined || node.rvalue === undefined) return l;
                const r = getNodeAt(node.rvalue, offset);
                if (r !== undefined) return r;
                break;
            }
            case "ParenthesisedExpression":
            case "UnaryExpression":
                if (node.value !== undefined) return getNodeAt(node.value, offset);
                break;
        }
    }
    return undefined;
}
