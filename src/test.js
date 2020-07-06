const flujo2 = require("./Inicio.bs").flujo2;
const SourceMap = require("source-map");
const SourceNode = SourceMap.SourceNode;

const fnCrear = (p1, p2, p3, p4) => new SourceNode(p1, p2, p3, p4);

const str = `
console.log "Hola" (20) (hola <> mundo <> mundial)
`;

const resultado = flujo2(str, "test.misti", fnCrear)
    .toStringWithSourceMap({ file: "test.misti" });

console.log(resultado);
console.log(resultado.code);
console.log(resultado.map.toString());
