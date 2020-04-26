
let rec repl = () => {
    Js.log("> ");
    
};


let entrada = "sea hola = 20"
let lexer = Gramatica.crearLexer(entrada);
let expresion = Parser.parseTokens(lexer);
Js.log(expresion);

