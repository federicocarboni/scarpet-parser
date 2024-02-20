import {findScope} from "./findScope.js";
import {resolveExpression} from "./resolveExpression.js";

/**
 * @param {import('./Parser.js').Node} node
 * @param {import('./Parser.js').Variable} reference
 * @param {Set<import('./Parser.js').Node>} references
 */
function findVariableReferencesInScope(node, reference, references) {
    switch (node.kind) {
        case "BinaryExpression":
            findVariableReferencesInScope(node.lvalue, reference, references);
            if (node.rvalue !== undefined) {
                findVariableReferencesInScope(node.rvalue, reference, references);
            }
            break;
        case "UnaryExpression":
        case "ParenthesisedExpression":
            if (node.value !== undefined) {
                findVariableReferencesInScope(node.value, reference, references);
            }
            break;
        case "FunctionExpression":
        case "MapLiteral":
        case "ListLiteral":
            for (const param of node.params) {
                findVariableReferencesInScope(param, reference, references);
            }
            break;
        case "Variable":
            if (node.name === reference.name) {
                references.add(node);
            }
            break;
        case "FunctionDeclaration": {
            // check if the declaration has an outer parameter with the search name
            const signature = resolveExpression(node.signature);
            if (signature === undefined || signature.kind !== "FunctionExpression") break;
            let isOuter = false;
            for (const p of signature.params) {
                const param = resolveExpression(p);
                if (
                    param === undefined
                    || param.kind !== "FunctionExpression"
                    || param.name.value !== "outer"
                    || param.params.length !== 1
                ) {
                    continue;
                }
                const variable = resolveExpression(param.params[0]);
                if (
                    variable === undefined
                    || variable.kind !== "Variable"
                    || variable.name !== reference.name
                ) {
                    continue;
                }
                references.add(variable);
                isOuter = true;
            }
            if (isOuter && node.body !== undefined) {
                findVariableReferencesInScope(node.body, reference, references);
            }
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
        if (declaration.body !== undefined) {
            findVariableReferencesInScope(declaration.body, reference, references);
        }
        const signature = resolveExpression(declaration.signature);
        if (signature === undefined || signature.kind !== "FunctionExpression") return;
        // if the parameter is in the outer scope we need to walk up the chain
        let isOuter = false;
        for (const p of signature.params) {
            const param = resolveExpression(p);
            if (param === undefined) continue;
            if (param.kind === "Variable" && param.name === reference.name) {
                references.add(param);
            } else if (
                param.kind === "UnaryExpression"
                && param.operator === "..."
                && param.value?.kind === "Variable"
            ) {
                references.add(param.value);
            } else if (
                param.kind === "FunctionExpression"
                && param.name.value === "outer"
                && param.params.length === 1
            ) {
                const variable = resolveExpression(param.params[0]);
                if (variable === undefined) continue;
                if (variable.kind === "Variable" && variable.name === reference.name) {
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
        case "BinaryExpression":
            findGlobalVariableReferences(ast.lvalue, reference, references);
            if (ast.rvalue !== undefined) {
                findGlobalVariableReferences(ast.rvalue, reference, references);
            }
            break;
        case "ParenthesisedExpression":
        case "UnaryExpression":
            if (ast.value !== undefined) {
                findGlobalVariableReferences(ast.value, reference, references);
            }
            break;
        case "FunctionExpression":
        case "MapLiteral":
        case "ListLiteral":
            for (const param of ast.params) {
                findGlobalVariableReferences(param, reference, references);
            }
            break;
        case "FunctionDeclaration":
            if (ast.body !== undefined) {
                findGlobalVariableReferences(ast.body, reference, references);
            }
            break;
        case "Variable":
            if (ast.name === reference.name) references.push(ast);
    }
}

/**
 * @param {import('./Parser.js').Node} ast
 * @param {import('./Parser.js').Variable} reference
 * @returns {import('./Parser.js').Node[]}
 */
export function findAllVariableReferences(ast, reference) {
    if (reference.kind === "Variable" && reference.name.startsWith("global_")) {
        /** @type {import('./Parser').Node[]} */
        const references = [];
        findGlobalVariableReferences(ast, reference, references);
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

/** @typedef {import('./Parser.js').FunctionExpression | import('./Parser.js').StringLiteral} FunctionReferenceNode */

/**
 * @param {import('./Parser').Node} ast
 * @param {FunctionReferenceNode} reference
 * @param {string} name
 * @returns {FunctionReferenceNode[]}
 */
export function findAllFunctionReferences(ast, reference, name) {
    /** @type {FunctionReferenceNode[]} */
    const references = [];
    findFunctionReferences(ast, reference, name, references);
    return references;
}

// Function name -> parameter index of the function
/** @type {Record<string, number>} */
const argCallPositionMap = {
    call: 0,
    task: 0,
    task_thread: 1,
    schedule: 1,
    handle_event: 1,
    entity_load_handler: 1,
    entity_event: 2,
    create_screen: 3,
};

/**
 * @param {import('./Parser.js').Node} ast
 * @param {FunctionReferenceNode} reference
 * @param {string} name
 * @param {FunctionReferenceNode[]} references
 */
function findFunctionReferences(ast, reference, name, references) {
    switch (ast.kind) {
        case "BinaryExpression":
            findFunctionReferences(ast.lvalue, reference, name, references);
            if (ast.rvalue !== undefined) {
                findFunctionReferences(ast.rvalue, reference, name, references);
            }
            break;
        case "ParenthesisedExpression":
        case "UnaryExpression":
            if (ast.value !== undefined) {
                findFunctionReferences(ast.value, reference, name, references);
            }
            break;
        case "FunctionDeclaration":
            findFunctionReferences(ast.signature, reference, name, references);
            if (ast.body !== undefined) {
                findFunctionReferences(ast.body, reference, name, references);
            }
            break;
        case "FunctionExpression": {
            const paramIndex = argCallPositionMap[ast.name.value];
            if (paramIndex !== undefined && paramIndex < ast.params.length) {
                const param = resolveExpression(ast.params[paramIndex]);
                if (param !== undefined && param.kind === "StringLiteral" && param.value === name) {
                    references.push(param);
                    break;
                }
            }
            if (ast.name.value === name) {
                references.push(ast);
                break;
            }
        }
        // fallthrough
        case "MapLiteral":
        case "ListLiteral":
            for (const param of ast.params) {
                findFunctionReferences(param, reference, name, references);
            }
            break;
    }
}

/**
 * @param {import('./Parser.js').Node} ast
 * @param {import('./Parser.js').Node} node
 * @returns {boolean}
 */
export function isFunctionReference(ast, node) {
    switch (ast.kind) {
        case "BinaryExpression":
            return (
                isFunctionReference(ast.lvalue, node)
                || (ast.rvalue !== undefined && isFunctionReference(ast.rvalue, node))
            );
        case "ParenthesisedExpression":
        case "UnaryExpression":
            return ast.value !== undefined && isFunctionReference(ast.value, node);
        case "FunctionExpression": {
            const paramIndex = argCallPositionMap[ast.name.value];
            if (
                paramIndex !== undefined
                && paramIndex < ast.params.length
                && resolveExpression(ast.params[paramIndex]) === node
            ) {
                return true;
            }
        }
        // fallthrough
        case "MapLiteral":
        case "ListLiteral":
            return ast.params.some((param) => isFunctionReference(param, node));
        case "FunctionDeclaration": {
            const signature = resolveExpression(ast.signature);
            // Prevent the declaration from being interpreted as a plain
            // function call
            if (signature?.kind === "FunctionExpression") {
                return signature.params.some((param) => isFunctionReference(param, node));
            }
            if (signature !== undefined && isFunctionReference(signature, node)) return true;
            return ast.body !== undefined && isFunctionReference(ast.body, node);
        }
    }
    return false;
}
