open Lexer;


let operadores = ["+" , "-" , "=" , "*" , "!" , "\\" , "/" , "\'" , "|" , "@" , "#" , "·" , "$" , "~" , "%" , "¦" , "&" , "?" , "¿" , "¡" , "<" , ">" , "€" , "^" , "-" , "." , ":" , "," , ";" ];
let digitos = [ "0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9" ];
let mayusculas = [ "A" , "B" , "C" , "D" , "E" , "F" , "G" , "H" , "I" , "J" , "K" , "L" , "M" , "N" , "O" , "P" , "Q" , "R" , "S" , "T" , "U" , "V" , "W" , "X" , "Y" , "Z" , "Ñ" ];
let minusculas = [ "a" , "b" , "c" , "d" , "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ñ" ];
let signosAgrupacion = [ "(", ")", "{", "}", "[", "]" ];

let parseDigito = cualquier(digitos);
let parseMayuscula = cualquier(mayusculas);
let parseMinuscula = cualquier(minusculas);
let parseGuionBajo = parseCaracter("_");
let parseComillaSimple = parseCaracter("'");
let parseDolar = parseCaracter("$");

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


let parseNuevaLinea = {

    let parseNuevaLCarac = parseCaracter("\n");
    let parseNuevoWin = parseCaracter("\r");

    let parseNuevaLineaWin = mapP(((s1, s2)) => s1 ++ s2, parseNuevoWin |>>| parseNuevaLCarac);

    parseNuevaLCarac <|> parseNuevaLineaWin;
}


let parseComentario = {
    let parseBarra = parseCaracter("/");
    let parseInicio = ((_) => "//") <!> (parseBarra |>>| parseBarra);

    let parseResto = charListToStr <!> parseVarios(parseCualquierMenosP(parseNuevaLinea));

    (((s1, s2)) => s1 ++ s2) <!> (parseInicio |>>| parseResto);
};


let parseComentarioMulti = {
    let parseBarra = parseCaracter("/");
    let parseAst = parseCaracter("*");

    let parseInicio = ((_) => "/*") <!> (parseBarra |>>| parseAst);
    let parseFinal  = ((_) => "*/") <!> (parseAst |>>| parseBarra);

    let parseResto  = charListToStr <!> parseVarios(parseCualquierMenosP(parseFinal));

    ((((s1, s2), s3)) => s1 ++ s2 ++ s3) <!> (parseInicio |>>| parseResto |>>| parseFinal);
};


let parseRestoIdentificador = {
    let pTest = parseDigito <|> parseMayuscula <|> parseMinuscula <|> parseGuionBajo <|> parseComillaSimple <|> parseDolar;
    mapP(charListToStr, parseVarios(pTest));
};


let parseGenerico = {
    let tuplaAStr = (((c1, c2), s)) => c1 ++ c2 ++ s;
    mapP(tuplaAStr, parseComillaSimple |>>| parseMayuscula |>>| parseRestoIdentificador);
};


let parseIdentificador =
    mapP(((c, s)) => c ++ s, parseGuionBajo <|> parseMinuscula <|> parseDolar |>>| parseRestoIdentificador);


let parseIdentificadorTipo =
    mapP(((c, s)) => c ++ s, parseMayuscula |>>| parseRestoIdentificador);



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
    mapTipo(parseComentarioMulti, Comentario),
    mapTipo(parseComentario, Comentario),
    mapTipo(parseIdentificadorTipo, IdentificadorTipo),
    mapTipo(parseIdentificador, Identificador),
    mapTipo(parseGenerico, Generico),
    mapTipo(parseNumero, Numero),
    mapTipo(parseTexto, Texto),
    mapTipo(parseOperadores, Operadores),
    mapTipo(parseSignoAgrupacionAb, AgrupacionAb),
    mapTipo(parseSignoAgrupacionCer, AgrupacionCer)
]);

exception EstadoInvalido(unit);

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
    lookAheadSignificativo: bool => (resLexer, int, bool, unit => unit),
    debug: unit => unit
};

