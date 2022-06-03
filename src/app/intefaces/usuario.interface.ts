export interface Usuario {
    uid: string,
    email?: string,
    emailVerified?: boolean,
    username?: string,
    biografia?: string,
    type?: string,
    photo?: string,
    sitios?: string[],
    populationControl?:number
}