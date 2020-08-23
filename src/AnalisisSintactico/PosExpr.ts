import { EIdentificador, Expresion } from "./Expresion";

export interface PosExpr {
    readonly inicioPE: number,
    readonly numLineaPE: number,
    readonly posInicioLineaPE: number
}

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
        default:
            let _: never;
            _ = ex;
            return _;
    }
}
