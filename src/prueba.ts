import {flujo2} from "./Utils/flujos";

const str = `
if 10 == 20 do
    console.log a
    console.log b
elif 20 == 30 do
    console.log c
else
    console.log h
`;

const resultado = flujo2(str, "test.ks")
    .toStringWithSourceMap({ file: "test.ks" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
