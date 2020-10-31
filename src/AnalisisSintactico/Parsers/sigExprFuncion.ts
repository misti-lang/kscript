import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { ExprRes } from "../ExprRes";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export function getSigExprFuncion(
    lexer: Lexer,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ) => ExprRes,
    sigExpresionBloque: (
        nivel: number,
        esExpresion: boolean
    ) => ExprRes
) {

    function sigExprFuncion(tokenFun: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        throw 0;
    }

    return sigExprFuncion;
}
