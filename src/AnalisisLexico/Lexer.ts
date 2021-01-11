import { EOFLexer, ErrorLexer, ResLexer, TokenLexer } from "./ResLexer";
import { TNuevaLinea } from "./Token2/TNuevaLinea"
import { TIdentificador } from "./Token2/TIdentificador";
import { TGenerico } from "./Token2/TGenerico";
import { TComentario } from "./Token2/TComentario";
import { TNumero } from "./Token2/TNumero"
import { TTexto } from "./Token2/TTexto"
import { TBool } from "./Token2/TBool"
import { TOperador } from "./Token2/TOperador"
import { TParenAb } from "./Token2/TParenAb"
import { TParenCer } from "./Token2/TParenCer"
import { TAgrupAb } from "./Token2/TAgrupAb"
import { TAgrupCer } from "./Token2/TAgrupCer"
import { PC_LET } from "./Token2/PC_LET"
import { PC_CONST } from "./Token2/PC_CONST"
import { PC_IF } from "./Token2/PC_IF"
import { PC_ELIF } from "./Token2/PC_ELIF"
import { PC_DO } from "./Token2/PC_DO"
import { PC_ELSE } from "./Token2/PC_ELSE"
import { PC_FUN } from "./Token2/PC_FUN";
import { Token2 } from "./Token2";
import { Token } from "./Token";
import { run } from "./parsers";
import { parserGeneral } from "./gramatica";
import { ErrorRes, ExitoRes } from "./Resultado";
import { InfoToken } from "./InfoToken";
import { TUndefined } from "./Token2/TUndefined";
import { TCorcheteAb } from "./Token2/TCorcheteAb";
import { TCorcheteCer } from "./Token2/TCorcheteCer";
import { TComa } from "./Token2/TComa";
import { PC_WHILE } from "./Token2/PC_WHILE";
import { TLlaveAb } from "./Token2/TLlaveAb";
import { TLlaveCer } from "./Token2/TLlaveCer";
import { PC_FROM, PC_IMPORT } from "./Token2/PC_modulos";

export class Lexer {

    entrada: string
    readonly tamanoEntrada: number
    esInicioDeLinea = true
    numLineaActual = 1
    posAbsInicioLinea = 0
    posActual = 0
    indentacionActual = 0
    tokensRestantes: Array<ResLexer> = []
    ultimoToken?: ResLexer = undefined
    resultadoLookAheadSignificativo?: [ResLexer, number, boolean, () => void]

    constructor(entrada: string) {
        this.entrada = entrada;
        this.tamanoEntrada = entrada.length;
        this.tokensRestantes = [this.extraerToken()];
    }

    private sigTokenLuegoDeIdentacion(posActual: number): [Token, number] {
        const sigToken = run(parserGeneral, this.entrada, posActual);
        switch (sigToken.type) {
            case "ErrorRes":
                return [Token.Nada, -1]
            case "ExitoRes": {
                const ex = sigToken.exito;
                if (ex.tipo === Token.Indentacion) return this.sigTokenLuegoDeIdentacion(ex.posFinal);
                else return [ex.tipo, posActual];
            }
            default:
                let _: never;
                _ = sigToken;
                return _;
        }
    }

