import { Expresion } from "./Expresion";

export type ExprRes =
    | PExito
    | PError
    | PErrorLexer
    | PEOF
    | PReturn

export class PExito {
    type = "PExito" as const
    expr: Expresion

    constructor(expr: Expresion) {
        this.expr = expr;
    }
}

export class PError {
    type = "PError" as const
    err: string

    constructor(err: string) {
        this.err = err;
    }
}

export class PErrorLexer {
    type = "PErrorLexer" as const
    err: string

    constructor(err: string) {
        this.err = err;
    }
}

export class PEOF {
    type = "PEOF" as const
}

export class PReturn {
    type = "PReturn" as const
}
