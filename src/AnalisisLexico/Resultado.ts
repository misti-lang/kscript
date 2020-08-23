import { Exito } from "./Exito";

export abstract class Resultado<A> {
    // Para que no se pueda devolver cualquier tipo de dato en vez de esta clase.
    _() {}
}

export class ExitoRes<A> extends Resultado<A> {
    readonly exito: Exito<A>

    constructor(exito: Exito<A>) {
        super();
        this.exito = exito;
    }
}

export class ErrorRes extends Resultado<any> {
    readonly error: string

    constructor(error: string) {
        super();
        this.error = error;
    }
}
