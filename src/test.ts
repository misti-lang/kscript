import { flujo2 } from "./index";

const str = `
const res1 = console.log "Hola mundo"
const res2 = sumar (1 / 2) 20
const nombreCompleto =
    const nombre = "Juan"
    const apellido = "Perez"
    console.log nombre apellido
    nombre + apellido
`;

const resultado = flujo2(str, "test.misti")
    .toStringWithSourceMap({ file: "test.misti" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
