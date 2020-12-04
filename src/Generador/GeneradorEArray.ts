import { Expresion } from "../AnalisisSintactico/Expresion";
import { SourceNode } from "source-map";
import { EArray } from "../AnalisisSintactico/Expresion/EArray";

export function getGeneradorJs_EArray(
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null
) {

    return function (eArr: EArray): [SourceNode, number] {

        const codigoExpresiones = eArr.expresiones.map((x, index: number, params) => {
            return index === params.length - 1
                ? [inner(x, false, nivel)[0]]
                : [inner(x, false, nivel)[0], ", "];
        })
            .reduce((acc, val) => acc.concat(val), []);

        const codigoRes = ["[", ...codigoExpresiones, "]"];
        const res = new SourceNode(eArr.numLinea, eArr.inicio - eArr.posInicioLinea, nombreArchivo, codigoRes);
        return [res, 0];
    }
}
