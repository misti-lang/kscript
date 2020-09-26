import { EBloque, eOperador, EOperadorApl, Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito, PReturn } from "../ExprRes";
import { SignIndefinida } from "../Signatura";
import { ResLexer } from "../../AnalisisLexico/ResLexer";
import { Asociatividad } from "../Asociatividad";
import { obtPosExpr } from "../PosExpr";
import { Lexer } from "../../AnalisisLexico/Lexer";
import {generarTextoError} from "./utilidades";

export function getParserSigExprOperador(
    lexer: Lexer,
    obtInfoOp: (operador: string) => [number, Asociatividad],
    obtInfoFunAppl: (esCurry: boolean, inicio: number, numLinea: number, posInicioLinea: number) => InfoToken<string>,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        iniciarIndentacionEnToken: boolean,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ) => ExprRes
) {

    function onSigExprExito(
        sigExpr: PExito,
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        precOp1: number,
        asocOp1: Asociatividad,
        precedencia: any,
        nivel: number,
        esExprPrincipal: boolean
    ) {
        const exprFinal = sigExpr.expr;

        const eOperadorRes = new eOperador(
            new SignIndefinida(),
            infoOp,
            precOp1,
            asocOp1
        );
        const exprOpRes = new EOperadorApl(eOperadorRes, exprIzq, exprFinal);

        function funDesicion(lexerRes: ResLexer, aceptarSoloOp: boolean, fnEnOp: () => void, funValorDefecto: () => ExprRes): ExprRes {
            switch (lexerRes.type) {
                case "EOFLexer":
                    return new PExito(exprOpRes)
                case "ErrorLexer":
                    return new PError(lexerRes.razon)
                case "TokenLexer": {
                    const token = lexerRes.token;
                    switch (token.type) {
                        case "TOperador": {
                            fnEnOp();
                            const [precOp, asocOp] = obtInfoOp(token.token.valor);

                            if (precOp > precedencia) {
                                return sigExprOperador(exprOpRes, token.token, nivel, precedencia, asocOp, esExprPrincipal);
                            } else if (precOp == precedencia && precOp == Asociatividad.Der) {
                                return sigExprOperador(exprOpRes, token.token, nivel, precedencia, asocOp, esExprPrincipal);
                            } else {
                                lexer.retroceder();
                                return new PExito(exprOpRes);
                            }
                        }
                        case "TParenCer": {
                            if (aceptarSoloOp) return funValorDefecto();

                            lexer.retroceder();
                            return new PExito(exprOpRes);
                        }
                        case "TIdentificador":
                        case "TNumero":
                        case "TTexto":
                        case "TBool":
                        case "TParenAb": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const posEI = obtPosExpr(exprIzq);
                            const infoOp2 = obtInfoFunAppl(false, posEI.inicioPE, posEI.numLineaPE, posEI.posInicioLineaPE);

                            const [precOpFunApl, asocOpFunApl] = obtInfoOp(infoOp2.valor);
                            lexer.retroceder();

                            if (precOpFunApl > precedencia) {
                                return sigExprOperador(exprOpRes, infoOp2, nivel, precedencia, asocOpFunApl, esExprPrincipal);
                            } else if (precOpFunApl == precedencia && asocOpFunApl == Asociatividad.Der) {
                                return sigExprOperador(exprOpRes, infoOp2, nivel, precedencia, asocOpFunApl, esExprPrincipal);
                            } else {
                                return new PExito(exprOpRes);
                            }
                        }
                        case "TGenerico": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const infoGen = token.token;
                            let textoError = generarTextoError(lexer.entrada, infoGen);
                            return new PError(`No se esperaba un genérico luego de la aplicación del operador.\n\n${textoError}`);
                        }
                        case "TComentario": {
                            return funDesicion(lexer.sigToken(), aceptarSoloOp, fnEnOp, funValorDefecto);
                        }
                        case "PC_LET": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const info = token.token;
                            let textoError = generarTextoError(lexer.entrada, info);
                            return new PError(`No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n${textoError}`)
                        }
                        case "PC_CONST": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const info = token.token;
                            let textoError = generarTextoError(lexer.entrada, info);
                            return new PError(`No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n${textoError}`)
                        }
                        case "TAgrupAb": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const info = token.token;
                            let textoError = generarTextoError(lexer.entrada, info);
                            return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
                        }
                        case "TAgrupCer": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const info = token.token;
                            let textoError = generarTextoError(lexer.entrada, info);
                            return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
                        }
                        case "TNuevaLinea": {
                            if (aceptarSoloOp) return funValorDefecto();

                            lexer.retroceder();
                            const [resLexer, indentacion, _, fnEstablecer] = lexer.lookAheadSignificativo(true);

                            const expresionRespuesta = new PExito(exprOpRes);

                            if (!esExprPrincipal) return expresionRespuesta;

                            if (indentacion < nivel) {
                                return expresionRespuesta;
                            } else if (indentacion === nivel) {
                                let nuevaFnEst = () => {
                                    fnEstablecer();
                                    lexer.sigToken();
                                };

                                const funSiNoEsOp = () => {
                                    let primeraExpresion = expresionRespuesta;
                                    fnEstablecer();
                                    let sigExpresionRaw = sigExpresion(nivel, nivel, false, 0, Asociatividad.Izq, true);
                                    switch (sigExpresionRaw.type) {
                                        case "PError":
                                            return sigExpresionRaw;
                                        case "PErrorLexer":
                                            return sigExpresionRaw
                                        case "PReturn":
                                        case "PEOF": {
                                            return primeraExpresion
                                        }
                                        case "PExito": {
                                            const nuevaExpr = sigExpresionRaw.expr;
                                            switch (nuevaExpr.type) {
                                                case "EBloque": {
                                                    const exprs = nuevaExpr.bloque;
                                                    return new PExito(new EBloque([exprOpRes, ...exprs]));
                                                }
                                                default: {
                                                    return new PExito(new EBloque([exprOpRes, nuevaExpr]));
                                                }
                                            }
                                        }
                                    }
                                };
                                return funDesicion(resLexer, true, nuevaFnEst, funSiNoEsOp);

                            } else {
                                fnEstablecer();
                                return funDesicion(lexer.sigToken(), false, () => {
                                }, () => new PReturn());
                            }
                        }
                        case "PC_IF": {
                            if (aceptarSoloOp) return funValorDefecto();

                            const info = token.token;
                            let textoError = generarTextoError(lexer.entrada, info);
                            return new PError(`No se esperaba la palabra clave 'if' luego de la aplicación del operador.
                                                \n\n${textoError}
                                                Si deseas usar un condicional como parámetro de una función encierra la
                                                condición en paréntesis.`);
                        }
                        case "PC_DO": {
                            if (aceptarSoloOp) return funValorDefecto();

                            // Asumir que estamos dentro de una condicion y que esta termino.
                            lexer.retroceder();
                            return new PExito(exprOpRes);
                        }
                        case "PC_ELIF": {
                            if (aceptarSoloOp) return funValorDefecto();

                            // Asumir que estamos dentro de una condicion y que esta termino.
                            lexer.retroceder();
                            return new PExito(exprOpRes);
                        }
                        case "PC_ELSE": {
                            if (aceptarSoloOp) return funValorDefecto();

                            // Asumir que estamos dentro de una condicion y que esta termino.
                            lexer.retroceder();
                            return new PExito(exprOpRes);
                        }
                        default: {
                            let _: never;
                            _ = token;
                            return _;
                        }
                    }
                }
            }
        }

        return funDesicion(lexer.sigToken(), false, () => {
        }, () => new PReturn());
    }

    function sigExprOperador(
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        nivel: number,
        precedencia: any,
        __: any,
        esExprPrincipal: boolean
    ): ExprRes {

        const valorOp = infoOp.valor;
        const [precOp1, asocOp1] = obtInfoOp(valorOp);
        const sigExpr = sigExpresion(nivel, nivel, false, precOp1, asocOp1, false);

        switch (sigExpr.type) {
            case "PEOF":
            case "PReturn":
                return new PError(`Se esperaba una expresión a la derecha del operador ${valorOp}`);
            case "PErrorLexer":
                return sigExpr;
            case "PError":
                return new PError(`Se esperaba una expresion a la derecha del operador ${valorOp} :\n${sigExpr.err}.`);
            case "PExito": {
                return onSigExprExito(
                    sigExpr,
                    exprIzq,
                    infoOp,
                    precOp1,
                    asocOp1,
                    precedencia,
                    nivel,
                    esExprPrincipal,
                );
            }
            default: {
                let _: never;
                _ = sigExpr;
                return _;
            }
        }

    }

    return sigExprOperador;
}
