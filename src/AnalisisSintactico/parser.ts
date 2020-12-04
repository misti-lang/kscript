import { InfoToken } from "../AnalisisLexico/InfoToken";
import { Asociatividad } from "./Asociatividad";
import { Lexer } from "../AnalisisLexico/Lexer";
import { ErrorLexerP, ErrorParser, ExitoParser, ResParser } from "./ResParser";
import { ExprRes, PEOF, PError, PErrorLexer, PExito, PReturn } from "./ExprRes";
import { ErrorComun, Expect } from "./Expect";
import {
    Expresion
} from "./Expresion";
import { SignIndefinida } from "./Signatura";
import { ExprIdInfo } from "./ExprIdInfo";
import { getParserSigExprOperador } from "./Parsers/sigExprOperador";
import { generarParserContinuo } from "./Parsers/parserContinuo";
import { generarTextoError, getGlobalState, obtInfoFunAppl, obtInfoOp, operadoresUnarios } from "./Parsers/utilidades"
import { getSigExprParen } from "./Parsers/sigExprParen";
import { getSigExprCondicional } from "./Parsers/sigExprCondicional";
import { getSigExprFuncion } from "./Parsers/sigExprFuncion";
import { EUndefined } from "./Expresion/EUndefined";
import { EIdentificador } from "./Expresion/EIdentificador";
import { ENumero } from "./Expresion/ENumero";
import { ETexto } from "./Expresion/ETexto";
import { EBool } from "./Expresion/EBool";
import { eOperador } from "./Expresion/EOperador";
import { EOperadorUnarioIzq } from "./Expresion/EOperadorUnarioIzq";
import { EDeclaracion } from "./Expresion/EDeclaracion";
import { EBloque } from "./Expresion/EBloque";
import { getSigExprArray } from "./Parsers/sigExprArray";

