export type Signatura =
    | SignIndefinida
    | SignSimple
    | SignFuncion

export class SignIndefinida {
    type = "SignIndefinida" as const
}

export class SignSimple {
    type = "SignSimple" as const
    valor: string

    constructor(valor: string) {
        this.valor = valor;
    }
}

export class SignFuncion {
    type = "SignFuncion" as const
    fun: Signatura
    param: Signatura

    constructor(fun: Signatura, param: Signatura) {
        this.fun = fun;
        this.param = param;
    }
}
