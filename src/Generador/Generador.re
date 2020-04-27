open Lexer;
open Parser;


let rec generarJs = (expr: expresion, toplevel, nivel) => {

    let indentacionNivel = String.make(nivel * 4, ' ');
    let indentacionNivelSig = String.make((nivel + 1) * 4, ' ');
    let indentacionNivelAnt =
        if (nivel == 0)  ""
        else String.make((nivel - 1) * 4, ' ');
    
    let generarJS_ENumero = (info: infoToken(float)) => Js.Float.toString(info.valor);

    let generarJS_ETexto = (info: infoToken(string)) => "\"" ++ info.valor ++ "\""

    let generarJS_EBool = (info: infoToken(bool)) => if (info.valor) "true" else "false";

    let generarJS_EIdentificador = (identificador: eIdentificador) =>
        identificador.valor.valor

    let generarJS_EDeclaracion = dec => {
        let inicio = if (dec.mut) "let" else "const";
        let id = generarJS_EIdentificador(dec.id);
        let valor = generarJs(dec.valor, false, (nivel + 1));
        switch (dec.valor) {
        | EDeclaracion(_) =>
            inicio ++ " " ++ id ++ " = " ++ "(() => {\n" ++ indentacionNivelSig ++ valor ++ "\n" 
            ++ indentacionNivelSig ++ "return undefined;\n" ++ indentacionNivel ++ "})()";
        | _ =>
            inicio ++ " " ++ id ++ " = " ++ valor
        };
    };

    let generarJS_EFuncion = (efuncion: eFuncion) => {
        let jsFun = generarJs(efuncion.fn, false, nivel);
        let jsParam = generarJs(efuncion.param, false, nivel);
        {j|$jsFun($jsParam)|j}
    };

    let generarJS_EOperadorApl = (eOpApl: eOperadorApl) => {
        let {op, izq, der} = eOpApl;
        let operador = op.valor.valor;
        let jsExprIzq = generarJs(izq, false, nivel);
        let jsExprDer = generarJs(der, false, nivel);
        "(" ++ jsExprIzq ++ ") " ++ operador ++ " " ++ jsExprDer
    };


    let generarJS_EBloque = (exprs, toplevel) => {

        let rec generarInner = exprs => {
            indentacionNivel ++
                switch (exprs) {
                | [] => ""
                | [e, ...es] when List.length(es) == 0 => {
                    if (toplevel) { generarJs(e, false, nivel) ++ ";" }
                    else
                        switch (e) {
                        | EDeclaracion(_) =>
                            generarJs(e, false, nivel) ++ ";\n" ++ indentacionNivel ++ "return undefined;";
                        | _ =>
                            "return " ++ generarJs(e, false, nivel) ++ ";"
                        }
                }
                | [e, ...es] =>
                    generarJs(e, false, nivel) ++ ";" ++ (if (toplevel) "\n" else "") ++ "\n" ++ generarInner(es)
                };
            
        };

        if (toplevel) generarInner(exprs)
        else "(() => {\n" ++ generarInner(exprs) ++ "\n" ++ indentacionNivelAnt ++ "})()"
    };


    switch (expr) {
    | EBloque(exprs) => generarJS_EBloque(exprs, toplevel)
    | EUnidad(_) => "undefined"
    | ENumero(infoToken) => generarJS_ENumero(infoToken)
    | ETexto(info) => generarJS_ETexto(info)
    | EBool(info) => generarJS_EBool(info)
    | EIdentificador(datos) => generarJS_EIdentificador(datos)
    | EDeclaracion(dec) => generarJS_EDeclaracion(dec)
    | EFuncion(efuncion) => generarJS_EFuncion(efuncion)
    | EOperadorApl(eOpApl) => generarJS_EOperadorApl(eOpApl)
    | _ => "/* No implementado :c */"
    };

};
