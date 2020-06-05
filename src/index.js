#!usr/bin/env node
const flujoREPL = require("./Utils/repl").flujoREPL;
const compilar  = require("./Utils/compile").compilar;

const strAyuda = `Uso:
  --repl               Inicia el REPL
  -c, --compile FILE   Compila el archivo FILE e imprime en stdout.
  -h, --help           Muestra esta información`;

const main = () => {
    if (process.argv.length <= 2) {
        console.log(strAyuda);
        return;
    }

    const comando = process.argv[2];
    switch (comando) {
        case "-h":
        case "--help": {
            console.log(strAyuda);
            break;
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
            break;
        }
        default: {
            console.log("Comando no reconocido. Usa -h para mas información.");
        }
    }
};

export default main;
