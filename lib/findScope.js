import {resolveExpression} from './resolveExpression.js';

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
            if (root.body === void 0) return false;
            stack.unshift(root);
            const found = findScope(root.body, reference, stack);
            const signature = resolveExpression(root.signature);
            if (signature !== void 0 && signature.kind === 'FunctionExpression') {
                for (const param of signature.params) {
                    const p = resolveExpression(param);
                    if (
                        p === reference ||
                        (p?.kind === 'UnaryExpression' &&
                            p.operator === '...' &&
                            p.value !== void 0 &&
                            resolveExpression(p.value) === reference) ||
                        (p?.kind === 'FunctionExpression' &&
                            p.name.value === 'outer' &&
                            p.params.length > 0 &&
                            resolveExpression(p.params[0]) === reference)
                    ) {
                        return true;
                    }
                }
            }
            if (!found) stack.shift();
            return found;
        }
        case 'ListLiteral':
        case 'MapLiteral':
        case 'FunctionExpression':
            for (const param of root.params) {
                if (findScope(param, reference, stack)) return true;
            }
            return false;
        case 'BinaryExpression': {
            if (findScope(root.lvalue, reference, stack)) return true;
            if (root.rvalue === void 0) return false;
            return findScope(root.rvalue, reference, stack);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (root.value === void 0) return false;
            return findScope(root.value, reference, stack);
        default:
            return false;
    }
}
