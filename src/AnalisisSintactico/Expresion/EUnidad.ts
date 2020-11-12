import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EUnidad {
    type = "EUnidad" as const
    readonly info: InfoToken<void>

    constructor(info: InfoToken<void>) {
        this.info = info;
    }
}
