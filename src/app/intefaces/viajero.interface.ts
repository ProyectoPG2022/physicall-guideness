import { Sitio } from "./sitio.interface";
import { Usuario } from "./usuario.interface";

export interface Viajero extends Usuario{
    sitios :Sitio [];
}