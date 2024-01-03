# Scarpet Parser

A fault tolerant parser for [the Scarpet language][1] (a scripting language for the [Carpet Mod][2]).

This parser produces an AST from valid or invalid Scarpet source code. It is intended to be used for
implementing language servers/linters and other similar tooling.

Errors, warnings or other hints are pushed to a list of `diagnostics` -- a compatible subset of [the
`Diagnostic` type in LSP][3].

This parser tries its best to be consistent with Carpet Mod's behavior, but it tends to be a bit
more pedantic and may occasionally produce diagnostic errors or warnings on code that executes just
fine in Carpet Mod.

The reverse however (a script parsing without diagnostics producing a parse error in Carpet Mod) is
generally an indication of a bug. Please report it on GitHub.

[1]: https://github.com/gnembon/fabric-carpet/tree/ab79e76b51f084b39654e9833bd6369eefef94cc
[2]: https://github.com/gnembon/fabric-carpet
[3]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic
