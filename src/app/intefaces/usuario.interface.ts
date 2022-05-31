import { Marcador } from "./marcador.interface";

export interface Usuario {
    uid: string;
    email?: string,
    emailVerified?: boolean,
    username?: string,
    biografia?: string,
    type?: string,
    photo?: string,
    sitios?: string[],
    populationControl:number
}