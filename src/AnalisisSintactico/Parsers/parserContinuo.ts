import { Lexer } from "../..";
import { EBloque, Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PErrorLexer, PExito, PReturn } from "../ExprRes";
import { Asociatividad } from "../Asociatividad";
import { ResLexer } from "../../AnalisisLexico/ResLexer";
import { obtInfoFunAppl, obtInfoOp, generarTextoError } from "./utilidades"

/* Si un operador esta en una nueva linea pero al mismo nivel de indentacion
*  ya no se considera dentro de la misma expresion
*/

/**
 * Genera una función que continua el parsing.
 * @param lexer - El lexer con el que se está trabajando
 * @param primeraExprId - Expresión que se devolverá si los parsers fallan
 * @param precedencia - La precedencia de primeraExprId
 * @param sigExprOperador - Una función que permite crear una expresión de Operador
 * @param infoIdInicio - La posición absoluta en la que acaba la expresión anterior.
 *                       Se usa para generar un token para la aplicación de funciones.
 * @param esExprPrincipal - Si actualmente se está tratando con una expresión principal.
 *                          Se usa para agrupar expresiones separadas por una linea nueva.
 * @param infoIdNumLinea - El número de linea de la expresión anterior.
 *                         Se usa para generar un token para la aplicación de funciones.
 * @param infoIdPosInicioLinea - La posición relativa en la que acaba la expresión anterior.
 *                               Se usa para generar un token para la aplicación de funciones.
 * @param nivel - El nivel de la expresión anterior
 * @param sigExpresion - Una función para extraer una nueva Expresión
 */
export const generarParserContinuo = (
    lexer: Lexer,
    primeraExprId: Expresion,
    precedencia: number,
    sigExprOperador: (
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        nivel: number,
        precedencia: any,
        __: any,
        esExprPrincipal: boolean
    ) => ExprRes,
    infoIdInicio: number,
    esExprPrincipal: boolean,
    infoIdNumLinea: number,
    infoIdPosInicioLinea: number,
    nivel: number
) => {
    function funDesicion(lexerRes: ResLexer, aceptarSoloOperador: boolean, fnEnOp: () => void, funValorDefecto: () => ExprRes): ExprRes {

        // Retorno en casos excepcionales
        if (lexerRes.type === "EOFLexer") {
            return new PExito(primeraExprId)
        } else if (lexerRes.type === "ErrorLexer") {
            return new PError(lexerRes.razon)
        }

        const token = lexerRes.token;
        switch (token.type) {
            case "TOperador": {
                const infoOp = token.token;
                fnEnOp();
                const [precOp, asocOp] = obtInfoOp(infoOp.valor);

                if (precOp > precedencia) {
                    return sigExprOperador(primeraExprId, infoOp, nivel, precedencia, asocOp, esExprPrincipal);
                } else if (precOp == precedencia && precOp == Asociatividad.Der) {
                    return sigExprOperador(primeraExprId, infoOp, nivel, precedencia, asocOp, esExprPrincipal);
                } else {
                    lexer.retroceder();
                    return new PExito(primeraExprId);
                }
            }
            case "TParenCer": {
                if (aceptarSoloOperador) return funValorDefecto();

                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "TIdentificador":
            case "TNumero":
            case "TTexto":
            case "TBool":
            case "TParenAb": {
                if (aceptarSoloOperador) return funValorDefecto();

                const infoOp2 = obtInfoFunAppl(false, infoIdInicio, infoIdNumLinea, infoIdPosInicioLinea, nivel);

                const [precOpFunApl, asocOpFunApl] = obtInfoOp(infoOp2.valor);
                lexer.retroceder();

                if (precOpFunApl > precedencia) {
                    return sigExprOperador(primeraExprId, infoOp2, nivel, precedencia, asocOpFunApl, esExprPrincipal);
                } else if (precOpFunApl == precedencia && asocOpFunApl == Asociatividad.Der) {
                    return sigExprOperador(primeraExprId, infoOp2, nivel, precedencia, asocOpFunApl, esExprPrincipal);
                } else {
                    return new PExito(primeraExprId);
                }
            }
            case "TGenerico": {
                if (aceptarSoloOperador) return funValorDefecto();

                const infoGen = token.token;
                const textoError = generarTextoError(lexer.entrada, infoGen);
                return new PError(`No se esperaba un genérico luego de la aplicación del operador.\n\n${textoError}`);
            }
            case "TComentario": {
                return funDesicion(lexer.sigToken(), aceptarSoloOperador, fnEnOp, funValorDefecto);
            }
            case "PC_LET": {
                if (aceptarSoloOperador) return funValorDefecto();

                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n${textoError}`)
            }
            case "PC_CONST": {
                if (aceptarSoloOperador) return funValorDefecto();

                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n${textoError}`)
            }
            case "TAgrupAb": {
                if (aceptarSoloOperador) return funValorDefecto();

                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
            }
            case "TAgrupCer": {
                if (aceptarSoloOperador) return funValorDefecto();

                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
            }
            case "TNuevaLinea": {
                if (aceptarSoloOperador) return funValorDefecto();

                lexer.retroceder();
                const [_, indentacion, __, fnEstablecer] = lexer.lookAheadSignificativo(true);

                const expresionRespuesta = new PExito(primeraExprId);

                if (!esExprPrincipal) return expresionRespuesta;

                if (indentacion <= nivel) {
                    return expresionRespuesta;
                } else {
                    fnEstablecer();
                    return funDesicion(
                        lexer.sigToken(),
                        false,
                        () => {
                        },
                        () => new PReturn()
                    );
                }
            }
            case "PC_IF": {
                if (aceptarSoloOperador) return funValorDefecto();

                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'if' luego de la aplicación del operador.
                                        \n\n${textoError}
                                        Si deseas usar un condicional como parámetro de una función encierra la
                                        condición en paréntesis.`);
            }
            case "PC_DO": {
                if (aceptarSoloOperador) return funValorDefecto();

                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "PC_ELIF": {
                if (aceptarSoloOperador) return funValorDefecto();

                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "PC_ELSE": {
                if (aceptarSoloOperador) return funValorDefecto();

                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            default: {
                let _: never;
                _ = token;
                return _;
            }
        }
    }

    return funDesicion;
};
