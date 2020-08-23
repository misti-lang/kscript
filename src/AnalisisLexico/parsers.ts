import { Parser } from "./Parser";
import { ErrorRes, ExitoRes, Resultado } from "./Resultado";
import { Token } from "./Token";

export function run<A>(parser: Parser<A>, entrada: string, inicio: number) {
    return parser(entrada, inicio);
}

export function bindP<A, C>(f: (c: C) => Parser<A>, p: Parser<C>): Parser<A> {
    return function (entrada, inicio): Resultado<A> {
        const resultado = run(p, entrada, inicio);
        if (resultado instanceof ErrorRes) {
            return resultado;
        } else if (resultado instanceof ExitoRes) {
            const res = resultado.exito.res;
            const posSiguiente = resultado.exito.posFinal;
            const p2 = f(res);
            return run(p2, entrada, posSiguiente);
        } else {
            throw Error("");
        }
    }
}

export function returnP<A>(x: A): Parser<A> {
    return function (_, inicio): Resultado<A> {
        return new ExitoRes({
            res: x,
            posInicio: inicio,
            posFinal: inicio,
            tipo: Token.Nada
        });
    }
}

export function mapP<A, C>(f: (a: A) => C, p: Parser<A>): Parser<C> {
    return function (entrada, inicio) {
        const res = run(p, entrada, inicio);
        if (res instanceof ErrorRes) {
            return res;
        } else if (res instanceof ExitoRes) {
            return new ExitoRes({
                res: f(res.exito.res),
                posInicio: res.exito.posInicio,
                posFinal: res.exito.posFinal,
                tipo: res.exito.tipo
            });
        } else {
            throw new Error("");
        }
    }
}

export function parseCaracter(caracter: string): Parser<string> {
    return function (entrada, inicio): Resultado<string> {
        if (entrada === "" || inicio >= entrada.length) {
            return new ErrorRes("Entrada terminada");
        } else {
            const c = entrada.substring(inicio, inicio + 1);
            if (c === caracter) {
                return new ExitoRes({
                    res: c,
                    posInicio: inicio,
                    posFinal: inicio + 1,
                    tipo: Token.Nada
                });
            } else {
                return new ErrorRes(`Se esperaba '${caracter}' pero se obtuvo '${c}'.`);
            }
        }
    }
}

export function parseLuego<A, B>(p1: Parser<A>, p2: Parser<B>): Parser<[A, B]> {
    return function (entrada, inicio): Resultado<A> {
        const res1 = run(p1, entrada, inicio);

        if (res1 instanceof ErrorRes) return res1;
        else if (res1 instanceof ExitoRes) {
            const res2 = run(p2, entrada, res1.exito.posFinal);
            if (res2 instanceof ErrorRes) return res2;
            else if (res2 instanceof ExitoRes) {
                return new ExitoRes({
                    res: [res1.exito.res, res2.exito.res],
                    posInicio: inicio,
                    posFinal: res2.exito.posFinal,
                    tipo: Token.Nada
                });
            } else {
                throw new Error("");
            }
        } else {
            throw new Error("");
        }
    }
}

export function parseOtro<A>(p1: Parser<A>, p2: Parser<A>): Parser<A> {
    return function (entrada, inicio) {
        const res1 = run(p1, entrada, inicio);
        if (res1 instanceof ExitoRes) return res1;
        else if (res1 instanceof ErrorRes) {
            return run(p2, entrada, inicio);
        } else {
            throw new Error("");
        }
    }
}

export function escoger<A>(parsers: Array<Parser<A>>): Parser<A> {
    return parsers.reduce((p, c) => parseOtro(p, c));
}

export function cualquier<A>(parsers: Array<string>): Parser<A> {
    return escoger(parsers.map(parseCaracter));
}

export function parseVariosHelper<A>(parser: Parser<A>, entrada: string, inicio: number): [Array<A>, number] {
    const resultado = run(parser, entrada, inicio);

    if (resultado instanceof ErrorRes) return [[], inicio];
    else if (resultado instanceof ExitoRes) {
        const resFinal = resultado.exito.res;
        const posSig = resultado.exito.posFinal;
        const [valores, posFinal] = parseVariosHelper(parser, entrada, posSig);
        return [[resFinal, ...valores], posFinal];
    } else {
        throw new Error("");
    }
}

export function parseVarios<A>(parser: Parser<A>): Parser<Array<A>> {
    return function (entrada, inicio) {
        const [datos, posFinal] = parseVariosHelper(parser, entrada, inicio);
        return new ExitoRes({
            res: datos,
            posInicio: inicio,
            posFinal: posFinal,
            tipo: Token.Nada
        });
    }
}

