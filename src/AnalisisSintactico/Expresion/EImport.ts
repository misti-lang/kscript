import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { EObjeto } from "./EObjeto";
import { IPosition } from "./IPosition";

export class EImport implements IPosition {
    type = "EImport" as const

    readonly rutaModulo: InfoToken<string>
    readonly importDefault?: InfoToken<string>
    readonly importObj?: EObjeto
    readonly inicioPE: number;
    readonly numLineaPE: number;
    readonly posInicioLineaPE: number;

    constructor(rutaModulo: InfoToken<string>, importDefault: InfoToken<string> | undefined, importObj: EObjeto | undefined, inicioPE: number, numLineaPE: number, posInicioLineaPE: number) {
        this.rutaModulo = rutaModulo;
        this.importDefault = importDefault;
        this.importObj = importObj;
        this.inicioPE = inicioPE;
        this.numLineaPE = numLineaPE;
        this.posInicioLineaPE = posInicioLineaPE;
    }
}

export class EImportAll implements IPosition {
    type = "EImportAll" as const

    readonly rutaModulo: InfoToken<string>
    readonly importId: InfoToken<string>
    readonly inicioPE: number;
    readonly numLineaPE: number;
    readonly posInicioLineaPE: number;

    constructor(rutaModulo: InfoToken<string>, importId: InfoToken<string>, inicioPE: number, numLineaPE: number, posInicioLineaPE: number) {
        this.rutaModulo = rutaModulo;
        this.importId = importId;
        this.inicioPE = inicioPE;
        this.numLineaPE = numLineaPE;
        this.posInicioLineaPE = posInicioLineaPE;
    }
}

export class EImportSolo implements IPosition {
    type = "EImportSolo" as const

    readonly rutaModulo: InfoToken<string>
    readonly inicioPE: number;
    readonly numLineaPE: number;
    readonly posInicioLineaPE: number;

    constructor(rutaModulo: InfoToken<string>, inicioPE: number, numLineaPE: number, posInicioLineaPE: number) {
        this.rutaModulo = rutaModulo;
        this.inicioPE = inicioPE;
        this.numLineaPE = numLineaPE;
        this.posInicioLineaPE = posInicioLineaPE;
    }
}
