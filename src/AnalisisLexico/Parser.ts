import { Resultado } from "./Resultado";

export type Parser<A> = (s: string, n: number) => Resultado<A>
