import {flujo2} from "./flujos";

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const repl = () => {
    rl.question("> ", (respuesta: string) => {
        if (respuesta === ":s") {
            rl.close();
            process.exit(0);
        } else {
            const jsResultado = flujo2(respuesta, "");
            console.log(jsResultado.toString());
            repl();
        }
    });
};

export const flujoREPL = () => {
    console.log("Misti v0.0.20");
    console.log("Para salir del REPL escribe :s o CTRL+C");
    repl();
};
