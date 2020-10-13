var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Variable simple", () => {
    const entrada = `let a = 20`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `let a = 20;`;
    expect(salida).toBe(esperado);
});

test("Variable, identificador y string", () => {
    const entrada = `let identificador'valido = "Hola mundo"`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `let identificador'valido = "Hola mundo";`;
    expect(salida).toBe(esperado);
});

test("Variable y operacion simple", () => {
    const entrada = `let a = 20 + 30`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `let a = 20 + 30;`;
    expect(salida).toBe(esperado);
});

test("Variable y operacion compleja", () => {
    const entrada = `let a = 10 - 20 + 30 * 40 / 4 - 5`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `let a = 10 - 20 + 30 * 40 / 4 - 5;`;
    expect(salida).toBe(esperado);
});

