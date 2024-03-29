import {findScope} from "./findScope.js";
import {resolveExpression} from "./resolveExpression.js";

/**
 * @typedef {object} VariableDefinition
 * @property {'outer' | 'parameter' | 'assignment' | 'listAssignment'} kind
 * @property {import('./Parser.js').Variable} variable
 * @property {import('./Parser.js').Node | undefined} value
 * @property {import('./Parser.js').FunctionDeclaration | import('./Parser.js').BinaryExpression} definition
 * @property {number} [index]
 * @property {string | undefined} comment
 */

/**
 * @param {import('./Parser.js').Node | undefined} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findAssign(scope, reference) {
    switch (scope?.kind) {
        case "BinaryExpression": {
            if (scope.operator === "=" || scope.operator === "+=" || scope.operator === "<>") {
                const variable = resolveExpression(scope.lvalue);
                if (
                    variable !== undefined
                    && variable.kind === "Variable"
                    && variable.name === reference.name
                ) {
                    return {
                        kind: "assignment",
                        variable,
                        value: scope.operator === "=" ? scope.rvalue : undefined,
                        definition: scope,
                        comment: scope.comment,
                    };
                } else if (
                    variable !== undefined
                    && (variable.kind === "ListLiteral"
                        || (variable.kind === "FunctionExpression" && variable.name.value === "l"))
                ) {
                    for (const p of variable.params) {
                        const variable = resolveExpression(p);
                        if (
                            variable !== undefined
                            && variable.kind === "Variable"
                            && variable.name === reference.name
                        ) {
                            return {
                                kind: "assignment",
                                variable,
                                value: scope.operator === "=" ? scope.rvalue : undefined,
                                definition: scope,
                                comment: scope.comment,
                            };
                        }
                    }
                }
            }
            return findAssign(scope.lvalue, reference) ?? findAssign(scope.rvalue, reference);
        }
        case "ParenthesisedExpression":
        case "UnaryExpression":
            return findAssign(scope.value, reference);
        case "FunctionExpression":
        case "MapLiteral":
        case "ListLiteral":
            for (const param of scope.params) {
                const res = findAssign(param, reference);
                if (res !== undefined) return res;
            }
            break;
    }
    return undefined;
}

/**
 * @param {import('./Parser.js').Node} scope - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findVarDefinitionInScope(scope, reference) {
    if (scope.kind === "FunctionDeclaration") {
        const signature = resolveExpression(scope.signature);
        if (signature !== undefined && signature.kind === "FunctionExpression") {
            for (const p of signature.params) {
                const param = resolveExpression(p);
                if (param === undefined) continue;
                if (
                    param.kind === "FunctionExpression"
                    && param.name.value === "outer"
                    && param.params.length > 0
                ) {
                    const outerName = resolveExpression(param.params[0]);
                    if (
                        outerName !== undefined
                        && outerName.kind === "Variable"
                        && outerName.name === reference.name
                    ) {
                        return {
                            kind: "outer",
                            variable: outerName,
                            definition: scope,
                            value: undefined,
                            comment: undefined,
                        };
                    }
                }
                if (param.kind === "Variable" && param.name === reference.name) {
                    return {
                        kind: "parameter",
                        variable: param,
                        value: undefined,
                        definition: scope,
                        comment: undefined,
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
        case "FunctionDeclaration": {
            const signature = resolveExpression(node.signature);
            if (
                signature !== undefined
                && signature.kind === "FunctionExpression"
                && signature.name.value === name
            ) {
                return node;
            }
            if (node.body === undefined) return undefined;
            return findFunctionDeclaration(node.body, reference, name);
        }
        case "BinaryExpression": {
            const lvalue = findFunctionDeclaration(node.lvalue, reference, name);
            if (lvalue !== undefined) return lvalue;
            if (node.rvalue === undefined) return undefined;
            return findFunctionDeclaration(node.rvalue, reference, name);
        }
        case "ParenthesisedExpression":
        case "UnaryExpression":
            if (node.value === undefined) return undefined;
            return findFunctionDeclaration(node.value, reference, name);
        case "FunctionExpression":
        case "MapLiteral":
        case "ListLiteral":
            for (const param of node.params) {
                if (param === undefined) continue;
                const func = findFunctionDeclaration(param, reference, name);
                if (func !== undefined) return func;
            }
            break;
        default:
    }
    return undefined;
}

/**
 * @param {import('./Parser.js').Node} root - Root node of the AST
 * @param {import('./Parser.js').Variable} reference - Reference node
 * @returns {VariableDefinition | undefined}
 */
export function findVariableDefinition(root, reference) {
    if (!reference.name.startsWith("global_")) {
        /** @type {import('./Parser.js').FunctionDeclaration[]} */
        const stack = [];
        findScope(root, reference.start.offset, stack);
        for (const scope of stack) {
            const definition = findVarDefinitionInScope(scope, reference);
            if (definition === undefined || definition.kind !== "outer") {
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
        if (func !== undefined) return func;
    }
    return findFunctionDeclaration(root, reference, name);
}
