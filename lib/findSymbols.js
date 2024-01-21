import {findScope} from './findScope.js';
import {resolveExpression} from './resolveExpression.js';

/**
 * @param {import('./Parser.js').FunctionDeclaration} declaration
 * @param {import('./findDefinition.js').VariableDefinition[]} names
 */
function getParameters(declaration, names) {
    const signature = resolveExpression(declaration.signature);
    if (signature === void 0 || signature.kind !== 'FunctionExpression') return;
    for (const p of signature.params) {
        const param = resolveExpression(p);
        switch (param?.kind) {
            case 'Variable':
                names.push({
                    kind: 'parameter',
                    variable: param,
                    value: void 0,
                    comment: void 0,
                });
                break;
            case 'UnaryExpression':
                if (
                    param.operator === '...' &&
                    param.value !== void 0 &&
                    param.value.kind === 'Variable'
                ) {
                    names.push({
                        kind: 'parameter',
                        variable: param.value,
                        value: void 0,
                        comment: void 0,
                    });
                }
                break;
            case 'FunctionExpression': {
                if (param.name.value !== 'outer') break;
                const variable = resolveExpression(param.params[0]);
                if (variable !== void 0 && variable.kind === 'Variable') {
                    names.push({
                        kind: 'outer',
                        variable,
                        value: void 0,
                        comment: void 0,
                    });
                }
            }
        }
    }
}

/**
 * @param {import('./Parser.js').Node | undefined} scope - Root node of the AST node
 * @param {import('./findDefinition.js').VariableDefinition[]} names
 */
function findAssign(scope, names) {
    switch (scope?.kind) {
        case 'BinaryExpression':
            if (scope.operator === '=' || scope.operator === '+=' || scope.operator === '<>') {
                const variable = resolveExpression(scope.lvalue);
                if (variable?.kind === 'Variable') {
                    names.push({
                        kind: 'assignment',
                        variable,
                        value: scope.rvalue,
                        comment: scope.comment,
                    });
                    findAssign(scope.rvalue, names);
                } else if (
                    variable?.kind === 'ListLiteral' ||
                    (variable?.kind === 'FunctionExpression' && variable.name.value === 'l')
                ) {
                    let index = 0;
                    for (const p of variable.params) {
                        const variable = resolveExpression(p);
                        if (variable?.kind === 'Variable')
                            names.push({
                                kind: 'listAssignment',
                                variable,
                                value: scope.rvalue,
                                index,
                                comment: scope.comment,
                            });
                        index++;
                    }
                }
            } else {
                findAssign(scope.lvalue, names);
                findAssign(scope.rvalue, names);
            }
            break;
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            findAssign(scope.value, names);
            break;
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
 * @param {number} offset
 * @returns {import('./findDefinition.js').VariableDefinition[]}
 */
export function findReachableVariables(root, offset) {
    /** @type {import('./findDefinition.js').VariableDefinition[]} */
    const names = [];
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, offset, stack);
    // console.log(stack);
    if (stack.length !== 0) {
        getParameters(stack[0], names);
        findAssign(stack[0].body, names);
    } else {
        findAssign(root, names);
    }
    return names.reduce((acc, value) => {
        if (acc.findIndex((prevValue) => value.variable.name === prevValue.variable.name) === -1)
            acc.push(value);
        return acc;
    }, /** @type {import('./findDefinition.js').VariableDefinition[]} */ ([]));
}

/**
 * @param {import('./Parser.js').Node} node
 * @param {import('./Parser.js').FunctionDeclaration[]} functions
 */
function findFunctionDeclarations(node, functions) {
    switch (node.kind) {
        case 'BinaryExpression':
            findFunctionDeclarations(node.lvalue, functions);
            if (node.rvalue !== void 0) findFunctionDeclarations(node.rvalue, functions);
            break;
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (node.value !== void 0) findFunctionDeclarations(node.value, functions);
            break;
        // case 'MapLiteral': // skip map literal as you cannot define functions inside it
        case 'ListLiteral':
        case 'FunctionExpression':
            for (const param of node.params) {
                findFunctionDeclarations(param, functions);
            }
            break;
        case 'FunctionDeclaration':
            functions.push(node);
            findFunctionDeclarations(node.signature, functions);
            break;
    }
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {number} offset
 * @returns {import('./Parser.js').FunctionDeclaration[]}
 */
export function findReachableFunctions(root, offset) {
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, offset, stack);
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const functions = [];
    for (const scope of stack) {
        findFunctionDeclarations(scope, functions);
    }
    findFunctionDeclarations(root, functions);
    return functions;
}
