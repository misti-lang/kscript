import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { ExprRes, PError, PExito } from "../ExprRes";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { getGlobalState } from "./utilidades";
import { Expresion } from "../Expresion";
import { EArray } from "../Expresion/EArray";

export function getSigExprArray(
    lexer: Lexer,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        precedencia: number,
        asociatividad: Asociatividad
    ) => ExprRes
) {

    function sigExprArray(infoArray: InfoToken<string>, indentacionNuevaLinea: number, indentacionMinima: number) {

        const globalState = getGlobalState();
        globalState.corchetesAbiertos++;

        const expresiones: Expresion[] = [];

        // Parsear todas las expresiones posibles
        while (true) {

            const sigExpr = sigExpresion(0, 0, 0, Asociatividad.Izq);

            switch (sigExpr.type) {
                case "PEOF":
                case "PError":
                case "PErrorLexer": {
                    return sigExpr;
                }
                // Verificar si es una coma o un corchete cerrado
                case "PReturn": {
                    const sigToken = lexer.sigToken();
                    switch (sigToken.type) {
                        case "EOFLexer":
                        case "ErrorLexer": {
                            return new PError("El array está incompleto.");
                        }
                        case "TokenLexer": {
                            switch (sigToken.token.type) {
                                // Continuar el bucle.
                                case "TComa": {
                                    continue;
                                }
                                // Salir del bucle
                                case "TCorcheteCer": {
                                    return new PExito(
                                        new EArray(expresiones, infoArray.inicio, infoArray.numLinea, infoArray.posInicioLinea)
                                    );
                                }
                                default: {
                                    return new PError("Se encontró un token inesperado dentro del array.");
                                }
                            }
                        }
                    }
                }
                // Si se encontro una expresion
                case "PExito": {
                    const sigExpr2 = sigExpr.expr;
                    expresiones.push(sigExpr2);
                }
            }

        }
    }

    return sigExprArray;
}
