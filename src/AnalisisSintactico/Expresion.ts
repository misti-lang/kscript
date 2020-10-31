import { Signatura } from "./Signatura";
import { InfoToken } from "../AnalisisLexico/InfoToken";
import { Asociatividad } from "./Asociatividad";

export type Expresion =
    | EIdentificador
    | EUnidad
    | ENumero
    | ETexto
    | EBool
    | EUndefined
    | EOperador
    | EOperadorApl
    | EOperadorUnarioIzq
    | EDeclaracion
    | ECondicional
    | EBloque

export class EUndefined {
    type = "EUndefined" as const
    readonly infoId: InfoToken<string>

    constructor(infoId: InfoToken<string>) {
        this.infoId = infoId;
    }
}

export class EIdentificador {
    type = "EIdentificador" as const
    readonly signatura: Signatura
    readonly valorId: InfoToken<string>

    constructor(signatura: Signatura, valorId: InfoToken<string>) {
        this.signatura = signatura;
        this.valorId = valorId;
    }
}

export class EUnidad {
    type = "EUnidad" as const
    readonly info: InfoToken<void>

    constructor(info: InfoToken<void>) {
        this.info = info;
    }
}

export class ENumero {
    type = "ENumero" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}

export class ETexto {
    type = "ETexto" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}

export class EBool {
    type = "EBool" as const
    readonly info: InfoToken<boolean>

    constructor(info: InfoToken<boolean>) {
        this.info = info;
    }
}

export class eOperador {
    signaturaOp: Signatura
    valorOp: InfoToken<string>
    precedencia: number
    asociatividad: Asociatividad

    constructor(signaturaOp: Signatura, valorOp: InfoToken<string>, precedencia: number, asociatividad: Asociatividad) {
        this.signaturaOp = signaturaOp;
        this.valorOp = valorOp;
        this.precedencia = precedencia;
        this.asociatividad = asociatividad;
    }
}

export class EOperador {
    type = "EOperador" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}

export class EOperadorApl {
    type = "EOperadorApl" as const
    readonly op: eOperador
    readonly izq: Expresion
    readonly der: Expresion

    constructor(op: eOperador, izq: Expresion, der: Expresion) {
        this.op = op;
        this.izq = izq;
        this.der = der;
    }
}

export class EOperadorUnarioIzq {
    type = "EOperadorUnarioIzq" as const
    readonly op: eOperador
    readonly expr: Expresion

    constructor(op: eOperador, expr: Expresion) {
        this.op = op;
        this.expr = expr;
    }
}

export class EDeclaracion {
    type = "EDeclaracion" as const
    readonly mut: boolean
    readonly id: EIdentificador
    readonly valorDec: Expresion
    readonly inicioDec: number
    readonly numLineaDec: number
    readonly posInicioLineaDec: number

    constructor(mut: boolean, id: EIdentificador, valorDec: Expresion, inicioDec: number, numLineaDec: number, posInicioLineaDec: number) {
        this.mut = mut;
        this.id = id;
        this.valorDec = valorDec;
        this.inicioDec = inicioDec;
        this.numLineaDec = numLineaDec;
        this.posInicioLineaDec = posInicioLineaDec;
    }
}

export class ECondicional {
    type = "ECondicional" as const

    readonly exprCondicion: [Expresion, Expresion]
    readonly exprElif?: [Expresion, Expresion][]
    readonly exprElse?: Expresion
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

    constructor(
        inicioDec: number,
        numLineaDec: number,
        posInicioLineaDec: number,
        exprCondicion: [Expresion, Expresion],
        exprElif?: [Expresion, Expresion][],
        exprElse?: Expresion
    ) {
        this.exprCondicion = exprCondicion;
        this.exprElif = exprElif;
        this.exprElse = exprElse;
        this.inicio = inicioDec;
        this.numLinea = numLineaDec;
        this.posInicioLinea = posInicioLineaDec;
    }
}

export class EBloque {
    type = "EBloque" as const
    readonly bloque: Array<Expresion>
    readonly esExpresion: boolean

    constructor(bloque: Array<Expresion>, esExpresion: boolean = true) {
        this.bloque = bloque;
        this.esExpresion = esExpresion;
    }
}
