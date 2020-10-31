import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { ExprRes, PError } from "../ExprRes";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ErrorComun, Expect } from "../Expect";

export function getSigExprFuncion(
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
) {

    function obtenerParametros() {
        const tokenLookAhead = lexer.lookAhead();
        if (tokenLookAhead.type === "ErrorLexer" || tokenLookAhead.type === "EOFLexer") {
            throw new ErrorComun("Se esperaban parámetros luego de la palabra clave 'fun'");
        }

        // La función no tiene parámetros
        // TODO: pattern matching :c
        if (tokenLookAhead.token.type === "TParenAb") {

        } else {

        }

    }

    /**
     * Parsea una expresión de declaración de función (fun f x y = ...)
     * @param tokenFun El token 'fun'
     * @param indentacionNuevaLinea La cantidad de indentacion
     */
    function sigExprFuncion(tokenFun: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        try {

            const infoIdentificadorFun = Expect.TIdentificador(
                lexer.sigToken.bind(lexer),
                undefined,
                "Se esperaba un identificador"
            );

            const parametros = obtenerParametros();

        } catch (e) {
            if (e instanceof ErrorComun) {
                return new PError(e.message);
            } else {
                throw e;
            }
        }

        throw 0;
    }

    return sigExprFuncion;
}
