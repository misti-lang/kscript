import { Expresion } from "./Expresion";
import { EIdentificador } from "./Expresion/EIdentificador";

export interface PosExpr {
    readonly inicioPE: number,
    readonly numLineaPE: number,
    readonly posInicioLineaPE: number
}

/**
 * Devuelve la posicion de inicio absoluta, número de linea y pos. de inicio relativa de una expresión.
 * @param ex - Expresión de la que extraer los datos
 */
export function obtPosExpr(ex: Expresion): PosExpr {
    switch (ex.type) {
        case "EIdentificador":
            return {
                inicioPE: ex.valorId.inicio,
                numLineaPE: ex.valorId.numLinea,
                posInicioLineaPE: ex.valorId.posInicioLinea
            }
        case "EUnidad":
            return {
                inicioPE: ex.info.inicio,
                numLineaPE: ex.info.numLinea,
                posInicioLineaPE: ex.info.posInicioLinea
            }
        case "ENumero":
            return {
                inicioPE: ex.info.inicio,
                numLineaPE: ex.info.numLinea,
                posInicioLineaPE: ex.info.posInicioLinea
            }
        case "ETexto":
            return {
                inicioPE: ex.info.inicio,
                numLineaPE: ex.info.numLinea,
                posInicioLineaPE: ex.info.posInicioLinea
            }
        case "EBool":
            return {
                inicioPE: ex.info.inicio,
                numLineaPE: ex.info.numLinea,
                posInicioLineaPE: ex.info.posInicioLinea
            }
        case "EOperador":
            return {
                inicioPE: ex.info.inicio,
                numLineaPE: ex.info.numLinea,
                posInicioLineaPE: ex.info.posInicioLinea
            }
        case "EOperadorApl":
            return obtPosExpr(ex.izq)
        case "EDeclaracion":
            return {
                inicioPE: ex.inicioDec,
                numLineaPE: ex.numLineaDec,
                posInicioLineaPE: ex.posInicioLineaDec
            }
        case "EBloque": {
            const exprs = ex.bloque;
            if (exprs.length >= 1) {
                return obtPosExpr(exprs[0]);
            } else {
                return {
                    inicioPE: 0,
                    numLineaPE: 0,
                    posInicioLineaPE: 0
                };
            }
        }
        case "EOperadorUnarioIzq": {
            const op = ex.op.valorOp;
            return {
                inicioPE: op.inicio,
                numLineaPE: op.numLinea,
                posInicioLineaPE: op.posInicioLinea
            }
        }
        case "ECondicional": {
            return {
                inicioPE: ex.inicio,
                numLineaPE: ex.numLinea,
                posInicioLineaPE: ex.posInicioLinea,
            }
        }
        case "EUndefined": {
            return {
                inicioPE: ex.infoId.inicio,
                numLineaPE: ex.infoId.numLinea,
                posInicioLineaPE: ex.infoId.posInicioLinea,
            }
        }
        default:
            let _: never;
            _ = ex;
            return _;
    }
}
