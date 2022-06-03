import { Comentario } from "./comentario.interface";
import { Marcador } from "./marcador.interface";
import { Usuario } from "./usuario.interface";

export interface Guia extends Usuario{
    valoracionMedia:number;
    coments:Comentario[];
}