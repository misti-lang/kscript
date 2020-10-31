import {
    between,
    cualquier, escoger,
    mapP, mapTipo,
    parseCaracter,
    parseCualquierMenos, parseCualquierMenosP,
    parseLuego, parseOtro,
    parseSegundoOpcional, parseString, parseVariasOpciones, parseVarios,
    parseVarios1
} from "./parsers";
import { Token } from "./Token";


const operadores = ["+", "-", "=", "*", "!", "\\", "/", "\'", "|", "@", "#", "·", "$", "~", "%", "¦", "&", "?", "¿", "¡", "<", ">", "€", "^", "-", ".", ":", ",", ";"];
const digitos = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const mayusculas = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ñ"];
const minusculas = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ñ"];

const parseDigito = cualquier(digitos);
const parseMayuscula = cualquier(mayusculas);
const parseMinuscula = cualquier(minusculas);
const parseMinusculaOMayuscula = cualquier(mayusculas.concat(minusculas));
const parseGuionBajo = parseCaracter("_");
const parseComillaSimple = parseCaracter("'");
const parseDolar = parseCaracter("$");

const parseParenAb = parseCaracter("(");
const parseParenCer = parseCaracter(")");

const parseLlaveAb = parseCaracter("{");
const parseLlaveCer = parseCaracter("}");

const parseCorcheteAb = parseCaracter("[");
const parseCorcheteCer = parseCaracter("]");

const parseComilla = parseCaracter("\"");

const charListToStr = (caracteres: Array<string>) => {
    if (caracteres.length === 0) return "";
    if (caracteres.length === 1) return caracteres[0];
    return caracteres.reduce((p, v) => p + v);
};

const tupla2AStr = ([s1, s2]: [string, string]) => s1 + s2;

const tupla3AStr = ([[s1, s2], s3]: [[string, string], string]) => {
    return s1 + s2 + s3;
};

const parseOperador = cualquier(operadores);
const parseOperadores = mapP(charListToStr, parseVarios1(parseOperador));

const parseNumero = (() => {
    const parseNumeros = mapP(charListToStr, parseVarios1(parseDigito));
    const parsePunto = parseCaracter(".");

    const parseParteDecimal = mapP(tupla2AStr, parseLuego(parsePunto, parseNumeros));

    const funPass = ([num, decimal]: [string, string | undefined]): string => {
        return num + (decimal ? decimal : "");
    };

    return mapP(funPass, parseSegundoOpcional(parseNumeros, parseParteDecimal));
})();

const parseTexto = (() => {
    const parseResto = mapP(charListToStr, (parseVarios(parseCualquierMenos("\""))));

    return between(parseComilla, parseResto, parseComilla);
})();

const parseNuevaLinea = (() => {
    const parseNuevaLCarac = parseCaracter("\n");
    const parseNuevoWin = parseCaracter("\r");

    const parseNuevaLineaWin = mapP(tupla2AStr, parseLuego(parseNuevoWin, parseNuevaLCarac));

    return parseOtro(parseNuevaLCarac, parseNuevaLineaWin);
})();

const parseComentario = (() => {
    const parseBarra = parseCaracter("/");
    const parseInicio = mapP(_ => "//", parseLuego(parseBarra, parseBarra));

    const parseResto = mapP(charListToStr, parseVarios(parseCualquierMenosP(parseNuevaLinea)));

    return mapP(tupla2AStr, parseLuego(parseInicio, parseResto));
})();

const parseComentarioMulti = (() => {
    const parseBarra = parseCaracter("/");
    const parseAst = parseCaracter("*");

    const parseInicio = mapP((_) => "/*", parseLuego(parseBarra, parseAst));
    const parseFinal = mapP((_) => "*/", parseLuego(parseAst, parseBarra));

    const parseResto = mapP(charListToStr, parseVarios(parseCualquierMenosP(parseFinal)));

    return mapP(tupla3AStr, parseLuego(parseLuego(parseInicio, parseResto), parseFinal));
})();

const parseUndefined = (() => {
    const pEB = parseCaracter(" ");
    const parseIdEspBlanco = mapP(charListToStr, parseVarios1(pEB));

    const parseParenAbiertoYCerrado =
        mapP(
            () => "()",
            parseLuego(parseSegundoOpcional(parseParenAb, parseIdEspBlanco), parseParenCer)
        );
    const parseUndefined = parseString("undefined");

    return parseOtro(parseParenAbiertoYCerrado, parseUndefined);
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
    parseLuego(parseOtro(parseOtro(parseGuionBajo, parseMinusculaOMayuscula), parseDolar), parseRestoIdentificador)
);

// Asume que se encuentra al inicio de la linea
const parseIndentacion = (() => {
    const pEB = parseCaracter(" ");
    const parseIdEspBlanco = mapP(charListToStr, parseVarios1(pEB));

    const pTab = parseCaracter("\t");
    return parseOtro(parseIdEspBlanco, pTab);
})();

const parseSignoAgrupacionAb = escoger([parseParenAb, parseLlaveAb, parseCorcheteAb]);
const parseSignoAgrupacionCer = escoger([parseParenCer, parseLlaveCer, parseCorcheteCer]);

export const parserGeneral = parseVariasOpciones([
    mapTipo(parseIndentacion, Token.Indentacion),
    mapTipo(parseNuevaLinea, Token.NuevaLinea),
    mapTipo(parseComentarioMulti, Token.Comentario),
    mapTipo(parseComentario, Token.Comentario),
    mapTipo(parseUndefined, Token.Undefined),
    mapTipo(parseIdentificador, Token.Identificador),
    mapTipo(parseGenerico, Token.Generico),
    mapTipo(parseNumero, Token.Numero),
    mapTipo(parseTexto, Token.Texto),
    mapTipo(parseOperadores, Token.Operadores),
    mapTipo(parseSignoAgrupacionAb, Token.AgrupacionAb),
    mapTipo(parseSignoAgrupacionCer, Token.AgrupacionCer)
]);

