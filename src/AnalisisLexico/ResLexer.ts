import { Token } from "./Token";

export type ResLexer = TokenLexer | ErrorLexer | EOFLexer

export class TokenLexer {
    type = "TokenLexer" as const
    token: Token
    indentacion: number

    constructor(token: Token, pos: number) {
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
