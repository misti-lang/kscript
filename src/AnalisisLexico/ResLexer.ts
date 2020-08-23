import { Token2 } from "./Token2";

export type ResLexer = TokenLexer | ErrorLexer | EOFLexer

export class TokenLexer {
    type = "TokenLexer" as const
    token: Token2
    indentacion: number

    constructor(token: Token2, pos: number) {
        this.token = token;
        this.indentacion = pos;
    }
}

export class ErrorLexer {
    type = "ErrorLexer" as const
    razon: string

    constructor(razon: string) {
        this.razon = razon;
    }
}

export class EOFLexer {
    type = "EOFLexer" as const
}
