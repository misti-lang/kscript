import {flujo2} from "./Utils/flujos";

const str = `
if true do
    console.log x y z
elif true do
    console.log a
else
    console.log b
`;

const resultado = flujo2(str, "test.ks")
    .toStringWithSourceMap({ file: "test.ks" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
