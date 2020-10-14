import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito } from "../ExprRes";
import { getGlobalState } from "./utilidades";
import { ErrorComun, Expect } from "../Expect";
import { ECondicional, Expresion } from "../Expresion";

interface Retorno<A> {
    error?: ExprRes
    exito?: A
}

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

    function obtExpresionBloqueCodigo(indentacionNuevaLinea: number): Retorno<Expresion> {
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
            return {error: new PError("Se esperaba una expresión luego de 'do'.")};
        } else if (sigExprCuerpo.type === "PError") {
            return {error: new PError(`Se esperaba una expresión luego de 'do':\n${sigExprCuerpo.err}`)};
        } else if (sigExprCuerpo.type === "PErrorLexer") {
            return {error: sigExprCuerpo};
        }

        return {exito: sigExprCuerpo.expr};
    }

    function obtExpresionesCondicion(indentacionNuevaLinea: number, tipoCondicion = "if"): Retorno<[Expresion, Expresion]> {

        // Obtener la posicion del siguiente token para ajustar la indentacion
        const tokenSig = lexer.lookAhead();
        if (tokenSig.type !== "TokenLexer") {
            return {error: new PError(`Se esperaba una expresión luego de '${tipoCondicion}'.`)};
        }
        const posInicio = tokenSig.token.token.inicio - tokenSig.token.token.posInicioLinea;

        // Obtener la expresion que se usara como condicional
        const sigExpr = sigExpresion(posInicio, indentacionNuevaLinea, 0, Asociatividad.Izq, true);
        if (sigExpr.type === "PReturn" || sigExpr.type === "PEOF") {
            return {error: new PError(`Se esperaba una expresión luego de '${tipoCondicion}'.`)};
        } else if (sigExpr.type === "PError") {
            return {error: new PError(`Se esperaba una expresión luego de '${tipoCondicion}':\n${sigExpr.err}`)};
        } else if (sigExpr.type === "PErrorLexer") {
            return {error: sigExpr};
        }

        const exprCondicionIf = sigExpr.expr;

        // Esperar el token 'do', o lanzar un error
        Expect.PC_DO(lexer.sigToken(), "Se esperaba el token 'do'.", lexer);

        const exprBloquePre = obtExpresionBloqueCodigo(indentacionNuevaLinea);
        if (exprBloquePre.error) {
            return {error: exprBloquePre.error};
        }

        const exprBloque = exprBloquePre.exito!!;

        return {exito: [exprCondicionIf, exprBloque]};
    }

    function sigExprCondicional(tokenIf: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        try {

            const resultadoExpresionesIf = obtExpresionesCondicion(indentacionNuevaLinea);

            if (resultadoExpresionesIf.error) return resultadoExpresionesIf.error;

            const [exprCondicionIf, exprBloqueIf] = resultadoExpresionesIf.exito!!

            const arrExpresionesElif: [Expresion, Expresion][] = [];

            // Iterar por todos los 'elif'
            while (true) {
                try {
                    const [token, _, __, fnSet] = lexer.lookAheadSignificativo(false);
                    Expect.PC_ELIF(token, "", lexer);

                    fnSet();
                    // Consumir el token ELIF
                    lexer.sigToken();
                    const resultadoExpresionesElif = obtExpresionesCondicion(indentacionNuevaLinea, "elif");
                    if (resultadoExpresionesElif.error) return resultadoExpresionesElif.error;
                    arrExpresionesElif.push(resultadoExpresionesElif.exito!!);

                } catch (e) {
                    break;
                }
            }

            let expresionBloqueElse: Expresion | undefined;
            // Buscar un 'else'
            try {
                const [token, _, __, fnSet] = lexer.lookAheadSignificativo(false);
                Expect.PC_ELSE(token, "", lexer);

                fnSet();
                // Consumir el token ELIF
                lexer.sigToken();
                const resultadoExpresionElse = obtExpresionBloqueCodigo(indentacionNuevaLinea);
                if (resultadoExpresionElse.error) return resultadoExpresionElse.error;
                expresionBloqueElse = resultadoExpresionElse.exito!!;
            } catch (e) {
                lexer.retroceder();
            }

            // Crear AST
            const exprCondicional = new ECondicional(
                tokenIf.inicio,
                tokenIf.numLinea,
                tokenIf.posInicioLinea,
                [exprCondicionIf, exprBloqueIf],
                arrExpresionesElif.length > 0? arrExpresionesElif: undefined,
                expresionBloqueElse
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
