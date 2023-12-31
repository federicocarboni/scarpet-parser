/**
 * @param {import('./Parser.js').Node} node
 * @returns {import('./Parser.js').Node | null}
 */
export function resolveParenthesised(node) {
    if (node.kind === 'ParenthesisedExpression')
        return node.value !== null ? resolveParenthesised(node.value) : null;
    return node;
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Node} node
 * @param {import('./Parser.js').FunctionDeclaration[]} stack
 * @returns {boolean} Found
 */
export function findScope(root, node, stack) {
    if (root === node) return true;
    switch (root.kind) {
        case 'FunctionDeclaration': {
            if (root.body === null) return false;
            stack.unshift(root);
            const found = findScope(root.body, node, stack);
            if (!found) stack.shift();
            return found;
        }
        case 'FunctionExpression':
            for (const param of root.params) {
                if (param === null) continue;
                if (findScope(root, node, stack)) return true;
            }
            return false;
        case 'BinaryExpression': {
            if (findScope(root.lvalue, node, stack)) return true;
            if (root.rvalue === null) return false;
            return findScope(root.rvalue, node, stack);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (root.value === null) return false;
            return findScope(root.value, node, stack);
        default:
            return false;
    }
}

/**
 * @param {import('./Parser.js').Node | null} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {import('./Parser.js').Node | null}
 */
export function findAssign(scope, reference) {
    switch (scope?.kind) {
        case 'BinaryExpression':
            if (scope.operator === '=') {
                const variable = resolveParenthesised(scope.lvalue);
                if (variable?.kind !== 'Variable' || variable.name !== reference.name)
                    return findAssign(scope.rvalue, reference);
                return variable;
            } else {
                const lvalue = findAssign(scope.lvalue, reference);
                if (lvalue !== null) return lvalue;
                return findAssign(scope.rvalue, reference);
            }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            return findAssign(scope.value, reference);
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of scope.params) {
                const res = findAssign(param, reference);
                if (res !== null) return res;
            }
            break;
    }
    return null;
}

/**
 * @param {import('./Parser.js').Node} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {import('./Parser.js').Node | null}
 */
export function findAssignInScope(scope, reference) {
    if (scope.kind === 'FunctionDeclaration') {
        for (const param of scope.params) {
            if (param.name === reference.name) return param;
        }
        if (scope.rest?.name?.name === reference.name) return scope.rest;
        return findAssign(scope.body, reference);
    }
    return findAssign(scope, reference);
}

/**
 * @param {import('./Parser.js').Node} root - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {import('./Parser.js').Node | null}
 */
export function findDefinition(root, reference) {
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, reference, stack);
    return findAssign(stack.shift() ?? root, reference);
}
