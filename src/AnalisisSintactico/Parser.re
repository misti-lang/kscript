open Lexer;
open Gramatica;
open Expect;


// ===================================
//  Expresion
// ===================================

type asociatividad =
    | Izq
    | Der

type signatura =
    | Indefinida
    | Simple(string)
    | Array(signatura)
    | Tupla(list(signatura))
    | Funcion(signatura, signatura)

type eIdentificador = {
    signatura: signatura,
    valorId: infoToken(string)
}

and eOperador = {
    signaturaOp: signatura,
    valorOp: infoToken(string),
    precedencia: int,
    asociatividad
}

and eOperadorApl = {
    op: eOperador,
    izq: expresion,
    der: expresion
}

and eDeclaracion = {
    mut: bool,
    id: eIdentificador,
    valorDec: expresion,
    inicioDec: int,
    numLineaDec: int,
    posInicioLineaDec: int
}

and expresion =
    | EIdentificador(eIdentificador)
    | EUnidad(infoToken(unit))
    | ENumero(infoToken(float))
    | ETexto(infoToken(string))
    | EBool(infoToken(bool))
    | EOperador(infoToken(string))
    | EOperadorApl(eOperadorApl)
    | EDeclaracion(eDeclaracion)
    | EBloque(list(expresion))


type exprRes =
    | PExito(expresion)
    | PError(string)
    | PEOF
    | PReturn


type resParser =
    | ExitoParser(expresion)
    | ErrorParser(string)


type posExpr = {
    inicioPE: int,
    numLineaPE: int,
    posInicioLineaPE: int
}


let rec obtPosExpr = (ex: expresion) => {
    switch ex {
    | EIdentificador(infoId) => {
        inicioPE: infoId.valorId.inicio,
        numLineaPE: infoId.valorId.numLinea,
        posInicioLineaPE: infoId.valorId.posInicioLinea
    }
    | EUnidad(info) => {
        inicioPE: info.inicio,
        numLineaPE: info.numLinea,
        posInicioLineaPE: info.posInicioLinea
    }
    | ENumero(info) => {
        inicioPE: info.inicio,
        numLineaPE: info.numLinea,
        posInicioLineaPE: info.posInicioLinea
    }
    | ETexto(info) => {
        inicioPE: info.inicio,
        numLineaPE: info.numLinea,
        posInicioLineaPE: info.posInicioLinea
    }
    | EBool(info) => {
        inicioPE: info.inicio,
        numLineaPE: info.numLinea,
        posInicioLineaPE: info.posInicioLinea
    }
    | EOperador(info) => {
        inicioPE: info.inicio,
        numLineaPE: info.numLinea,
        posInicioLineaPE: info.posInicioLinea
    }
    | EOperadorApl(eOp) => obtPosExpr(eOp.izq)
    | EDeclaracion(eDec) => {
        inicioPE: eDec.inicioDec,
        numLineaPE: eDec.numLineaDec,
        posInicioLineaPE: eDec.posInicioLineaDec
    }
    | EBloque(exprs) => {
        switch exprs {
        | [e, ..._] => obtPosExpr(e)
        | [] => {
            inicioPE: 0,
            numLineaPE: 0,
            posInicioLineaPE: 0
        }
        };
    }
    };
};


// M t -> (t -> M u) -> M u
let (>>=) = (a: exprRes, f: expresion => exprRes) => {
    switch a {
    | PExito(expr) => f(expr);
    | _ => a;
    }
};


let obtInfoFunAppl = (esCurry, inicio, numLinea, posInicioLinea) => ({
    valor: if (esCurry) {j|Ñ|j} else {j|ñ|j},
    inicio,
    final: inicio + 1,
    numLinea,
    posInicioLinea
});


/**
 * El operador ñ representa aplicacion de funcion.
 * El operador Ñ representa aplicacion de funcion con currying.
 */
let obtInfoOp = (operador) => {
    let strEneMinuscula = {j|ñ|j};
    let strEneMayuscula = {j|Ñ|j};
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
    | "." | "?." => (15, Izq)
    | _ => {
        if (operador == strEneMayuscula || operador == strEneMinuscula) {
            (14, Izq)
        } else {
            (13, Izq)
        }
    }
    };
};


