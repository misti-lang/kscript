const flujoPrincipal = require("../Inicio.bs").flujoPrincipal;
const fs = require("fs");


const compilar = ruta => {
    const data = fs.readFileSync(ruta, "utf-8");

    try {
        const jsResultado = flujoPrincipal(data);
        console.log(jsResultado);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);

};

module.exports.compilar = compilar;