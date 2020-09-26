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
    | PC_IF
    | PC_ELIF
    | PC_DO
    | PC_ELSE

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
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
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

export class PC_IF {
    type = "PC_IF" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class PC_ELIF {
    type = "PC_ELIF" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class PC_DO {
    type = "PC_DO" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}

export class PC_ELSE {
    type = "PC_ELSE" as const
    token: InfoToken<string>

    constructor(token: InfoToken<string>) {
        this.token = token;
    }
    toString() {
        return `${this.type}: ${this.token.valor}`;
    }
}
