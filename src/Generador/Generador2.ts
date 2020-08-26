import { EDeclaracion, EIdentificador, EOperadorApl, Expresion } from "../AnalisisSintactico/Expresion";
import { SourceNode } from "source-map";
import { InfoToken } from "../AnalisisLexico/InfoToken";

export function crearCodeWithSourceMap(
    expr: Expresion,
    toplevel: boolean,
    nivel: number,
    nombreArchivo: string | null
): [SourceNode, number] {

    function inner(expr: Expresion, toplevel: boolean, nivel: number): [SourceNode, number] {
        const indentacionNivel = new Array(nivel * 4).fill(" ").join("");
        const indentacionNivelSig = new Array((nivel + 1) * 4).fill(" ").join("");
        const indentacionNivelAnt = (nivel == 0) ? "" : new Array((nivel - 1) * 4).fill(" ").join("");

        const uncurry = (exprOp: EOperadorApl): SourceNode => {
            const extraerParams = (exprFn: EOperadorApl, acc: Array<Expresion>): [SourceNode, Array<Expresion>] => {
                const exprOpCurry = exprFn.izq;
                const ultimoParam = exprFn.der;
                switch (exprOpCurry.type) {
                    case "EOperadorApl": {
                        let valorOp = exprOpCurry.op.valorOp.valor;
                        if (valorOp === "ñ" || valorOp === "Ñ") {
                            return extraerParams(exprOpCurry, [ultimoParam, ...acc]);
                        } else {
                            let nodo = inner(exprOpCurry, toplevel, nivel)[0];
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
                if (params.length === 1 && params[0].type === "EIdentificador" && params[0].valorId.valor === "()") {
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

        function generarJS_EBloque(exprs: Array<Expresion>, toplevel: boolean): [SourceNode, number] {
            function generarInner(exprs: Array<Expresion>): SourceNode {
                if (exprs.length === 1) {
                    const e = exprs[0];
                    if (toplevel) {
                        const snJs = inner(e, false, nivel)[0];
                        return new SourceNode(snJs.line, snJs.column, nombreArchivo, [indentacionNivel, snJs, ";"]);
                    } else {
                        switch (e.type) {
                            case "EDeclaracion": {
                                const snJs = inner(e, false, nivel)[0];
                                const codigoRes = [indentacionNivel, snJs, ";\n", indentacionNivel, "return undefined;"];
                                return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                            }
                            default: {
                                const snJs = inner(e, false, nivel)[0];
                                const codigoRes = [indentacionNivel, "return ", snJs, ";"];
                                return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                            }
                        }
                    }
                } else if (exprs.length > 1) {
                    const [e, ...es] = exprs
                    const snJs = inner(e, false, nivel)[0];
                    const codigoRes = new SourceNode(null, null, nombreArchivo, [indentacionNivel, snJs, ";", "\n", generarInner(es)]);
                    return new SourceNode(snJs.line, snJs.column, nombreArchivo, codigoRes);
                } else {
                    return new SourceNode(0, 0, nombreArchivo, "");
                }
            }

            const jsRetorno = (() => {
                if (toplevel) {
                    return generarInner(exprs);
                } else {
                    const jsGen = generarInner(exprs);
                    const codigoRes = ["(() => {\n", jsGen, "\n", indentacionNivelAnt, "})()"];
                    return new SourceNode(jsGen.line, jsGen.column, nombreArchivo, codigoRes);
                }
            })();
            return [jsRetorno, 0];
        }

        function generarJS_ENumero(info: InfoToken<number>): [SourceNode, number] {
            let valor = info.valor.toString();
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, valor), 0];
        }

        function generarJS_ETexto(info: InfoToken<string>): [SourceNode, number] {
            const strRes = "\"" + info.valor + "\"";
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, strRes), 0];
        }

        function generarJS_EBool(info: InfoToken<boolean>): [SourceNode, number] {
            let strRes = info.valor.toString();
            return [new SourceNode(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, strRes), 0];
        }

        function generarJS_EIdentificador(identificador: EIdentificador): [SourceNode, number] {
            const strRes = identificador.valorId.valor === "()"? "undefined": identificador.valorId.valor;
            return [new SourceNode(
                identificador.valorId.numLinea,
                identificador.valorId.inicio - identificador.valorId.posInicioLinea,
                nombreArchivo,
                strRes
            ), 0];
        }

        function generarJS_EDeclaracion(dec: EDeclaracion): [SourceNode, number] {
            const inicio = dec.mut ? "let" : "const";
            const snId = generarJS_EIdentificador(dec.id)[0];
            const snResto = inner(dec.valorDec, false, (nivel + 1))[0];
            switch (dec.valorDec.type) {
                case "EDeclaracion": {
                    let codigoRes = [inicio, " ", snId, " = ", "(() => {\n", indentacionNivelSig, snResto, "\n", indentacionNivelSig,
                        "return undefined;\n", indentacionNivel, "})()"];
                    let res = new SourceNode(dec.id.valorId.numLinea, dec.id.valorId.inicio - dec.id.valorId.posInicioLinea, nombreArchivo, codigoRes);
                    return [res, 0];
                }
                default: {
                    let codigoRes = [inicio, " ", snId, " = ", snResto];
                    let res = new SourceNode(dec.id.valorId.numLinea, dec.id.valorId.inicio - dec.id.valorId.posInicioLinea, nombreArchivo, codigoRes);
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

            let jsOpFinal = (() => {
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

            let nodoOp = new SourceNode(op.valorOp.numLinea, op.valorOp.inicio - op.valorOp.posInicioLinea, nombreArchivo, jsOpFinal);

            let retorno = new SourceNode(nodoIzq.line, nodoIzq.column, nombreArchivo, [nuevoNodoIzq, nodoOp, nuevoNodoDer]);
            return [retorno, precedenciaOp];
        }

        switch (expr.type) {
            case "EBloque": {
                return generarJS_EBloque(expr.bloque, toplevel)
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
            default:
                return [new SourceNode(0, 0, nombreArchivo, ""), 0];
        }
    }

    return inner(expr, toplevel, nivel);
}

