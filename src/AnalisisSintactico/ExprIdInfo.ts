import { Expresion } from "./Expresion";

export interface ExprIdInfo {
    readonly expr: Expresion,
    readonly infoInicio: number,
    readonly infoNumLinea: number,
    readonly infoPosInicioLinea: number
}
