const flujoPrincipal = require("../Inicio.bs").flujoPrincipal;
const fs = require("fs");


const compilar = ruta => {
    fs.readFile(ruta, "utf-8", (err, data) => {
        if (err) {
            throw new Error("Error al leer el archivo: " + err);
        }

        const jsResultado = flujoPrincipal(data);
        console.log(jsResultado);
        process.exit(0);
    });
};

module.exports.compilar = compilar;