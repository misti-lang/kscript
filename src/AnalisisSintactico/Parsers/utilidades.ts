import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { Asociatividad } from "../Asociatividad";
import { ExprRes, PError } from "../ExprRes";
import { Lexer } from "../../AnalisisLexico/Lexer";
import { Expresion } from "../Expresion";
import { ErrorComun, Expect } from "../Expect";

export function obtInfoFunAppl(
    esCurry: boolean,
    inicio: number,
    numLinea: number,
    posInicioLinea: number,
    indentacion: number
): InfoToken<string> {
    return {
        valor: (esCurry) ? "Ñ" : "ñ",
        inicio,
        final: inicio + 1,
        numLinea,
        posInicioLinea,
        indentacion
    }
}

export function obtInfoOp(operador: string): [number, Asociatividad] {
    switch (operador) {
        case ",":
            return [1, Asociatividad.Izq]
        case "=":
        case "+=":
        case "-=":
        case "*=":
        case "/=":
        case "%=":
        case "**=":
            return [2, Asociatividad.Izq]
        case "<|":
        case "|>":
            return [3, Asociatividad.Izq]
        case "<<" :
        case ">>":
            return [4, Asociatividad.Izq]
        case "||":
            return [5, Asociatividad.Izq]
        case "&&":
            return [6, Asociatividad.Izq]
        case "??":
            return [7, Asociatividad.Izq]
        case "==":
        case "!=":
        case "===":
        case "!==":
            return [8, Asociatividad.Izq]
        case "<" :
        case "<=":
        case ">=":
        case ">":
            return [9, Asociatividad.Izq]
        case "+" :
        case "-":
            return [10, Asociatividad.Izq]
        case "*" :
        case "/":
        case "%":
            return [11, Asociatividad.Izq]
        case "**":
            return [12, Asociatividad.Der]
        case ".":
        case "?.":
            return [15, Asociatividad.Izq]
        case "ñ":
        case "Ñ":
            return [14, Asociatividad.Izq]
        default:
            return [13, Asociatividad.Izq]
    }
}

export const operadoresUnarios = ["+", "-", "!"];

export const crearString = (largo: number, c: string): string => {
    return new Array(largo).fill(c).join("");
};

/**
 * Devuelve un string con un token resaltado.
 * @param entrada El código fuente
 * @param info El token que generó el error, y que se resaltará
 */
export const generarTextoError = <A>(entrada: string, info: InfoToken<A>): string => {
    let largo = info.final - info.posInicioLinea;
    let substr = entrada.substring(info.posInicioLinea, info.posInicioLinea + largo);
    if (substr.charAt(substr.length - 1) === "\n") substr = substr.substr(0, substr.length - 1);

    let espBlanco = crearString(info.inicio - info.posInicioLinea, ' ');
    let indicador = crearString(info.final - info.inicio, '~');
    let numLinea = info.numLinea;
    let strIndicadorNumLinea = ` ${numLinea} | `;
    let espacioBlancoIndicador = crearString(strIndicadorNumLinea.length, ' ');
    let strIndicador = `${espBlanco}${indicador}`;
    return `${strIndicadorNumLinea}${substr}\n${espacioBlancoIndicador}${strIndicador}\n`;
};

const globalState = {
    parensAbiertos: 0,
    corchetesAbiertos: 0,
    ifAbiertos: 0,
    whileAbiertos: 0,
    llavesAbiertas: 0
};

export const getGlobalState = () => globalState;

export interface Retorno<A> {
    error?: ExprRes
    exito?: A
}

export function obtExpresionBloqueCodigo(
    indentacionNuevaLinea: number,
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
): Retorno<Expresion> {
    // Revisar si el siguiente token está en la misma linea o en una linea diferente
    const [_, nuevoNivel1, hayNuevaLinea, fnEstablecer] = lexer.lookAheadSignificativo(false);

    if (hayNuevaLinea && nuevoNivel1 <= indentacionNuevaLinea) {
        throw new ErrorComun(`La expresión condicional está incompleta. Se esperaba una expresión indentada.`);
    }

    if (hayNuevaLinea) {
        fnEstablecer();
    }

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

export function obtExpresionesCondicion(
    indentacionNuevaLinea: number,
    tipoCondicion = "if",
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
): Retorno<[Expresion, Expresion]> {

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

    const exprBloquePre = obtExpresionBloqueCodigo(indentacionNuevaLinea, lexer, sigExpresion, sigExpresionBloque);
    if (exprBloquePre.error) {
        return {error: exprBloquePre.error};
    }

    const exprBloque = exprBloquePre.exito!!;

    return {exito: [exprCondicionIf, exprBloque]};
}

