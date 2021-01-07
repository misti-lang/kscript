import { TNuevaLinea } from "./Token2/TNuevaLinea";
import { TIdentificador } from "./Token2/TIdentificador";
import { TGenerico } from "./Token2/TGenerico";
import { TComentario } from "./Token2/TComentario";
import { TNumero } from "./Token2/TNumero";
import { TTexto } from "./Token2/TTexto";
import { TBool } from "./Token2/TBool";
import { TUndefined } from "./Token2/TUndefined";
import { TOperador } from "./Token2/TOperador";
import { TParenAb } from "./Token2/TParenAb";
import { TParenCer } from "./Token2/TParenCer";
import { TAgrupAb } from "./Token2/TAgrupAb";
import { TAgrupCer } from "./Token2/TAgrupCer";
import { PC_LET } from "./Token2/PC_LET";
import { PC_CONST } from "./Token2/PC_CONST";
import { PC_IF } from "./Token2/PC_IF";
import { PC_ELIF } from "./Token2/PC_ELIF";
import { PC_DO } from "./Token2/PC_DO";
import { PC_ELSE } from "./Token2/PC_ELSE";
import { PC_FUN } from "./Token2/PC_FUN";
import { TCorcheteAb } from "./Token2/TCorcheteAb";
import { TCorcheteCer } from "./Token2/TCorcheteCer";
import { TComa } from "./Token2/TComa";
import { PC_WHILE } from "./Token2/PC_WHILE";
import { TLlaveAb } from "./Token2/TLlaveAb";
import { TLlaveCer } from "./Token2/TLlaveCer";

export type Token2 =
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
