import { Expresion } from "../Expresion";
import { IPosition } from "./IPosition";
import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EArray implements IPosition {
    type = "EArray" as const

    readonly expresiones: Expresion[];
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(expresiones: Expresion[], infoArray: InfoToken<string>) {
        this.expresiones = expresiones;
        this.inicioPE = infoArray.inicio;
        this.numLineaPE = infoArray.numLinea;
        this.posInicioLineaPE = infoArray.posInicioLinea;
    }

}
