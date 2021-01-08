import { Lexer } from "../../AnalisisLexico/Lexer";
import { Asociatividad } from "../Asociatividad";
import { ExprRes, PError, PExito } from "../ExprRes";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { getGlobalState } from "./utilidades";
import { Expresion } from "../Expresion";
import { ErrorComun, Expect } from "../Expect";
import { EObjeto } from "../Expresion/EObjeto";

export function getSigExprObjeto(
    lexer: Lexer,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        precedencia: number,
        asociatividad: Asociatividad
    ) => ExprRes
) {

    function sigExprObjeto(infoArray: InfoToken<string>, indentacionNuevaLinea: number, indentacionMinima: number) {
        try {
            const globalState = getGlobalState();
            globalState.llavesAbiertas++;

            const entradas: [InfoToken<string>, Expresion][] = [];

            let ultimoTokenEsComa = false;
            // Parsear todas las expresiones posibles
            while (true) {

                // Revisar si el sig token es una llave cerrada, y terminar el objeto si es asi
                const sigToken = lexer.sigToken();
                if (sigToken.type === "TokenLexer" && sigToken.token.type === "TLlaveCer") {
                    if (ultimoTokenEsComa) {
                        return new PError("Los objetos no pueden tener comas colgantes.");
                    }

                    return new PExito(
                        new EObjeto(entradas, infoArray.inicio, infoArray.numLinea, infoArray.posInicioLinea)
                    );
                }

                // El siguiente token no es una llave cerrada. Retroceder y seguir flujo normal
                lexer.retroceder();

                const identificador = Expect.TIdentificador(
                    lexer.sigToken.bind(lexer),
                    undefined,
                    "Se esperaba un identificador como clave"
                );

                const sigExpr = sigExpresion(0, 0, 0, Asociatividad.Izq);
                if (sigExpr.type === "PEOF" || sigExpr.type === "PError" || sigExpr.type === "PErrorLexer") {
                    return sigExpr;
                }

                if (sigExpr.type === "PReturn") {
                    const sigToken = lexer.sigToken();
                    if (sigToken.type === "EOFLexer" || sigToken.type === "ErrorLexer") {
                        return new PError("El objeto esta incompleto");
                    }

                    switch (sigToken.token.type) {
                        // Continuar el bucle.
                        case "TComa": {
                            ultimoTokenEsComa = true;
                            break;
                        }
                        // Terminar el objeto
                        case "TLlaveCer": {
                            if (ultimoTokenEsComa) {
                                return new PError("Los objetos no pueden tener comas colgantes.");
                            }

                            return new PExito(
                                new EObjeto(entradas, infoArray.inicio, infoArray.numLinea, infoArray.posInicioLinea)
                            );
                        }
                        default: {
                            return new PError("Se encontró un token inesperado dentro del objeto.");
                        }
                    }

                } else {
                    ultimoTokenEsComa = false;
                    const expr = sigExpr.expr;
                    entradas.push([identificador, expr]);
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

    return sigExprObjeto;
}
