export interface Usuario {
    uid: string,
    email?: string,
    emailVerified?: boolean,
    username?: string,
    biografia?: string,
    type?: string,
    photo?: string,
    sitios?: string[],
    control_poblacion?:number
}