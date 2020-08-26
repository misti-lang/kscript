#!/usr/bin/env node
import {flujoREPL} from "./Utils/repl";
import {compilar} from "./Utils/compile";

const strAyuda = `Uso:
  --repl               Inicia el REPL.
  -c, --compile FILE   Compila el archivo FILE.
  -cs FILE             Compila el archivo FILE y adicionalmente imprime en stdout.
  -h, --help           Muestra esta información.
  -v, --version        Imprime la versión del compilador.`;

process.on("SIGINT", () => {
    console.log("Recibida señal de detención.");
    process.exit(1);
});

if (process.argv.length <= 2) {
    console.log(strAyuda);
    process.exit(0);
}

const comando = process.argv[2];
let imprimirCompilacion = false;
switch (comando) {
    case "-h":
    case "--help": {
        console.log(strAyuda);
        process.exit(0);
    }
    case "-v":
    case "--version": {
        console.log("El compilador Misti, versión 0.0.21");
        process.exit(0);
    }
    case "--repl": {
        flujoREPL();
        break;
    }
    case "-cs":
        imprimirCompilacion = true;
    case "-c":
    case "--compile": {
        const ruta = process.argv[3];
        if (ruta) {
            compilar(ruta, imprimirCompilacion);
        }
        else {
            console.log("Tienes que introducir una ruta a un archivo " +
                "luego de usar " + comando + ".");
            process.exit(0);
        }
        break;
    }
    default: {
        console.log("Comando no reconocido. Usa -h para mas información.");
        process.exit(0);
    }
}
