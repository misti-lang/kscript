var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Asignar a objeto", () => {
    const entrada = `window.nombre = "Juan"`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `window.nombre = "Juan"`;
    expect(salida).toBe(esperado);
});

test("Asignar propiedad a otra propiedad", () => {
    const entrada = `a.b = c.d`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `a.b = c.d`;
    expect(salida).toBe(esperado);
});

test("Asignar () compila a undefined", () => {
    const entrada = `a.b = ()`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `a.b = undefined`;
    expect(salida).toBe(esperado);
});

test("Crear objeto", () => {
    const entrada = `{a 20}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).not.toThrow(Error);
});

test("Crear objeto vacio", () => {
    const entrada = `{}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).not.toThrow(Error);
});