    private extraerToken(): ResLexer {
        if (this.posActual >= this.tamanoEntrada) return new EOFLexer();

        const resultado = run(parserGeneral, this.entrada, this.posActual);
        switch (resultado.type) {
            case "ErrorRes":
                return new ErrorLexer(resultado.error);
            case "ExitoRes": {
                const ex = resultado.exito;

                const opComun = () => {
                    this.esInicioDeLinea = false;
                    this.posActual = ex.posFinal;
                };

                const crearToken2 = (fnTipo: (i: InfoToken<any>) => Token2, valor: any) => {
                    opComun();

                    return new TokenLexer(fnTipo({
                        valor,
                        inicio: ex.posInicio,
                        final: ex.posFinal,
                        numLinea: this.numLineaActual,
                        posInicioLinea: this.posAbsInicioLinea,
                        indentacion: this.indentacionActual
                    }), this.indentacionActual);
                };

                switch (ex.tipo) {
                    case Token.Nada: {
                        return new ErrorLexer("Se encontró un token Huerfano");
                    }
                    case Token.Undefined: {
                        return crearToken2(x => new TUndefined(x), ex.res);
                    }
                    case Token.Indentacion: {
                        if (!this.esInicioDeLinea) {
                            // Se encontró espacios blancos o un Tab en medio de una linea.
                            this.posActual = ex.posFinal;
                            return this.extraerToken();
                        } else {
                            let [tipo, sigPos] = this.sigTokenLuegoDeIdentacion(ex.posFinal);
                            switch (tipo) {
                                case Token.Nada:
                                    return new EOFLexer();
                                case Token.NuevaLinea: {
                                    this.posActual = sigPos;
                                    this.indentacionActual = 0;
                                    return this.extraerToken();
                                }
                                default: {
                                    this.posActual = sigPos;
                                    this.indentacionActual = sigPos - ex.posInicio;
                                    return this.extraerToken();
                                }
                            }
                        }
                    }
                    case Token.NuevaLinea: {
                        const resultado = new TokenLexer(new TNuevaLinea({
                            valor: undefined,
                            inicio: ex.posInicio,
                            final: ex.posFinal,
                            numLinea: this.numLineaActual,
                            posInicioLinea: this.posAbsInicioLinea,
                            indentacion: this.indentacionActual
                        }), this.indentacionActual);
                        this.posActual = ex.posFinal;
                        this.esInicioDeLinea = true;
                        this.indentacionActual = 0;
                        this.numLineaActual = this.numLineaActual + 1;
                        this.posAbsInicioLinea = ex.posFinal;
                        return resultado;
                    }
                    case Token.Identificador: {
                        switch (ex.res as string) {
                            case "true":
                            case "false": {
                                return crearToken2(x => new TBool(x), ex.res === "true");
                            }
                            case "let": {
                                return crearToken2(x => new PC_LET(x), "let");
                            }
                            case "const": {
                                return crearToken2(x => new PC_CONST(x), "const");
                            }
                            case "if": {
                                return crearToken2(x => new PC_IF(x), "if");
                            }
                            case "do": {
                                return crearToken2(x => new PC_DO(x), "do");
                            }
                            case "elif": {
                                return crearToken2(x => new PC_ELIF(x), "elif");
                            }
                            case "else": {
                                return crearToken2(x => new PC_ELSE(x), "else");
                            }
                            case "while": {
                                return crearToken2(x => new PC_WHILE(x), "while");
                            }
                            case "fun": {
                                return crearToken2(x => new PC_FUN(x), "fun");
                            }
                            case "import": {
                                return crearToken2(x => new PC_IMPORT(x), "import");
                            }
                            case "from": {
                                return crearToken2(x => new PC_FROM(x), "from");
                            }
                            default: {
                                return crearToken2(x => new TIdentificador(x), ex.res)
                            }
                        }
                    }
                    case Token.Generico:
                        return crearToken2(x => new TGenerico(x), ex.res);
                    case Token.Comentario:
                        return crearToken2(x => new TComentario(x), ex.res);
                    case Token.Numero:
                        return crearToken2(x => new TNumero(x), ex.res);
                    case Token.Texto:
                        return crearToken2(x => new TTexto(x), ex.res);
                    case Token.Operadores: {
                        switch (ex.res as string) {
                            case ",": {
                                return crearToken2(x => new TComa(x), ex.res);
                            }
                            default: {
                                return crearToken2(x => new TOperador(x), ex.res);
                            }
                        }
                    }
                    case Token.AgrupacionAb: {
                        switch (ex.res as string) {
                            case "(":
                                return crearToken2(x => new TParenAb(x), ex.res)
                            case "[":
                                return crearToken2(x => new TCorcheteAb(x), ex.res)
                            case "{":
                                return crearToken2(x => new TLlaveAb(x), ex.res)
                            default:
                                return crearToken2(x => new TAgrupAb(x), ex.res)
                        }
                    }
                    case Token.AgrupacionCer: {
                        switch (ex.res as string) {
                            case ")":
                                return crearToken2(x => new TParenCer(x), ex.res)
                            case "]":
                                return crearToken2(x => new TCorcheteCer(x), ex.res)
                            case "}":
                                return crearToken2(x => new TLlaveCer(x), ex.res)
                            default:
                                return crearToken2(x => new TAgrupCer(x), ex.res)
                        }
                    }
                }
            }
            default:
                let _: never;
                _ = resultado;
                return _;
        }
    }

    sigToken() {
        const tokenRespuesta = (() => {
            if (this.tokensRestantes.length >= 2) {
                const [token1, ...resto] = this.tokensRestantes;
                this.tokensRestantes = resto;
                return token1;
            } else if (this.tokensRestantes.length === 1) {
                // Limpiar el lookaheadsignificativo si ya se recurrieron los tokens que este almacenaba
                const tokenRespuesta = this.tokensRestantes[0];
                this.resultadoLookAheadSignificativo = undefined;
                this.tokensRestantes = [this.extraerToken()];
                return tokenRespuesta;
            } else {
                throw new Error("Estado invalido del lexer.");
            }
        })();

        this.ultimoToken = tokenRespuesta;
        return tokenRespuesta;
    }

