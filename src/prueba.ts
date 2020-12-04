import { flujo2 } from "./Utils/flujos";

const str = `
const arr = [[1, 2], 3, [4, 5]]
`;

const resultado = flujo2(str, "test.ks")
    .toStringWithSourceMap({ file: "test.ks" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
