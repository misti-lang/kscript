import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EDeclaracionFuncion implements IPosition {
    type = "EDeclaracionFuncion" as const
    readonly id: EIdentificador
    readonly parametros: EIdentificador[]
    readonly valor: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(id: EIdentificador, parametros: EIdentificador[], valor: Expresion, infoFun: InfoToken<string>) {
        this.id = id;
        this.parametros = parametros;
        this.valor = valor;
        this.inicioPE = infoFun.inicio;
        this.numLineaPE = infoFun.numLinea;
        this.posInicioLineaPE = infoFun.posInicioLinea;
    }
}

export class EDeclaracionFn implements IPosition {
    type = "EDeclaracionFn" as const
    readonly parametros: EIdentificador[]
    readonly operadorFn: InfoToken<string>
    readonly valor: Expresion
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(parametros: EIdentificador[], operadorFn: InfoToken<string>, valor: Expresion, infoFun: InfoToken<string>) {
        this.parametros = parametros;
        this.operadorFn = operadorFn;
        this.valor = valor;
        this.inicioPE = infoFun.inicio;
        this.numLineaPE = infoFun.numLinea;
        this.posInicioLineaPE = infoFun.posInicioLinea;
    }
}
