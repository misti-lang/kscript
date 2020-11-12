import { InfoToken } from "../../AnalisisLexico/InfoToken";

export class EBool {
    type = "EBool" as const
    readonly info: InfoToken<boolean>

    constructor(info: InfoToken<boolean>) {
        this.info = info;
    }
}
