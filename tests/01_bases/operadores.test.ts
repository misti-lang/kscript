var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Modificar precedencia de operadores con paréntesis 1", () => {
    const entrada = `(1 + 2) * 3`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `(1 + 2) * 3`;
    expect(salida).toBe(esperado);
});

test("Modificar precedencia de operadores con paréntesis 2", () => {
    const entrada = `(1 + 2) * (3 - 4) / 5`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `(1 + 2) * (3 - 4) / 5`;
    expect(salida).toBe(esperado);
});

test("Modificar precedencia de operadores con paréntesis 3", () => {
    const entrada = `1 - (2 * 3) + (4 - 5) / 6`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `1 - 2 * 3 + (4 - 5) / 6`;
    expect(salida).toBe(esperado);
});
