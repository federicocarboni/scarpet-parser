import {findScope, resolveParenthesised} from './findScope.js';

/**
 * @param {import('./Parser.js').Node | null} scope - Root node of the AST node
 * @param {import('./Parser.js').Node[]} names
 */
function findAssign(scope, names) {
    switch (scope?.kind) {
        case 'BinaryExpression':
            if (scope.operator === '=' || scope.operator === '+=' || scope.operator === '<>') {
                const variable = resolveParenthesised(scope.lvalue);
                if (variable?.kind !== 'Variable') {
                    names.push(scope);
                    return findAssign(scope.rvalue, names);
                }
                return variable;
            } else {
                findAssign(scope.lvalue, names);
                return findAssign(scope.rvalue, names);
            }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            return findAssign(scope.value, names);
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of scope.params) {
                findAssign(param, names);
            }
            break;
    }
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Node} node
 * @returns {import('./Parser.js').Node[]}
 */
export function findVariableNames(root, node) {
    /** @type {import('./Parser.js').Node[]} */
    const names = [];
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, node, stack);
    if (stack.length !== 0) findAssign(stack[0], names);
    return names;
}
