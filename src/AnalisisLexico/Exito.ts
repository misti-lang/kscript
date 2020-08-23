import { Token } from "./Token";

export interface Exito<A> {
    readonly res: A,
    readonly posInicio: number,
    readonly posFinal: number,
    readonly tipo: Token
}
