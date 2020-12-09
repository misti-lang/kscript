import { Expresion } from "../AnalisisSintactico/Expresion";
import { SourceNode } from "source-map";
import { InfoToken } from "../AnalisisLexico/InfoToken";
import { EUndefined } from "../AnalisisSintactico/Expresion/EUndefined";
import { EIdentificador } from "../AnalisisSintactico/Expresion/EIdentificador";
import { EOperadorApl } from "../AnalisisSintactico/Expresion/EOperadorApl";
import { EOperadorUnarioIzq } from "../AnalisisSintactico/Expresion/EOperadorUnarioIzq";
import { EDeclaracion } from "../AnalisisSintactico/Expresion/EDeclaracion";
import { ECondicional } from "../AnalisisSintactico/Expresion/ECondicional";
import { getGeneradorJs_EDeclaracionFuncion } from "./GeneradorEDeclaracionFuncion";
import { getGeneradorJs_EArray } from "./GeneradorEArray";
import { getGeneradorJs_EWhile } from "./GeneradorEWhile";

const opcionesDefecto: { [s: string]: boolean } = {
    imprimirParensEnOperadores: false
};

export function crearCodeWithSourceMap(
    expr: Expresion,
    toplevel: boolean,
    nivel: number,
    nombreArchivo: string | null,
    opciones: { [s: string]: boolean } = opcionesDefecto
): [SourceNode, number] {

    const imprParenEnOp = !!(opciones?.imprimirParensEnOperadores) ?? false;

    function inner(
        expr: Expresion,
        toplevel: boolean,
        nivel: number,
        IIFE = true,
        usarReturn = false
    ): [SourceNode, number] {
        const indentacionNivel = new Array(nivel * 4).fill(" ").join("");
        const indentacionNivelSig = new Array((nivel + 1) * 4).fill(" ").join("");
        const indentacionNivelAnt = (nivel == 0) ? "" : new Array((nivel - 1) * 4).fill(" ").join("");

        const uncurry = (exprOp: EOperadorApl): SourceNode => {
            const extraerParams = (exprFn: EOperadorApl, acc: Array<Expresion>): [SourceNode, Array<Expresion>] => {
                const exprOpCurry = exprFn.izq;
                const ultimoParam = exprFn.der;
                switch (exprOpCurry.type) {
                    case "EOperadorApl": {
                        const valorOp = exprOpCurry.op.valorOp.valor;
                        if (valorOp === "ñ" || valorOp === "Ñ") {
                            return extraerParams(exprOpCurry, [ultimoParam, ...acc]);
                        } else {
                            const nodo = inner(exprOpCurry, toplevel, nivel)[0];
                            return [nodo, [ultimoParam, ...acc]];
                        }
                    }
                    default: {
                        const nodo = inner(exprOpCurry, toplevel, nivel)[0];
                        return [nodo, [ultimoParam, ...acc]];
                    }
                }
            };

            const [nodoFun, params] = extraerParams(exprOp, []);
            const nodos = (() => {
                // Si no hay parametros
                if (params.length === 1 && params[0].type === "EUndefined") {
                    return [];
                }
                const paramANodo = (param: Expresion): SourceNode => {
                    return inner(param, toplevel, nivel)[0];
                };

                return params.map(paramANodo);
            })();

            nodoFun.add("(");
            for (let i = 0; i < nodos.length; i++) {
                nodoFun.add(nodos[i]);
                if (i + 1 !== nodos.length) {
                    nodoFun.add(", ");
                }
            }
            nodoFun.add(")");

            return nodoFun;
        }

        function generarJS_EBloque(
            exprs: Array<Expresion>,
            toplevel: boolean,
            IIFE = true,
            usarReturn = false
        ): [SourceNode, number] {
            function generarInner(exprs: Array<Expresion>): SourceNode {
                if (exprs.length === 1) {
                    const e = exprs[0];
                    if (toplevel) {
                        const snJs = inner(e, false, nivel)[0];
                        return new SourceNode(snJs.line, snJs.column, nombreArchivo, [indentacionNivel, snJs]);
                    } else {
                        switch (e.type) {
                            case "EDeclaracion": {
                                const snJs = inner(e, false, nivel)[0];
                                const codigoRes = [indentacionNivel, snJs, "\n", indentacionNivel];
                                if (usarReturn) codigoRes.push("return undefined");
                                return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                            }
                            default: {
                                const snJs = inner(e, false, nivel)[0];
                                const codigoRes = usarReturn
                                    ? [indentacionNivel, "return ", snJs]
                                    : [indentacionNivel, snJs];
                                return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                            }
                        }
                    }
                } else if (exprs.length > 1) {
                    const [e, ...es] = exprs
                    const snJs = inner(e, false, nivel)[0];
                    const codigoRes = new SourceNode(null, null, nombreArchivo, [indentacionNivel, snJs, "\n", generarInner(es)]);
                    return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                } else {
                    return new SourceNode(0, 0, nombreArchivo, "");
                }
            }

            const jsRetorno = (() => {
                if (toplevel) {
                    return generarInner(exprs);
                } else if (IIFE) {
                    const jsGen = generarInner(exprs);
                    const codigoRes = ["(() => {\n", jsGen, "\n", indentacionNivelAnt, "})()"];
                    return new SourceNode(jsGen.line, jsGen.column, nombreArchivo, codigoRes);
                } else {
                    const jsGen = generarInner(exprs);
                    const codigoRes = [jsGen, "\n"];
                    return new SourceNode(jsGen.line, jsGen.column, nombreArchivo, codigoRes);
                }
            })();
            return [jsRetorno, 0];
        }

        function generarJS_ENumero(info: InfoToken<string>): [SourceNode, number] {
            const valor = info.valor.toString();
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, valor), 0];
        }

        function generarJS_ETexto(info: InfoToken<string>): [SourceNode, number] {
            const strRes = "\"" + info.valor + "\"";
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, strRes), 0];
        }

        function generarJS_EBool(info: InfoToken<boolean>): [SourceNode, number] {
            const strRes = info.valor.toString();
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, strRes), 0];
        }

        function generarJS_EIdentificador(identificador: EIdentificador): [SourceNode, number] {
            const strRes = identificador.valorId.valor === "()" ? "undefined" : identificador.valorId.valor;
            return [new SourceNode(
                identificador.valorId.numLinea,
                identificador.valorId.inicio - identificador.valorId.posInicioLinea,
                nombreArchivo,
                strRes
            ), 0];
        }

        function generarJS_EUndefined(identificador: EUndefined): [SourceNode, number] {
            const strRes = "undefined";
            return [new SourceNode(
                identificador.infoId.numLinea,
                identificador.infoId.inicio - identificador.infoId.posInicioLinea,
                nombreArchivo,
                strRes
            ), 0];
        }

        function generarJS_EDeclaracion(dec: EDeclaracion): [SourceNode, number] {
            const inicio = dec.mut ? "let" : "const";
            const snId = generarJS_EIdentificador(dec.id)[0];

            switch (dec.valorDec.type) {
                // Si se asigna una declaracion a otra declaracion
                case "EDeclaracion": {
                    const [snResto] = inner(dec.valorDec, false, (nivel + 1));
                    const codigoRes = [inicio, " ", snId, " = ", "(() => {\n", indentacionNivelSig, snResto, "\n", indentacionNivelSig,
                        "return undefined;\n", indentacionNivel, "})()"];
                    const res = new SourceNode(
                        dec.id.valorId.numLinea,
                        dec.id.valorId.inicio - dec.id.valorId.posInicioLinea,
                        nombreArchivo,
                        codigoRes
                    );
                    return [res, 0];
                }
                default: {
                    const [snResto] = inner(dec.valorDec, false, (nivel + 1), true, true);
                    const codigoRes = [inicio, " ", snId, " = ", snResto];
                    const res = new SourceNode(
                        dec.id.valorId.numLinea,
                        dec.id.valorId.inicio - dec.id.valorId.posInicioLinea,
                        nombreArchivo,
                        codigoRes
                    );
                    return [res, 0];
                }
            }
        }

        function generarJS_EOperadorApl(eOpApl: EOperadorApl): [SourceNode, number] {
            const {op, izq, der} = eOpApl;
            const operador = op.valorOp.valor;
            const precedenciaOp = op.precedencia;
            if (operador === "ñ" || operador === "Ñ") return [uncurry(eOpApl), 14];

            const [nodoIzq, precedenciaJsIzq] = inner(izq, false, nivel);
            const [nodoDer, precedenciaJsDer] = inner(der, false, nivel);

            const nuevoNodoIzq = (precedenciaJsIzq > 0 && precedenciaJsIzq < precedenciaOp)
                ? new SourceNode(nodoIzq.line, nodoIzq.column, nombreArchivo, ["(", nodoIzq, ")"])
                : nodoIzq;

            const nuevoNodoDer = (precedenciaJsDer > 0 && precedenciaJsDer < precedenciaOp)
                ? new SourceNode(nodoIzq.line, nodoIzq.column, nombreArchivo, ["(", nodoDer, ")"])
                : nodoDer;

            const jsOpFinal = (() => {
                switch (operador) {
                    case ".":
                    case "?.":
                        return operador;
                    case ",":
                        return operador + " ";
                    default: {
                        return " " + operador + " ";
                    }
                }
            })();

            const nodoOp = new SourceNode(op.valorOp.numLinea, op.valorOp.inicio - op.valorOp.posInicioLinea, nombreArchivo, jsOpFinal);

            const chunks = imprParenEnOp ? ["(", nuevoNodoIzq, nodoOp, nuevoNodoDer, ")"] : [nuevoNodoIzq, nodoOp, nuevoNodoDer];
            const retorno = new SourceNode(nodoIzq.line, nodoIzq.column, nombreArchivo, chunks);
            return [retorno, precedenciaOp];
        }

        function generarJS_EOpUnarioIzq(eOpApl: EOperadorUnarioIzq): [SourceNode, number] {
            const infoOp = eOpApl.op.valorOp;

            const [nodo] = crearCodeWithSourceMap(eOpApl.expr, false, nivel, nombreArchivo);

            return [
                new SourceNode(
                    infoOp.numLinea,
                    infoOp.inicio - infoOp.posInicioLinea,
                    nombreArchivo,
                    [infoOp.valor, nodo]
                ),
                eOpApl.op.precedencia
            ];
        }

        function generarJS_ECondicional(eCond: ECondicional): [SourceNode, number] {
            const [exprCondicionIf, exprBloqueIf] = eCond.exprCondicion;

            const [snCondicion] = inner(exprCondicionIf, toplevel, nivel);
            const [snBloqueIf] = inner(exprBloqueIf, toplevel, nivel + 1, false);

            const nodoIf = new SourceNode(
                eCond.numLinea,
                eCond.inicio - eCond.posInicioLinea,
                nombreArchivo,
                [
                    "if (",
                    snCondicion,
                    ") {\n",
                    indentacionNivelSig,
                    snBloqueIf,
                    "\n}"
                ]
            );

            // Agregar nodos elif si existen
            eCond.exprElif?.map((g) => {
                const [exprCondicionElif, exprBloqueElif] = g;
                const [snCondicionELif] = inner(exprCondicionElif, toplevel, nivel);
                const [snBloqueElif] = inner(exprBloqueElif, toplevel, nivel + 1, false);

                return new SourceNode(
                    null,
                    null,
                    nombreArchivo,
                    [
                        " else if (",
                        snCondicionELif,
                        ") {",
                        indentacionNivelSig,
                        snBloqueElif,
                        "\n}"
                    ]
                );
            })
                ?.forEach((nodo) => {
                    nodoIf.add(nodo);
                });

            // Agregar nodo else si existe
            if (eCond.exprElse !== undefined) {
                const [snBloqueElse] = inner(eCond.exprElse, toplevel, nivel + 1, false);

                nodoIf.add(new SourceNode(
                    null,
                    null,
                    nombreArchivo,
                    [
                        " else {",
                        indentacionNivelSig,
                        snBloqueElse,
                        "\n}"
                    ]
                ));
            }

            return [nodoIf, 0];
        }

        const generarJS_EDeclaracionFuncion = getGeneradorJs_EDeclaracionFuncion(
            inner,
            generarJS_EIdentificador,
            nivel,
            nombreArchivo,
            indentacionNivelSig,
            indentacionNivel
        );
        const generarJS_EArray = getGeneradorJs_EArray(
            inner,
            nivel,
            nombreArchivo
        );
        const generarJS_EWhile = getGeneradorJs_EWhile(
            inner,
            nivel,
            nombreArchivo,
            toplevel,
            indentacionNivelSig
        );

        switch (expr.type) {
            case "EBloque": {
                return generarJS_EBloque(expr.bloque, toplevel, IIFE, usarReturn);
            }
            case "ENumero": {
                return generarJS_ENumero(expr.info);
            }
            case "ETexto": {
                return generarJS_ETexto(expr.info);
            }
            case "EBool": {
                return generarJS_EBool(expr.info);
            }
            case "EIdentificador": {
                return generarJS_EIdentificador(expr);
            }
            case "EDeclaracion": {
                return generarJS_EDeclaracion(expr);
            }
            case "EOperadorApl": {
                return generarJS_EOperadorApl(expr);
            }
            case "EUnidad": {
                const info = expr.info;
                return [
                    new SourceNode(
                        info.numLinea,
                        info.inicio - info.posInicioLinea,
                        nombreArchivo,
                        "undefined"
                    ),
                    0
                ];
            }
            case "EOperador": {
                throw new Error("Usar operadores como expresiones aun no soportado.");
            }
            case "EOperadorUnarioIzq": {
                return generarJS_EOpUnarioIzq(expr);
            }
            case "ECondicional": {
                return generarJS_ECondicional(expr);
            }
            case "EWhile": {
                return generarJS_EWhile(expr);
            }
            case "EUndefined": {
                return generarJS_EUndefined(expr);
            }
            case "EDeclaracionFuncion": {
                return generarJS_EDeclaracionFuncion(expr);
            }
            case "EArray": {
                return generarJS_EArray(expr);
            }
            default:
                let _: never;
                _ = expr;
                return _;
            // return [new SourceNode(0, 0, nombreArchivo, ""), 0];
        }
    }

    return inner(expr, toplevel, nivel);
}

