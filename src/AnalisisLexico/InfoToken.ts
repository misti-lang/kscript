export interface InfoToken<A> {
    readonly valor: A,
    readonly inicio: number,
    readonly final: number,
    readonly numLinea: number,
    readonly posInicioLinea: number,
    readonly indentacion: number
}
