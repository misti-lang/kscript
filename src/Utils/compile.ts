import {flujo2} from "./flujos";

const fs = require("fs");

const compilar = (ruta: string, imprimirEnStdout = false) => {
    const data = fs.readFileSync(ruta, "utf-8");

    try {
        const jsResultado = flujo2(data, ruta);

        if (imprimirEnStdout) {
            console.log(jsResultado);
        }

        fs.open(ruta + ".js", "w", (err: Error, fd: number) => {
            if (err) {
                console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo crear el archivo resultado.`);
                console.error(err);
                process.exit(0);
            }

            fs.write(fd, jsResultado, (err: Error) => {
                if (err) {
                    console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo escribir al archivo ${ruta}.js`);
                    console.error(err);
                    fs.closeSync(fd);
                    process.exit(0);
                }

                fs.closeSync(fd);
                console.log("Compilado sin problemas.");
                process.exit(0);
            });

        });

    } catch (e) {
        console.error(e);
        process.exit(0);
    }

};

module.exports.compilar = compilar;
