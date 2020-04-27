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
            console.log(flujoPrincipal(respuesta));
            repl();
        }
    });
};

console.log("Kan v0.0.1");
console.log("Para salir del REPL escribe :s o CTRL+C");
repl();
