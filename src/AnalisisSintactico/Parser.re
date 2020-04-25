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
            _TNuevaLinea(lexer.lookAhead(), None, "");
            hayNuevaLinea := true;
            lexer.sigToken();
        }
    }) {
    | ErrorComun(_) => {
        let (__, nuevaIndentacion) = _Any(lexer.lookAhead(), msgError, fnErrorLexer, fnEOF);
        (nuevaIndentacion, hayNuevaLinea^);
    }
    };
};


let parseTokens = (lexer: lexer) => {

    let rec sigExprDeclaracion = nivel => {
        try ({
            let esMut = ref(false);
            let token2 = lexer.sigToken();
            let preTokenId = ref(token2);
                
           try ({
                let infoTokenMut = _PC_MUT(token2, None, "");
                esMut := true;
                preTokenId := lexer.sigToken();
            }) {
            | _ => ()
            };

            let infoTokenId = _TIdentificador(preTokenId, None, "Se esperaba un identificador");
            let infoTokenOpAsign = _TOperador(lexer.sigToken(), Some("="), "Se esperaba el operador de asignación '=' luego del indentificador.");

            let (nuevoNivel, hayNuevaLinea) = obtSigIndentacion(lexer, "Se esperaba una expresion luego del signo '='.", None, None);

            if (hayNuevaLinea && nuevoNivel <= nivel) {
                raise(ErrorComun("La expresión actual está incompleta. Se esperaba una expresión indentada."));
            }

            switch (sigExpresion (nuevoNivel, hayNuevaLinea)) {
            | PEOF => PError("Se esperaba una expresión luego de la asignacion.");
            | PError(err) => PError({j|Se esperaba una expresión luego de la asignación: $s|j});
            | PExito(exprFinal) =>
                PExito(EDeclaracion({
                    mut: esMut,
                    id: {
                        signatura: Indefinida,
                        valor: infoTokenId
                    },
                    valor: exprFinal
                }))
            };

        }) {
        | _ => PError(err)
        };
    }

    and sigExprOperador = (exprIzq, infoOp) => ()


    and sigExprFuncion = (funExpr, paramExpr, nivel) => {
        let exprFunAct = EFuncion {
            signatura: Indefinida,
            fn: funExpr,
            param: paramExpr
        };

        switch (lexer.sigToken()) {
        | EOF => PExito(exprFunAct)
        | ErrorLexer(err) => PError(err)
        | Token(token, indentacion) =>
            switch (token) {
            | TIdentificador(infoId2) => {
                let expr2 = EIdentificador {
                    signatura: Indefinida,
                    valor: infoId2
                };
                sigExprFuncionexprFunAct(expr2, nivel);
            }
            | TNumero(infoNum) => {
                let expr2 = ENumero(infoNum);
                sigExprFuncion(exprFunAct, expr2, nivel);
            }
            | TTexto(infoTxt) => {
                let expr2 = ETexto(infoTxt);
                sigExprFuncion(exprFunAct, expr2, nivel);
            }
            | TBool(infoBool) => {
                let expr2 = EBool(infoBool);
                sigExprFuncion(exprFunAct, expr2, nivel);
            }
            | _ => PExito(exprFunAct);
            };
        };
    }


    and sigExprIdentificador = (infoId, nivel) => {
        let primeraExprId = EIdentificador {
            signatura: Indefinida,
            valor: infoId
        };

        switch (lexer.sigToken()) {
        | EOF => PExito(primeraExprId)
        | ErrorLexer(err) => PError(err)
        | Token (token, indentacion) => {
            switch (token) {
            | TIdentificador(infoId2) => {
                let expr2 = EIdentificador({
                    signatura: Indefinida,
                    valor: infoId2
                });
                sigExprFuncion(primeraExprId, expr2, nivel);
            }
            | TNumero(infoNum) => {
                let expr2 = ENumero(infoNum);
                sigExprFuncion(primeraExprId, expr2, nivel);
            }
            | TTexto(infoTxt) => {
                let expr2 = ETexto(infoTxt);
                sigExprFuncion(primeraExprId, expr2, nivel);
            }
            | TBool(infoBool) => {
                let expr2 = EBool(infoBool);
                sigExprFuncion(primeraExprId, expr2, nivel);
            }
            | _ => PExito(primeraExprId)
            };
        };
        };
    }

    and sigExpresion = (nivel, aceptarExprMismoNivel) => {

        let resultado = lexer.sigToken();

        let sigExprActual = {
            switch (resultado) {
            | EOF => PEOF
            | ErrorLexer(err) => PError(err)
            | Token(token, identacion) => {
                switch (token) {
                | PC_SEA(infoToken) => sigExprDeclaracion(nivel)
                | PC_MUT(_) => PError("No se esperaba la palabra clave 'sea' aquí.")
                | TComentario(_) => sigExpresion(nivel, aceptarExprMismoNivel)
                | TNumero(infoNumero) => PExito(ENumero(infoNumero))
                | TTexto(infoTexto) => PExito(ETexto(infoTexto))
                | TBool(infoBool) => PExito(EBool(infoBool))
                | TIdentificador(infoId) => sigExprIdentificador(infoId, nivel)
                | TParenAb(infoParen) => {
                    let sigToken = sigExpresion(nivel, false);
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
                        | Token (ultimoToken3, indentacion2) => {
                            switch (ultimoToken3) {
                            | TParenCer(_) => PExito(sigToken2)
                            | _ => PError("Se esperaba un cierre de parentesis.")
                            };
                        }
                        };
                    }
                    };
                }
                | TParenCer(_) => PError("No se esperaba un parentesis aquí.")
                | TNuevaLinea(_) => sigExpresion(nivel, aceptarExprMismoNivel)
                | TAgrupAb(_) | TAgrupCer(_) => PError("Otros signos de agrupacion aun no estan soportados.")
                | TGenerico(_) => PError("Los genericos aun no estan soportados.")
                | TOperador(_) => PError("No se puede usar un operador como expresion. Si esa es tu intención, rodea el operador en paréntesis, por ejemplo: (+)")
                };
            }
            };
        };

        switch (sigExprActual) {
        | PEOF => sigExprActual
        | PError(_) => sigExprActual
        | PExito(exprAct) => {
            try ({
                let (sigNivelIndentacion, _) = obtSigIndentacion(lexer, "", Some(OpInvalida), None);
                if (aceptarExprMismoNivel && sigNivelIndentacion == nivel) {
                    let sigExprTop = sigExpresion(nivel, aceptarExprMismoNivel);
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
            }) {
            | OpInvalida(err) => PError(err)
            | _ => sigExprActual
            };
        }
        };
    };


    let exprRe = sigExpresion(0, true);
    switch (exprRe) {
    | PError(err) => ErrorParser(err);
    | PExito(expr) => ExitoParser(expr);
    | PEOF => ErrorParser("EOF sin tratar en el parser.");
    };

};