import { Expresion } from "./Expresion";

export type ResParser =
    | ExitoParser
    | ErrorLexerP
    | ErrorParser

export class ExitoParser {
    type = "ExitoParser" as const
    expr: Expresion

    constructor(expr: Expresion) {
        this.expr = expr;
    }
}

export class ErrorLexerP {
    type = "ErrorLexerP" as const
    err: string

    constructor(err: string) {
        this.err = err;
    }
}

export class ErrorParser {
    type = "ErrorParser" as const
    err: string

    constructor(err: string) {
        this.err = err;
    }
}
