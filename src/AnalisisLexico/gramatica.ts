import {
    between,
    cualquier, escoger,
    mapP, mapTipo,
    parseCaracter,
    parseCualquierMenos, parseCualquierMenosP,
    parseLuego, parseOtro,
    parseSegundoOpcional, parseVariasOpciones, parseVarios,
    parseVarios1
} from "./parsers";
import { Token } from "./Token";


const operadores = ["+", "-", "=", "*", "!", "\\", "/", "\'", "|", "@", "#", "·", "$", "~", "%", "¦", "&", "?", "¿", "¡", "<", ">", "€", "^", "-", ".", ":", ",", ";"];
const digitos = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const mayusculas = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ñ"];
const minusculas = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ñ"];
const signosAgrupacion = ["(", ")", "{", "}", "[", "]"];

let parseDigito = cualquier(digitos);
let parseMayuscula = cualquier(mayusculas);
let parseMinuscula = cualquier(minusculas);
let parseGuionBajo = parseCaracter("_");
let parseComillaSimple = parseCaracter("'");
let parseDolar = parseCaracter("$");

const charListToStr = (caracteres: Array<string>) => {
    if (caracteres.length === 0) return "";
    if (caracteres.length === 1) return caracteres[0];
    return caracteres.reduce((p, v) => p + v);
};

const tupla2AStr = ([s1, s2]: [string, string]) => s1 + s2;

const tupla3AStr = ([[s1, s2], s3]: [[string, string], string]) => {
    return s1 + s2 + s3;
};

let parseOperador = cualquier(operadores);
let parseOperadores = mapP(charListToStr, parseVarios1(parseOperador));

const parseNumero = (() => {
    let parseNumeros = mapP(charListToStr, parseVarios1(parseDigito));
    let parsePunto = parseCaracter(".");

    let parseParteDecimal = mapP(tupla2AStr, parseLuego(parsePunto, parseNumeros));

    const funPass = ([num, decimal]: [string, string | undefined]): string => {
        return num + (decimal ? decimal : "");
    };

    return mapP(funPass, parseSegundoOpcional(parseNumeros, parseParteDecimal));
})();

const parseTexto = (() => {
    let parseComilla = parseCaracter("\"");
    let parseResto = mapP(charListToStr, (parseVarios(parseCualquierMenos("\""))));

    return between(parseComilla, parseResto, parseComilla);
})();

const parseNuevaLinea = (() => {
    let parseNuevaLCarac = parseCaracter("\n");
    let parseNuevoWin = parseCaracter("\r");

    let parseNuevaLineaWin = mapP(tupla2AStr, parseLuego(parseNuevoWin, parseNuevaLCarac));

    return parseOtro(parseNuevaLCarac, parseNuevaLineaWin);
})();

const parseComentario = (() => {
    let parseBarra = parseCaracter("/");
    let parseInicio = mapP(_ => "//", parseLuego(parseBarra, parseBarra));

    let parseResto = mapP(charListToStr, parseVarios(parseCualquierMenosP(parseNuevaLinea)));

    return mapP(tupla2AStr, parseLuego(parseInicio, parseResto));
})();

const parseComentarioMulti = (() => {
    let parseBarra = parseCaracter("/");
    let parseAst = parseCaracter("*");

    let parseInicio = mapP((_) => "/*", parseLuego(parseBarra, parseAst));
    let parseFinal = mapP((_) => "*/", parseLuego(parseAst, parseBarra));

    let parseResto = mapP(charListToStr, parseVarios(parseCualquierMenosP(parseFinal)));

    return mapP(tupla3AStr, parseLuego(parseLuego(parseInicio, parseResto), parseFinal));
})();

const parseRestoIdentificador = (() => {
    const pTest = parseOtro(parseOtro(parseOtro(parseOtro(parseOtro(parseDigito, parseMayuscula), parseMinuscula),
        parseGuionBajo), parseComillaSimple), parseDolar);

    return mapP(charListToStr, parseVarios(pTest));
})();

const parseGenerico = mapP(
    tupla3AStr,
    parseLuego(parseLuego(parseComillaSimple, parseMayuscula), parseRestoIdentificador)
);

const parseIdentificador = mapP(
    tupla2AStr,
    parseLuego(parseOtro(parseOtro(parseGuionBajo, parseMinuscula), parseDolar), parseRestoIdentificador)
);

// Asume que se encuentra al inicio de la linea
const parseIndentacion = (() => {
    let pEB = parseCaracter(" ");
    let parseIdEspBlanco = mapP(charListToStr, parseVarios1(pEB));

    let pTab = parseCaracter("\t");
    return parseOtro(parseIdEspBlanco, pTab);
})();


let parseParenAb = parseCaracter("(");
let parseParenCer = parseCaracter(")");

let parseLlaveAb = parseCaracter("{");
let parseLlaveCer = parseCaracter("}");

let parseCorcheteAb = parseCaracter("[");
let parseCorcheteCer = parseCaracter("]");

let parseSignoAgrupacionAb = escoger([parseParenAb, parseLlaveAb, parseCorcheteAb]);
let parseSignoAgrupacionCer = escoger([parseParenCer, parseLlaveCer, parseCorcheteCer]);


export let parserGeneral = parseVariasOpciones([
    mapTipo(parseIndentacion, Token.Indentacion),
    mapTipo(parseNuevaLinea, Token.NuevaLinea),
    mapTipo(parseComentarioMulti, Token.Comentario),
    mapTipo(parseComentario, Token.Comentario),
    mapTipo(parseIdentificador, Token.Identificador),
    mapTipo(parseGenerico, Token.Generico),
    mapTipo(parseNumero, Token.Numero),
    mapTipo(parseTexto, Token.Texto),
    mapTipo(parseOperadores, Token.Operadores),
    mapTipo(parseSignoAgrupacionAb, Token.AgrupacionAb),
    mapTipo(parseSignoAgrupacionCer, Token.AgrupacionCer)
]);

