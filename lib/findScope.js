/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Node} reference
 * @param {import('./Parser.js').FunctionDeclaration[]} stack
 * @returns {boolean} Found
 */
export function findScope(root, reference, stack) {
    if (root === reference) return true;
    switch (root.kind) {
        case 'FunctionDeclaration': {
            for (const outerParam of root.outerParams) {
                if (outerParam.name === reference) return true;
            }
            if (root.body === null) return false;
            stack.unshift(root);
            const found = findScope(root.body, reference, stack);
            if (!found) stack.shift();
            for (const param of root.params) {
                if (param === reference) return true;
            }
            if (root.rest === reference) return true;
            return found;
        }
        case 'FunctionExpression':
            for (const param of root.params) {
                if (param === null) continue;
                if (findScope(param, reference, stack)) return true;
            }
            return false;
        case 'BinaryExpression': {
            if (findScope(root.lvalue, reference, stack)) return true;
            if (root.rvalue === null) return false;
            return findScope(root.rvalue, reference, stack);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (root.value === null) return false;
            return findScope(root.value, reference, stack);
        default:
            return false;
    }
}
