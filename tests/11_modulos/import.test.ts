var flujo2 = require("../../src/Utils/flujos").flujo2;

test("Import default", () => {
    const entrada = `from "react" import React`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import React from "react"`;
    expect(salida).toBe(esperado);
});

test("Import comun", () => {
    const entrada = `from "aphrodite" import {css}`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import {css} from "aphrodite"`;
    expect(salida).toBe(esperado);
});

test("Import default y comun", () => {
    const entrada = `from "react" import React, {useEffect}`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import React, {useEffect} from "react"`;
    expect(salida).toBe(esperado);
});

test("Import comun as", () => {
    const entrada = `from "aphrodite" import {S Stylesheet}`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import {Stylesheet as S} from "aphrodite"`;
    expect(salida).toBe(esperado);
});

test("Import todo as", () => {
    const entrada = `from "aphrodite" import * as A`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import * as A from "aphrodite"`;
    expect(salida).toBe(esperado);
});

test("Import solo", () => {
    const entrada = `import "./style.css"`;
    const salida = flujo2(entrada, "").toString();
    const esperado = `import "./style.css"`;
    expect(salida).toBe(esperado);
});
