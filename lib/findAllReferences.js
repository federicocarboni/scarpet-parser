import {findScope} from './findScope.js';
import {resolveExpression} from './resolveExpression.js';

/**
 * @param {import('./Parser.js').Node} node
 * @param {import('./Parser.js').Variable} reference
 * @param {Set<import('./Parser.js').Node>} references
 */
function findVariableReferencesInScope(node, reference, references) {
    switch (node.kind) {
        case 'BinaryExpression':
            findVariableReferencesInScope(node.lvalue, reference, references);
            if (node.rvalue !== undefined)
                findVariableReferencesInScope(node.rvalue, reference, references);
            break;
        case 'UnaryExpression':
        case 'ParenthesisedExpression':
            if (node.value !== undefined)
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
                references.add(node);
            }
            break;
        case 'FunctionDeclaration': {
            // check if the declaration has an outer parameter with the search name
            const signature = resolveExpression(node.signature);
            if (signature === undefined || signature.kind !== 'FunctionExpression') break;
            let isOuter = false;
            for (const p of signature.params) {
                const param = resolveExpression(p);
                if (
                    param === undefined ||
                    param.kind !== 'FunctionExpression' ||
                    param.name.value !== 'outer' ||
                    param.params.length !== 1
                )
                    continue;
                const variable = resolveExpression(param.params[0]);
                if (
                    variable === undefined ||
                    variable.kind !== 'Variable' ||
                    variable.name !== reference.name
                )
                    continue;
                references.add(variable);
                isOuter = true;
            }
            if (isOuter && node.body !== undefined)
                findVariableReferencesInScope(node.body, reference, references);
            break;
        }
    }
}

/**
 * @param {import('./Parser.js').Node} root
 * @param {import('./Parser.js').FunctionDeclaration[]} stack
 * @param {import('./Parser.js').Variable} reference
 * @param {Set<import('./Parser.js').Node>} references
 */
function findVariableReferences(root, stack, reference, references) {
    for (const declaration of stack) {
        if (declaration.body !== undefined)
            findVariableReferencesInScope(declaration.body, reference, references);
        const signature = resolveExpression(declaration.signature);
        if (signature === undefined || signature.kind !== 'FunctionExpression') return;
        // if the parameter is in the outer scope we need to walk up the chain
        let isOuter = false;
        for (const p of signature.params) {
            const param = resolveExpression(p);
            if (param === undefined) continue;
            if (
                param.kind === 'FunctionExpression' &&
                param.name.value === 'outer' &&
                param.params.length === 1
            ) {
                const variable = resolveExpression(param.params[0]);
                if (variable === undefined) continue;
                if (variable.kind === 'Variable' && variable.name === reference.name) {
                    isOuter = true;
                    break;
                }
            }
        }
        if (!isOuter) return;
    }
    findVariableReferencesInScope(root, reference, references);
}

/**
 * @param {import('./Parser.js').Node} ast
 * @param {import('./Parser.js').Variable} reference
 * @param {import('./Parser.js').Node[]} references
 */
function findGlobalVariableReferences(ast, reference, references) {
    switch (ast.kind) {
        case 'BinaryExpression':
            findGlobalVariableReferences(ast.lvalue, reference, references);
            if (ast.rvalue !== undefined)
                findGlobalVariableReferences(ast.rvalue, reference, references);
            break;
        case 'ParenthesisedExpression':
        case 'UnaryExpression':
            if (ast.value !== undefined)
                findGlobalVariableReferences(ast.value, reference, references);
            break;
        case 'FunctionExpression':
        case 'MapLiteral':
        case 'ListLiteral':
            for (const param of ast.params)
                findGlobalVariableReferences(param, reference, references);
            break;
        case 'FunctionDeclaration':
            if (ast.body !== undefined)
                findGlobalVariableReferences(ast.body, reference, references);
            break;
        case 'Variable':
            if (ast.name === reference.name) references.push(ast);
    }
}

/**
 * @param {import('./Parser.js').Node} ast
 * @param {import('./Parser.js').Variable} reference
 * @returns {import('./Parser.js').Node[]}
 */
export function findAllVariableReferences(ast, reference) {
    // TODO: global variables
    if (reference.kind === 'Variable' && reference.name.startsWith('global_')) {
        /** @type {import('./Parser').Node[]} */
        const references = [];
        findGlobalVariableReferences(ast, reference, references)
        return references;
    }
    /** @type {Set<import('./Parser').Node>} */
    const references = new Set();
    /** @type {import('./Parser').FunctionDeclaration[]} */
    const stack = [];
    findScope(ast, reference.start.offset, stack);
    findVariableReferences(ast, stack, reference, references);
    return Array.from(references);
}

// /**
//  * @param {import('./Parser').Node | null} _root
//  * @param {import('./Parser.js').FunctionDeclaration
//  *     | import('./Parser').FunctionExpression
//  *     | null} _node
//  * @returns {import('./diagnostic.js').Range[]}
//  */
// export function findAllFunctionReferences(_root, _node) {
//     /** @type {import('./Parser').Node[]} */
//     const references = [];

//     return references;
// }

// /**
//  * @param {import('./Parser.js').Node} root
//  * @param {import('./Parser.js').StringLiteral} node
//  */
// export function isFunctionReference(root, node) {
//     switch (root.kind) {
//         case 'FunctionExpression': {
//             const params = root.params.filter(
//                 /** @returns {node is import('./Parser.js').Node} */ (node) => node !== null,
//             );
//             if (root.name.value === 'call' && params[0] === node) return true;
//             if (root.name.value === 'schedule' && params[1] === node) return true;
//         }
//         // fallthrough
//         case 'MapLiteral':
//         case 'ListLiteral':
//             for (const param of root.params) {
//                 if (param === null) continue;
//                 if (isFunctionReference(param, node)) return true;
//             }
//             break;
//         case 'FunctionDeclaration':
//             if (root.body !== null) return isFunctionReference(root.body, node);
//             break;
//         case 'BinaryExpression':
//             if (isFunctionReference(root.lvalue, node)) return true;
//             if (root.rvalue === null) break;
//             if (isFunctionReference(root.rvalue, node)) return true;
//             break;
//         case 'ParenthesisedExpression':
//         case 'UnaryExpression':
//             if (root.value !== null) return isFunctionReference(root.value, node);
//             break;
//     }
//     return false;
// }
