#!/usr/bin/env node
const flujoREPL = require("./Utils/repl").flujoREPL;
const compilar  = require("./Utils/compile").compilar;

const strAyuda = `Uso:
  --repl               Inicia el REPL
  -c, --compile FILE   Compila el archivo FILE e imprime en stdout.
  -h, --help           Muestra esta información`;


process.on("SIGINT", () => {
    console.log("Recibida señal de detención.");
    process.exit(1);
});


const main = function () {
    if (process.argv.length <= 2) {
        console.log(strAyuda);
        process.exit(0);
    }

    const comando = process.argv[2];
    switch (comando) {
        case "-h":
        case "--help": {
            console.log(strAyuda);
            process.exit(0);
        }
        case "--repl": {
            flujoREPL();
            break;
        }
        case "-c":
        case "--compile": {
            const ruta = process.argv[3];
            if (ruta) {
                compilar(ruta);
            } else {
                console.log("Tienes que introducir una ruta a un archivo " +
                "luego de usar " + comando + ".");
            }
            process.exit(0);
        }
        default: {
            console.log("Comando no reconocido. Usa -h para mas información.");
            process.exit(0);
        }
    }
};

module.exports = main;
