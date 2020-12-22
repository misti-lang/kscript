var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Llamadas multiples separadas", () => {
    const entrada = `console.log "hola"\nconsole.log "mundo"`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log("hola")\nconsole.log("mundo")`;
    expect(salida).toBe(esperado);
});

test("Declarar función sin parametros", () => {
    const entrada = `fun f () = 10`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).not.toThrow(Error);
});
