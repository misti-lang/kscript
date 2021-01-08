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

test("Objeto con comas colgantes", () => {
    const entrada = `{a 20,}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});

test("Objeto con multiples llaves cerradas", () => {
    const entrada = `{a 20}}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});

test("Objetos anidados", () => {
    const entrada = `{a {b 30}}`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `{a: {b: 30}}`
    expect(salida).toBe(esperado);
});

test("Objeto con multiples valores", () => {
    const entrada = `{a 20, b 30, c 40}`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `{a: 20, b: 30, c: 40}`
    expect(salida).toBe(esperado);
});

test("Usar numeros como claves", () => {
    const entrada = `{40 20}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});

test("Usar string como clave", () => {
    const entrada = `{"hola" "mundo"}`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});

