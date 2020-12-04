import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito, PReturn } from "../ExprRes";
import { SignIndefinida } from "../Signatura";
import { Asociatividad } from "../Asociatividad";
import { generarTextoError, getGlobalState, obtInfoFunAppl, obtInfoOp } from "./utilidades";
import { Lexer } from "../..";
import { generarParserContinuo } from "./parserContinuo";
import { getParserSigExprOperador } from "./sigExprOperador";
import { EUndefined } from "../Expresion/EUndefined";
import { EIdentificador } from "../Expresion/EIdentificador";

export const getSigExprParen = (
    lexer: Lexer,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        precedencia: number,
        asociatividad: Asociatividad
    ) => ExprRes
) => {
    function sigExprParen(infoParen: InfoToken<string>, indentacionNuevaLinea: number, indentacionMinima: number) {
        const globalState = getGlobalState();
        globalState.parensAbiertos++;

        // Extraer un token para ver si se tiene `()`, y generar el ast adecuado
        const sigToken = lexer.sigToken();

        if (sigToken.type == "EOFLexer") {
            return new PError("Parentesis sin cerrar");
        } else if (sigToken.type == "ErrorLexer") {
            return new PError(`Error lexico: ${sigToken.razon}\nParentesis sin cerrar.`);
        }

        const t = sigToken.token;

        // Si se ingreso `()` se devuelve EUndefined
        if (t.type === "TParenCer") {
            const infoParenCer = t.token;
            return new PExito(new EUndefined({
                ...infoParen,
                valor: "()",
                final: infoParenCer.final
            }));
        }

        // Cualquier otro token
        lexer.retroceder();
        const sigToken2 = sigExpresion(
            0,
            0,
            0,
            Asociatividad.Izq
        );
        switch (sigToken2.type) {
            case "PReturn":
                return new PError("Error de indentación. El parentesis no ha sido cerrado.");
            case "PErrorLexer":
                return sigToken2;
            case "PError":
                return sigToken2;
            case "PEOF": {
                let textoErr = generarTextoError(lexer.entrada, infoParen);
                let numLinea = infoParen.numLinea;
                let numColumna = infoParen.inicio - infoParen.posInicioLinea;
                return new PError(`El parentesis abierto en ${numLinea},${numColumna} no está cerrado.\n\n${textoErr}`);
            }
            case "PExito": {
                const sigExpr2 = sigToken2.expr;
                const ultimoToken = lexer.sigToken();
                switch (ultimoToken.type) {
                    case "EOFLexer": {
                        let textoErr = generarTextoError(lexer.entrada, infoParen);
                        let numLinea = infoParen.numLinea;
                        let numColumna = infoParen.inicio - infoParen.posInicioLinea;
                        return new PError(`El parentesis abierto en ${numLinea},${numColumna} contiene una expresion, pero no está cerrado.\n\n${textoErr}`);
                    }
                    case "ErrorLexer": {
                        const error = ultimoToken.razon;
                        const textoErr = generarTextoError(lexer.entrada, infoParen);
                        const numLinea = infoParen.numLinea;
                        const numColumna = infoParen.inicio - infoParen.posInicioLinea;
                        return new PError(`El parentesis abierto en ${numLinea},${numColumna} no está cerrado.\n\n${textoErr}\nDebido a un error léxico: ${error}`);
                    }
                    case "TokenLexer": {
                        const ultimoToken3 = ultimoToken.token;
                        switch (ultimoToken3.type) {
                            case "TParenCer": {
                                globalState.parensAbiertos--;

                                const funDesicion = generarParserContinuo(
                                    lexer,
                                    sigExpr2,
                                    0,
                                    getParserSigExprOperador(
                                        lexer,
                                        obtInfoOp,
                                        obtInfoFunAppl,
                                        sigExpresion
                                    ),
                                    ultimoToken3.token.final,
                                    ultimoToken3.token.numLinea,
                                    ultimoToken3.token.posInicioLinea,
                                    indentacionNuevaLinea,
                                    indentacionMinima
                                );

                                return funDesicion(lexer.sigToken());
                            }
                            default:
                                return new PError("Se esperaba un cierre de parentesis.")
                        }
                    }
                    default:
                        let _: never;
                        _ = ultimoToken;
                        return _;
                }
            }
            default:
                let _: never;
                _ = sigToken2;
                return _;
        }

    }

    return sigExprParen;
};