let parseTokens = (lexer: lexer) => {

    let generarTextoError = info => {
        let largo = info.final - info.posInicioLinea;
        let substr = String.sub(lexer.entrada, info.posInicioLinea, largo);
        let espBlanco = String.make(info.inicio - info.posInicioLinea, ' ');
        let indicador = String.make(info.final - info.inicio, '~');
        let numLinea = info.numLinea;
        let strIndicadorNumLinea = {j| $numLinea | |j};
        let espacioBlancoIndicador = String.make(String.length(strIndicadorNumLinea), ' ');
        let strIndicador = {j|$espBlanco$indicador|j};
        {j|$strIndicadorNumLinea$substr\n$espacioBlancoIndicador$strIndicador\n|j};
    }

    let rec sigExprDeclaracion = (nivel, esMut) => {
        try {

            let infoTokenId = _TIdentificador(
                lexer.sigToken, 
                None, 
                "Se esperaba un identificador"
            );
            let _ = _TOperador(
                lexer.sigToken, 
                Some("="), 
                "Se esperaba el operador de asignación '=' luego del indentificador."
            );

            let (_, nuevoNivel, hayNuevaLinea, fnEstablecer) = lexer.lookAheadSignificativo(false);

            if (hayNuevaLinea && nuevoNivel <= nivel) {
                raise(ErrorComun({j|La expresión actual está incompleta. Se esperaba una expresión indentada.|j}));
            }

            if (hayNuevaLinea) {
                fnEstablecer();
            }

            switch (sigExpresion(nuevoNivel, nivel, true, 0, Izq, true)) {
            | PEOF | PReturn => PError("Se esperaba una expresión luego de la asignacion.");
            | PError(err) => PError({j|Se esperaba una expresión luego de la asignación: $err|j});
            | PExito(exprFinal) => {

                let exprDeclaracion = EDeclaracion {
                    mut: esMut,
                    id: {
                        signatura: Indefinida,
                        valorId: infoTokenId
                    },
                    valorDec: exprFinal,
                    inicioDec: infoTokenId.inicio,
                    numLineaDec: infoTokenId.numLinea,
                    posInicioLineaDec: infoTokenId.posInicioLinea
                };
                let exprRespuesta = PExito(exprDeclaracion);

                let sigExpresionRaw = sigExpresion(nivel, nivel, true, 0, Izq, true);
                switch sigExpresionRaw {
                | PError(err) => PError(err);
                | PReturn | PEOF => exprRespuesta
                | PExito(nuevaExpr) => {
                    switch nuevaExpr {
                    | EBloque(exprs) => {
                        PExito(EBloque([exprDeclaracion, ...exprs]));
                    }
                    | _ => {
                        PExito(EBloque([exprDeclaracion, nuevaExpr]));
                    }
                    }
                }
                };
            }
            };

        } {
        | ErrorComun(err) => PError(err)
        };
    }

    and sigExprOperador = (exprIzq, infoOp: infoToken(string), nivel, precedencia, asociatividad, esExprPrincipal) => {
        let valorOp = infoOp.valor
        let (precOp1, asocOp1) = obtInfoOp(valorOp);

        switch (sigExpresion(nivel, nivel, false, precOp1, asocOp1, false)) {
        | PEOF | PReturn => PError({j|Se esperaba una expresión a la derecha del operador $valorOp|j})
        | PError(err) => PError({j|Se esperaba una expresion a la derecha del operador $valorOp :\n$err.|j});
        | PExito(exprFinal) => {

            let eOperadorRes: eOperador = { 
                signaturaOp: Indefinida, 
                valorOp: infoOp, 
                precedencia: precOp1,
                asociatividad: asocOp1
            }
            let exprOpRes = EOperadorApl({
                op: eOperadorRes,
                izq: exprIzq,
                der: exprFinal
            });

            let rec funDesicion = (lexerRes, aceptarSoloOp, fnEnOp, funValorDefecto) => {

                switch (lexerRes) {
                | EOF => PExito(exprOpRes)
                | ErrorLexer(err) => PError(err)
                | Token(token, _) => {
                    switch token {
                    | TOperador(infoOp2) => {
                        fnEnOp();
                        let (precOp, asocOp) = obtInfoOp(infoOp2.valor);
                        sigExprOperador(exprOpRes, infoOp2, nivel, precOp, asocOp, esExprPrincipal);
                    }
                    | TParenCer(_) when !aceptarSoloOp => {
                        lexer.retroceder();
                        PExito(exprOpRes);
                    }
                    | TIdentificador(_) | TNumero(_) | TTexto(_) | TBool(_) when !aceptarSoloOp => {
                        let posEI = obtPosExpr(exprIzq);
                        let infoOp2 = obtInfoFunAppl(false, posEI.inicioPE, posEI.numLineaPE, posEI.posInicioLineaPE);

                        let (precOpFunApl, asocOpFunApl) = obtInfoOp(infoOp2.valor);
                        lexer.retroceder();
                        sigExprOperador(exprOpRes, infoOp2, nivel, precOpFunApl, asocOpFunApl, esExprPrincipal);
                    }
                    | TGenerico(infoGen) when !aceptarSoloOp => {
                        let textoError = generarTextoError(infoGen);
                        PError({j|No se esperaba un genérico luego de la aplicación del operador.\n\n$textoError|j})
                    }
                    | TComentario(_) => {
                        funDesicion(lexer.sigToken(), aceptarSoloOp, fnEnOp, funValorDefecto);
                    }
                    | TParenAb(infoParen) when !aceptarSoloOp => {
                        let sigExpr = sigExprParen(infoParen, nivel, nivel);
                        switch sigExpr {
                        | PError(_) | PReturn | PEOF =>
                            PError("Hay un parentesis sin cerrar.")
                        | PExito(expr) => {
                            let posEI = obtPosExpr(exprIzq);
                            let infoOpFunApl = obtInfoFunAppl(false, posEI.inicioPE, posEI.numLineaPE, posEI.posInicioLineaPE);
                            let (precedenciaOpFunApl, asociatividadOpFunApl) = obtInfoOp(infoOpFunApl.valor);
                            PExito(EOperadorApl {
                                op: { 
                                    signaturaOp: Indefinida, 
                                    valorOp: infoOpFunApl, 
                                    precedencia: precedenciaOpFunApl,
                                    asociatividad: asociatividadOpFunApl
                                },
                                izq: exprOpRes,
                                der: expr
                            });
                        }
                        };
                    }
                    | PC_LET(info) when !aceptarSoloOp => {
                        let textoError = generarTextoError(info);
                        PError({j|No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n$textoError|j})
                    }
                    | PC_CONST(info) when !aceptarSoloOp => {
                        let textoError = generarTextoError(info);
                        PError({j|No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n$textoError|j})
                    }
                    | TAgrupAb(info) when !aceptarSoloOp => {
                        let textoError = generarTextoError(info);
                        PError({j|Este signo de agrupación aun no está soportado.\n\n$textoError|j});
                    }
                    | TAgrupCer(info) when !aceptarSoloOp => {
                        let textoError = generarTextoError(info);
                        PError({j|Este signo de agrupación aun no está soportado.\n\n$textoError|j});
                    }
                    | TNuevaLinea(_) when !aceptarSoloOp => {

                        lexer.retroceder();
                        let (resLexer, indentacion, _, fnEstablecer) = lexer.lookAheadSignificativo(true);

                        let expresionRespuesta = PExito(exprOpRes);

                        if (esExprPrincipal) {

                            if (indentacion < nivel) {
                                expresionRespuesta;
                            } else if (indentacion == nivel) {
                                // Js.log({j|Es Expr Prin? $esExprPrincipal|j});
                                let nuevaFnEst = () => {
                                    fnEstablecer();
                                    ignore(lexer.sigToken());
                                };

                                let funSiNoEsOp = () => {
                                    let primeraExpresion = expresionRespuesta;
                                    fnEstablecer();
                                    let sigExpresionRaw = sigExpresion(nivel, nivel, false, 0, Izq, true);
                                    switch sigExpresionRaw {
                                    | PError(err) => PError(err);
                                    | PReturn | PEOF => {
                                        primeraExpresion
                                    }
                                    | PExito(nuevaExpr) => {
                                        switch nuevaExpr {
                                        | EBloque(exprs) => {
                                            PExito(EBloque([exprOpRes, ...exprs]));
                                        }
                                        | _ => {
                                            PExito(EBloque([exprOpRes, nuevaExpr]));
                                        }
                                        }
                                    }
                                    };
                                };
                                funDesicion(resLexer, true, nuevaFnEst, funSiNoEsOp);

                            } else {
                                // Js.log({j|Añuña|j});
                                // PExito(exprOpRes);
                                fnEstablecer();
                                funDesicion(lexer.sigToken(), false, () => (), () => PReturn);
                            }

                        } else {
                            expresionRespuesta;
                        }

                    }
                    | _ => {
                        // Js.log("Llamando fun defecto...");
                        funValorDefecto();
                    }
                    };
                }
                };
            }

            funDesicion(lexer.sigToken(), false, () => (), () => PReturn);
        }
        };
    }

    and sigExprIdentificador = (infoId: infoToken(string), nivel, precedencia, asociatividad, esExprPrincipal) => {
        let primeraExprId = EIdentificador {
            signatura: Indefinida,
            valorId: infoId
        };

        let rec funDesicion = (lexerRes, aceptarSoloOperador, fnEnOp, funValorDefecto) => {
            switch (lexerRes) {
            | EOF => PExito(primeraExprId)
            | ErrorLexer(err) => PError(err)
            | Token (token, _) => {
                switch token {
                | TIdentificador(_) | TNumero(_) | TTexto(_) | TBool(_) when !aceptarSoloOperador => {
                    lexer.retroceder();
                    let (precFunApl, asocFunApl) = (14, Izq);
                    if (precFunApl > precedencia) {
                        let infoOpFunApl = obtInfoFunAppl(false, infoId.inicio, infoId.numLinea, infoId.posInicioLinea);
                        sigExprOperador(primeraExprId, infoOpFunApl, nivel, precFunApl, asocFunApl, esExprPrincipal);
                    } else if (precFunApl == precedencia && asocFunApl == Der) {
                        let infoOpFunApl = obtInfoFunAppl(false, infoId.inicio, infoId.numLinea, infoId.posInicioLinea);
                        sigExprOperador(primeraExprId, infoOpFunApl, nivel, precFunApl, asocFunApl, esExprPrincipal);
                    } else {
                        PExito(primeraExprId);
                    }
                }
                | TOperador(infoOp) => {
                    fnEnOp();
                    let (precOp, asocOp) = obtInfoOp(infoOp.valor);
                    if (precOp > precedencia) {
                        sigExprOperador(primeraExprId, infoOp, nivel, precOp, asocOp, esExprPrincipal);
                    } else if (precOp == precedencia && asocOp == Der) {
                        sigExprOperador(primeraExprId, infoOp, nivel, precOp, asocOp, esExprPrincipal);
                    } else {
                        lexer.retroceder();
                        PExito(primeraExprId);
                    }
                }
                | TNuevaLinea(_) when !aceptarSoloOperador => {
                    
                    lexer.retroceder();
                    let (tokenSig, indentacion, _, fnEstablecer) = lexer.lookAheadSignificativo(true);

                    let expresionRespuesta = PExito(primeraExprId);
                    if (esExprPrincipal) {
                        if (indentacion < nivel) {
                            expresionRespuesta;
                        } else if (indentacion == nivel) {
                            let nuevaFnEst = () => {
                                fnEstablecer();
                                ignore(lexer.sigToken());
                            };
                            
                            let funSiNoEsOp = () => {
                                let primeraExpresion = expresionRespuesta;
                                fnEstablecer();
                                let sigExpresionRaw = sigExpresion(nivel, nivel, false, 0, Izq, true);
                                switch sigExpresionRaw {
                                | PError(err) => PError(err);
                                | PReturn | PEOF => {
                                    primeraExpresion
                                }
                                | PExito(nuevaExpr) => {
                                    switch nuevaExpr {
                                    | EBloque(exprs) => {
                                        PExito(EBloque([primeraExprId, ...exprs]));
                                    }
                                    | _ => {
                                        PExito(EBloque([primeraExprId, nuevaExpr]));
                                    }
                                    }
                                }
                                };
                            };
                            funDesicion(tokenSig, true, nuevaFnEst, funSiNoEsOp);
                            
                        } else {
                            fnEstablecer();
                            funDesicion(lexer.sigToken(), false, () => (), () => PReturn);
                        }
                    } else {
                        expresionRespuesta;
                    }

                }
                | TComentario(_) => {
                    Js.log("Atorado en parser?");
                    funDesicion(lexer.sigToken(), aceptarSoloOperador, fnEnOp, funValorDefecto);
                }
                | TParenAb(infoParen) when !aceptarSoloOperador => {
                    let sigExpr = sigExprParen(infoParen, nivel, nivel);
                    switch sigExpr {
                    | PError(_) | PReturn | PEOF =>
                        PError("Hay un parentesis sin cerrar.")
                    | PExito(expr) => {
                        let infoOpFunApl = obtInfoFunAppl(false, infoId.inicio, infoId.numLinea, infoId.posInicioLinea);
                        let (precedenciaOpFunApl, asociatividadOpFunApl) = obtInfoOp(infoOpFunApl.valor);
                        PExito(EOperadorApl {
                            op: { 
                                signaturaOp: Indefinida, 
                                valorOp: infoOpFunApl, 
                                precedencia: precedenciaOpFunApl,
                                asociatividad: asociatividadOpFunApl
                            },
                            izq: primeraExprId,
                            der: expr
                        });
                    }
                    };
                }
                | TParenCer(_) when !aceptarSoloOperador => {
                    lexer.retroceder();
                    PExito(primeraExprId);
                }
                | PC_LET(info) => {
                        let textoError = generarTextoError(info);
                        PError({j|No se esperaba la palabra clave 'let' luego de la aplicación del operador.\n\n$textoError|j})
                    }
                | PC_CONST(info) => {
                    let textoError = generarTextoError(info);
                    PError({j|No se esperaba la palabra clave 'const' luego de la aplicación del operador.\n\n$textoError|j})
                }
                | TAgrupAb(info) => {
                    let textoError = generarTextoError(info);
                    PError({j|Este signo de agrupación aun no está soportado.\n\n$textoError|j});
                }
                | TAgrupCer(info) => {
                    let textoError = generarTextoError(info);
                    PError({j|Este signo de agrupación aun no está soportado.\n\n$textoError|j});
                }
                | TGenerico(infoGen) when !aceptarSoloOperador => {
                    let textoError = generarTextoError(infoGen);
                    PError({j|No se esperaba un genérico luego del identificador.\n\n$textoError|j})
                }
                | _ => {
                    funValorDefecto();
                }
                };
            };
            };
        };

        funDesicion(lexer.sigToken(), false, () => (), () => PReturn);
        
    }

    //: TODO: Para que funcione debe estar implementado el lookaheadsignificativo en el
    //  resto de parsers.
    and sigExprParen = (infoParen, nivel, nivelPadre) => {
        let sigToken = sigExpresion(nivelPadre, nivelPadre, false, 0, Izq, true);
        switch sigToken {
        | PReturn => PError("Error de indentación. El parentesis no ha sido cerrado.")
        | PError(_) => sigToken
        | PEOF => {
            let textoErr = generarTextoError(infoParen);
            let numLinea = infoParen.numLinea;
            let numColumna = infoParen.inicio - infoParen.posInicioLinea;
            PError({j|El parentesis abierto en $numLinea,$numColumna no está cerrado.\n\n$textoErr|j});
        }
        | PExito(sigToken2) => {
            let ultimoToken = lexer.sigToken();
            switch ultimoToken {
            | EOF => {
                let textoErr = generarTextoError(infoParen);
                let numLinea = infoParen.numLinea;
                let numColumna = infoParen.inicio - infoParen.posInicioLinea;
                PError({j|El parentesis abierto en $numLinea,$numColumna contiene una expresion, pero no está cerrado.\n\n$textoErr|j});
            }
            | ErrorLexer(error) => {
                let textoErr = generarTextoError(infoParen);
                let numLinea = infoParen.numLinea;
                let numColumna = infoParen.inicio - infoParen.posInicioLinea;
                PError({j|El parentesis abierto en $numLinea,$numColumna no está cerrado.\n\n$textoErr\nDebido a un error léxico: $error|j});
            }
            | Token (ultimoToken3, _) => {
                switch ultimoToken3 {
                | TParenCer(_) => PExito(sigToken2)
                | _ => PError("Se esperaba un cierre de parentesis.")
                };
            }
            };
        }
        };
    }

    and sigExpresion = (nivel, nivelPadre, iniciarIndentacionEnToken, precedencia, asociatividad, esExprPrincipal) => {

        let obtNuevoNivel = (infoToken) => {
            let res = if (iniciarIndentacionEnToken) {
                infoToken.inicio - infoToken.posInicioLinea
            } else {
                nivel
            };
            // Js.log({j|El sig nivel es $res|j});
            res;
        };

        let resultado = lexer.sigToken();

        switch resultado {
        | EOF => PEOF
        | ErrorLexer(err) => PError(err)
        | Token(token, _) => {
            switch token {
            | PC_LET(infoSea) => {
                sigExprDeclaracion(obtNuevoNivel(infoSea), true);
            }
            | PC_CONST(infoConst) => {
                sigExprDeclaracion(obtNuevoNivel(infoConst), false);
            }
            | TComentario(_) => sigExpresion(nivel, nivel, iniciarIndentacionEnToken, precedencia, asociatividad, esExprPrincipal)
            | TNumero(infoNumero) => {
                PExito(ENumero(infoNumero));
            }
            | TTexto(infoTexto) => {
                PExito(ETexto(infoTexto));
            }
            | TBool(infoBool) => {
                PExito(EBool(infoBool));
            }
            | TIdentificador(infoId) => {
                sigExprIdentificador(infoId, obtNuevoNivel(infoId), precedencia, asociatividad, esExprPrincipal);
            }
            | TParenAb(infoParen) => {
                sigExprParen(infoParen, obtNuevoNivel(infoParen), nivelPadre);
            }
            | TParenCer(infoParen) => {
                let textoErr = generarTextoError(infoParen);
                PError({j|No se esperaba un parentesis aquí. No hay ningún parentesis a cerrar.\n\n$textoErr|j});
            }
            | TNuevaLinea(_) => {
                lexer.retroceder();
                let (_, sigNivel, _, fnEstablecer) = lexer.lookAheadSignificativo(true);
                if (sigNivel >= nivel) {
                    fnEstablecer();
                    sigExpresion(nivel, nivel, iniciarIndentacionEnToken, precedencia, asociatividad, esExprPrincipal);
                } else {
                    PReturn
                }
            }
            | TAgrupAb(_) | TAgrupCer(_) => PError({j|Otros signos de agrupación aun no estan soportados.|j})
            | TGenerico(_) => PError({j|Los genericos aun no estan soportados.|j})
            | TOperador(infoOp) => {
                let textoErr = generarTextoError(infoOp);
                PError({j|No se puede usar un operador como expresión. Si esa es tu intención, rodea el operador en paréntesis, por ejemplo: (+)\n\n$textoErr|j});
            }
            };
        }
        };
    };


    let exprRe = sigExpresion(0, 0, true, 0, Izq, true);
    switch (exprRe) {
    | PError(err) => ErrorParser(err);
    | PExito(expr) => ExitoParser(expr);
    | PEOF | PReturn => ExitoParser(EBloque([]));
    };

};