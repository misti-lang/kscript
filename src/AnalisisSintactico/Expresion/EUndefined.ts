import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EUndefined {
    type = "EUndefined" as const
    readonly infoId: InfoToken<string>

    constructor(infoId: InfoToken<string>) {
        this.infoId = infoId;
    }
}
