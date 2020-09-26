import { Lexer } from "../..";
import { EBloque, Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PErrorLexer, PExito, PReturn } from "../ExprRes";
import { Asociatividad } from "../Asociatividad";
import { ResLexer } from "../../AnalisisLexico/ResLexer";
import {obtInfoFunAppl, obtInfoOp, generarTextoError} from "./utilidades"

export const generarParserContinuo = (
    lexer: Lexer,
    primeraExprId: Expresion,
    precedencia: number,
    sigExprOperador: (
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        nivel: number,
        precedencia: any,
        __: any,
        esExprPrincipal: boolean
    ) => ExprRes,
    infoIdInicio: number,
    esExprPrincipal: boolean,
    infoIdNumLinea: number,
    infoIdPosInicioLinea: number,
    nivel: number,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        iniciarIndentacionEnToken: boolean,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ) => ExprRes,
) => {
    function funDesicion(lexerRes: ResLexer, aceptarSoloOperador: boolean, fnEnOp: () => void, funValorDefecto: () => ExprRes): ExprRes {
        switch (lexerRes.type) {
            case "EOFLexer":
                return new PExito(primeraExprId);
            case "ErrorLexer":
                return new PErrorLexer(lexerRes.razon);
            case "TokenLexer": {
                const token = lexerRes.token;
                switch (token.type) {
                    case "TIdentificador":
                    case "TNumero":
                    case "TTexto":
                    case "TBool":
                    case "TParenAb": {
                        if (aceptarSoloOperador) fnEnOp();

                        lexer.retroceder();
                        const [precFunApl, asocFunApl] = [14, Asociatividad.Izq];
                        if (precFunApl > precedencia) {
                            let infoOpFunApl = obtInfoFunAppl(false, infoIdInicio, infoIdNumLinea, infoIdPosInicioLinea);
                            return sigExprOperador(primeraExprId, infoOpFunApl, nivel, precedencia, asocFunApl, esExprPrincipal);
                        } else if (precFunApl == precedencia && asocFunApl == Asociatividad.Der) {
                            let infoOpFunApl = obtInfoFunAppl(false, infoIdInicio, infoIdNumLinea, infoIdPosInicioLinea);
                            return sigExprOperador(primeraExprId, infoOpFunApl, nivel, precedencia, asocFunApl, esExprPrincipal);
                        } else {
                            return new PExito(primeraExprId);
                        }
                    }
                    case "TOperador": {
                        const infoOp = token.token;
                        fnEnOp();
                        const [precOp, asocOp] = obtInfoOp(infoOp.valor);
                        if (precOp > precedencia) {
                            return sigExprOperador(primeraExprId, infoOp, nivel, precedencia, asocOp, esExprPrincipal);
                        } else if (precOp == precedencia && asocOp == Asociatividad.Der) {
                            return sigExprOperador(primeraExprId, infoOp, nivel, precedencia, asocOp, esExprPrincipal);
                        } else {
                            lexer.retroceder();
                            return new PExito(primeraExprId);
                        }
                    }
                    case "TNuevaLinea": {
                        if (aceptarSoloOperador) return funValorDefecto();

                        lexer.retroceder();
                        let [tokenSig, indentacion, _, fnEstablecer] = lexer.lookAheadSignificativo(true);

                        let expresionRespuesta = new PExito(primeraExprId);

                        if (!esExprPrincipal) return expresionRespuesta;

                        if (indentacion < nivel) {
                            return expresionRespuesta;
                        } else if (indentacion === nivel) {
                            const nuevaFnEst = () => {
                                fnEstablecer();
                                lexer.sigToken();
                            };

                            const funSiNoEsOp = () => {
                                let primeraExpresion = expresionRespuesta;
                                fnEstablecer();
                                let sigExpresionRaw = sigExpresion(nivel, nivel, false, 0, Asociatividad.Izq, true);
                                switch (sigExpresionRaw.type) {
                                    case "PError":
                                        return new PError(sigExpresionRaw.err);
                                    case "PErrorLexer":
                                        return sigExpresionRaw;
                                    case "PReturn":
                                    case "PEOF":
                                        return primeraExpresion;
                                    case "PExito": {
                                        const nuevaExpr = sigExpresionRaw.expr;
                                        switch (nuevaExpr.type) {
                                            case "EBloque": {
                                                const exprs = nuevaExpr.bloque;
                                                return new PExito(new EBloque([primeraExprId, ...exprs]));
                                            }
                                            default: {
                                                return new PExito(new EBloque([primeraExprId, nuevaExpr]));
                                            }
                                        }
                                    }
                                    default:
                                        let _: never;
                                        _ = sigExpresionRaw;
                                        return _;
                                }
                            };
                            return funDesicion(tokenSig, true, nuevaFnEst, funSiNoEsOp);

                        } else {
                            fnEstablecer();
                            return funDesicion(
                                lexer.sigToken(),
                                false,
                                () => {},
                                () => new PReturn()
                            );
                        }
                    }
                    case "TComentario": {
                        console.log("Atorado en parser?");
                        return funDesicion(lexer.sigToken(), aceptarSoloOperador, fnEnOp, funValorDefecto);
                    }
                    case "TParenCer": {
                        if (!aceptarSoloOperador) {
                            lexer.retroceder();
                            return new PExito(primeraExprId);
                        } else {
                            return funValorDefecto();
                        }
                    }
                    case "PC_LET": {
                        const info = token.token;
                        const textoError = generarTextoError(lexer.entrada, info);
                        return new PError(`No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n${textoError}`)
                    }
                    case "PC_CONST": {
                        const info = token.token;
                        const textoError = generarTextoError(lexer.entrada, info);
                        return new PError(`No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n${textoError}`)
                    }
                    case "TAgrupAb": {
                        const info = token.token;
                        const textoError = generarTextoError(lexer.entrada, info);
                        return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
                    }
                    case "TAgrupCer": {
                        const info = token.token;
                        const textoError = generarTextoError(lexer.entrada, info);
                        return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
                    }
                    case "TGenerico": {
                        if (!aceptarSoloOperador) {
                            const infoGen = token.token;
                            const textoError = generarTextoError(lexer.entrada, infoGen);
                            console.error(token);
                            return new PError(`No se esperaba un genérico luego del identificador.\n\n${textoError}`)
                        } else {
                            return funValorDefecto();
                        }
                    }
                    case "PC_IF": {
                        if (aceptarSoloOperador) return funValorDefecto();

                        const info = token.token;
                        let textoError = generarTextoError(lexer.entrada, info);
                        return new PError(`No se esperaba la palabra clave 'if' luego de la aplicación del operador.
                                                \n\n${textoError}
                                                Si deseas usar un condicional como parámetro de una función encierra la
                                                condición en paréntesis.`);
                    }
                    case "PC_DO": {
                        if (aceptarSoloOperador) return funValorDefecto();

                        // Asumir que estamos dentro de una condicion y que esta termino.
                        lexer.retroceder();
                        return new PExito(primeraExprId);
                    }
                    case "PC_ELIF": {
                        if (aceptarSoloOperador) return funValorDefecto();

                        // Asumir que estamos dentro de una condicion y que esta termino.
                        lexer.retroceder();
                        return new PExito(primeraExprId);
                    }
                    case "PC_ELSE": {
                        if (aceptarSoloOperador) return funValorDefecto();

                        // Asumir que estamos dentro de una condicion y que esta termino.
                        lexer.retroceder();
                        return new PExito(primeraExprId);
                    }
                    default:
                        let _: never;
                        _ = token;
                        return _;
                }
            }
        }
    }

    return funDesicion;
};
