import {resolveExpression} from "./resolveExpression.js";

/**
 * @param {import('./Parser.js').Node} node
 * @param {number} offset
 * @returns
 */
function isInRange(node, offset) {
    return node.start.offset <= offset && node.end.offset > offset;
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {number} offset
 * @param {import('./Parser.js').FunctionDeclaration[]} stack
 * @returns {boolean} Found
 */
export function findScope(root, offset, stack) {
    if (!isInRange(root, offset)) return false;
    switch (root.kind) {
        case "FunctionDeclaration": {
            if (root.body === undefined) return false;
            const found = findScope(root.body, offset, stack);
            if (found) stack.unshift(root);
            const signature = resolveExpression(root.signature);
            if (signature !== undefined && signature.kind === "FunctionExpression") {
                for (const param of signature.params) {
                    if (findScope(param, offset, stack)) return true;
                }
            }
            return found;
        }
        case "ListLiteral":
        case "MapLiteral":
        case "FunctionExpression":
            for (const param of root.params) {
                if (findScope(param, offset, stack)) break;
            }
            return true;
        case "BinaryExpression": {
            if (findScope(root.lvalue, offset, stack) || root.rvalue === undefined) return true;
            return findScope(root.rvalue, offset, stack);
        }
        case "ParenthesisedExpression":
        case "UnaryExpression":
            if (root.value === undefined) return true;
            findScope(root.value, offset, stack);
            return true;
        default:
            return true;
    }
}
