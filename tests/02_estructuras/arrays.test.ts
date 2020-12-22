var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Array vacio", () => {
    const entrada = `[]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `[]`;
    expect(salida).toBe(esperado);
});

test("Array con 1 elemento", () => {
    const entrada = `[1]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `[1]`;
    expect(salida).toBe(esperado);
});

test("Array con 5 elementos", () => {
    const entrada = `[1, 2, 3, 4, 5]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `[1, 2, 3, 4, 5]`;
    expect(salida).toBe(esperado);
});

test("Array con diferentes tipos de elementos", () => {
    const entrada = `[1, "2", false, true, 5, ()]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `[1, "2", false, true, 5, undefined]`;
    expect(salida).toBe(esperado);
});

test("Array asignado a declaracion", () => {
    const entrada = `const frutas = ["Pera", "Manzana"]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const frutas = ["Pera", "Manzana"]`;
    expect(salida).toBe(esperado);
});

test("Array asignado a variable", () => {
    const entrada = `variable = [1, 2]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `variable = [1, 2]`;
    expect(salida).toBe(esperado);
});

test("Array asignado a objecto", () => {
    const entrada = `window.frutas = ["Pera"]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `window.frutas = ["Pera"]`;
    expect(salida).toBe(esperado);
});

test("Array como parametro", () => {
    const entrada = `console.log [1, 2, 3]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `console.log([1, 2, 3])`;
    expect(salida).toBe(esperado);
});

test("Acceder a elemento de array", () => {
    const entrada = `frutas.[0]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `frutas.[0]`;
    expect(salida).toBe(esperado);
});

test("Asignar a elemento de array", () => {
    const entrada = `frutas.[0] = [1]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `frutas.[0] = [1]`;
    expect(salida).toBe(esperado);
});

test("Asignar elemento de array a elemento de array", () => {
    const entrada = `frutas.[0] = frutas.[1]`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `frutas.[0] = frutas.[1]`;
    expect(salida).toBe(esperado);
});

test("Array con coma colgante", () => {
    const entrada = `[1, 2, 3,]`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});

test("Array con multiples comas colgantes", () => {
    const entrada = `[1, 2, 3, , , , ,]`;
    const f = () => flujo2(entrada, "").toString();
    expect(f).toThrow(Error);
});
