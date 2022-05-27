import { Component, Input, OnInit } from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core'; // Para poder poner un componente en un popup
import { Guia } from '../intefaces/guia.interface';
import { Marcador } from '../intefaces/marcador.interface';
import { Usuario } from '../intefaces/usuario.interface';
import { UsuariosService } from '../usuarios.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {

  @Input() titulo = 'Default tittle.'
  @Input() guias: string[] = []
  guiasPopup:Usuario[] = []
  constructor(private resolver: ComponentFactoryResolver, public userService: UsuariosService) {

  }

  async ngOnInit() {
    this.guias.forEach(uidGuia => {
      this.userService.getUser(uidGuia).subscribe((usu:Usuario) => {
        this.guiasPopup.push(usu)
      })
    })
    
  }

}
