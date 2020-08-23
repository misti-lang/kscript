import { flujo2 } from "./index";

const str = `
// TODO: En el parser usar bind al pasar funciones del lexer a otras funciones.
const res1 = console.log "Hola mundo"
const res2 = sumar (1 / 2) 20
`;

const resultado = flujo2(str, "test.misti")
    .toStringWithSourceMap({ file: "test.misti" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
