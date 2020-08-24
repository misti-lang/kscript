import { Exito } from "./Exito";

export type Resultado<A> =
    | ExitoRes<A>
    | ErrorRes

export class ExitoRes<A> {
    type = "ExitoRes" as const
    readonly exito: Exito<A>

    constructor(exito: Exito<A>) {
        this.exito = exito;
    }
}

export class ErrorRes {
    type = "ErrorRes" as const
    readonly error: string

    constructor(error: string) {
        this.error = error;
    }
}
