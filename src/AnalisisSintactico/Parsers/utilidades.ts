import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { Asociatividad } from "../Asociatividad";

export function obtInfoFunAppl(esCurry: boolean, inicio: number, numLinea: number, posInicioLinea: number): InfoToken<string> {
    return {
        valor: (esCurry) ? "Ñ" : "ñ",
        inicio,
        final: inicio + 1,
        numLinea,
        posInicioLinea
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

export const generarTextoError = <A>(entrada: string, info: InfoToken<A>): string => {
    let largo = info.final - info.posInicioLinea;
    let substr = entrada.substring(info.posInicioLinea, info.posInicioLinea + largo);
    let espBlanco = crearString(info.inicio - info.posInicioLinea, ' ');
    let indicador = crearString(info.final - info.inicio, '~');
    let numLinea = info.numLinea;
    let strIndicadorNumLinea = ` ${numLinea} | `;
    let espacioBlancoIndicador = crearString(strIndicadorNumLinea.length, ' ');
    let strIndicador = `${espBlanco}${indicador}`;
    return `${strIndicadorNumLinea}${substr}\n${espacioBlancoIndicador}${strIndicador}\n`;
};

const globalState = {
    parensAbiertos: 0
};

export const getGlobalState = () => globalState;
