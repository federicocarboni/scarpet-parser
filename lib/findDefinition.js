import {findScope, resolveParenthesised} from './findScope.js';


/**
 * @param {import('./Parser.js').Node | null} scope - Root node of the AST
 * @param {import('./Parser.js').Variable | import('./Parser.js').Parameter} reference - Reference
 *   node
 * @returns {import('./Parser.js').Node | null}
 */
export function findAssign(scope, reference) {
    switch (scope?.kind) {
        case 'BinaryExpression':
            if (scope.operator === '=' || scope.operator === '+=' || scope.operator === '<>') {
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
 * @param {import('./Parser.js').Variable | import('./Parser.js').Parameter} reference
 *
 *   - Reference node
 *
 * @returns {import('./Parser.js').Node | null}
 */
export function findVarDefinitionInScope(scope, reference) {
    if (scope.kind === 'FunctionDeclaration') {
        for (const param of scope.params) {
            if (param.name === reference.name) return param;
        }
        if (scope.rest?.name?.name === reference.name) return scope.rest;
        for (const param of scope.outerParams) {
            if (param.name.name === reference.name) return param;
        }
        return findAssign(scope.body, reference);
    }
    return findAssign(scope, reference);
}

/**
 * @param {import('./Parser.js').Node} node - Scope node of the AST
 * @param {import('./Parser.js').Node} reference - Reference node
 * @param {string} name
 * @returns {import('./Parser.js').FunctionDeclaration | null}
 */
function findFunctionDeclaration(node, reference, name) {
    switch (node.kind) {
        case 'FunctionDeclaration':
            if (node.name?.value === name) return node;
            if (node.body === null) return null;
            return findFunctionDeclaration(node.body, reference, name);
        case 'BinaryExpression': {
            const lvalue = findFunctionDeclaration(node.lvalue, reference, name);
            if (lvalue !== null) return lvalue;
            if (node.rvalue === null) return null;
            return findFunctionDeclaration(node.rvalue, reference, name);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (node.value === null) return null;
            return findFunctionDeclaration(node.value, reference, name);
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of node.params) {
                if (param === null) continue;
                const func = findFunctionDeclaration(param, reference, name);
                if (func !== null) return func;
            }
            break;
        default:
    }
    return null;
}

/**
 * @param {import('./Parser.js').Node} root - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {import('./Parser.js').Node | null}
 */
export function findVariableDefinition(root, reference) {
    if (!reference.name.startsWith('global_')) {
        /** @type {import('./Parser.js').FunctionDeclaration[]} */
        const stack = [];
        findScope(root, reference, stack);
        if (stack.length !== 0) return findVarDefinitionInScope(stack[0], reference);
    }
    return findAssign(root, reference);
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Node} reference
 * @param {string} name
 * @returns {import('./Parser.js').FunctionDeclaration | null}
 */
export function findFunctionDefinition(root, reference, name) {
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, reference, stack);
    for (const scope of stack) {
        const func = findFunctionDeclaration(scope, reference, name);
        if (func !== null) return func;
    }
    return findFunctionDeclaration(root, reference, name);
}
