import {findScope} from './findScope.js';
import {resolveExpression} from './resolveExpression.js';

/**
 * @typedef {object} VariableDefinition
 * @property {'outer' | 'parameter' | 'assignment'} kind
 * @property {import('./Parser.js').Variable} variable
 * @property {import('./Parser.js').Node | undefined} value
 * @property {string | undefined} comment
 */

/**
 * @param {import('./Parser.js').Node | undefined} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findAssign(scope, reference) {
    switch (scope?.kind) {
        case 'BinaryExpression': {
            if (scope.operator === '=' || scope.operator === '+=' || scope.operator === '<>') {
                const variable = resolveExpression(scope.lvalue);
                if (
                    variable !== void 0 &&
                    variable.kind === 'Variable' &&
                    variable.name === reference.name
                )
                    return {
                        kind: 'assignment',
                        variable,
                        value: scope.operator === '=' ? scope.rvalue : void 0,
                        comment: scope.comment,
                    };
            }
            return findAssign(scope.lvalue, reference) ?? findAssign(scope.rvalue, reference);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            return findAssign(scope.value, reference);
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of scope.params) {
                const res = findAssign(param, reference);
                if (res !== void 0) return res;
            }
            break;
    }
    return void 0;
}

/**
 * @param {import('./Parser.js').Node} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findVarDefinitionInScope(scope, reference) {
    if (scope.kind === 'FunctionDeclaration') {
        const signature = resolveExpression(scope.signature);
        if (signature !== void 0 && signature.kind === 'FunctionExpression') {
            for (const p of signature.params) {
                const param = resolveExpression(p);
                if (param === void 0) continue;
                if (
                    param.kind === 'FunctionExpression' &&
                    param.name.value === 'outer' &&
                    param.params.length > 0
                ) {
                    const outerName = resolveExpression(param.params[0]);
                    if (
                        outerName !== void 0 &&
                        outerName.kind === 'Variable' &&
                        outerName.name === reference.name
                    )
                        return {
                            kind: 'outer',
                            variable: outerName,
                            value: void 0,
                            comment: void 0,
                        };
                }
                if (param.kind === 'Variable' && param.name === reference.name) {
                    return {
                        kind: 'parameter',
                        variable: param,
                        value: void 0,
                        comment: void 0,
                    };
                }
            }
        }
        return findAssign(scope.body, reference);
    }
    return findAssign(scope, reference);
}

/**
 * @param {import('./Parser.js').Node} node - Scope node of the AST
 * @param {import('./Parser.js').Node} reference - Reference node
 * @param {string} name
 * @returns {import('./Parser.js').FunctionDeclaration | undefined}
 */
function findFunctionDeclaration(node, reference, name) {
    switch (node.kind) {
        case 'FunctionDeclaration': {
            const signature = resolveExpression(node.signature);
            if (
                signature !== void 0 &&
                signature.kind === 'FunctionExpression' &&
                signature.name.value === name
            )
                return node;
            if (node.body === void 0) return void 0;
            return findFunctionDeclaration(node.body, reference, name);
        }
        case 'BinaryExpression': {
            const lvalue = findFunctionDeclaration(node.lvalue, reference, name);
            if (lvalue !== void 0) return lvalue;
            if (node.rvalue === void 0) return void 0;
            return findFunctionDeclaration(node.rvalue, reference, name);
        }
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (node.value === void 0) return void 0;
            return findFunctionDeclaration(node.value, reference, name);
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of node.params) {
                if (param === void 0) continue;
                const func = findFunctionDeclaration(param, reference, name);
                if (func !== void 0) return func;
            }
            break;
        default:
    }
    return void 0;
}

/**
 * @param {import('./Parser.js').Node} root - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findVariableDefinition(root, reference) {
    if (!reference.name.startsWith('global_')) {
        /** @type {import('./Parser.js').FunctionDeclaration[]} */
        const stack = [];
        findScope(root, reference.start.offset, stack);
        for (const scope of stack) {
            const definition = findVarDefinitionInScope(scope, reference);
            if (definition === void 0 || definition.kind !== 'outer') {
                return definition;
            }
        }
    }
    return findAssign(root, reference);
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Node} reference
 * @param {string} name
 * @returns {import('./Parser.js').FunctionDeclaration | undefined}
 */
export function findFunctionDefinition(root, reference, name) {
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, reference.start.offset, stack);
    for (const scope of stack) {
        const func = findFunctionDeclaration(scope, reference, name);
        if (func !== void 0) return func;
    }
    return findFunctionDeclaration(root, reference, name);
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
export function findFunctions(root, offset) {
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, offset, stack);
    /** @type {import('./Parser.js').FunctionDeclaration[]} */
    const functions = [];
    for (const scope of stack) {
        findFunctionDeclarations(scope, functions);
    }
    return functions;
}
