open Lexer;


let operadores = ["+" , "-" , "=" , "*" , "!" , "\\" , "/" , "\'" , "|" , "@" , "#" , "·" , "$" , "~" , "%" , "¦" , "&" , "?" , "¿" , "¡" , "<" , ">" , "€" , "^" , "-" , "." , ":" , "," , " ," ];
let digitos = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" ];
let mayusculas = [ "A" , "B" , "C" , "D" , "E" , "F" , "G" , "H" , "I" , "J" , "K" , "L" , "M" , "N" , "O" , "P" , "Q" , "R" , "S" , "T" , "U" , "V" , "W" , "X" , "Y" , "Z" , "Ñ" ];
let minusculas = [ "a" , "b" , "c" , "d" , "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ñ" ];
let signosAgrupacion = [ "(", ")", "{", "}", "[", "]" ];

let parseDigito = cualquier(digitos);
let parseMayuscula = cualquier(mayusculas);
let parseMinuscula = cualquier(minusculas);
let parseGuionBajo = parseCaracter("_");
let parseComillaSimple = parseCaracter("'");

let charListToStr = caracteres => {
    let rec inner = (acc, param) => {
        switch (param) {
        | [] => acc;
        | [c, ...cs] => inner((acc ++ c), cs)
        };
    };

    inner("", caracteres);
};


let parseOperador = cualquier(operadores);
let parseOperadores = mapP(charListToStr, parseVarios1(parseOperador));


let parseNumero = {
    let parseNumeros = mapP(charListToStr, parseVarios1(parseDigito));
    let parsePunto = parseCaracter(".");

    let parseParteDecimal =
        mapP(((p, n)) => p ++ n, (parsePunto |>>| parseNumeros))

    let funPass = ((num, decimal)) =>
        num ++ switch (decimal) {
               | None => ""
               | Some(s) => s
        };

    mapP(funPass, parseNumeros <?> parseParteDecimal);
};


let parseTexto = {
    let parseComilla = parseCaracter("\"");
    let parseResto = mapP(charListToStr, (parseVarios(parseCualquierMenos("\""))));

    between(parseComilla, parseResto, parseComilla);
};


let parseComentario = {
    let parseBarra = parseCaracter("/");
    let parseInicio = mapP(((x1, x2)) => x1 ++ x2, parseBarra |>>| parseBarra);

    let parseResto = mapP(charListToStr, parseVarios(parseCualquierMenos("\n")));

    parseInicio >>| parseResto;
};


let parseRestoIdentificador = {
    let pTest = parseDigito <|> parseMayuscula <|> parseMinuscula <|> parseGuionBajo <|> parseComillaSimple;
    mapP(charListToStr, parseVarios(pTest));
};


let parseGenerico = {
    let tuplaAStr = (((c1, c2), s)) => c1 ++ c2 ++ s;
    mapP(tuplaAStr, parseComillaSimple |>>| parseMayuscula |>>| parseRestoIdentificador);
};


let parseIdentificador =
    mapP(((c, s)) => c ++ s, parseGuionBajo <|> parseMinuscula |>>| parseRestoIdentificador);


let parseIdentificadorTipo =
    mapP(((c, s)) => c ++ s, parseMayuscula |>>| parseRestoIdentificador);


let parseNuevaLinea = {

    let parseNuevaLCarac = parseCaracter("\n");
    let parseNuevoWin = parseCaracter("\r");

    let parseNuevaLineaWin = mapP(((s1, s2)) => s1 ++ s2, parseNuevoWin |>>| parseNuevaLCarac);

    parseNuevaLCarac <|> parseNuevaLineaWin;
}



// Esta fun. asume que se encuentra al inicio de linea.
let parseIndentacion = {
    let pEB = parseCaracter(" ");
    let parseIdEspBlanco = mapP(charListToStr, parseVarios1(pEB));

    let pTab = parseCaracter("\t");
    parseIdEspBlanco <|> pTab;
};


let parseParenAb = parseCaracter("(");
let parseParenCer = parseCaracter(")");

let parseLlaveAb = parseCaracter("{");
let parseLlaveCer = parseCaracter("}");

let parseCorcheteAb = parseCaracter("[");
let parseCorcheteCer = parseCaracter("]");


let parseSignoAgrupacionAb = escoger([parseParenAb, parseLlaveAb, parseCorcheteAb]);


