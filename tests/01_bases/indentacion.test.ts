var flujo2 = require("../../src/Utils/flujos").flujo2;

test("2 constantes", () => {
    const entrada = `const a = 20\nconst b = 30`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 20\nconst b = 30`;
    expect(salida).toBe(esperado);
});

test("3 constantes", () => {
    const entrada = `const a = 20\nconst b = 30\nconst c = 40`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 20\nconst b = 30\nconst c = 40`;
    expect(salida).toBe(esperado);
});

test("Constante con valor en misma linea", () => {
    const entrada = `const a = 20`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = 20`;
    expect(salida).toBe(esperado);
});

// TODO: Hacer que el generador reconozca bloques con solo 1 expresión y lo optimice.
test("Constante con único valor en nueva linea", () => {
    const entrada = `const a =\n    20`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = (() => {\n    return 20\n})()`;
    expect(salida).toBe(esperado);
});

test("Constante anidada", () => {
    const entrada = `const a =\n    const b = 20\n    b`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const a = (() => {\n    const b = 20\n    return b\n})()`;
    expect(salida).toBe(esperado);
});

test("Juan Perez", () => {
    const entrada = `
    const nombreCompleto =
        const nombre = "Juan"
        const apellido = "Apellido"
        
        nombre + " " + apellido
    `;
    const salida = flujo2(entrada, "").toString();
    const esperado = `const nombreCompleto = (() => {
    const nombre = "Juan"
    const apellido = "Apellido"
    return nombre + " " + apellido
})()`;
    expect(salida).toBe(esperado);
});
