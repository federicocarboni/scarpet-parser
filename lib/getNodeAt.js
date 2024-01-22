/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @param {import('./Parser.js').FunctionExpression | undefined} lastFunction
 * @returns {[import('./Parser.js').FunctionExpression, number] | undefined}
 */
export function getCallAt(node, offset, lastFunction = void 0, index = 0) {
    if (node.start.offset <= offset && node.end.offset > offset) {
        switch (node.kind) {
            case 'Constant':
            case 'Variable':
            case 'HexLiteral':
            case 'NumberLiteral':
            case 'StringLiteral':
                if (lastFunction !== void 0) return [lastFunction, index];
                break;
            case 'BinaryExpression': {
                const l = getCallAt(node.lvalue, offset, lastFunction, index);
                if (l !== void 0) return l;
                if (node.rvalue !== void 0)
                    return getCallAt(node.rvalue, offset, lastFunction, index);
                break;
            }
            case 'UnaryExpression':
            case 'ParenthesisedExpression':
                if (node.value !== void 0)
                    return getCallAt(node.value, offset, lastFunction, index);
                break;
            case 'FunctionDeclaration': {
                // const l = getCallAt(node.signature, offset, lastFunction, index);
                // if (l !== void 0) return l;
                if (node.body !== void 0) return getCallAt(node.body, offset, lastFunction, index);
                break;
            }
            case 'MapLiteral':
            case 'ListLiteral':
                for (const param of node.params) {
                    const v = getCallAt(param, offset, lastFunction, index);
                    if (v !== void 0) return v;
                }
                if (lastFunction !== void 0) return [lastFunction, index];
                break;
            case 'FunctionExpression':
                for (const [i, param] of node.params.entries()) {
                    const v = getCallAt(param, offset, node, i);
                    if (v !== void 0) return v;
                }
                break;
            default:
        }
    }
    return void 0;
}

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
                if (node.name.start.offset <= offset && node.name.end.offset > offset) {
                    return node;
                }
            // fallthrough
            case 'MapLiteral':
            case 'ListLiteral':
                for (const param of node.params) {
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
