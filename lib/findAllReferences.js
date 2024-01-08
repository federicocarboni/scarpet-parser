import {findVarDefinitionInScope} from './findDefinition.js';
import {findScope} from './findScope.js';

/**
 * @param {import('./Parser.js').Node | null} node
 * @param {import('./Parser.js').Variable | import('./Parser.js').Parameter} reference
 * @param {import('./Parser.js').Node[]} references
 */
function findVariableReferencesInScope(node, reference, references) {
    switch (node?.kind) {
        case 'BinaryExpression':
            findVariableReferencesInScope(node.lvalue, reference, references);
            findVariableReferencesInScope(node.rvalue, reference, references);
            break;
        case 'UnaryExpression':
        case 'ParenthesisedExpression':
            findVariableReferencesInScope(node.value, reference, references);
            break;
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of node.params) {
                findVariableReferencesInScope(param, reference, references);
            }
            break;
        case 'Variable':
            if (node.name === reference.name) {
                references.push(node);
            }
            break;
    }
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').FunctionDeclaration[]} stack
 * @param {import('./Parser.js').Variable | import('./Parser.js').Parameter} reference
 * @param {import('./Parser.js').Node[]} references
 */
function findVariableReferences(root, stack, reference, references) {
    if (stack.length !== 0) {
        const definition = findVarDefinitionInScope(stack[0], reference);
        findVariableReferencesInScope(stack[0], reference, references);
        if (definition?.kind === 'OuterParameter') {
            stack.shift();
            findVariableReferences(root, stack, reference, references);
        }
    } else {
        findVariableReferencesInScope(root, reference, references);
    }
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').Variable
 *     | import('./Parser.js').Parameter
 *     | import('./Parser.js').OuterParameter
 *     | import('./Parser.js').RestParameter} reference
 * @returns {import('./diagnostic.js').Range[]}
 */
export function findAllVariableReferences(root, reference) {
    // TODO: global variables
    if (reference.kind === 'Variable' && reference.name.startsWith('global_')) return [];
    if (reference.kind === 'OuterParameter' || reference.kind === 'RestParameter')
        reference = reference.name;
    /** @type {import('./Parser').Node[]} */
    const references = [];
    /** @type {import('./Parser').FunctionDeclaration[]} */
    const stack = [];
    findScope(root, reference, stack);
    findVariableReferences(root, stack, reference, references);
    return references;
}

/**
 * @param {import('./Parser').Node | null} _root
 * @param {import('./Parser.js').FunctionDeclaration
 *     | import('./Parser').FunctionExpression
 *     | null} _node
 * @returns {import('./diagnostic.js').Range[]}
 */
export function findAllFunctionReferences(_root, _node) {
    /** @type {import('./Parser').Node[]} */
    const references = [];

    return references;
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').StringLiteral} node
 */
export function isFunctionReference(root, node) {
    switch (root.kind) {
        case 'FunctionExpression': {
            const params = root.params.filter(
                /** @returns {node is import('./Parser.js').Node} */ (node) => node !== null,
            );
            if (root.name.value === 'call' && params[0] === node) return true;
            if (root.name.value === 'schedule' && params[1] === node) return true;
        }
        // fallthrough
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of root.params) {
                if (param === null) continue;
                if (isFunctionReference(param, node)) return true;
            }
            break;
        case 'FunctionDeclaration':
            if (root.body !== null) return isFunctionReference(root.body, node);
            break;
        case 'BinaryExpression':
            if (isFunctionReference(root.lvalue, node)) return true;
            if (root.rvalue === null) break;
            if (isFunctionReference(root.rvalue, node)) return true;
            break;
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (root.value !== null) return isFunctionReference(root.value, node);
            break;
    }
    return false;
}
