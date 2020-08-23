#!/usr/bin/env node
import { Token2 } from "./AnalisisLexico/Token2";
import { Lexer } from "./AnalisisLexico/Lexer";
import { parseTokens } from "./AnalisisSintactico/parser";
import { crearCodeWithSourceMap } from "./Generador/Generador2";
import { SourceNode } from "source-map";
const flujoREPL = require("./Utils/repl").flujoREPL;
const compilar  = require("./Utils/compile").compilar;

let tknToStr = (token2: Token2): string => token2.toString();

/*
let flujoPrincipal = (entrada: string): string => {
    let lexer = new Lexer(entrada);
    let expresion = parseTokens(lexer);
    switch (expresion.type) {
        case "ErrorParser": return expresion.err;
        case "ExitoParser": {
            const expr = expresion.expr;
            let [js, _] = Generador.generarJs(expr, true, 0);
            return js;
        }
    }
};
 */

export const flujo2 = (entrada: string, nombreArchivo: string): SourceNode => {
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

const strAyuda = `Uso:
  --repl               Inicia el REPL.
  -c, --compile FILE   Compila el archivo FILE.
  -cs FILE             Compila el archivo FILE y adicionalmente imprime en stdout.
  -h, --help           Muestra esta información.
  -v, --version        Imprime la versión del compilador.`;


process.on("SIGINT", () => {
    console.log("Recibida señal de detención.");
    process.exit(1);
});


export default function () {
    if (process.argv.length <= 2) {
        console.log(strAyuda);
        process.exit(0);
    }

    const comando = process.argv[2];
    let imprimirCompilacion = false;
    switch (comando) {
        case "-h":
        case "--help": {
            console.log(strAyuda);
            process.exit(0);
        }
        case "-v":
        case "--version": {
            console.log("El compilador Misti, versión 0.0.13");
            process.exit(0);
        }
        case "--repl": {
            flujoREPL();
            break;
        }
        case "-cs":
            imprimirCompilacion = true;
        case "-c":
        case "--compile": {
            const ruta = process.argv[3];
            if (ruta) {
                compilar(ruta, imprimirCompilacion);
            } else {
                console.log("Tienes que introducir una ruta a un archivo " +
                    "luego de usar " + comando + ".");
                process.exit(0);
            }
            break;
        }
        default: {
            console.log("Comando no reconocido. Usa -h para mas información.");
            process.exit(0);
        }
    }
};

