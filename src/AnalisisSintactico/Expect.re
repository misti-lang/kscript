open Lexer;
open Gramatica;

exception ErrorComun(string);

let extraerToken = (resLexer, msgError) => {
    switch (resLexer) {
    | ErrorLexer(err) => raise(ErrorComun({j|$msgError ($err)|j}));
    | EOF => raise(ErrorComun({j|$msgError (EOF)|j}));
    | Token (token, indentacion) => token
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


let _TIdentificador = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
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


let _PC_SEA = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
    | PC_SEA(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken;
        };

    | _ => raise(ErrorComun(msgError))
    };
};


let _PC_MUT = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
    | PC_MUT(infoToken) =>
        switch (valorOpc) {
        | Some(v) =>
            if (infoToken.valor == v) infoToken
            else raise(ErrorComun(""))
        | None => infoToken
        };

    | _ => raise(ErrorComun(msgError));
    };
};


let _TOperador = (resLexer, valorOpc, msgError) => {
    let preToken = extraerToken(resLexer, msgError);
    switch (preToken) {
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

