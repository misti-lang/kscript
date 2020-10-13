import {flujo2} from "./Utils/flujos";

const str = `
if true do
    const s = 20
    console.log "hola mundo" s

console.log 20

`;

const resultado = flujo2(str, "test.ks")
    .toStringWithSourceMap({ file: "test.ks" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
