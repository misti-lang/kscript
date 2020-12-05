import { flujo2 } from "./Utils/flujos";

export const compilar = (codigo: string) => {
    return flujo2(codigo, null);
};