    lookAhead() {
        if (this.tokensRestantes.length >= 1) {
            return this.tokensRestantes[0];
        } else {
            throw new Error("Estado invalido del lexer.");
        }
    }

    retroceder() {
        if (this.tokensRestantes.length === 1) {
            const token = this.tokensRestantes[0];
            if (this.ultimoToken) {
                this.tokensRestantes = [this.ultimoToken, token];
            }
        }
    }

    hayTokens() {
        return this.posActual <= this.tamanoEntrada && !(this.ultimoToken instanceof EOFLexer);
    }

    /**
     * Busca el sig token que no sea nueva linea.
     * Devuelve ese token, y una funcion que permite hacer permantes los cambios.
     * El cliente es responsable de retroceder el parser si desea volver a
     * esa posicion anterior.
     */
    lookAheadSignificativo(ignorarPrimerToken: boolean): [ResLexer, number, boolean, () => void] {
        const extraerToken = this.extraerToken.bind(this);

        function obtSigTokenSign(tokensList: Array<ResLexer>, hayNuevaLinea: boolean)
            : [ResLexer, number, boolean, Array<ResLexer>] {
            const sigToken = extraerToken();
            switch (sigToken.type) {
                case "ErrorLexer":
                case "EOFLexer":
                    return [sigToken, -1, hayNuevaLinea, tokensList.concat([sigToken])];
                case "TokenLexer": {
                    const token = sigToken.token;
                    const indentacion = sigToken.indentacion;

                    if (token instanceof TNuevaLinea) {
                        return obtSigTokenSign(tokensList, true);
                    } else {
                        return [sigToken, indentacion, hayNuevaLinea, tokensList.concat([sigToken])];
                    }
                }
                default:
                    let _: never;
                    _ = sigToken;
                    return _;
            }
        }

        function pre(tokensAct: Array<ResLexer>, hayNuevaLinea: boolean)
            : [ResLexer, number, boolean, Array<ResLexer>] {
            if (tokensAct.length >= 1) {
                const [t, ...resto] = tokensAct;
                if (t instanceof TokenLexer) {
                    const token = t.token;
                    const indentacion = t.indentacion;

                    if (token instanceof TNuevaLinea) {
                        return pre(resto, true);
                    } else {
                        return [t, indentacion, hayNuevaLinea, tokensAct];
                    }

                } else {
                    return [t, -1, hayNuevaLinea, tokensAct];
                }
            } else {
                return obtSigTokenSign([], hayNuevaLinea);
            }
        }

        if (this.resultadoLookAheadSignificativo) {
            return this.resultadoLookAheadSignificativo;
        } else {
            const [token, nivelIndentacion, hayNuevaLinea, listaRestante] = (()
                : [ResLexer, number, boolean, Array<ResLexer>] => {
                if (this.tokensRestantes.length >= 1) {
                    if (ignorarPrimerToken) {
                        const [primerToken, ...resto] = this.tokensRestantes;
                        const [token, nivelIndentacion, hayNuevaLinea, listaRestante] = pre(resto, false);
                        return [token, nivelIndentacion, hayNuevaLinea, [primerToken, ...listaRestante]];
                    } else {
                        return pre(this.tokensRestantes, false);
                    }
                } else {
                    throw new Error("Estado invalido del lexer.");
                }
            })();

            this.tokensRestantes = listaRestante;
            const resultado: [ResLexer, number, boolean, () => void] =
                [token, nivelIndentacion, hayNuevaLinea, () => {
                    this.resultadoLookAheadSignificativo = undefined;
                    this.tokensRestantes = [token];
                }];
            this.resultadoLookAheadSignificativo = resultado;
            return resultado;
        }
    }

    private tokensRestantesAStr() {
        function inner<A>(tokens: Array<ResLexer>, acc: string): string {
            if (tokens.length === 0) return acc;
            else {
                const [x, ...xs] = tokens;
                const stdAcc = (() => {
                    if (x instanceof TokenLexer) {
                        return x.token.toString();
                    } else if (x instanceof ErrorLexer) {
                        return `ErrorLexer(${x.razon})`;
                    } else {
                        return "EOF";
                    }
                })();
                return inner(xs, acc + stdAcc + ", ");
            }
        }

        return inner(this.tokensRestantes, "");
    }

    debug() {
        console.log("\n-----------------------------");
        console.log("Estado actual del lexer:");
        console.log(`esInicioDeLinea: ${this.esInicioDeLinea}`);
        console.log(`posActual: ${this.posActual}`);
        console.log(`tokensRestantes: [${this.tokensRestantesAStr()}]`);
        console.log(`ultimoToken: ${this.ultimoToken}`);
        console.log("-----------------------------\n");
    }

}
