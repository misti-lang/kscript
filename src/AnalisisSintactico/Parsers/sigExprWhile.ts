import { Asociatividad, InfoToken } from "../../../kscript";
import { ExprRes, PError, PExito } from "../ExprRes";
import { ErrorComun } from "../Expect";
import { Lexer } from "../../AnalisisLexico/Lexer";
import { getGlobalState, obtExpresionesCondicion } from "./utilidades";
import { EWhile } from "../Expresion/EWhile";

const globalState = getGlobalState();

export function getSigExprWhile(
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

    function sigExprWhile(tokenWhile: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        try {

            globalState.whileAbiertos += 1;

            const resultadoExpresionesWhile = obtExpresionesCondicion(
                indentacionNuevaLinea,
                "if",
                lexer,
                sigExpresion,
                sigExpresionBloque
            );

            if (resultadoExpresionesWhile.error) return resultadoExpresionesWhile.error;

            const [exprCondicionWhile, exprBloqueWhile] = resultadoExpresionesWhile.exito!!

            const exprWhile = new EWhile(
                exprBloqueWhile,
                exprBloqueWhile,
                tokenWhile.inicio,
                tokenWhile.numLinea,
                tokenWhile.posInicioLinea
            );

            globalState.whileAbiertos -= 1;

            return new PExito(exprWhile);
        } catch (e) {
            if (e instanceof ErrorComun) {
                return new PError(e.message);
            } else {
                throw e;
            }
        }
    }

    return sigExprWhile;
}
