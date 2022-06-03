import { Component, Input, OnInit } from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core'; // Para poder poner un componente en un popup
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../interfaces/usuario.interface';
import { Viajero } from '../interfaces/viajero.interface';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';
import { Marcador } from '../interfaces/marcador.interface';
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
  @Input() ciudad: boolean
  guiasPopup: Usuario[] = []
  inputOptions:{}

  constructor(
    private resolver: ComponentFactoryResolver,
    public userService: UsuariosService,
    private authSvc: AuthService,
    private afs: AngularFirestore) {
    this.user$.subscribe((usuario) => {
      this.usuLogged = usuario
    })

    this.guias.forEach((guiaUid) => {
      this.userService.getUser(guiaUid).subscribe((usu: Usuario) => {
        var newUser = `${usu.uid}`
        this.inputOptions[newUser] = usu.username
      })
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


  // El viajero pide la cita.
  // Se manda un mensaje al viajero con la información de la cita
  // Se manda otro mensaje al Guía
  // El guia acepta la cita:
  //    - Se manda un mensaje al viajero y otro al guía de cita aceptada
  // El guia rechaza:
  //    - Se manda un mensaje al viajero y otro al guía de cita rechazada
  async pedirCita(event) {

    if(this.inputOptions) {
      console.log("inputOptions: " + JSON.stringify(this.inputOptions))

      const body = document.getElementsByTagName('body')[0];
      await Swal.fire({
        title: 'Solicitar un encuentro',
        input: 'select',
        inputPlaceholder: 'Seleccione un guía',
        inputOptions: this.inputOptions,
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve(value)
            } else {
              resolve('Necesitas seleccionar un guía!')
            }
          })
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const body = document.getElementsByTagName('body')[0];
          console.log("guia seleccionado: "+result.value)
          Swal.fire('Operación aceptada', '', 'success')
          body.classList.remove('swal2-height-auto');
        }
      })
      body.classList.remove('swal2-height-auto');
    }
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
