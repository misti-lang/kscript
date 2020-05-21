open Lexer;
open Parser;


let rec generarJs = (expr: expresion, toplevel, nivel): (string, int) => {

    let indentacionNivel = String.make(nivel * 4, ' ');
    let indentacionNivelSig = String.make((nivel + 1) * 4, ' ');
    let indentacionNivelAnt =
        if (nivel == 0)  ""
        else String.make((nivel - 1) * 4, ' ');

    let generarJS_ENumero = (info: infoToken(float)) => (Js.Float.toString(info.valor), 0);

    let generarJS_ETexto = (info: infoToken(string)) => ("\"" ++ info.valor ++ "\"", 0)

    let generarJS_EBool = (info: infoToken(bool)) => (if (info.valor) "true" else "false", 0);

    let generarJS_EIdentificador = (identificador: eIdentificador) =>
        (identificador.valorId.valor, 0);

    let generarJS_EDeclaracion = dec => {
        let inicio = if (dec.mut) "let" else "const";
        let (id, _) = generarJS_EIdentificador(dec.id);
        let (strJs, _) = generarJs(dec.valorDec, false, (nivel + 1));
        switch (dec.valorDec) {
        | EDeclaracion(_) => {
            let jsRetorno = inicio ++ " " ++ id ++ " = " ++ "(() => {\n" ++ indentacionNivelSig ++ strJs ++ "\n" 
                ++ indentacionNivelSig ++ "return undefined;\n" ++ indentacionNivel ++ "})()";
            (jsRetorno, 0);
        }
        | _ =>
            (inicio ++ " " ++ id ++ " = " ++ strJs, 0)
        };
    };

    let generarJS_EOperadorApl = (eOpApl: eOperadorApl) => {
        let {op, izq, der} = eOpApl;
        let operador = op.valorOp.valor;
        let precedenciaOp = op.precedencia;
        let (jsExprIzq, precedenciaJsIzq) = generarJs(izq, false, nivel);
        let (jsExprDer, precedenciaJsDer) = generarJs(der, false, nivel);

        let jsIzqFinal = 
            if (precedenciaJsIzq > 0 && precedenciaJsIzq < precedenciaOp) {
                {j|($jsExprIzq)|j};
            } else {
                jsExprIzq;
            };

        let exprDerFinal =
            if (precedenciaJsDer > 0 && precedenciaJsDer < precedenciaOp) {
                {j|($jsExprDer)|j};
            } else {
                jsExprDer;
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

        let jsRetorno = jsIzqFinal ++ jsOpFinal ++ exprDerFinal;
        (jsRetorno, precedenciaOp);
    };


    let generarJS_EBloque = (exprs, toplevel) => {

        let rec generarInner = exprs => {
            indentacionNivel ++
                switch (exprs) {
                | [] => ""
                | [e, ...es] when List.length(es) == 0 => {
                    if (toplevel) {
                        let (js, _) = generarJs(e, false, nivel);
                        js ++ ";";
                    } else
                        switch (e) {
                        | EDeclaracion(_) => {
                            let (js, _) = generarJs(e, false, nivel);
                            js ++ ";\n" ++ indentacionNivel ++ "return undefined;";
                        }
                        | _ => {
                            let (js, _) = generarJs(e, false, nivel);
                            "return " ++ js ++ ";"
                        }
                        }
                }
                | [e, ...es] => {
                    let (js, _) = generarJs(e, false, nivel);
                    js ++ ";" ++ (if (toplevel) "\n" else "") ++ "\n" ++ generarInner(es)
                }
                };

        };

        let jsRestorno = 
            if (toplevel) generarInner(exprs)
            else "(() => {\n" ++ generarInner(exprs) ++ "\n" ++ indentacionNivelAnt ++ "})()";

        (jsRestorno, 0);
    };


    switch (expr) {
    | EBloque(exprs) => generarJS_EBloque(exprs, toplevel)
    | EUnidad(_) => ("undefined", 0)
    | ENumero(infoToken) => generarJS_ENumero(infoToken)
    | ETexto(info) => generarJS_ETexto(info)
    | EBool(info) => generarJS_EBool(info)
    | EIdentificador(datos) => generarJS_EIdentificador(datos)
    | EDeclaracion(dec) => generarJS_EDeclaracion(dec)
    | EOperadorApl(eOpApl) => generarJS_EOperadorApl(eOpApl)
    | _ => ("/* No implementado :c */", 0)
    };

};
