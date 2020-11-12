import { EIdentificador } from "./EIdentificador";
import { Expresion } from "../Expresion";

export class EDeclaracionFuncion {
    type = "EDeclaracionFuncion" as const
    readonly id: EIdentificador
    readonly parametros: EIdentificador[]
    readonly valor: Expresion
    readonly inicio: number
    readonly numLinea: number
    readonly posInicioLinea: number

    constructor(id: EIdentificador, parametros: EIdentificador[], valor: Expresion, inicio: number, numLinea: number, posInicioLinea: number) {
        this.id = id;
        this.parametros = parametros;
        this.valor = valor;
        this.inicio = inicio;
        this.numLinea = numLinea;
        this.posInicioLinea = posInicioLinea;
    }
}
