open Lexer;
open Gramatica;
open Expect;


// ===================================
//  Expresion
// ===================================

type signatura =
    | Indefinida
    | Simple(string)
    | Array(signatura)
    | Tupla(list(signatura))
    | Funcion(signatura, signatura)

type eIdentificador = {
    signatura: signatura,
    valor: infoToken(string)
}

and eOperador = {
    signatura: signatura,
    valor: infoToken(string)
}

and eOperadorApl = {
    op: eOperador,
    izq: expresion,
    der: expresion
}

and eFuncion = {
    signatura: signatura,
    fn: expresion,
    param: expresion,
}

and eDeclaracion = {
    mut: bool,
    id: eIdentificador,
    valor: expresion
}


and expresion =
    | EIdentificador(eIdentificador)
    | EUnidad(infoToken(unit))
    | ENumero(infoToken(float))
    | ETexto(infoToken(string))
    | EBool(infoToken(bool))
    | EOperador(infoToken(string))
    | EOperadorApl(eOperadorApl)
    | EFuncion(eFuncion)
    | EDeclaracion(eDeclaracion)
    | EBloque(list(expresion))


type exprRes =
    | PExito(expresion)
    | PError(string)
    | PEOF

type resParser =
    | ExitoParser(expresion)
    | ErrorParser(string)


type asociatividad =
    | Izq
    | Der


let obtSigIndentacion = (lexer: lexer, msgError, fnErrorLexer, fnEOF) => {
    let hayNuevaLinea = ref(false);
    try ({
        while (true) {
            let _ = _TNuevaLinea(lexer.lookAhead(), None, "");
            hayNuevaLinea := true;
            let _ = lexer.sigToken();
        };
        (1, true)
    }) {
    | ErrorComun(_) => {
        let (__, nuevaIndentacion) = _Any(lexer.lookAhead(), msgError, fnErrorLexer, fnEOF);
        (nuevaIndentacion, hayNuevaLinea^);
    }
    };
};


/**
 * Precedencia y Asociatividad de los tokens
 * = += -= *= /= %= ^=      ->  1 L
 * <| |>                    ->  2 L
 * << >>                    ->  3 L
 * ||                       ->  4 L
 * &&                       ->  5 L
 * == !=                    ->  6 L
 * === !==                  ->  7 L
 * < <= > >=                ->  8 L
 * + -                      ->  9 L
 * * /                      -> 10 L
 * %                        -> 11 L
 * ^                        -> 12 R
 * .                        -> 13 L
 * 
 */

let obtInfoOp = (operador) => {
    switch (operador) {
    | "," => (1, Izq)
    | "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "^=" => (2, Izq)
    | "<|" | "|>" => (3, Izq)
    | "<<" | ">>" => (4, Izq)
    | "||" => (5, Izq)
    | "&&" => (6, Izq)
    | "??" => (7, Izq)
    | "==" | "!=" | "===" | "!==" => (8, Izq)
    | "<" | "<=" | ">=" | ">" => (9, Izq)
    | "+" | "-" => (10, Izq)
    | "*" | "/" | "%" => (11, Izq)
    | "^" => (12, Der)
    | "." | "?." => (13, Izq)
    | _ => (14, Izq)
    };
};


