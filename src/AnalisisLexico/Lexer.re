

type token =
    | Indentacion
    | NuevaLinea
    | IdentificadorTipo
    | Identificador
    | Generico
    | Comentario
    | Numero
    | Texto
    | Operadores
    | AgrupacionAb
    | AgrupacionCer
    | Nada


type exito('A) = {
    res: 'A,
    posInicio: int,
    posFinal: int,
    tipo: token
};



type infoToken('A) = {
    valor:       'A,
    inicio:      int,
    final:       int
}


type token2 =
    | TNuevaLinea(infoToken(unit))
    | TIdentificador(infoToken(string))
    | TGenerico(infoToken(string))
    | TComentario(infoToken(string))
    | TNumero(infoToken(float))
    | TTexto(infoToken(string))
    | TBool(infoToken(bool))
    | TOperador(infoToken(string))
    | TParenAb(infoToken(string))  // Parentesis abierto
    | TParenCer(infoToken(string)) // Parentesis cerrado
    | TAgrupAb(infoToken(string))
    | TAgrupCer(infoToken(string))
    | PC_SEA(infoToken(string))
    | PC_MUT(infoToken(string))


type resultado('A) =
    | Exito(exito('A))
    | Error(string)


type parser('A) = Parser(string => int => resultado('A))


let run = (parser, entrada, inicio) => {
    let Parser(p) = parser;
    p(entrada, inicio);
};


let bindP = (f, p) => {
    let innerFn = (entrada, inicio) => {
        let result1 = run(p, entrada, inicio);
        switch (result1) {
        | Error(err) => Error(err)
        | Exito(ex) => {
            let (resultado, posSiguiente) = (ex.res, ex.posFinal)
            let p2 = f(resultado);
            run(p2, entrada, posSiguiente);
        }
        };
    };

    Parser(innerFn)
};


let ( >>= ) = (p, f) => bindP(f, p);



/// Lift a value to a Parser
let returnP = (x) => {
    let innerFn = (_, inicio) => {
        Exito({
            res: x,
            posInicio: inicio,
            posFinal: inicio,
            tipo: Nada
        })
    };

    Parser(innerFn)
};



/// Aplica una función al resultado de un Parser
let mapP = (f, p) => {
    let inner = (entrada, inicio) => {
        let res = run(p, entrada, inicio);
        switch (res) {
        | Error(err) => Error(err)
        | Exito(ex) =>
            Exito {
                res: f(ex.res),
                posInicio: ex.posInicio,
                posFinal: ex.posFinal,
                tipo: ex.tipo
            }
        };
    };

    Parser(inner);
};

let ( <!> ) = mapP
let ( |>> ) = (x, f) => mapP(f, x);


let applyP = (fP, xP) =>
    fP >>= (f => 
        xP >>= (x =>
            returnP(f(x))
        )
    )

let ( <*> ) = applyP


/// lift a two parameter function to Parser World
let lift2 = (f, xP, yP) => returnP(f) <*> xP <*> yP


// ===================================
//  Parsers
// ===================================


let parseCaracter = caracter => {
    let inner = (entrada, inicio) => {
        if (entrada == "" || inicio >= String.length(entrada))
            Error("Entrada terminada")
        else {
            let c = String.get(entrada, inicio);
            if (c == caracter)
                Exito {
                    res: c,
                    posInicio: inicio,
                    posFinal: inicio + 1,
                    tipo: Nada
                }
            else
                Error({j|Se esperaba '$(caracter)', pero se obtuvo '$(c)'.|j})
        };
    };

    Parser(inner)
};


/// Aplica p1 y luego p2
let parseLuego = (p1, p2) => {
    let inner = (entrada, inicio) => {
        let res1 = run(p1, entrada, inicio);

        switch (res1) {
        | Error(err) => Error(err)
        | Exito(ex1) => {
            let res2 = run(p2, entrada, ex1.posFinal);

            switch (res2) {
            | Error(err) => Error(err)
            | Exito(ex2) =>
                Exito {
                    res: (ex1.res, ex2.res),
                    posInicio: inicio,
                    posFinal: ex2.posFinal,
                    tipo: Nada
                }
            };
        }
        };
    };

    Parser(inner);
};


let ( |>>| ) = parseLuego


/// Intenta aplicar p1 y si falla aplica p2
let parseOtro = (p1, p2) => {
    let innerFn = (entrada, inicio) => {
        let result1 = run(p1, entrada, inicio);

        switch (result1) {
        | Exito(_) => result1
        | Error(_) => run(p2, entrada, inicio)
        };
    };

    Parser(innerFn);
};

let ( <|> ) = parseOtro


/// Escoge desde una lista de parsers
let escoger = listOfParsers => {
    let (primer, resto) = (List.hd(listOfParsers), List.tl(listOfParsers));
    List.fold_left(( <|> ), primer, resto);
};

/// Escoge desde una lista de caracteres
let cualquier = listOfChars =>
    listOfChars
    |> List.map(parseCaracter)
    |> escoger


/// Convierte una lista de Parsers a un Parser de listas
let rec sequence = parserList => {
    
    let cons = (head, tail) => [head, ...tail];

    let consP = lift2(cons);

    // process the list of parsers recursively
    switch (parserList) {
    | [] => returnP([]);
    | [head, ...tail] => consP(head, sequence(tail))
    };
};


let rec parseVariosHelper = (parser, entrada, inicio) => {

    let resultado = run(parser, entrada, inicio);
    
    switch (resultado) {
    | Error(_) => ([], inicio)
    | Exito(ex) => {
        let (resultado, posSig) = (ex.res, ex.posFinal)
        let (valores, posFinal) = parseVariosHelper(parser, entrada, posSig);

        ([resultado, ...valores], posFinal)
    }
    };
};


let parseVarios = parser => {
    let inner = (entrada, inicio) => {
        let (datos, posFinal) = parseVariosHelper(parser, entrada, inicio);
        Exito {
            res: datos,
            posInicio: inicio,
            posFinal: posFinal,
            tipo: Nada
        }
    };

    Parser(inner);
};


let parseVarios1 = parser => {
    let inner = (entrada, inicio) => {
        let (datos, posFinal) = parseVariosHelper(parser, entrada, inicio);

        switch (datos) {
        | [] => Error("");
        | _ => Exito {
            res: datos,
            posInicio: inicio,
            posFinal: posFinal,
            tipo: Nada
        }
        }
    };

    Parser(inner);
};


let parseSegundoOpcional = (p1, p2) => {
    let inner = (entrada, inicio) => {
        let res1 = run(p1, entrada, inicio);
        
        switch (res1) {
        | Error(err) => Error(err);
        | Exito(ex1) => {
            let res2 = run(p2, entrada, ex1.posFinal);
            
            switch (res2) {
            | Exito(ex2) =>
                Exito {
                    res: (ex1.res, Some(ex2.res)),
                    posInicio: inicio,
                    posFinal: ex2.posFinal,
                    tipo: Nada
                }
            | Error(_) =>
                Exito {
                    res: (ex1.res, None),
                    posInicio: inicio,
                    posFinal: ex1.posFinal,
                    tipo: Nada
                }
            };
        }
        };
    };
    
    Parser(inner);
};


let (<?>) = parseSegundoOpcional


let parseCualquierMenos = caracter => {
    let inner = (entrada, inicio) => {
        if (entrada == "" || inicio >= String.length(entrada))
            Error("Entrada terminada")
        else {
            let c = String.get(entrada, inicio);
            if (caracter == c) {
                Error("Se encontró el caracter a no parsear.");
            } else {
                Exito {
                    res: c,
                    posInicio: inicio,
                    posFinal: inicio + 1,
                    tipo: Nada
                }
            }
        }
    };
        
        
    Parser(inner);
};


let crearSome = x => Some(x);

/// Parsea una ocurrencia opcional de p y lo devuelve en option
let pOpc = p => {
    let some = p |>> crearSome;
    let none = returnP(None);
    some <|> none
};


/// Ignora el resultado del parser derecho
let (|>>) = (p1, p2) =>  p1 |>>| p2 |>> ((a,_) => a);

/// Ignora el resultado del parser izq
let (>>|) = (p1, p2) => mapP((_,b) => b, p1 |>>| p2);


/// Ignora el resultado de los parsers de los costados
let between = (p1, p2, p3) => p1 >>| p2 |>> p3


let parseVariasOpciones = parsers => {
    let inner = (entrada, pos) => {

        let rec inner2 = parsers =>
            switch (parsers) {
            | [p, ...ps] =>
                let resultado = run(p, entrada, pos);

                switch (resultado) {
                | Exito(ex) =>
                    Exito {
                        res: ex.res,
                        posInicio: ex.posInicio,
                        posFinal: ex.posFinal,
                        tipo: ex.tipo
                    }
                | _ => inner2(ps)
                };

            | [] => Error("Ningun parser se adapta a la entrada.");
            };


        inner2(parsers)
    };

    Parser(inner);
};


let mapTipo = (parser, nuevoTipo) => {
    let inner = (entrada, inicio) => {
        let res = run(parser, entrada, inicio);
        
        switch (res) {
        | Error(err) => Error(err);
        | Exito(ex) => Exito {
            res: ex.res,
            posInicio: ex.posInicio,
            posFinal: ex.posFinal,
            tipo: nuevoTipo
        }
        };
    };

    Parser(inner)
};

