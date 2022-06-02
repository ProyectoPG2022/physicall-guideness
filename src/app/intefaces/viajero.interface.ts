import { Marcador } from "./marcador.interface";
import { Usuario } from "./usuario.interface";

export interface Viajero extends Usuario{
    control_poblacion?:number
}