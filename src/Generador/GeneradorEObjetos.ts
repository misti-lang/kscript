import { Expresion } from "../AnalisisSintactico/Expresion";
import { SourceNode } from "source-map";
import { EObjeto } from "../AnalisisSintactico/Expresion/EObjeto";

export const getGeneradorJs_EObjeto = (
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null
) => (eObjeto: EObjeto): [SourceNode, number] => {

    const numEntradas = eObjeto.entradas.length;
    const codigoExpresiones = eObjeto.entradas
        .map(([clave, valor], index) => {
            const claveStr = clave.valor;
            if (valor) {
                const valorStr = inner(valor, false, nivel)[0];
                return (index === numEntradas - 1)
                    ? [claveStr, ": ", valorStr]
                    : [claveStr, ": ", valorStr, ", "];
            } else {
                return (index === numEntradas - 1)
                    ? [claveStr]
                    : [claveStr, ", "];
            }
        })
        .reduce(
            (acc, val) => acc.concat(val),
            []
        );

    const codigoRes = ["{", ...codigoExpresiones, "}"];
    const res = new SourceNode(eObjeto.numLinea, eObjeto.inicio - eObjeto.posInicioLinea, nombreArchivo, codigoRes);
    return [res, 0];

}
