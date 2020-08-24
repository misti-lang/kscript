var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Constante simple", () => {
    const entrada = `const a = 20`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 20`;
    expect(salida).toBe(esperado);
});

test("Constante, identificador y string", () => {
    const entrada = `const identificador'valido = "Hola mundo"`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const identificador'valido = "Hola mundo"`;
    expect(salida).toBe(esperado);
});

test("Constante y operacion simple", () => {
    const entrada = `const a = 20 + 30`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 20 + 30`;
    expect(salida).toBe(esperado);
});

test("Constante y operacion compleja", () => {
    const entrada = `const a = 10 - 20 + 30 * 40 / 4 - 5`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 10 - 20 + 30 * 40 / 4 - 5`;
    expect(salida).toBe(esperado);
});

