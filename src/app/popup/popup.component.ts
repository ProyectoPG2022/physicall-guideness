import { Component, Input, OnInit } from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core'; // Para poder poner un componente en un popup
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../interfaces/usuario.interface';
import { Viajero } from '../interfaces/viajero.interface';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';
import { Marcador } from '../interfaces/marcador.interface';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Mensaje } from '../interfaces/mensaje.interface';
import { v4 as uuidv4 } from 'uuid';

interface InputOptions {
  uid: string;
  username: string;
}

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  user$: Observable<Viajero> = this.authSvc.user$;
  usuLogged: Usuario;
  @Input() titulo = 'Default tittle.';
  @Input() guias: string[] = [];
  @Input() marcador: Marcador;
  @Input() ciudad: boolean;
  guiasPopup: Usuario[] = [];
  public inputOptions: {} = {};
  newUser: Usuario;

  constructor(
    private resolver: ComponentFactoryResolver,
    public userService: UsuariosService,
    private authSvc: AuthService,
    private afs: AngularFirestore
  ) {
    this.user$.subscribe((usuario) => {
      this.usuLogged = usuario;
    });
  }

  async ngOnInit() {
    this.guias.forEach((uidGuia, index) => {
      this.userService.getUser(uidGuia).subscribe((usu: Usuario) => {
        this.guiasPopup.push(usu);
      });
    });
  }

  isGuiaInPopup(useruid: string) {
    var bool_esta = false;
    this.guiasPopup.forEach((guia) => {
      if (guia.uid == useruid) {
        bool_esta = true;
      }
    });
    return bool_esta;
  }

  // El viajero pide la cita.
  // Se manda un mensaje al viajero con la información de la cita
  // Se manda otro mensaje al Guía
  // El guia acepta la cita:
  //    - Se manda un mensaje al viajero y otro al guía de cita aceptada
  // El guia rechaza:
  //    - Se manda un mensaje al viajero y otro al guía de cita rechazada
  
  async pedirCita(event) {
    var options = {};
    $.map(this.guiasPopup, function (o) {
      options[o.uid] = o.username;
    });
    if (this.inputOptions) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        title: 'Solicitar un encuentro',
        input: 'select',
        inputPlaceholder: 'Seleccione un guía',
        inputOptions: options,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const date = new Date();
          date.setDate(date.getDate() + 2);
          const uidMensaje1 = uuidv4();
          const uidMensaje2 = uuidv4();

          const mensaje: Mensaje = {
            idEmisor: this.usuLogged.uid,
            idReceptor: result.value,
            idSitio: this.marcador.uid,
            fecha: new Date().toLocaleDateString(),
            peticion: true,
            pendiente: true,
            aceptada: false,
            uid: uidMensaje1,
            texto: `Esta es una petición para poder vernos en ${
              this.marcador.descripcion
            } el día: ${date.toLocaleDateString()}. Fdo: ${
              this.usuLogged.username
            }`,
          };

          const mensaje2: Mensaje = {
            idEmisor: 'PhysicallGuideness',
            idReceptor: this.usuLogged.uid,
            idSitio: this.marcador.uid,
            fecha: new Date().toLocaleDateString(),
            peticion: false,
            uid: uidMensaje2,
            texto: `Se ha enviado una petición al guía ${
              options[result.value]
            } para vernos en ${
              this.marcador.descripcion
            } el día: ${date.toLocaleDateString()}`,
          };
          const messageRef: AngularFirestoreDocument<Mensaje> = this.afs.doc(
            `mensajes/${uidMensaje1}`
          );

          messageRef.set(mensaje, { merge: true }).then(() => {
            const message2Ref: AngularFirestoreDocument<Mensaje> = this.afs.doc(
              `mensajes/${uidMensaje2}`
            );

            message2Ref.set(mensaje2, { merge: true }).then(() => {
              const body = document.getElementsByTagName('body')[0];
              Swal.fire('Operación aceptada', '', 'success');
              body.classList.remove('swal2-height-auto');
            });
          });
          /*this.afs
            .collection<Mensaje>('mensajes')
            .add(mensaje)
            .then(() => {
              this.afs
                .collection<Mensaje>('mensajes')
                .add(mensaje2)
                .then(() => {
                  const body = document.getElementsByTagName('body')[0];
                  Swal.fire('Operación aceptada', '', 'success');
                  body.classList.remove('swal2-height-auto');
                });
            });*/
        }
      });
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
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          const marcRef = this.afs
            .collection<Marcador>('marcadores')
            .doc(`${this.marcador.uid}`);

          this.guias.push(this.usuLogged.uid);

          marcRef.update({
            guias: this.guias,
          });
        } else if (result.isDenied) {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire('Operación cancelada', '', 'info');
          body.classList.remove('swal2-height-auto');
        }
      })
      .catch((error) => {
        const body = document.getElementsByTagName('body')[0];
        Swal.fire('Ha ocurrido un error durante la operación', '', 'warning');
        body.classList.remove('swal2-height-auto');
        console.error(error);
      });
    body.classList.remove('swal2-height-auto');
  }
}
