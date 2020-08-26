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

test("Unico () en función compila a ()", () => {
    const entrada = `console.log ()`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log()`;
    expect(salida).toBe(esperado);
});

test("Un () en medio de otros parametros compila a undefined", () => {
    const entrada = `console.log a () b`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log(a, undefined, b)`;
    expect(salida).toBe(esperado);
});

test("Asignar () compila a undefined", () => {
    const entrada = `param = ()`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `param = undefined`;
    expect(salida).toBe(esperado);
});

test("Pasar propiedad de objeto como parametro", () => {
    const entrada = `console.log a.b`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log(a.b)`;
    expect(salida).toBe(esperado);
});

test("Pasar propiedad de objeto como parametro entre otros", () => {
    const entrada = `console.log a.b c`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log(a.b, c)`;
    expect(salida).toBe(esperado);
});

test("Operadores unarios izq", () => {
    const entrada = `const s = -1`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const s = -1`;
    expect(salida).toBe(esperado);
});

test("Operadores unarios der", () => {
    const entrada = `const s = 1++`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const s = 1++`;
    expect(salida).toBe(esperado);
});

test("Precedencia de operadores correctaa", () => {
    const entrada = `1 * 1 + 2 * 2 + 3`;
    const salida = flujo2(entrada, "", {
        imprimirParensEnOperadores: true
    }).toString();
    const esperado = `(((1 * 1) + (2 * 2)) + 3)`;
    expect(salida).toBe(esperado);
});
