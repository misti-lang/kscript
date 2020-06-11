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
  ]) => _SourceNode = "SourceNode";


let rec crearCodeWithSourceMap = (expr, toplevel, nivel, nombreArchivo) => {

    let nombreArchivo = {
        switch (nombreArchivo) {
        | "" => None
        | _ => Some(nombreArchivo)
        };
    };

    let rec inner = (expr, toplevel, nivel): (_SourceNode, int) => {
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
        | ENumero(infoToken) => generarJS_ENumero(infoToken)
        | ETexto(info) => generarJS_ETexto(info)
        | EBool(info) => generarJS_EBool(info)
        | EIdentificador(datos) => generarJS_EIdentificador(datos)
        | EOperadorApl(eOpApl) => generarJS_EOperadorApl(eOpApl)
        | _ => (fnCSN(0, 0, nombreArchivo, `Str("")), 0)
        };
    };

    inner(expr, toplevel, nivel);
};

