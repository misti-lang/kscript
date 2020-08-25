import { SourceNode } from "source-map";
import { Lexer } from "../AnalisisLexico/Lexer";
import { parseTokens } from "../AnalisisSintactico/parser";
import { crearCodeWithSourceMap } from "../Generador/Generador2";

export const flujo2 = (entrada: string, nombreArchivo: string | null): SourceNode => {
    const lexer = new Lexer(entrada);
    const expresion = parseTokens(lexer);
    switch (expresion.type) {
        case "ErrorLexerP": {
            throw new Error(expresion.err);
        }
        case "ErrorParser": {
            console.log(expresion.err);
            throw new Error(expresion.err);
        }
        case "ExitoParser": {
            const expr = expresion.expr;
            return crearCodeWithSourceMap(expr, true, 0, nombreArchivo)[0];
        }
    }
};
