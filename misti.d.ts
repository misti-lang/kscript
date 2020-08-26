import type { SourceNode } from "source-map";

export declare type Signatura = SignIndefinida | SignSimple | SignFuncion;
export declare class SignIndefinida {
    type: "SignIndefinida";
}
export declare class SignSimple {
    type: "SignSimple";
    valor: string;
    constructor(valor: string);
}
export declare class SignFuncion {
    type: "SignFuncion";
    fun: Signatura;
    param: Signatura;
    constructor(fun: Signatura, param: Signatura);
}

export declare enum Asociatividad {
    Izq = 0,
    Der = 1
}

export declare type Expresion = EIdentificador | EUnidad | ENumero | ETexto | EBool | EOperador | EOperadorApl | EDeclaracion | EBloque;
export declare class EIdentificador {
    type: "EIdentificador";
    readonly signatura: Signatura;
    readonly valorId: InfoToken<string>;
    constructor(signatura: Signatura, valorId: InfoToken<string>);
}
export declare class EUnidad {
    type: "EUnidad";
    readonly info: InfoToken<void>;
    constructor(info: InfoToken<void>);
}
export declare class ENumero {
    type: "ENumero";
    readonly info: InfoToken<number>;
    constructor(info: InfoToken<number>);
}
export declare class ETexto {
    type: "ETexto";
    readonly info: InfoToken<string>;
    constructor(info: InfoToken<string>);
}
export declare class EBool {
    type: "EBool";
    readonly info: InfoToken<boolean>;
    constructor(info: InfoToken<boolean>);
}
export declare class eOperador {
    signaturaOp: Signatura;
    valorOp: InfoToken<string>;
    precedencia: number;
    asociatividad: Asociatividad;
    constructor(signaturaOp: Signatura, valorOp: InfoToken<string>, precedencia: number, asociatividad: Asociatividad);
}
export declare class EOperador {
    type: "EOperador";
    readonly info: InfoToken<string>;
    constructor(info: InfoToken<string>);
}
export declare class EOperadorApl {
    type: "EOperadorApl";
    readonly op: eOperador;
    readonly izq: Expresion;
    readonly der: Expresion;
    constructor(op: eOperador, izq: Expresion, der: Expresion);
}
export declare class EDeclaracion {
    type: "EDeclaracion";
    readonly mut: boolean;
    readonly id: EIdentificador;
    readonly valorDec: Expresion;
    readonly inicioDec: number;
    readonly numLineaDec: number;
    readonly posInicioLineaDec: number;
    constructor(mut: boolean, id: EIdentificador, valorDec: Expresion, inicioDec: number, numLineaDec: number, posInicioLineaDec: number);
}
export declare class EBloque {
    type: "EBloque";
    readonly bloque: Array<Expresion>;
    constructor(bloque: Array<Expresion>);
}

export interface InfoToken<A> {
    readonly valor: A;
    readonly inicio: number;
    readonly final: number;
    readonly numLinea: number;
    readonly posInicioLinea: number;
}

export declare type Token2 = TNuevaLinea | TIdentificador | TGenerico | TComentario | TNumero | TTexto | TBool | TOperador | TParenAb | TParenCer | TAgrupAb | TAgrupCer | PC_LET | PC_CONST;
export declare class TNuevaLinea {
    type: "TNuevaLinea";
    token: InfoToken<undefined>;
    constructor(token: InfoToken<undefined>);
    toString(): string;
}
export declare class TIdentificador {
    type: "TIdentificador";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TGenerico {
    type: "TGenerico";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TComentario {
    type: "TComentario";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TNumero {
    type: "TNumero";
    token: InfoToken<number>;
    constructor(token: InfoToken<number>);
    toString(): string;
}
export declare class TTexto {
    type: "TTexto";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TBool {
    type: "TBool";
    token: InfoToken<boolean>;
    constructor(token: InfoToken<boolean>);
    toString(): string;
}
export declare class TOperador {
    type: "TOperador";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TParenAb {
    type: "TParenAb";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TParenCer {
    type: "TParenCer";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TAgrupAb {
    type: "TAgrupAb";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class TAgrupCer {
    type: "TAgrupCer";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class PC_LET {
    type: "PC_LET";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}
export declare class PC_CONST {
    type: "PC_CONST";
    token: InfoToken<string>;
    constructor(token: InfoToken<string>);
    toString(): string;
}

export declare type ResLexer = TokenLexer | ErrorLexer | EOFLexer;
export declare class TokenLexer {
    type: "TokenLexer";
    token: Token2;
    indentacion: number;
    constructor(token: Token2, pos: number);
}
export declare class ErrorLexer {
    type: "ErrorLexer";
    razon: string;
    constructor(razon: string);
}
export declare class EOFLexer {
    type: "EOFLexer";
}

export declare type ResParser = ExitoParser | ErrorLexerP | ErrorParser;
export declare class ExitoParser {
    type: "ExitoParser";
    expr: Expresion;
    constructor(expr: Expresion);
}
export declare class ErrorLexerP {
    type: "ErrorLexerP";
    err: string;
    constructor(err: string);
}
export declare class ErrorParser {
    type: "ErrorParser";
    err: string;
    constructor(err: string);
}

export declare class Lexer {
    entrada: string;
    readonly tamanoEntrada: number;
    esInicioDeLinea: boolean;
    numLineaActual: number;
    posAbsInicioLinea: number;
    posActual: number;
    indentacionActual: number;
    tokensRestantes: Array<ResLexer>;
    ultimoToken?: ResLexer;
    resultadoLookAheadSignificativo?: [ResLexer, number, boolean, () => void];
    constructor(entrada: string);
    private sigTokenLuegoDeIdentacion;
    private extraerToken;
    sigToken(): ResLexer;
    lookAhead(): ResLexer;
    retroceder(): void;
    hayTokens(): boolean;
    /**
     * Busca el sig token que no sea nueva linea.
     * Devuelve ese token, y una funcion que permite hacer permantes los cambios.
     * El cliente es responsable de retroceder el parser si desea volver a
     * esa posicion anterior.
     */
    lookAheadSignificativo(ignorarPrimerToken: boolean): [ResLexer, number, boolean, () => void];
    private tokensRestantesAStr;
    debug(): void;
}

export declare function parseTokens(lexer: Lexer): ResParser;

export declare function crearCodeWithSourceMap(expr: Expresion, toplevel: boolean, nivel: number, nombreArchivo: string | null, opciones?: {
    [s: string]: boolean;
}): [SourceNode, number];

export declare const compilar: (codigo: string) => SourceNode;

