export interface Mensaje {
    idEmisor: string
    idReceptor: string
    idSitio: string
    fecha: string
    texto: string
    peticion: boolean
    pendiente?: boolean
    aceptada?: boolean
}