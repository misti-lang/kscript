import { Lexer } from "../..";
import { Asociatividad } from "../Asociatividad";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito } from "../ExprRes";
import { getGlobalState, obtExpresionBloqueCodigo, obtExpresionesCondicion } from "./utilidades";
import { ErrorComun, Expect } from "../Expect";
import { Expresion } from "../Expresion";
import { ECondicional } from "../Expresion/ECondicional";

const globalState = getGlobalState();

export function getSigExprCondicional(
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

    function sigExprCondicional(tokenIf: InfoToken<string>, indentacionNuevaLinea: number): ExprRes {
        try {

            // Indicar que hay un if abierto para que sigExpresion devuelva PReturn al encontrarse con 'elif' o 'else'
            globalState.ifAbiertos += 1;

            const resultadoExpresionesIf = obtExpresionesCondicion(indentacionNuevaLinea, "if", lexer, sigExpresion, sigExpresionBloque);

            if (resultadoExpresionesIf.error) return resultadoExpresionesIf.error;

            const [exprCondicionIf, exprBloqueIf] = resultadoExpresionesIf.exito!!

            const arrExpresionesElif: [Expresion, Expresion][] = [];

            // Iterar por todos los 'elif'
            while (true) {
                try {
                    const [token, _, __, fnSet] = lexer.lookAheadSignificativo(false);
                    Expect.PC_ELIF(token, "", lexer);

                    fnSet();
                    // Consumir el token ELIF
                    lexer.sigToken();
                    const resultadoExpresionesElif = obtExpresionesCondicion(
                        indentacionNuevaLinea,
                        "elif",
                        lexer,
                        sigExpresion,
                        sigExpresionBloque
                    );
                    if (resultadoExpresionesElif.error) return resultadoExpresionesElif.error;
                    arrExpresionesElif.push(resultadoExpresionesElif.exito!!);

                } catch (e) {
                    break;
                }
            }

            let expresionBloqueElse: Expresion | undefined;
            // Buscar un 'else'
            try {
                const [token, _, __, fnSet] = lexer.lookAheadSignificativo(false);
                Expect.PC_ELSE(token, "", lexer);

                fnSet();
                // Consumir el token ELIF
                lexer.sigToken();
                const resultadoExpresionElse = obtExpresionBloqueCodigo(
                    indentacionNuevaLinea,
                    lexer,
                    sigExpresion,
                    sigExpresionBloque
                );
                if (resultadoExpresionElse.error) return resultadoExpresionElse.error;
                expresionBloqueElse = resultadoExpresionElse.exito!!;
            } catch (e) {
                lexer.retroceder();
            }

            // Crear AST
            const exprCondicional = new ECondicional(
                tokenIf.inicio,
                tokenIf.numLinea,
                tokenIf.posInicioLinea,
                [exprCondicionIf, exprBloqueIf],
                arrExpresionesElif.length > 0 ? arrExpresionesElif : undefined,
                expresionBloqueElse
            );

            // Cerrar el if
            globalState.ifAbiertos -= 1;

            return new PExito(exprCondicional);
        } catch (e) {
            if (e instanceof ErrorComun) {
                return new PError(e.message);
            } else {
                throw e;
            }
        }
    }

    return sigExprCondicional;
}
