import { TNuevaLinea } from "./Token/TNuevaLinea";
import { TIdentificador } from "./Token/TIdentificador";
import { TGenerico } from "./Token/TGenerico";
import { TComentario } from "./Token/TComentario";
import { TNumero } from "./Token/TNumero";
import { TTexto } from "./Token/TTexto";
import { TBool } from "./Token/TBool";
import { TUndefined } from "./Token/TUndefined";
import { TOperador } from "./Token/TOperador";
import { TParenAb } from "./Token/TParenAb";
import { TParenCer } from "./Token/TParenCer";
import { TAgrupAb } from "./Token/TAgrupAb";
import { TAgrupCer } from "./Token/TAgrupCer";
import { PC_LET } from "./Token/PC_LET";
import { PC_CONST } from "./Token/PC_CONST";
import { PC_IF } from "./Token/PC_IF";
import { PC_ELIF } from "./Token/PC_ELIF";
import { PC_DO } from "./Token/PC_DO";
import { PC_ELSE } from "./Token/PC_ELSE";
import { PC_FN, PC_FUN } from "./Token/PC_FUN";
import { TCorcheteAb } from "./Token/TCorcheteAb";
import { TCorcheteCer } from "./Token/TCorcheteCer";
import { TComa } from "./Token/TComa";
import { PC_WHILE } from "./Token/PC_WHILE";
import { TLlaveAb } from "./Token/TLlaveAb";
import { TLlaveCer } from "./Token/TLlaveCer";
import { PC_AS, PC_FROM, PC_IMPORT } from "./Token/PC_modulos";

export type Token =
    | TNuevaLinea
    | TIdentificador
    | TGenerico
    | TComentario
    | TNumero
    | TTexto
    | TBool
    | TUndefined
    | TOperador
    | TComa
    | TParenAb
    | TParenCer
    | TAgrupAb
    | TAgrupCer
    | TCorcheteAb
    | TCorcheteCer
    | TLlaveAb
    | TLlaveCer
    | PC_LET
    | PC_CONST
    | PC_IF
    | PC_ELIF
    | PC_DO
    | PC_ELSE
    | PC_WHILE
    | PC_FUN
    | PC_FN
    | PC_IMPORT
    | PC_FROM
    | PC_AS
