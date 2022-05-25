import { Sitio } from "./sitio.interface";
import { Usuario } from "./usuario.interface";

export interface Guia extends Usuario{
    valoracionMedia:number;
}