let tknToStr = token2 => {
    switch (token2) {
    | TNuevaLinea(_) => "TNuevaLinea"
    | TIdentificador(i: infoToken(string)) => i.valor
    | TGenerico(_) => "TGenerico"
    | TComentario(_) => "TComentario"
    | TNumero(_) => "TNumero"
    | TTexto(_) => "TTexto"
    | TBool(_) => "TBool"
    | TOperador(i: infoToken(string)) => i.valor
    | TParenAb(_) => "TParenAb"
    | TParenCer(_) => "TParenCer"
    | TAgrupAb(_) => "TAgrupAb"
    | TAgrupCer(_) => "TAgrupCer"
    | PC_LET(_) => "PC_LET"
    | PC_CONST(_) => "PC_CONST"
    };
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

    let tokensRestantesAStr = () => {
        let rec inner = (tokens, acc) => {
            switch tokens {
            | [x, ...xs] => {
                let stdAdc =
                    switch x {
                    | Token(t, _) => tknToStr(t);
                    | ErrorLexer(err) => {j|ErrorLexer($err)|j}
                    | EOF => "EOF"
                    };
                inner(xs, acc ++ stdAdc ++ ", ");
            }
            | [] => acc;
            }
        };

        inner(tokensRestantes^, "");
    };
    
    let debug = () => {
        Js.log("\n-----------------------------");
        Js.log("Estado actual del lexer:");
        let v = esInicioDeLinea^;
        Js.log({j|esInicioDeLinea: $v|j});
        let v = posActual^;
        Js.log({j|posActual: $v|j});
        let v = tokensRestantesAStr();
        Js.log({j|tokensRestantes: [$v]|j});
        let v = ultimoToken^;
        Js.log({j|ultimoToken:|j});
        Js.log(v);
        Js.log("-----------------------------\n");
    };

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
                | "let" => crearToken2(x => PC_LET(x), "let");
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

    tokensRestantes := [extraerToken()];

    let sigToken = () => {
        let tokenRespuesta =
            switch (tokensRestantes^) {
            | [token1, token2, ...resto] => {
                tokensRestantes := [token2] @ resto;
                token1;
            }
            | [token] => {
                // Limpiar el lookaheadsignificativo si ya se recurrieron los tokens que este almacenaba
                resultadoLookAheadSignificativo := None
                tokensRestantes := [extraerToken()];
                token;
            }
            | [] => raise(EstadoInvalido());
            };

        ultimoToken := Some(tokenRespuesta);
        tokenRespuesta;
    };

    let lookAhead = () => {
        switch (tokensRestantes^) {
        | [token, ..._] => token;
        | [] => raise(EstadoInvalido());
        };
    };

    let retroceder = () => {
        switch (tokensRestantes^) {
        | [token] => {
            switch (ultimoToken^) {
            | Some(tokenAnt) => {
                tokensRestantes := [tokenAnt, token]
            }
            | None => ();
            }
        }
        | [_, ..._] => ()
        | [] => raise(EstadoInvalido());
        }
    };

    /**
     * Busca el sig token que no sea nueva linea.
     * Devuelve ese token, y una funcion que permite hacer permantes los cambios.
     * El cliente es responsable de retroceder el parser si desea volver a 
     * esa pesicion anterior.
     */
    let lookAheadSignificativo = (ignorarPrimerToken): (resLexer, int, bool, unit => unit) => {

        let rec obtSigTokenSign = (tokensList, hayNuevaLinea) => {
            let sigToken = extraerToken();
            switch (sigToken) {
            | ErrorLexer(_) | EOF => {
                (sigToken, -1, hayNuevaLinea, tokensList @ [sigToken]);
            }
            | Token(token, indentacion) => {
                switch (token) {
                | TNuevaLinea(_) => {
                    obtSigTokenSign(tokensList, true);
                }
                | _ => {
                    (sigToken, indentacion, hayNuevaLinea, tokensList @ [sigToken]);
                }
                };
            }
            }
        };

        let rec pre = (tokensAct, hayNuevaLinea) => {
            switch tokensAct {
            | [t, ...resto] => {
                switch t {
                | ErrorLexer(_) | EOF => (t, -1, hayNuevaLinea, tokensAct);
                | Token(token, indentacion) => {
                    switch token {
                    | TNuevaLinea(_) => pre(resto, true);
                    | _ => (t, indentacion, hayNuevaLinea, tokensAct);
                    }
                }
                }
            }
            | [] => {
                obtSigTokenSign([], hayNuevaLinea);
            }
            }
        };

        switch resultadoLookAheadSignificativo^ {
        | Some(resultado) => resultado
        | None => {

            let (token, nivelIndentacion, hayNuevaLinea, listaRestante) =
                switch tokensRestantes^ {
                | [primerToken, ...resto] => {
                    if (ignorarPrimerToken) {
                        let (token, nivelIndentacion, hayNuevaLinea, listaRestante) = pre(resto, false);
                        (token, nivelIndentacion, hayNuevaLinea, [primerToken] @ listaRestante)
                    } else {
                        pre(tokensRestantes^, false);
                    }
                }
                | _ => raise(EstadoInvalido());
                }

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

    {
        entrada,
        sigToken,
        lookAhead,
        retroceder,
        lookAheadSignificativo,
        hayTokens: () => posActual^ <= String.length(entrada),
        debug
    }
};

