import { InfoToken } from "./InfoToken";

export type Token2 =
    | TNuevaLinea
    | TIdentificador
    | TGenerico
    | TComentario
    | TNumero
    | TTexto
    | TBool
    | TOperador
    | TParenAb
    | TParenCer
    | TAgrupAb
    | TAgrupCer
    | PC_LET
    | PC_CONST

export class TNuevaLinea {
    type = "TNuevaLinea" as const
    token: InfoToken<undefined>

    constructor(token: InfoToken<undefined>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TIdentificador {
    type = "TIdentificador" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TGenerico {
    type = "TGenerico" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TComentario {
    type = "TComentario" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TNumero {
    type = "TNumero" as const
    token: InfoToken<number>

    constructor(token: InfoToken<number>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TTexto {
    type = "TTexto" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TBool {
    type = "TBool" as const
    token: InfoToken<boolean>

    constructor(token: InfoToken<boolean>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TOperador {
    type = "TOperador" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TParenAb {
    type = "TParenAb" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TParenCer {
    type = "TParenCer" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TAgrupAb {
    type = "TAgrupAb" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class TAgrupCer {
    type = "TAgrupCer" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class PC_LET {
    type = "PC_LET" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class PC_CONST {
    type = "PC_CONST" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

