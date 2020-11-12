import { Signatura } from "../Signatura";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { Asociatividad } from "../Asociatividad";

export class eOperador {
    signaturaOp: Signatura
    valorOp: InfoToken<string>
    precedencia: number
    asociatividad: Asociatividad

    constructor(signaturaOp: Signatura, valorOp: InfoToken<string>, precedencia: number, asociatividad: Asociatividad) {
        this.signaturaOp = signaturaOp;
        this.valorOp = valorOp;
        this.precedencia = precedencia;
        this.asociatividad = asociatividad;
    }
}

export class EOperador {
    type = "EOperador" as const
    readonly info: InfoToken<string>

    constructor(info: InfoToken<string>) {
        this.info = info;
    }
}
