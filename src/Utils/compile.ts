import {flujo2} from "./flujos";

const fs = require("fs");

const check = (() => {
    let c = 2;
    return () => {
        c--;
        if (c === 0) {
            process.exit(0);
        }
    };
})();

export const compilar = (ruta: string, imprimirEnStdout = false) => {
    const fragmentosRuta = ruta.split("/");
    const nombreArchivo = (() => {
        const n = fragmentosRuta.pop();
        if (n && n.endsWith(".ks")) return n;
        else {
            console.error(`El archivo provisto no tiene la extensión .ks`);
            process.exit(1);
        }
    })();

    const nombreSinExtension = nombreArchivo.substr(0, nombreArchivo.length - 3);
    let restoRuta = fragmentosRuta.join("/");
    if (restoRuta !== "") restoRuta += "/";

    const data = fs.readFileSync(ruta, "utf-8");

    try {
        const jsResultado = flujo2(data, nombreSinExtension + ".ks");
        const codigoConSourceMap = jsResultado.toStringWithSourceMap();
        const codigo = codigoConSourceMap.code + `\n\n//# sourceMappingURL=${nombreSinExtension}.js.map`;
        const sourceMap = codigoConSourceMap.map.toString();

        if (imprimirEnStdout) {
            console.log(jsResultado.toString());
        }

        // Abre el archivo resultado.
        fs.open(restoRuta + nombreSinExtension + ".js", "w", (err: Error, fd: number) => {
            if (err) {
                console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo crear el archivo resultado.`);
                console.error(err);
                process.exit(1);
            }

            fs.write(fd, codigo, (err: Error) => {
                if (err) {
                    console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo escribir al archivo ${ruta}.js`);
                    console.error(err);
                    fs.closeSync(fd);
                    process.exit(1);
                }

                fs.closeSync(fd);
                check();
            });

        });

        // Abre el archivo para source map
        fs.open(restoRuta + nombreSinExtension + ".js.map", "w", (err: Error, fd: number) => {
            if (err) {
                console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo crear el archivo para crear source-map.`);
                console.error(err);
                process.exit(1);
            }

            fs.write(fd, sourceMap, (err: Error) => {
                if (err) {
                    console.error(`Error al compilar el archivo ${ruta}:
                               Se compiló el código, pero no se pudo escribir al archivo ${ruta}.js`);
                    console.error(err);
                    fs.closeSync(fd);
                    process.exit(1);
                }

                fs.closeSync(fd);
                check();
            });

        });

    } catch (e) {
        console.error(e);
        process.exit(1);
    }

};
