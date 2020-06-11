open Lexer;
open Parser;

type _CodeGenerator = {
    toString: unit => string
}

type _CodeWithSourceMap = {
    code: string,
    map: _CodeGenerator
};

type _SourceNode = {
    children: array(_SourceNode),
    line: int,
    column: int,
    source: string,
    name: string,
    toStringWithSourceMap: int
};

[@bs.new][@bs.module "source-map"] external fnCSN: (
  int, 
  int,
  option(string),
  [@bs.unwrap] [
    | `Str(string)
    | `SN(_SourceNode)
    | `SNR(array(_SourceNode))
    | `SS((string, _SourceNode, string))
    | `S1((string, _SourceNode, string))
    | `S2(string, _SourceNode, string, string, _SourceNode)
    | `S3(string, _SourceNode, string, string, string)
    | `S4((string, string, _SourceNode, string))
    | `SST(string, string, _SourceNode, string, string, string, _SourceNode,
            string, string, string, string, string)
    | `SSTT(string, string, _SourceNode, string, _SourceNode)
  ]) => _SourceNode = "SourceNode";


let crearCodeWithSourceMap = (expr, toplevel, nivel, nombreArchivo) => {

    let nombreArchivo = {
        switch (nombreArchivo) {
        | "" => None
        | _ => Some(nombreArchivo)
        };
    };

    let rec inner = (expr, toplevel, nivel): (_SourceNode, int) => {

        let indentacionNivel = String.make(nivel * 4, ' ');
        let indentacionNivelSig = String.make((nivel + 1) * 4, ' ');
        let indentacionNivelAnt = if (nivel == 0)  "" else String.make((nivel - 1) * 4, ' ');

        let generarJS_EBloque = (exprs, toplevel) => {

            let rec generarInner = exprs: _SourceNode => {
                
                switch (exprs) {
                | [e, ...es] when List.length(es) == 0 => {
                    if (toplevel) {
                        let (snJs, _) = inner(e, false, nivel);
                        fnCSN(snJs.line, snJs.column, nombreArchivo, `S1(indentacionNivel, snJs, ";"));
                    } else {
                        switch (e) {
                        | EDeclaracion(_) => {
                            let (snJs, _) = inner(e, false, nivel);
                            let codigoRes = `S3(indentacionNivel, snJs, ";\n", indentacionNivel, "return undefined;");
                            fnCSN(snJs.line, snJs.column, nombreArchivo, codigoRes);
                        }
                        | _ => {
                            let (snJs, _) = inner(e, false, nivel);
                            let codigoRes = `S4(indentacionNivel, "return ", snJs, ";");
                            fnCSN(snJs.line, snJs.column, nombreArchivo, codigoRes);
                        }
                        }
                    }
                }
                | [e, ...es] => {
                    let (snJs, _) = inner(e, false, nivel);
                    let codigoRes = `S2(indentacionNivel, snJs, ";", "\n", generarInner(es));
                    fnCSN(snJs.line, snJs.column, nombreArchivo, codigoRes);
                }
                | [] => fnCSN(0, 0, nombreArchivo, `Str(""));
                };

            };

            let jsRestorno = 
                if (toplevel) generarInner(exprs)
                else {
                    let jsGen = generarInner(exprs);
                    let codigoRes = `S3("(() => {\n", jsGen, "\n", indentacionNivelAnt, "})()");
                    fnCSN(jsGen.line, jsGen.column, nombreArchivo, codigoRes);
                };

            (jsRestorno, 0);
        };

        let generarJS_ENumero = (info: infoToken(float)) => {
            let valor = Js.Float.toString(info.valor);
            (fnCSN(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, `Str(valor)), 0);
        };

        let generarJS_ETexto = (info: infoToken(string)) => {
            let strRes = "\"" ++ info.valor ++ "\"";
            (fnCSN(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, `Str(strRes)), 0);
        }

        let generarJS_EBool = (info: infoToken(bool)) => {
            let strRes = if (info.valor) "true" else "false";
            (fnCSN(info.numLinea, info.inicio - info.posInicioLinea, nombreArchivo, `Str(strRes)), 0);
        }

        let generarJS_EIdentificador = (identificador: eIdentificador) => {
            let strRes = identificador.valorId.valor;
            (fnCSN(
                identificador.valorId.numLinea, 
                identificador.valorId.inicio - identificador.valorId.posInicioLinea,
                nombreArchivo,
                `Str(strRes)
            ), 0);
        }

        let generarJS_EDeclaracion = dec => {
            let inicio = if (dec.mut) "let" else "const";
            let (snId, _) = generarJS_EIdentificador(dec.id);
            let (snResto, _) = inner(dec.valorDec, false, (nivel + 1));
            switch (dec.valorDec) {
            | EDeclaracion(_) => {
                let codigoRes = `SST(inicio, " ", snId, " = ", "(() => {\n", indentacionNivelSig, snResto, "\n", indentacionNivelSig, 
                                "return undefined;\n", indentacionNivel, "})()");
                let res = fnCSN(dec.id.valorId.numLinea, dec.id.valorId.inicio - dec.id.valorId.posInicioLinea, nombreArchivo, codigoRes);
                (res, 0);
            }
            | _ => {
                let codigoRes = `SSTT(inicio, " ", snId, " = ", snResto);
                let res = fnCSN(dec.id.valorId.numLinea, dec.id.valorId.inicio - dec.id.valorId.posInicioLinea, nombreArchivo, codigoRes);
                (res, 0)
            }
            };
        };

        let generarJS_EOperadorApl = (eOpApl: eOperadorApl) => {
            let {op, izq, der} = eOpApl;
            let operador = op.valorOp.valor;
            let precedenciaOp = op.precedencia;
            let (nodoIzq, precedenciaJsIzq) = inner(izq, false, nivel);
            let (nodoDer, precedenciaJsDer) = inner(der, false, nivel);

            let nuevoNodoIzq = 
                if (precedenciaJsIzq > 0 && precedenciaJsIzq < precedenciaOp) {
                    fnCSN(nodoIzq.line, nodoIzq.column, nombreArchivo, `SS("(", nodoIzq, ")"));
                } else {
                    nodoIzq
                };

            let nuevoNodoDer =
                if (precedenciaJsDer > 0 && precedenciaJsDer < precedenciaOp) {
                    fnCSN(nodoIzq.line, nodoIzq.column, nombreArchivo, `SS("(", nodoDer, ")"));
                } else {
                    nodoDer;
                };

            let jsOpFinal = {
                let strEneMinuscula = {j|ñ|j};
                let strEneMayuscula = {j|Ñ|j};
                switch (operador) {
                | "." | "?." => operador
                | "," => operador ++ " "
                | _ => {
                    if (operador == strEneMinuscula || operador == strEneMayuscula) {
                        " "
                    } else {
                        " " ++ operador ++ " "
                    };
                }
                };
            };

            let nodoOp = fnCSN(op.valorOp.numLinea, op.valorOp.inicio - op.valorOp.posInicioLinea, nombreArchivo, `Str(jsOpFinal));

            let retorno = fnCSN(nodoIzq.line, nodoIzq.column, nombreArchivo, `SNR([|nuevoNodoIzq, nodoOp, nuevoNodoDer|]));
            (retorno, precedenciaOp);
        };

        switch (expr) {
        | EBloque(exprs) => generarJS_EBloque(exprs, toplevel)
        | ENumero(infoToken) => generarJS_ENumero(infoToken)
        | ETexto(info) => generarJS_ETexto(info)
        | EBool(info) => generarJS_EBool(info)
        | EIdentificador(datos) => generarJS_EIdentificador(datos)
        | EDeclaracion(dec) => generarJS_EDeclaracion(dec)
        | EOperadorApl(eOpApl) => generarJS_EOperadorApl(eOpApl)
        | _ => (fnCSN(0, 0, nombreArchivo, `Str("")), 0)
        };
    };

    inner(expr, toplevel, nivel);
};

