import { EDeclaracionFuncion } from "../AnalisisSintactico/Expresion/EDeclaracionFuncion";
import { SourceNode } from "source-map";
import { EIdentificador } from "../AnalisisSintactico/Expresion/EIdentificador";
import { Expresion } from "../AnalisisSintactico/Expresion";

export function getGeneradorJs_EDeclaracionFuncion(
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    generarJS_EIdentificador: (_: EIdentificador) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null,
    indentacionNivelSig: string,
    indentacionNivel: string
) {

    return function (eDecF: EDeclaracionFuncion): [SourceNode, number] {
        const {id, parametros, valor} = eDecF;

        const [snId] = generarJS_EIdentificador(id);
        const snParametrosP = parametros
            .map((p: EIdentificador, index) => {
                return index === parametros.length - 1
                    ? [generarJS_EIdentificador(p)[0]]
                    : [generarJS_EIdentificador(p)[0], ", "];
            })
            .reduce((acc, val) => acc.concat(val), []);

        const [snResto] = inner(valor, false, nivel + 1, false);

        const codigoRes = [
            "function ",
            snId,
            "(",
            ...snParametrosP,
            ") {\n",
            indentacionNivelSig,
            snResto,
            indentacionNivel,
            "}"
        ];
        const res = new SourceNode(eDecF.numLineaPE, eDecF.inicioPE - eDecF.posInicioLineaPE, nombreArchivo, codigoRes);
        return [res, 0];
    }

}
