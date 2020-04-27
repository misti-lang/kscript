open Lexer;
open Parser;

let tknToStr = token2 => {
    switch (token2) {
    | TNuevaLinea(_) => "TNuevaLinea"
    | TIdentificador(_) => "TIdentificador"
    | TGenerico(_) => "TGenerico"
    | TComentario(_) => "TComentario"
    | TNumero(_) => "TNumero"
    | TTexto(_) => "TTexto"
    | TBool(_) => "TBool"
    | TOperador(_) => "TOperador"
    | TParenAb(_) => "TParenAb"
    | TParenCer(_) => "TParenCer"
    | TAgrupAb(_) => "TAgrupAb"
    | TAgrupCer(_) => "TAgrupCer"
    | PC_SEA(_) => "PC_SEA"
    | PC_MUT(_) => "PC_MUT"
    };
};


let main = () => {

    let entrada = "sea mut hola = 20";
    let lexer = Gramatica.crearLexer(entrada);
    let expresion = Parser.parseTokens(lexer);

    switch (expresion) {
    | ExitoParser(expr) => {
        let js = Generador.generarJs(expr, true, 0);
        Js.log(js);
    }
    | ErrorParser(err) => {
        Js.log(err);
    }
    }

};


main();
