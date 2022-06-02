import { Component, Input, OnInit } from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core'; // Para poder poner un componente en un popup
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Usuario } from '../intefaces/usuario.interface';
import { Viajero } from '../intefaces/viajero.interface';
import { UsuariosService } from '../usuarios.service';
import Swal from 'sweetalert2';
import { Marcador } from '../intefaces/marcador.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {

  user$: Observable<Viajero> = this.authSvc.user$;
  usuLogged: Usuario
  @Input() titulo = 'Default tittle.'
  @Input() guias: string[] = []
  @Input() marcador: Marcador
  guiasPopup: Usuario[] = []

  constructor(
    private resolver: ComponentFactoryResolver,
    public userService: UsuariosService,
    private authSvc: AuthService,
    private afs: AngularFirestore) {
    this.user$.subscribe((usuario) => {
      this.usuLogged = usuario
    })
  }

  async ngOnInit() {
    this.guias.forEach(uidGuia => {
      this.userService.getUser(uidGuia).subscribe((usu: Usuario) => {
        this.guiasPopup.push(usu)
      })
    })
  }

  isGuiaInPopup(useruid: string) {
    var bool_esta = false
    this.guiasPopup.forEach((guia) => {
      if (guia.uid == useruid) {
        bool_esta = true
      }
    })
    return bool_esta
  }

  pedirCita(event) {
    console.log("Pedir cita: " + event)
    // El viajero pide la cita.
    // Se manda un mensaje al viajero con la información de la cita
    // Se manda otro mensaje al Guía
    // El guia acepta la cita:
    //    - Se manda un mensaje al viajero y otro al guía de cita aceptada
    // El guia rechaza:
    //    - Se manda un mensaje al viajero y otro al guía de cita rechazada
  }

  agregarAlSitio(event) {
    const body = document.getElementsByTagName('body')[0];
    Swal.fire({
      title: '¿Quiere agregarse como guía a este sitio?',
      text: `${this.marcador.ciudad} / ${this.marcador.pais}`,
      icon: 'question',
      showDenyButton: true,
      denyButtonText: 'No',
      confirmButtonText: 'Si',
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("Usuario uid: " + this.usuLogged.uid)
        console.log("Marcador actual: " + this.marcador.uid)

        const marcRef = this.afs.collection<Marcador>('marcadores')
          .doc(`${this.marcador.uid}`)

        this.guias.push(this.usuLogged.uid)

        marcRef.update({
          guias: this.guias
        })

      } else if (result.isDenied) {
        const body = document.getElementsByTagName('body')[0];
        Swal.fire('Operación cancelada', '', 'info')
        body.classList.remove('swal2-height-auto');
      }
    }).catch((error) => {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire('Ha ocurrido un error durante la operación', '', 'warning')
      body.classList.remove('swal2-height-auto');
      console.error(error)
    })
    body.classList.remove('swal2-height-auto');
  }

}
