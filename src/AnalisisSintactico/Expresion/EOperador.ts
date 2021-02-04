import { Signatura } from "../Signatura";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { Asociatividad } from "../Asociatividad";
import { IPosition } from "./IPosition";

export class eOperador implements IPosition {
    readonly signaturaOp: Signatura
    readonly info: InfoToken<string>
    readonly precedencia: number
    readonly asociatividad: Asociatividad
    readonly inicioPE: number
    readonly numLineaPE: number
    readonly posInicioLineaPE: number

    constructor(signaturaOp: Signatura, info: InfoToken<string>, precedencia: number, asociatividad: Asociatividad) {
        this.signaturaOp = signaturaOp;
        this.info = info;
        this.precedencia = precedencia;
        this.asociatividad = asociatividad;
        this.inicioPE = info.inicio;
        this.numLineaPE = info.numLinea;
        this.posInicioLineaPE = info.posInicioLinea;
    }
}

export class EOperador {
    type = "EOperador" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}
