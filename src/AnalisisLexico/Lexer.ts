import { EOFLexer, ErrorLexer, ResLexer, TokenLexer } from "./ResLexer";
import {
    PC_CONST,
    PC_LET, TAgrupAb, TAgrupCer,
    TBool,
    TComentario,
    TGenerico,
    TTexto,
    TIdentificador,
    TNuevaLinea,
    TNumero,
    Token2, TOperador, TParenAb, TParenCer
} from "./Token2";
import { Token } from "./Token";
import { run } from "./parsers";
import { parserGeneral } from "./gramatica";
import { ErrorRes, ExitoRes } from "./Resultado";
import { InfoToken } from "./InfoToken";

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
        if (sigToken instanceof ErrorRes) return [Token.Nada, -1]
        else if (sigToken instanceof ExitoRes) {
            const ex = sigToken.exito;
            if (ex.tipo === Token.Indentacion) return this.sigTokenLuegoDeIdentacion(ex.posFinal);
            else return [ex.tipo, posActual];
        } else {
            throw new Error("");
        }
    }

    private extraerToken(): ResLexer {
        if (this.posActual >= this.tamanoEntrada) return new EOFLexer();

        const resultado = run(parserGeneral, this.entrada, this.posActual);
        if (resultado instanceof ErrorRes) return new ErrorLexer(resultado.error);
        else if (resultado instanceof ExitoRes) {
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
                    posInicioLinea: this.posAbsInicioLinea
                }), this.indentacionActual);
            };

            switch (ex.tipo) {
                case Token.Nada: {
                    return new ErrorLexer("Se encontró un token Huerfano");
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
                        posInicioLinea: this.posAbsInicioLinea
                    }), this.indentacionActual);
                    this.posActual = ex.posFinal;
                    this.esInicioDeLinea = true;
                    this.indentacionActual = 0;
                    this.numLineaActual = this.numLineaActual + 1;
                    this.posAbsInicioLinea = ex.posFinal;
                    return resultado;
                }
                case Token.Identificador: {
                    switch (ex.res) {
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
                    return crearToken2(x => new TNumero(x), parseFloat(ex.res));
                case Token.Texto:
                    return crearToken2(x => new TTexto(x), ex.res);
                case Token.Operadores:
                    return crearToken2(x => new TOperador(x), ex.res);
                case Token.AgrupacionAb: {
                    switch (ex.res) {
                        case "(":
                            return crearToken2(x => new TParenAb(x), ex.res)
                        default:
                            return crearToken2(x => new TAgrupAb(x), ex.res)
                    }
                }
                case Token.AgrupacionCer: {
                    switch (ex.res) {
                        case ")":
                            return crearToken2(x => new TParenCer(x), ex.res)
                        default:
                            return crearToken2(x => new TAgrupCer(x), ex.res)
                    }
                }
            }

        } else {
            throw new Error("");
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
            if (sigToken instanceof ErrorLexer || sigToken instanceof EOFLexer) {
                return [sigToken, -1, hayNuevaLinea, tokensList.concat([sigToken])];
            } else if (sigToken instanceof TokenLexer) {
                const token = sigToken.token;
                const indentacion = sigToken.indentacion;

                if (token instanceof TNuevaLinea) {
                    return obtSigTokenSign(tokensList, true);
                } else {
                    return [sigToken, indentacion, hayNuevaLinea, tokensList.concat([sigToken])];
                }
            } else {
                throw new Error("");
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
