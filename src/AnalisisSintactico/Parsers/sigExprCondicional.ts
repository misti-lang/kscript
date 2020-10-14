import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito } from "../ExprRes";
import { getGlobalState } from "./utilidades";
import { ErrorComun, Expect } from "../Expect";
import { EBloque, ECondicional } from "../Expresion";

export function getSigExprCondicional(
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

    const globlalState = getGlobalState();

    function sigExprCondicional(tokenIf: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        try {

            // Obtener la posicion del siguiente token para ajustar la indentacion
            const tokenSig = lexer.lookAhead();
            if (tokenSig.type !== "TokenLexer") {
                return new PError("Se esperaba una expresión luego de 'if'.");
            }
            const posInicio = tokenSig.token.token.inicio - tokenSig.token.token.posInicioLinea;

            // Obtener la expresion que se usara como condicional
            const sigExpr = sigExpresion(posInicio, indentacionNuevaLinea, 0, Asociatividad.Izq, true);
            if (sigExpr.type === "PReturn" || sigExpr.type === "PEOF") {
                return new PError("Se esperaba una expresión luego de 'if'.");
            } else if (sigExpr.type === "PError") {
                return new PError(`Se esperaba una expresión luego de 'if':\n${sigExpr.err}`);
            } else if (sigExpr.type === "PErrorLexer") {
                return sigExpr;
            }

            const exprCondicionIf = sigExpr.expr;

            // Esperar el token 'do', o lanzar un error
            Expect.PC_DO(lexer.sigToken(), "Se esperaba el token 'do'.", lexer);

            // Revisar si el siguiente token está en la misma linea o en una linea diferente
            const [_, nuevoNivel1, hayNuevaLinea, fnEstablecer] = lexer.lookAheadSignificativo(false);

            if (hayNuevaLinea && nuevoNivel1 <= indentacionNuevaLinea) {
                throw new ErrorComun(`La expresión condicional está incompleta. Se esperaba una expresión indentada.`);
            }

            if (hayNuevaLinea) {
                fnEstablecer();
            }

            // Indicar que hay un if abierto, para que sigExpresion devuelva PReturn al encontrarse con 'elif' o 'else'
            globlalState.ifAbiertos += 1;

            const nuevoNivel = Math.max(nuevoNivel1, indentacionNuevaLinea);

            // Obtener la expresion que ira dentro del if. Si esta en la misma linea, solo 1 expresion.
            //   Sino, un bloque de expresiones
            const sigExprCuerpo = hayNuevaLinea ?
                sigExpresionBloque(nuevoNivel, true) :
                sigExpresion(
                    nuevoNivel,
                    indentacionNuevaLinea,
                    0,
                    Asociatividad.Izq,
                    true
                );

            if (sigExprCuerpo.type === "PReturn" || sigExprCuerpo.type === "PEOF") {
                return new PError("Se esperaba una expresión luego de 'do'.");
            } else if (sigExprCuerpo.type === "PError") {
                return new PError(`Se esperaba una expresión luego de 'do':\n${sigExprCuerpo.err}`);
            } else if (sigExprCuerpo.type === "PErrorLexer") {
                return sigExpr;
            }

            const exprBloque = sigExprCuerpo.expr;

            // Crear AST
            const exprCondicional = new ECondicional(
                tokenIf.inicio,
                tokenIf.numLinea,
                tokenIf.posInicioLinea,
                [exprCondicionIf, exprBloque]
            );

            // Cerrar el if
            globlalState.ifAbiertos -= 1;

            return new PExito(exprCondicional);
        } catch (e) {
            if (e instanceof ErrorComun) {
                return new PError(e.message);
            } else {
                throw e;
            }
        }
    }

    return sigExprCondicional;
}
