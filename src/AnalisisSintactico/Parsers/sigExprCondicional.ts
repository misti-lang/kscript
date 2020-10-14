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

            const sigExpr = sigExpresion(posInicio, indentacionNuevaLinea, 0, Asociatividad.Izq, true);
            if (sigExpr.type === "PReturn" || sigExpr.type === "PEOF") {
                return new PError("Se esperaba una expresión luego de 'if'.");
            } else if (sigExpr.type === "PError") {
                return new PError(`Se esperaba una expresión luego de 'if':\n${sigExpr.err}`);
            } else if (sigExpr.type === "PErrorLexer") {
                return sigExpr;
            }

            const exprCondicionIf = sigExpr.expr;

            Expect.PC_DO(lexer.sigToken(), "Se esperaba el token 'do'.", lexer);

            const [_, nuevoNivel1, hayNuevaLinea, fnEstablecer] = lexer.lookAheadSignificativo(false);

            if (hayNuevaLinea && nuevoNivel1 <= indentacionNuevaLinea) {
                throw new ErrorComun(`La expresión condicional está incompleta. Se esperaba una expresión indentada.`);
            }

            if (hayNuevaLinea) {
                fnEstablecer();
            }

            globlalState.ifAbiertos += 1;

            const nuevoNivel = Math.max(nuevoNivel1, indentacionNuevaLinea);

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

            const exprCondicional = new ECondicional(
                tokenIf.inicio,
                tokenIf.numLinea,
                tokenIf.posInicioLinea,
                [exprCondicionIf, exprBloque]
            );
            const exprRespuestaRes = new PExito(exprCondicional);

            const sigExpresionRaw = sigExpresion(
                indentacionNuevaLinea,
                indentacionNuevaLinea,
                0,
                Asociatividad.Izq,
                true
            );

            // Cerrar el if
            globlalState.ifAbiertos -= 1;

            // Continuar parseando expresiones luego de terminar el condicional
            switch (sigExpresionRaw.type) {
                case "PError":
                    return sigExpresionRaw
                case "PErrorLexer":
                    return sigExpresionRaw
                case "PReturn":
                case "PEOF":
                    return exprRespuestaRes
                case "PExito": {
                    const nuevaExpr = sigExpresionRaw.expr;
                    switch (nuevaExpr.type) {
                        case "EBloque": {
                            return new PExito(new EBloque([exprCondicional, ...nuevaExpr.bloque]));
                        }
                        default: {
                            return new PExito(new EBloque([exprCondicional, nuevaExpr]));
                        }
                    }
                }
                default: {
                    let _: never;
                    _ = sigExpresionRaw;
                    return _;
                }
            }
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