let parseTokens = (lexer: lexer) => {

    let rec sigExprDeclaracion = nivel => {
        try ({
            let esMut = ref(false);
            let token2 = lexer.sigToken();
            let preTokenId = ref(token2);
                
           try ({
                let _ = _PC_MUT(token2, None, "");
                esMut := true;
                preTokenId := lexer.sigToken();
            }) {
            | _ => ()
            };

            let infoTokenId = _TIdentificador(preTokenId^, None, "Se esperaba un identificador");
            let _ = _TOperador(lexer.sigToken(), Some("="), "Se esperaba el operador de asignación '=' luego del indentificador.");

            let (nuevoNivel, hayNuevaLinea) = obtSigIndentacion(lexer, "Se esperaba una expresion luego del signo '='.", None, None);

            if (hayNuevaLinea && nuevoNivel <= nivel) {
                raise(ErrorComun("La expresión actual está incompleta. Se esperaba una expresión indentada."));
            }

            switch (sigExpresion (nuevoNivel, hayNuevaLinea, 0, Izq)) {
            | PEOF => PError("Se esperaba una expresión luego de la asignacion.");
            | PError(err) => PError({j|Se esperaba una expresión luego de la asignación: $err|j});
            | PExito(exprFinal) =>
                PExito(EDeclaracion({
                    mut: esMut^,
                    id: {
                        signatura: Indefinida,
                        valor: infoTokenId
                    },
                    valor: exprFinal
                }))
            };

        }) {
        | ErrorComun(err) => PError(err)
        };
    }

    and sigExprOperador = (exprIzq, infoOp: infoToken(string), precedencia, asociatividad) => {
        let valorOp = infoOp.valor
        switch (sigExpresion(0, false, precedencia, Izq)) {
        | PEOF => PError({j|Se esperaba una expresión a la derecha del operador $valorOp|j})
        | PError(err) => PError({j|Se esperaba una expresion a la derecha del operador $valorOp. Interrumpido por: $err.|j});
        | PExito(exprFinal) => {
            // TODO: Aqui continuar a procesar el sig token.
            let eOperadorRes: eOperador = { signatura: Indefinida, valor: infoOp }
            let exprOpRes = EOperadorApl({
                op: eOperadorRes,
                izq: exprIzq,
                der: exprFinal
            });

            switch (lexer.sigToken()) {
            | EOF => PExito(exprOpRes)
            | ErrorLexer(err) => PError(err)
            | Token(token, _) => {
                switch (token) {
                | TOperador(infoOp2) => {
                    let (precOp, asocOp) = obtInfoOp(infoOp2.valor);
                    sigExprOperador(exprOpRes, infoOp2, precOp, asocOp);
                }
                | TParenCer(_) => {
                    lexer.retroceder();
                    PExito(exprOpRes);
                }
                | _ => PError("Es esto posible?")
                };
            }
            };

            
        }
        };
    }


    and sigExprFuncion = (funExpr, paramExpr, nivel, precedencia, asociatividad) => {
        let exprFunAct = EFuncion {
            signatura: Indefinida,
            fn: funExpr,
            param: paramExpr
        };

        switch (lexer.sigToken()) {
        | EOF => PExito(exprFunAct)
        | ErrorLexer(err) => PError(err)
        | Token(token, _) =>
            switch (token) {
            | TIdentificador(infoId2) => {
                let expr2 = EIdentificador {
                    signatura: Indefinida,
                    valor: infoId2
                };
                sigExprFuncion(exprFunAct, expr2, nivel, precedencia, asociatividad);
            }
            | TNumero(infoNum) => {
                let expr2 = ENumero(infoNum);
                sigExprFuncion(exprFunAct, expr2, nivel, precedencia, asociatividad);
            }
            | TTexto(infoTxt) => {
                let expr2 = ETexto(infoTxt);
                sigExprFuncion(exprFunAct, expr2, nivel, precedencia, asociatividad);
            }
            | TBool(infoBool) => {
                let expr2 = EBool(infoBool);
                sigExprFuncion(exprFunAct, expr2, nivel, precedencia, asociatividad);
            }
            | _ => PExito(exprFunAct);
            };
        };
    }


    and sigExprIdentificador = (infoId, nivel, precedencia, asociatividad) => {
        let primeraExprId = EIdentificador {
            signatura: Indefinida,
            valor: infoId
        };

        switch (lexer.sigToken()) {
        | EOF => PExito(primeraExprId)
        | ErrorLexer(err) => PError(err)
        | Token (token, _) => {
            switch (token) {
            | TIdentificador(infoId2) => {
                let expr2 = EIdentificador({
                    signatura: Indefinida,
                    valor: infoId2
                });
                sigExprFuncion(primeraExprId, expr2, nivel, precedencia, asociatividad);
            }
            | TNumero(infoNum) => {
                let expr2 = ENumero(infoNum);
                sigExprFuncion(primeraExprId, expr2, nivel, precedencia, asociatividad);
            }
            | TTexto(infoTxt) => {
                let expr2 = ETexto(infoTxt);
                sigExprFuncion(primeraExprId, expr2, nivel, precedencia, asociatividad);
            }
            | TBool(infoBool) => {
                let expr2 = EBool(infoBool);
                sigExprFuncion(primeraExprId, expr2, nivel, precedencia, asociatividad);
            }
            | TOperador(infoOp) => {
                let (precOp, asocOp) = obtInfoOp(infoOp.valor);
                if (precOp > precedencia) {
                    sigExprOperador(primeraExprId, infoOp, precOp, asocOp);
                } else if (precOp == precedencia && asocOp == Der) {
                    sigExprOperador(primeraExprId, infoOp, precOp, asocOp);
                } else {
                    lexer.retroceder();
                    PExito(primeraExprId);
                }
            }
            | _ => {
                lexer.retroceder();
                PExito(primeraExprId)
            }
            };
        };
        };
    }

    and sigExprParen = (infoParen, nivel) => {
        let sigToken = sigExpresion(nivel, false, 0, Izq);
        switch (sigToken) {
        | PError(_) => sigToken
        | PEOF => {
            let posInicio = infoParen.inicio;
            PError({j|El parentesis abierto en $posInicio no está cerrado.|j});
        }
        | PExito(sigToken2) => {
            let ultimoToken = lexer.sigToken();
            switch (ultimoToken) {
            | EOF =>
                PError({j|El parentesis abierto en $infoParen.inicio contiene una expresion, pero no está cerrado.|j})
            | ErrorLexer(error) =>
                PError({j|El parentesis abierto en $infoParen.inicio no está cerrado debido a un error léxico: $error|j})
            | Token (ultimoToken3, _) => {
                switch (ultimoToken3) {
                | TParenCer(_) => PExito(sigToken2)
                | _ => PError("Se esperaba un cierre de parentesis.")
                };
            }
            };
        }
        };
    }

    and sigExpresion = (nivel, aceptarExprMismoNivel, precedencia, asociatividad) => {

        let resultado = lexer.sigToken();

        let sigExprActual = {
            switch (resultado) {
            | EOF => PEOF
            | ErrorLexer(err) => PError(err)
            | Token(token, _) => {
                switch (token) {
                | PC_SEA(_) => sigExprDeclaracion(nivel)
                | PC_MUT(_) => PError("No se esperaba la palabra clave 'sea' aquí.")
                | TComentario(_) => sigExpresion(nivel, aceptarExprMismoNivel, precedencia, asociatividad)
                | TNumero(infoNumero) => PExito(ENumero(infoNumero))
                | TTexto(infoTexto) => PExito(ETexto(infoTexto))
                | TBool(infoBool) => PExito(EBool(infoBool))
                | TIdentificador(infoId) => sigExprIdentificador(infoId, nivel, precedencia, asociatividad)
                | TParenAb(infoParen) => sigExprParen(infoParen, nivel)
                | TParenCer(_) => PError("No se esperaba un parentesis aquí.")
                | TNuevaLinea(_) => sigExpresion(nivel, aceptarExprMismoNivel, precedencia, asociatividad)
                | TAgrupAb(_) | TAgrupCer(_) => PError("Otros signos de agrupación aun no estan soportados.")
                | TGenerico(_) => PError("Los genericos aun no estan soportados.")
                | TOperador(_) => PError("No se puede usar un operador como expresión. Si esa es tu intención, rodea el operador en paréntesis, por ejemplo: (+)")
                };
            }
            };
        };

        switch (sigExprActual) {
        | PEOF => sigExprActual
        | PError(_) => sigExprActual
        | PExito(exprAct) => {
            try {
                let (sigNivelIndentacion, _) = obtSigIndentacion(lexer, "", Some(x => OpInvalida(x)), None);
                if (aceptarExprMismoNivel && sigNivelIndentacion == nivel) {
                    let sigExprTop = sigExpresion(nivel, aceptarExprMismoNivel, precedencia, asociatividad);
                    switch (sigExprTop) {
                    | PError(err) => PError(err)
                    | PEOF => sigExprActual
                    | PExito(expr) =>
                        PExito (switch expr {
                                | EBloque(exprs) =>
                                    EBloque([exprAct, ...exprs])
                                | _ =>
                                    EBloque([exprAct, expr])
                                })
                    };
                } else {
                    sigExprActual
                };
            } {
            | OpInvalida(err) => PError(err)
            | _ => sigExprActual
            };
        }
        };
    };


    let exprRe = sigExpresion(0, true, 0, Izq);
    switch (exprRe) {
    | PError(err) => ErrorParser(err);
    | PExito(expr) => ExitoParser(expr);
    | PEOF => ErrorParser("EOF sin tratar en el parser.");
    };

};