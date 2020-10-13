import { eOperador, EOperadorApl, Expresion } from "../Expresion";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ExprRes, PError, PExito, PReturn } from "../ExprRes";
import { SignIndefinida } from "../Signatura";
import { Asociatividad } from "../Asociatividad";
import { obtPosExpr } from "../PosExpr";
import { Lexer } from "../../AnalisisLexico/Lexer";
import { generarParserContinuo } from "./parserContinuo";

export function getParserSigExprOperador(
    lexer: Lexer,
    obtInfoOp: (operador: string) => [number, Asociatividad],
    obtInfoFunAppl: (esCurry: boolean, inicio: number, numLinea: number, posInicioLinea: number, indentacion: number) => InfoToken<string>,
    sigExpresion: (
        nivel: number,
        nivelPadre: number,
        iniciarIndentacionEnToken: boolean,
        precedencia: number,
        asociatividad: Asociatividad,
        esExprPrincipal: boolean
    ) => ExprRes
) {

    function onSigExprExito(
        sigExpr: PExito,
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        precOp1: number,
        asocOp1: Asociatividad,
        precedencia: any,
        nivel: number,
        esExprPrincipal: boolean
    ) {
        const exprFinal = sigExpr.expr;

        const eOperadorRes = new eOperador(
            new SignIndefinida(),
            infoOp,
            precOp1,
            asocOp1
        );
        const exprOpRes = new EOperadorApl(eOperadorRes, exprIzq, exprFinal);
        const posEI = obtPosExpr(exprIzq);

        const funDesicion = generarParserContinuo(
            lexer,
            exprOpRes,
            precedencia,
            sigExprOperador,
            posEI.inicioPE,
            esExprPrincipal,
            posEI.numLineaPE,
            posEI.posInicioLineaPE,
            nivel,
            sigExpresion
        );

        return funDesicion(lexer.sigToken(), false, () => {
        }, () => new PReturn());
    }

    function sigExprOperador(
        exprIzq: Expresion,
        infoOp: InfoToken<string>,
        nivel: number,
        precedencia: any,
        __: any,
        esExprPrincipal: boolean
    ): ExprRes {

        const valorOp = infoOp.valor;
        const [precOp1, asocOp1] = obtInfoOp(valorOp);
        const sigExpr = sigExpresion(nivel, nivel, false, precOp1, asocOp1, false);

        switch (sigExpr.type) {
            case "PEOF":
            case "PReturn":
                return new PError(`Se esperaba una expresión a la derecha del operador ${valorOp}`);
            case "PErrorLexer":
                return sigExpr;
            case "PError":
                return new PError(`Se esperaba una expresion a la derecha del operador ${valorOp} :\n${sigExpr.err}.`);
            case "PExito": {
                return onSigExprExito(
                    sigExpr,
                    exprIzq,
                    infoOp,
                    precOp1,
                    asocOp1,
                    precedencia,
                    nivel,
                    esExprPrincipal,
                );
            }
            default: {
                let _: never;
                _ = sigExpr;
                return _;
            }
        }

    }

    return sigExprOperador;
}
