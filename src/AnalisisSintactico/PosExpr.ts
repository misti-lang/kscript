import { Expresion } from "./Expresion";
import { IPosition } from "./Expresion/IPosition";

/**
 * Devuelve la posicion de inicio absoluta, número de linea y pos. de inicio relativa de una expresión.
 * @param ex - Expresión de la que extraer los datos
 */
export function obtPosExpr(ex: Expresion): IPosition {
    return (ex as Expresion & IPosition);
}
