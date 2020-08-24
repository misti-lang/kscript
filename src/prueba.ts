import {flujo2} from "./Utils/flujos";

const str = `
if (a === b) console.log 20
`;

const resultado = flujo2(str, "test.misti")
    .toStringWithSourceMap({ file: "test.misti" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
