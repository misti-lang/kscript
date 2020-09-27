import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito } from "../ExprRes";
import { EIdentificador } from "../Expresion";
import { SignIndefinida } from "../Signatura";
import { Asociatividad } from "../Asociatividad";
import { generarTextoError } from "./utilidades";
import { Lexer } from "../..";
import { generarParserContinuo } from "./parserContinuo";

export const getSigExprParen = (
    lexer: Lexer,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        iniciarIndentacionEnToken: boolean,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ) => ExprRes
) => {
    function sigExprParen(infoParen: InfoToken<string>, parensAbiertos: { v: number }) {
        parensAbiertos.v++;
        const sigToken = lexer.sigToken();

        if (sigToken.type == "EOFLexer") {
            return new PError("Parentesis sin cerrar");
        } else if (sigToken.type == "ErrorLexer") {
            return new PError(`Error lexico: ${sigToken.razon}\nParentesis sin cerrar.`);
        }

        const t = sigToken.token;

        if (t.type === "TParenCer") {
            const infoParenCer = t.token;
            return new PExito(new EIdentificador(new SignIndefinida(), {
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
            false,
            0,
            Asociatividad.Izq,
            true
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
                            /* TODO: Aqui debe cerrar la expresion y continuar buscando una nueva expresion.
                                     Básicamente hacer lo mismo que hace funDesicion en el parser de operador e
                                     identificador.
                                     Pedir una sig. expresión y hacer lo de funDesicion.
                            */
                            case "TParenCer": {
                                parensAbiertos.v--;

                                /*
                                TODO:
                                const funDesicion = generarParserContinuo(
                                    lexer,
                                    sigExpr2,
                                    precedencia,
                                    sigExprOperador,
                                    posEI.inicioPE,
                                    esExprPrincipal,
                                    posEI.numLineaPE,
                                    posEI.posInicioLineaPE,
                                    nivel,
                                    sigExpresion
                                );
                                */

                                return new PExito(sigExpr2);
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
