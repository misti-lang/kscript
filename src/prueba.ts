import {flujo2} from "./Utils/flujos";

const str = `
fun f x y z =
    console.log x y z
`;

const resultado = flujo2(str, "test.ks")
    .toStringWithSourceMap({ file: "test.ks" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