export function parseVarios1<A>(parser: Parser<A>): Parser<Array<A>> {
    return function (entrada, inicio) {
        const [datos, posFinal] = parseVariosHelper(parser, entrada, inicio);
        if (datos.length === 0) {
            return new ErrorRes("Error al ejecutar parseVarios1. No se encontró una coincidencia.");
        } else {
            return new ExitoRes({
                res: datos,
                posInicio: inicio,
                posFinal: posFinal,
                tipo: Token.Nada
            });
        }
    }
}

export function parseSegundoOpcional<A, B>(p1: Parser<A>, p2: Parser<B>): Parser<[A, B | undefined]> {
    return function (entrada, inicio) {
        const res1 = run(p1, entrada, inicio);
        if (res1 instanceof ErrorRes) return res1;
        else if (res1 instanceof ExitoRes) {

            const res2 = run(p2, entrada, res1.exito.posFinal);
            if (res2 instanceof ErrorRes) {
                return new ExitoRes({
                    res: [res1.exito.res, undefined],
                    posInicio: inicio,
                    posFinal: res1.exito.posFinal,
                    tipo: Token.Nada
                });
            } else if (res2 instanceof ExitoRes) {
                return new ExitoRes({
                    res: [res1.exito.res, res2.exito.res],
                    posInicio: inicio,
                    posFinal: res2.exito.posFinal,
                    tipo: Token.Nada
                });
            } else {
                throw new Error("");
            }

        } else {
            throw new Error("");
        }
    }
}

export function parseCualquierMenos(caracter: string): Parser<string> {
    return function (entrada, inicio) {
        if (entrada === "" || inicio >= entrada.length) {
            return new ErrorRes("Entrada terminada");
        } else {
            const c = entrada.substring(inicio, inicio + 1);
            if (caracter === c) {
                return new ErrorRes("Se encontro el caracter a no parsear.");
            } else {
                return new ExitoRes({
                    res: c,
                    posInicio: inicio,
                    posFinal: inicio + 1,
                    tipo: Token.Nada
                });
            }
        }
    }
}

export function parseCualquierMenosP<A>(parserAEvitar: Parser<A>): Parser<string> {
    return function (entrada, inicio) {
        if (entrada === "" || inicio >= entrada.length) {
            return new ErrorRes("Entrada terminada");
        } else {
            const resultado = run(parserAEvitar, entrada, inicio);
            if (resultado instanceof ErrorRes) {
                return new ExitoRes({
                    res: entrada.substring(inicio, inicio + 1),
                    posInicio: inicio,
                    posFinal: inicio + 1,
                    tipo: Token.Nada
                });
            } else {
                return new ErrorRes("Parser cumplido");
            }
        }
    }
}

export function ignorarParserDerecho<A, B>(p1: Parser<A>, p2: Parser<B>) {
    return mapP(([a, _]: [A, B]) => a, parseLuego(p1, p2));
}

export function ignorarParserIzquierdo<A, B>(p1: Parser<A>, p2: Parser<B>) {
    return mapP(([_, b]: [A, B]) => b, parseLuego(p1, p2));
}

export function between<A, B, C>(p1: Parser<A>, p2: Parser<B>, p3: Parser<C>): Parser<B> {
    return ignorarParserDerecho(ignorarParserIzquierdo(p1, p2), p3);
}

export function parseVariasOpciones<A>(parsers: Array<Parser<A>>): Parser<A> {
    return function (entrada, inicio) {
        const inner2 = (parsers: Array<Parser<A>>): Resultado<A> => {
            if (parsers.length === 0) {
                return new ErrorRes("Ningun parser se adapta a la entrada.");
            } else {
                const [p, ...ps] = parsers;
                const resultado = run(p, entrada, inicio);

                if (resultado instanceof ExitoRes) return resultado;
                else return inner2(ps);
            }
        };

        return inner2(parsers);
    }
}

export function mapTipo<A>(parser: Parser<A>, nuevoTipo: Token): Parser<A> {
    return function (entrada, inicio) {
        const res = run(parser, entrada, inicio);

        if (res instanceof ExitoRes) {
            return new ExitoRes({
                res: res.exito.res,
                posInicio: res.exito.posInicio,
                posFinal: res.exito.posFinal,
                tipo: nuevoTipo
            });
        } else {
            return res;
        }
    }
}
