import { EUndefined } from "./Expresion/EUndefined";
import { EIdentificador } from "./Expresion/EIdentificador";
import { EUnidad } from "./Expresion/EUnidad";
import { ENumero } from "./Expresion/ENumero";
import { ETexto } from "./Expresion/ETexto";
import { EBool } from "./Expresion/EBool";
import { EOperador } from "./Expresion/EOperador";
import { EOperadorApl } from "./Expresion/EOperadorApl";
import { EOperadorUnarioIzq } from "./Expresion/EOperadorUnarioIzq";
import { EDeclaracion } from "./Expresion/EDeclaracion";
import { ECondicional } from "./Expresion/ECondicional";
import { EBloque } from "./Expresion/EBloque";
import { EDeclaracionFuncion } from "./Expresion/EDeclaracionFuncion";
import { EArray } from "./Expresion/EArray";

export type Expresion =
    | EIdentificador
    | EUnidad
    | ENumero
    | ETexto
    | EBool
    | EUndefined
    | EOperador
    | EOperadorApl
    | EOperadorUnarioIzq
    | EDeclaracion
    | ECondicional
    | EBloque
    | EArray
    | EDeclaracionFuncion