export function parseTokens(lexer: Lexer): ResParser {

    const globalState = getGlobalState();

    /**
     * Parsea una expresión de declaracion (let x = ..., const x = ...)
     * @param indentacionNuevaLinea La indentación de tokens en nuevas lineas.
     * @param indentacionMinima La indentación de la expresion actual.
     * @param esMut Si es una declaración tipo 'let' o 'const'
     */
    function sigExprDeclaracion(indentacionNuevaLinea: number, indentacionMinima: number, esMut: boolean): ExprRes {
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

            const [_, nuevoNivel1, hayNuevaLinea, fnEstablecer] = lexer.lookAheadSignificativo(false);

            if (hayNuevaLinea && nuevoNivel1 <= indentacionNuevaLinea) {
                throw new ErrorComun(`La expresión actual está incompleta. Se esperaba una expresión indentada.`);
            }

            if (hayNuevaLinea) {
                fnEstablecer();
            }

            // Enviar el mayor entre el nivel del token y el nivel heredado
            const nuevoNivel = Math.max(nuevoNivel1, indentacionNuevaLinea);

            // Obtener expresion que representa el valor de la declaracion
            const sigExpr = hayNuevaLinea ?
                sigExpresionBloque(nuevoNivel, true) :
                sigExpresion(
                    nuevoNivel,
                    hayNuevaLinea ? nuevoNivel : indentacionMinima,
                    0,
                    Asociatividad.Izq
                );

            // Casos de error de la expresión inicializadora :D
            if (sigExpr.type === "PEOF" || sigExpr.type === "PReturn") {
                return new PError("Se esperaba una expresión luego de la asignación");
            } else if (sigExpr.type === "PErrorLexer") {
                return sigExpr;
            } else if (sigExpr.type === "PError") {
                return new PError(`Se esperaba una expresión luego de la asignación: ${sigExpr.err}`);
            }

            const exprFinal = sigExpr.expr;

            const exprDeclaracion = new EDeclaracion(
                esMut,
                new EIdentificador(new SignIndefinida(), infoTokenId),
                exprFinal,
                infoTokenId.inicio,
                infoTokenId.numLinea,
                infoTokenId.posInicioLinea
            );
            return new PExito(exprDeclaracion);
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
        nivel: number
    ): ExprRes {
        const valorOp = infoOp.valor;
        const [precOp1, asocOp1] = obtInfoOp(valorOp);
        const sigExpr = sigExpresion(
            nivel,
            nivel,
            precOp1,
            asocOp1
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
        indentacionNuevaLinea: number,
        indentacionMinima: number,
        precedencia: number
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
            infoIdNumLinea,
            infoIdPosInicioLinea,
            indentacionNuevaLinea,
            indentacionMinima
        );

        return funDesicion(lexer.sigToken());
    }

    const sigExprParen = getSigExprParen(lexer, sigExpresion);
    const sigExprArray = getSigExprArray(lexer, sigExpresion);
    const sigExprCondicional = getSigExprCondicional(lexer, sigExpresion, sigExpresionBloque);
    const sigExprFuncion = getSigExprFuncion(lexer, sigExpresion, sigExpresionBloque);

    /**
     * Obtiene el siguiente bloque de expresiones.
     */
    function sigExpresionBloque(
        nivel: number,
        esExpresion: boolean = false
    ): ExprRes {

        const exprs: Array<Expresion> = [];
        while (true) {
            const sigExpr = sigExpresion(nivel, nivel, 0, Asociatividad.Izq);
            switch (sigExpr.type) {
                case "PErrorLexer":
                case "PError":
                    return sigExpr
                case "PEOF":
                case "PReturn":
                    return new PExito(new EBloque(exprs, esExpresion))
                case "PExito": {
                    exprs.push(sigExpr.expr)
                }
            }
        }
    }

    /**
     *
     * @param indentacionNuevaLinea El nivel de indentacion que deben tener los tokens en nuevas lineas para que
     *                              se consideren parte de la expresion
     * @param indentacionMinima El nivel de indentacion minima para que el token se considere parte de la expresion
     * @param precedencia
     * @param asociatividad
     */
    function sigExpresion(
        indentacionNuevaLinea: number,
        indentacionMinima: number,
        precedencia: number,
        asociatividad: Asociatividad
    ): ExprRes {

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
                if (token.token.indentacion < indentacionMinima) {
                    console.log("Error de indentacion?");
                    console.log("Esperado ", indentacionMinima, ", obtenido", token.token.indentacion);
                    lexer.retroceder();
                    return new PReturn();
                }
                switch (token.type) {
                    case "PC_LET": {
                        return sigExprDeclaracion(indentacionNuevaLinea, indentacionMinima, true);
                    }
                    case "PC_CONST": {
                        return sigExprDeclaracion(indentacionNuevaLinea, indentacionMinima, false);
                    }
                    case "TComentario":
                        return sigExpresion(indentacionNuevaLinea, indentacionMinima, precedencia, asociatividad);
                    case "TNumero": {
                        const infoNumero = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new ENumero(infoNumero),
                            infoInicio: infoNumero.inicio,
                            infoNumLinea: infoNumero.numLinea,
                            infoPosInicioLinea: infoNumero.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, indentacionNuevaLinea, indentacionMinima, precedencia);
                    }
                    case "TTexto": {
                        const infoTexto = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new ETexto(infoTexto),
                            infoInicio: infoTexto.inicio,
                            infoNumLinea: infoTexto.numLinea,
                            infoPosInicioLinea: infoTexto.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, indentacionNuevaLinea, indentacionMinima, precedencia);
                    }
                    case "TBool": {
                        const infoBool = token.token;
                        let exprIdInfo: ExprIdInfo = {
                            expr: new EBool(infoBool),
                            infoInicio: infoBool.inicio,
                            infoNumLinea: infoBool.numLinea,
                            infoPosInicioLinea: infoBool.posInicioLinea
                        };
                        return sigExprIdentificador(exprIdInfo, indentacionNuevaLinea, indentacionMinima, precedencia);
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
                        return sigExprIdentificador(exprIdInfo, indentacionNuevaLinea, indentacionMinima, precedencia);
                    }
                    case "TParenAb": {
                        const infoParen = token.token;
                        return sigExprParen(infoParen, indentacionNuevaLinea, indentacionMinima);
                    }
                    case "TParenCer": {
                        const infoParen = token.token;
                        if (globalState.parensAbiertos > 0) {
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
                        if (sigNivel >= indentacionNuevaLinea) {
                            fnEstablecer();
                            return sigExpresion(indentacionNuevaLinea, indentacionMinima, precedencia, asociatividad);
                        } else {
                            return new PReturn();
                        }
                    }
                    case "TAgrupAb":
                    case "TAgrupCer": {
                        return new PError(`Otros signos de agrupación aun no estan soportados.`)
                    }
                    case "TCorcheteAb": {
                        const infoCorchete = token.token;
                        return sigExprArray(infoCorchete, indentacionNuevaLinea, indentacionMinima);
                    }
                    case "TCorcheteCer": {
                        const infoCorchete = token.token;
                        if (globalState.corchetesAbiertos > 0) {
                            lexer.retroceder();
                            return new PReturn();
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, infoCorchete);
                            return new PError(`No se esperaba un corchete aquí. No hay ningún array a cerrar.\n\n${textoErr}`);
                        }
                    }
                    case "TGenerico":
                        return new PError(`Los genericos aun no estan soportados.`);
                    case "TOperador": {
                        const infoOp = token.token;
                        if (operadoresUnarios.find(s => infoOp.valor === s)) {
                            return sigExprOpUnarioIzq(infoOp, indentacionNuevaLinea);
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, infoOp);
                            return new PError(`No se puede usar el operador ${infoOp.valor} como operador unario.\n\n${textoErr}`);
                        }
                    }
                    case "TComa": {
                        if (globalState.parensAbiertos > 0 || globalState.corchetesAbiertos > 0) {
                            lexer.retroceder();
                            return new PReturn();
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, token.token);
                            return new PError(`No se esperaba una coma aquí. No hay ningún paréntesis, corchete o llave abierto.\n\n${textoErr}`);
                        }
                    }
                    case "PC_IF": {
                        return sigExprCondicional(token.token, indentacionNuevaLinea);
                    }
                    case "PC_ELSE":
                    case "PC_ELIF": {
                        if (globalState.ifAbiertos > 0) {
                            lexer.retroceder();
                            return new PReturn();
                        } else {
                            let textoErr = generarTextoError(lexer.entrada, token.token);
                            return new PError(`No se esperaba la palabra clave 'elif'. No hay ningún condicional abierto.\n\n${textoErr}`);
                        }
                    }
                    case "PC_DO": {
                        return new PError("No se esperada la palabra clave 'do' aqui.")
                    }
                    case "PC_FUN": {
                        return sigExprFuncion(token.token, indentacionNuevaLinea);
                    }
                    case "TUndefined": {
                        return new PExito(new EUndefined(token.token));
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

    // const exprRe = sigExpresion(0, true, 0, Asociatividad.Izq, true);
    const exprRe = sigExpresionBloque(0, false);
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
