import { Lexer } from "../..";
import { Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PErrorLexer, PExito, PReturn } from "../ExprRes";
import { Asociatividad } from "../Asociatividad";
import { ResLexer } from "../../AnalisisLexico/ResLexer";
import { obtInfoFunAppl, obtInfoOp, generarTextoError } from "./utilidades"
import { EBloque } from "../Expresion/EBloque";

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
 *                          Se usa para agrupar expresiones separadas por una linea nueva.
 * @param infoIdNumLinea - El número de linea de la expresión anterior.
 *                         Se usa para generar un token para la aplicación de funciones.
 * @param infoIdPosInicioLinea - La posición relativa en la que acaba la expresión anterior.
 *                               Se usa para generar un token para la aplicación de funciones.
 * @param indentacionNuevaLinea - El nivel de la expresión anterior
 */
export const generarParserContinuo = (
    lexer: Lexer,
    primeraExprId: Expresion,
    precedencia: number,
    sigExprOperador: (
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        indentacionNuevaLinea: number,
        indentacionMinima: number,
        precedencia: any
    ) => ExprRes,
    infoIdInicio: number,
    infoIdNumLinea: number,
    infoIdPosInicioLinea: number,
    indentacionNuevaLinea: number,
    indentacionMinima: number,
) => {
    function funDesicion(lexerRes: ResLexer): ExprRes {

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
                const [precOp] = obtInfoOp(infoOp.valor);

                if (precOp > precedencia) {
                    return sigExprOperador(primeraExprId, infoOp, indentacionNuevaLinea, indentacionMinima, precedencia);
                } else if (precOp == precedencia && precOp == Asociatividad.Der) {
                    return sigExprOperador(primeraExprId, infoOp, indentacionNuevaLinea, indentacionMinima, precedencia);
                } else {
                    lexer.retroceder();
                    return new PExito(primeraExprId);
                }
            }
            case "TComa":
            case "TParenCer":
            case "TCorcheteCer": {
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "TIdentificador":
            case "TNumero":
            case "TTexto":
            case "TBool":
            case "TParenAb":
            case "TCorcheteAb":
            case "TUndefined": {
                const infoOp2 = obtInfoFunAppl(false, infoIdInicio, infoIdNumLinea, infoIdPosInicioLinea, indentacionNuevaLinea);

                const [precOpFunApl, asocOpFunApl] = obtInfoOp(infoOp2.valor);
                lexer.retroceder();

                if (precOpFunApl > precedencia) {
                    return sigExprOperador(primeraExprId, infoOp2, indentacionNuevaLinea, indentacionMinima, precedencia);
                } else if (precOpFunApl == precedencia && asocOpFunApl == Asociatividad.Der) {
                    return sigExprOperador(primeraExprId, infoOp2, indentacionNuevaLinea, indentacionMinima, precedencia);
                } else {
                    return new PExito(primeraExprId);
                }
            }
            case "TGenerico": {
                const infoGen = token.token;
                const textoError = generarTextoError(lexer.entrada, infoGen);
                return new PError(`No se esperaba un genérico luego de la aplicación del operador.\n\n${textoError}`);
            }
            case "TComentario": {
                return funDesicion(lexer.sigToken());
            }
            case "PC_LET": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n${textoError}`)
            }
            case "PC_CONST": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n${textoError}`)
            }
            case "TAgrupAb": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
            }
            case "TAgrupCer": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`Este signo de agrupación aun no está soportado.\n\n${textoError}`);
            }
            case "TNuevaLinea": {
                lexer.retroceder();
                const [_, indentacion, __, fnEstablecer] = lexer.lookAheadSignificativo(true);

                const expresionRespuesta = new PExito(primeraExprId);

                if (indentacion <= indentacionNuevaLinea) {
                    return expresionRespuesta;
                } else {
                    fnEstablecer();
                    return funDesicion(lexer.sigToken());
                }
            }
            case "PC_IF": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'if' luego de la aplicación del operador.
                                        \n\n${textoError}
                                        Si deseas usar un condicional como parámetro de una función encierra la
                                        condición en paréntesis.`);
            }
            case "PC_DO": {
                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "PC_ELIF": {
                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "PC_ELSE": {
                // Asumir que estamos dentro de una condicion y que esta termino.
                lexer.retroceder();
                return new PExito(primeraExprId);
            }
            case "PC_FUN": {
                const info = token.token;
                const textoError = generarTextoError(lexer.entrada, info);
                return new PError(`No se esperaba la palabra clave 'fun' luego de la aplicación del operador.
                                        \n\n${textoError}
                                        Si deseas usar una función como expresión, usa una función anónima.`);
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
