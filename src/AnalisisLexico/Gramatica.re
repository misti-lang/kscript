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


let parseNuevaLinea = parseCaracter("\n");



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
    hayTokens: unit => bool
};


/* TODO: Agregar funcion que permita obtener el sig. token:
 *  luego de encontrar una nueva linea, saltandose todas las
 *  nuevas lineas y/o indentaciones.
 * Luego, debe ser posible regresar a la posición inicial.
 */
let crearLexer = (entrada: string) => {

    let tamanoEntrada = String.length(entrada);
    let esInicioDeLinea = ref(true)
    let numLineaActual = ref(1);
    let posAbsInicioLinea = ref(0);
    let posActual = ref(0);
    let indentacionActual = ref(0);
    let lookAhead = ref(None: option(resLexer));
    let ultimoToken = ref(None: option(resLexer));

    let rec sigTokenLuegoDeIdentacion = posActual => {
        let sigToken = run(parserGeneral, entrada, posActual);
        switch (sigToken) {
        | Error(_) => (Nada, -1)
        | Exito(ex) =>
            switch (ex.tipo) {
            | Indentacion =>
                sigTokenLuegoDeIdentacion(ex.posFinal);
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
                | "sea" => crearToken2(x => PC_SEA(x), "sea");
                | "mut" => crearToken2(x => PC_MUT(x), "mut");
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
            switch (lookAhead^) {
            | Some(token) => {
                lookAhead := None;
                token
            };
            | None => extraerToken();
            };
        
        ultimoToken := Some(tokenRespuesta);
        tokenRespuesta;
    };

    {
        entrada: entrada,
        sigToken: sigToken,
        lookAhead: () => {
            switch (lookAhead^) {
            | Some(token) => token
            | None => {
                let sigToken = sigToken();
                lookAhead := Some(sigToken);
                sigToken;
            };
            }
        },
        retroceder: () => {
            switch (lookAhead^) {
            | Some(_) => ()
            | None => {
                lookAhead := ultimoToken^
            }
            };
        },
        hayTokens: () => posActual^ < String.length(entrada)
    }
};

