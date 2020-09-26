import { InfoToken } from "../AnalisisLexico/InfoToken";
import { Asociatividad } from "./Asociatividad";
import { Lexer } from "../AnalisisLexico/Lexer";
import { ErrorLexerP, ErrorParser, ExitoParser, ResParser } from "./ResParser";
import { ExprRes, PEOF, PError, PErrorLexer, PExito, PReturn } from "./ExprRes";
import { ErrorComun, Expect } from "./Expect";
import {
    EBloque,
    EBool,
    EDeclaracion,
    EIdentificador,
    ENumero,
    eOperador,
    EOperadorUnarioIzq,
    ETexto
} from "./Expresion";
import { SignIndefinida } from "./Signatura";
import { ExprIdInfo } from "./ExprIdInfo";
import { getParserSigExprOperador } from "./Parsers/sigExprOperador";
import { generarParserContinuo } from "./Parsers/parserContinuo";
import { obtInfoFunAppl, obtInfoOp, operadoresUnarios, generarTextoError } from "./Parsers/utilidades"


export function parseTokens(lexer: Lexer): ResParser {

    let parensAbiertos = 0;

    function sigExprDeclaracion(nivel: number, esMut: boolean): ExprRes {
        try {

            const infoTokenId = Expect.TIdentificador(
                lexer.sigToken.bind(lexer),
                undefined,
                "Se esperaba un identificador"
            );
            Expect.TOperador(
                lexer.sigToken.bind(lexer),
                "=",
                "Se esperaba el operador de asignación '=' luego del indentificador."
            );

            const [_, nuevoNivel, hayNuevaLinea, fnEstablecer] = lexer.lookAheadSignificativo(false);

            if (hayNuevaLinea && nuevoNivel <= nivel) {
                throw new ErrorComun(`La expresión actual está incompleta. Se esperaba una expresión indentada.`);
            }

            if (hayNuevaLinea) {
                fnEstablecer();
            }

            const sigExpr = sigExpresion(nuevoNivel, nivel, true, 0, Asociatividad.Izq, true);
            switch (sigExpr.type) {
                case "PEOF":
                case "PReturn": {
                    return new PError("Se esperaba una expresión luego de la asignación");
                }
                case "PErrorLexer":
                    return sigExpr;
                case "PError": {
                    return new PError(`Se esperaba una expresión luego de la asignación: ${sigExpr.err}`);
                }
                case "PExito": {
                    const exprFinal = sigExpr.expr;

                    const exprDeclaracion = new EDeclaracion(
                        esMut,
                        new EIdentificador(new SignIndefinida(), infoTokenId),
                        exprFinal,
                        infoTokenId.inicio,
                        infoTokenId.numLinea,
                        infoTokenId.posInicioLinea
                    );
                    const exprRespuesta = new PExito(exprDeclaracion);
                    const sigExpresionRaw = sigExpresion(
                        nivel, nivel, true,
                        0, Asociatividad.Izq, true
                    );

                    switch (sigExpresionRaw.type) {
                        case "PError":
                            return sigExpresionRaw
                        case "PErrorLexer":
                            return sigExpresionRaw
                        case "PReturn":
                        case "PEOF":
                            return exprRespuesta
                        case "PExito": {
                            const nuevaExpr = sigExpresionRaw.expr;
                            switch (nuevaExpr.type) {
                                case "EBloque": {
                                    return new PExito(new EBloque([exprDeclaracion, ...nuevaExpr.bloque]));
                                }
                                default: {
                                    return new PExito(new EBloque([exprDeclaracion, nuevaExpr]));
                                }
                            }
                        }
                        default: {
                            let _: never;
                            _ = sigExpresionRaw;
                            return _;
                        }
                    }
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

    const sigExprOperador = getParserSigExprOperador(lexer, obtInfoOp, obtInfoFunAppl, sigExpresion);

    function sigExprOpUnarioIzq(
        infoOp: InfoToken<string>,
        nivel: number,
        precedencia: any,
        esExprPrincipal: boolean
    ): ExprRes {
        const valorOp = infoOp.valor;
        const [precOp1, asocOp1] = obtInfoOp(valorOp);
        const sigExpr = sigExpresion(
            nivel,
            nivel,
            false,
            precOp1,
            asocOp1,
            esExprPrincipal
        );

        switch (sigExpr.type) {
            case "PEOF":
            case "PReturn":
            case "PErrorLexer":
            case "PError":
                return new PError("");
            case "PExito": {
                const expr = sigExpr.expr;
                const eOp = new eOperador(new SignIndefinida(), infoOp, precOp1, asocOp1);
                return new PExito(new EOperadorUnarioIzq(eOp, expr));
            }
            default:
                let _: never;
                _ = sigExpr;
                return _;
        }
    }

    function sigExprIdentificador(
        exprIdInfo: ExprIdInfo,
        nivel: number,
        precedencia: number,
        _: any,
        esExprPrincipal: boolean
    ): ExprRes {

        const primeraExprId = exprIdInfo.expr;
        const infoIdInicio = exprIdInfo.infoInicio;
        const infoIdNumLinea = exprIdInfo.infoNumLinea;
        const infoIdPosInicioLinea = exprIdInfo.infoPosInicioLinea;

        const funDesicion = generarParserContinuo(
            lexer,
            primeraExprId,
            precedencia,
            sigExprOperador,
            infoIdInicio,
            esExprPrincipal,
            infoIdNumLinea,
            infoIdPosInicioLinea,
            nivel,
            sigExpresion,
        );

        return funDesicion(
            lexer.sigToken(),
            false,
            () => {
            },
            () => new PReturn()
        );
    }

    function sigExprParen(infoParen: InfoToken<string>, _: number, __: number) {
        parensAbiertos = parensAbiertos + 1;
        const sigToken = lexer.sigToken();
        switch (sigToken.type) {
            case "EOFLexer":
                return new PError("Parentesis sin cerrar");
            case "ErrorLexer": {
                return new PError(`Error lexico: ${sigToken.razon}\nParentesis sin cerrar.`);
            }
            case "TokenLexer": {
                const t = sigToken.token;
                switch (t.type) {
                    case "TParenCer": {
                        const infoParenCer = t.token;
                        return new PExito(new EIdentificador(new SignIndefinida(), {
                            ...infoParen,
                            valor: "()",
                            final: infoParenCer.final
                        }));
                    }
                    default: {
                        lexer.retroceder();
                        const sigToken = sigExpresion(0, 0, false, 0, Asociatividad.Izq, true);
                        switch (sigToken.type) {
                            case "PReturn":
                                return new PError("Error de indentación. El parentesis no ha sido cerrado.");
                            case "PErrorLexer":
                                return sigToken;
                            case "PError":
                                return sigToken;
                            case "PEOF": {
                                let textoErr = generarTextoError(lexer.entrada, infoParen);
                                let numLinea = infoParen.numLinea;
                                let numColumna = infoParen.inicio - infoParen.posInicioLinea;
                                return new PError(`El parentesis abierto en ${numLinea},${numColumna} no está cerrado.\n\n${textoErr}`);
                            }
                            case "PExito": {
                                const sigExpr2 = sigToken.expr;
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
                                                parensAbiertos = parensAbiertos - 1;
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
                                _ = sigToken;
                                return _;
                        }
                    }
                }
            }
            default:
                let _: never;
                _ = sigToken;
                return _;
        }
    }

    function sigExpresion(
        nivel: number,
        nivelPadre: number,
        iniciarIndentacionEnToken: boolean,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ): ExprRes {

        const obtNuevoNivel = (infoToken: InfoToken<any>): number => {
            if (iniciarIndentacionEnToken) {
                return infoToken.inicio - infoToken.posInicioLinea;
            } else {
                return nivel;
            }
        };

        const resultado = lexer.sigToken();

        switch (resultado.type) {
            case "EOFLexer": {
                return new PEOF();
            }
            case "ErrorLexer": {
                return new PErrorLexer(resultado.razon);
            }
            case "TokenLexer": {
                const token = resultado.token;
                switch (token.type) {
                    case "PC_LET": {
                        return sigExprDeclaracion(obtNuevoNivel(token.token), true);
                    }
                    case "PC_CONST": {
                        return sigExprDeclaracion(obtNuevoNivel(token.token), false);
                    }
                    case "TComentario":
                        return sigExpresion(nivel, nivel, iniciarIndentacionEnToken, precedencia, asociatividad, esExprPrincipal);
                    case "TNumero": {
                        const infoNumero = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new ENumero(infoNumero),
                            infoInicio: infoNumero.inicio,
                            infoNumLinea: infoNumero.numLinea,
                            infoPosInicioLinea: infoNumero.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, obtNuevoNivel(infoNumero), precedencia, asociatividad, esExprPrincipal);
                        // sigExprLiteral(ENumero(infoNumero), obtNuevoNivel(infoNumero), precedencia, esExprPrincipal);
                    }
                    case "TTexto": {
                        const infoTexto = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new ETexto(infoTexto),
                            infoInicio: infoTexto.inicio,
                            infoNumLinea: infoTexto.numLinea,
                            infoPosInicioLinea: infoTexto.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, obtNuevoNivel(infoTexto), precedencia, asociatividad, esExprPrincipal);
                        // sigExprLiteral(ETexto(infoTexto), obtNuevoNivel(infoTexto), precedencia, esExprPrincipal);
                    }
                    case "TBool": {
                        const infoBool = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new EBool(infoBool),
                            infoInicio: infoBool.inicio,
                            infoNumLinea: infoBool.numLinea,
                            infoPosInicioLinea: infoBool.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, obtNuevoNivel(infoBool), precedencia, asociatividad, esExprPrincipal);
                        // sigExprLiteral(EBool(infoBool), obtNuevoNivel(infoBool), precedencia, esExprPrincipal);
                    }
                    case "TIdentificador": {
                        const infoId = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new EIdentificador(
                                new SignIndefinida(),
                                infoId
                            ),
                            infoInicio: infoId.inicio,
                            infoNumLinea: infoId.numLinea,
                            infoPosInicioLinea: infoId.posInicioLinea
                        }
                        return sigExprIdentificador(exprIdInfo, obtNuevoNivel(infoId), precedencia, asociatividad, esExprPrincipal);
                    }
                    case "TParenAb": {
                        const infoParen = token.token;
                        return sigExprParen(infoParen, obtNuevoNivel(infoParen), nivelPadre);
                    }
                    case "TParenCer": {
                        const infoParen = token.token;
                        if (parensAbiertos > 0) {
                            lexer.retroceder();
                            return new PReturn();
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, infoParen);
                            return new PError(`No se esperaba un parentesis aquí. No hay ningún parentesis a cerrar.\n\n${textoErr}`);
                        }
                    }
                    case "TNuevaLinea": {
                        lexer.retroceder();
                        const [_, sigNivel, __, fnEstablecer] = lexer.lookAheadSignificativo(true);
                        if (sigNivel >= nivel) {
                            fnEstablecer();
                            return sigExpresion(nivel, nivel, iniciarIndentacionEnToken, precedencia, asociatividad, esExprPrincipal);
                        } else {
                            return new PReturn();
                        }
                    }
                    case "TAgrupAb":
                    case "TAgrupCer": {
                        return new PError(`Otros signos de agrupación aun no estan soportados.`)
                    }
                    case "TGenerico":
                        return new PError(`Los genericos aun no estan soportados.`);
                    case "TOperador": {
                        const infoOp = token.token;
                        if (operadoresUnarios.find(s => infoOp.valor === s)) {
                            return sigExprOpUnarioIzq(infoOp, nivel, precedencia, esExprPrincipal);
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, infoOp);
                            return new PError(`No se puede usar el operador ${infoOp.valor} como operador unario.\n\n${textoErr}`);
                        }
                    }
                    case "PC_IF":
                    case "PC_ELSE":
                    case "PC_ELIF":
                    case "PC_DO": {
                        return new PError("Condicionales no implementados")
                    }
                    default:
                        let _: never;
                        _ = token;
                        return _;
                }
            }
            default: {
                let _: never;
                _ = resultado;
                return _;
            }
        }

    }

    let exprRe = sigExpresion(0, 0, true, 0, Asociatividad.Izq, true);
    switch (exprRe.type) {
        case "PExito":
            return new ExitoParser(exprRe.expr);
        case "PError":
            return new ErrorParser(exprRe.err);
        case "PErrorLexer":
            return new ErrorLexerP(exprRe.err);
        case "PEOF":
        case "PReturn":
            return new ExitoParser(new EBloque([]));
        default:
            let _: never;
            _ = exprRe;
            return _;
    }

}
