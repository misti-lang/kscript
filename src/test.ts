import { flujo2 } from "./index";

const str = `
algo?.basico = algo.complejo
`;

const resultado = flujo2(str, "test.misti")
    .toStringWithSourceMap({ file: "test.misti" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
process.exit(0);
