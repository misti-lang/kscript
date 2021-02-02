# Changelog

## 0.0.38

- Agregado soporte para sintaxis abreviada de objetos `{a, b}`
- Roto soporte para importar modulos

## 0.0.37

- Agregado soporte basico para importar. Solo import default por ahora.

## 0.0.36

- Arreglado error al crear funciones sin parametros y objetos tipo '{a 1}}}'

## 0.0.35

- Agregado soporte basico para objetos. Solo en una linea, separados por comas, en una misma linea.

## 0.0.34

- Restaurado exports removidos.

## 0.0.33

- Agregado soporte basico para bucle while.

## 0.0.32

- Agregado soporte basico para arrays. Soporta cualquier tipo de expresion en su interior, separadas por coma.

## 0.0.31

- Agregado soporte basico para funciones con `fun`.

## 0.0.30

- Agregado soporte para generar codigo a partir de `elif` y `else`.

## 0.0.28

- Arreglado error al agrupar expresiones en parentesis que evitaba que el codigo continuara compilandose,
  y que malograba la precedencia de operadores.

## 0.0.27

- Arreglado error que trataba identificadores en una nueva linea como parametros de una función.
- Eliminado soporte para los operadores unario ++ y --.

## 0.0.23

- Ahora los tokens de tipo ENumero contienen un string en lugar de un number,
  para poder compilar y representarse adecuadamente.

## 0.0.22

- Agregado soporte para operadores unarios a la izq.
- Reemplazados operadores `^` y `^=` por `**` y `**=` para la potenciacion.
