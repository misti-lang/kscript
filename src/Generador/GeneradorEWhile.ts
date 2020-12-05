import { SourceNode } from "source-map";
import { Expresion } from "../AnalisisSintactico/Expresion";
import { EWhile } from "../AnalisisSintactico/Expresion/EWhile";

export function getGeneradorJs_EWhile(
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null,
    toplevel: boolean,
    indentacionNivelSig: string
) {

    return function (eWhile: EWhile): [SourceNode, number] {

        const [exprCondicionWhile, exprBloqueWhile] = [eWhile.condicion, eWhile.cuerpo];

        const [snCondicion] = inner(exprCondicionWhile, toplevel, nivel);
        const [snBloqueWhile] = inner(exprBloqueWhile, toplevel, nivel + 1, false);

        const nodoWhile = new SourceNode(
            eWhile.numLinea,
            eWhile.inicio - eWhile.posInicioLinea,
            nombreArchivo,
            [
                "while (",
                snCondicion,
                ") {\n",
                indentacionNivelSig,
                snBloqueWhile,
                "\n}"
            ]
        );

        return [nodoWhile, 0];
    }

}
