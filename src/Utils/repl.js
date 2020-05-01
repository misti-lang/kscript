const readline = require("readline");
const flujoPrincipal = require("../Inicio.bs").flujoPrincipal;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const repl = () => {
    rl.question("> ", (respuesta) => {
        if (respuesta === ":s") {
            rl.close();
        } else {
            const jsResultado = flujoPrincipal(respuesta);
            console.log(jsResultado);
            repl();
        }
    });
};


const flujoREPL = () => {
    console.log("Kan v0.0.2");
    console.log("Para salir del REPL escribe :s o CTRL+C");
    repl();
};

module.exports.flujoREPL = flujoREPL;