import {Lexer} from "./AnalisisLexico/Lexer";
import {parseTokens} from "./AnalisisSintactico/parser";
import {crearCodeWithSourceMap} from "./Generador/Generador2";
import {flujo2} from "./Utils/flujos";

export const compilar = (codigo: string) => {
    return flujo2(codigo, null);
};

export {
    Lexer,
    parseTokens,
    crearCodeWithSourceMap
};
