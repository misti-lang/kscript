open Lexer;
open Gramatica;

exception ErrorComun(string);
exception OpInvalida(string);

let extraerToken = (resLexer, msgError) => {
    switch (resLexer) {
    | ErrorLexer(err) => raise(ErrorComun({j|$msgError ($err)|j}));
    | EOF => raise(ErrorComun({j|$msgError (EOF)|j}));
    | Token (token, _) => token
    };
};


let _Any = (resLexer, msgError, fnErrorLexer, fnEOF) => {
    let fnErrorLexer = switch (fnErrorLexer) {
                       | None => x => ErrorComun(x);
                       | Some(f) => f
                       };

    let fnEOF = switch (fnEOF) {
                | None => x => ErrorComun(x);
                | Some(f) => f;
                };

    switch (resLexer) {
    | ErrorLexer(err) => raise(fnErrorLexer({j|$msgError ($err)|j}));
    | EOF => raise(fnEOF({j|$msgError (EOF)|j}));
    | Token (token, indentacion) => (token, indentacion)
    };
};


let _TNuevaLinea = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
    | TNuevaLinea(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""));
        | None => infoToken
        };
    | _ => raise(ErrorComun(msgError));
    };
};


let rec _TIdentificador = (fnObtToken, valorOpc, msgError) => {
    let preToken = extraerToken(fnObtToken(), msgError);
    switch (preToken) {
    | TComentario(_) => _TIdentificador(fnObtToken, valorOpc, msgError);
    | TIdentificador(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken
        };

    | _ => raise(ErrorComun(msgError));
    };
};


let _PC_LET = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
    | PC_LET(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken;
        };

    | _ => raise(ErrorComun(msgError))
    };
};


let _PC_CONST = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
    | PC_CONST(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken
        };

    | _ => raise(ErrorComun(msgError));
    };
};


let rec _TOperador = (fnObtToken, valorOpc, msgError) => {
    let preToken = extraerToken(fnObtToken(), msgError);
    switch preToken {
    | TComentario(_) => _TOperador(fnObtToken, valorOpc, msgError);
    | TOperador(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken
        };

    | _ => raise(ErrorComun(msgError));
    };
};