let parseSignoAgrupacionCer = escoger([parseParenCer, parseLlaveCer, parseCorcheteCer]);


let parserGeneral = parseVariasOpciones([
    mapTipo(parseIndentacion, Indentacion),
    mapTipo(parseNuevaLinea, NuevaLinea),
    mapTipo(parseIdentificadorTipo, IdentificadorTipo),
    mapTipo(parseIdentificador, Identificador),
    mapTipo(parseGenerico, Generico),
    mapTipo(parseComentario, Comentario),
    mapTipo(parseNumero, Numero),
    mapTipo(parseTexto, Texto),
    mapTipo(parseOperadores, Operadores),
    mapTipo(parseSignoAgrupacionAb, AgrupacionAb),
    mapTipo(parseSignoAgrupacionCer, AgrupacionCer)
]);


type resLexer =
    | Token(token2, int)
    | ErrorLexer(string)
    | EOF


type lexer = {
    entrada: string,
    sigToken: unit => resLexer,
    lookAhead: unit => resLexer,
    retroceder: unit => unit,
    hayTokens: unit => bool,
    lookAheadSignificativo: unit => (resLexer, int, bool, unit => unit),
    debug: unit => unit
};


let crearLexer = (entrada: string) => {

    let tamanoEntrada = String.length(entrada);
    let esInicioDeLinea = ref(true)
    let numLineaActual = ref(1);
    let posAbsInicioLinea = ref(0);
    let posActual = ref(0);
    let indentacionActual = ref(0);
    let tokensRestantes = ref([]: list(resLexer));
    let ultimoToken = ref(None: option(resLexer));
    let resultadoLookAheadSignificativo = ref(None: option((resLexer, int, bool, unit => unit)));

    let rec sigTokenLuegoDeIdentacion = posActual => {
        let sigToken = run(parserGeneral, entrada, posActual);
        switch (sigToken) {
        | Error(_) => (Nada, -1)
        | Exito(ex) =>
            switch (ex.tipo) {
            | Indentacion => sigTokenLuegoDeIdentacion(ex.posFinal);
            | _ => (ex.tipo, posActual);
            };
        };
    };

    let rec extraerToken = (): resLexer => {
        if (posActual^ >= tamanoEntrada) EOF else {
        let resultado = run(parserGeneral, entrada, posActual^);

        switch (resultado) {
        | Error(err) => ErrorLexer(err);
        | Exito(ex) => {

            let opComun () = {
                esInicioDeLinea := false;
                posActual := ex.posFinal;
            };

            let crearToken2 = (tipo, valor) => {
                opComun();

                Token(tipo {
                    valor: valor,
                    inicio: ex.posInicio,
                    final: ex.posFinal,
                    numLinea: numLineaActual^,
                    posInicioLinea: posAbsInicioLinea^
                }, indentacionActual^)
            };

            switch (ex.tipo) {
            | Nada => ErrorLexer("Se encontró un token huerfano");

            | Indentacion when (!esInicioDeLinea^) => {
                // Se encontró espacios blancos o un Tab en medio de una linea.
                posActual := ex.posFinal;
                extraerToken();
            };
            | Indentacion => {

                let (tipo, sigPos) = sigTokenLuegoDeIdentacion(ex.posFinal);
                switch (tipo) {
                | Nada =>
                    // ErrorLexer "Se encontró un token invalido (Nada)"
                    EOF
                | NuevaLinea => {
                    posActual := sigPos;
                    indentacionActual := 0;
                    extraerToken();
                };
                | _ => {
                    posActual := ex.posFinal;
                    posActual := sigPos;
                    indentacionActual := sigPos - ex.posInicio;
                    extraerToken();
                };
                };
            };
            | NuevaLinea => {
                let resultado = Token(TNuevaLinea {
                    valor: (),
                    inicio: ex.posInicio,
                    final: ex.posFinal,
                    numLinea: numLineaActual^,
                    posInicioLinea: posAbsInicioLinea^
                }, indentacionActual^);
                posActual := ex.posFinal;
                esInicioDeLinea := true;
                indentacionActual := 0;
                numLineaActual := numLineaActual^ + 1;
                posAbsInicioLinea := ex.posFinal;
                resultado;
            };
            | Identificador | IdentificadorTipo => {
                switch (ex.res) {
                | "true" => crearToken2(x => TBool(x), true);
                | "false" => crearToken2(x => TBool(x), false);
                | "let" => crearToken2(x => PC_LET(x), "sea");
                | "const" => crearToken2(x => PC_CONST(x), "const");
                | _ => crearToken2(x => TIdentificador(x), ex.res);
                };
            };
            | Generico =>
                crearToken2(x => TGenerico(x), ex.res)
            | Comentario =>
                crearToken2(x => TComentario(x), ex.res);
            | Numero =>
                crearToken2(x => TNumero(x), (Js.Float.fromString(ex.res)));
            | Texto =>
                crearToken2(x => TTexto(x), ex.res);
            | Operadores =>
                crearToken2(x => TOperador(x), ex.res);
            | AgrupacionAb =>
                switch (ex.res) {
                | "(" =>
                    crearToken2(x => TParenAb(x), ex.res);
                | _ =>
                    crearToken2(x => TAgrupAb(x), ex.res);
                };
            | AgrupacionCer =>
                switch (ex.res) {
                | ")" =>
                    crearToken2(x => TParenCer(x), ex.res);
                | _ =>
                    crearToken2(x => TAgrupCer(x), ex.res);
                };
            };
        };
        };
    }};

    let sigToken = () => {
        let tokenRespuesta =
            switch (tokensRestantes^) {
            | [] => extraerToken();
            | [token, ...resto] => {
                tokensRestantes := resto;
                token;
            }
            };

        ultimoToken := Some(tokenRespuesta);
        tokenRespuesta;
    };

    let lookAhead = () => {
        switch (tokensRestantes^) {
        | [] => {
            let sigToken = sigToken();
            tokensRestantes := [sigToken];
            sigToken;
        }
        | [token, ..._] => token;
        };
    };

    let retroceder = () => {
        switch (tokensRestantes^) {
        | [] => {
            switch (ultimoToken^) {
            | Some(token) => {
                tokensRestantes := [token]
            }
            | None => ();
            }
        }
        | [_, ..._] => ()
        }
    };

    /**
     * Busca el sig token que no sea nueva linea.
     * Devuelve ese token, y una funcion que permite hacer permantes los cambios.
     * El cliente es responsable de retroceder el parser si desea volver a 
     * esa pesicion anterior.
     */
    let lookAheadSignificativo = (): (resLexer, int, bool, unit => unit) => {

        let rec obtSigTokenSign = (tokensList, hayNuevaLinea) => {
            let sigToken = extraerToken();
            switch (sigToken) {
            | ErrorLexer(_) | EOF => {
                (sigToken, -1, hayNuevaLinea, tokensList);
            }
            | Token(token, indentacion) => {
                switch (token) {
                | TNuevaLinea(_) => {
                    obtSigTokenSign(tokensList @ [sigToken], true);
                }
                | _ => {
                    (sigToken, indentacion, hayNuevaLinea, tokensList @ [sigToken]);
                }
                };
            }
            }
        };

        switch resultadoLookAheadSignificativo^ {
        | Some(resultado) => resultado
        | None => {
            let (token, nivelIndentacion, hayNuevaLinea, listaRestante) = obtSigTokenSign(tokensRestantes^, false);
            tokensRestantes := listaRestante;
            let resultado = (token, nivelIndentacion, hayNuevaLinea, () => {
                resultadoLookAheadSignificativo := None;
                tokensRestantes := [token];
            });
            resultadoLookAheadSignificativo := Some(resultado);
            resultado;
        }
        };

    };

    let debug = () => {
        Js.log("\n-----------------------------");
        Js.log("Estado actual del lexer:");
        let v = esInicioDeLinea^;
        Js.log({j|esInicioDeLinea: $v|j});
        let v = posActual^;
        Js.log({j|posActual: $v|j});
        let v = tokensRestantes^;
        Js.log({j|tokensRestantes:|j});
        Js.log(v);
        let v = ultimoToken^;
        Js.log({j|ultimoToken:|j});
        Js.log(v);
        Js.log("-----------------------------\n");
    };

    {
        entrada,
        sigToken,
        lookAhead,
        retroceder,
        lookAheadSignificativo,
        hayTokens: () => posActual^ < String.length(entrada),
        debug
    }
};

