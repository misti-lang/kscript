import { flujo2 } from "./Utils/flujos";
import { Lexer } from "./AnalisisLexico/Lexer";
import { parseTokens } from "./AnalisisSintactico/parser";
import { crearCodeWithSourceMap } from "./Generador/Generador";

export const compilar = (codigo: string) => {
    return flujo2(codigo, null);
};

export {
    Lexer as KLexer,
    parseTokens as kparseTokens,
    crearCodeWithSourceMap as kcrearCodeWithSourceMap
}
