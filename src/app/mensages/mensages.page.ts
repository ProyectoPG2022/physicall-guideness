import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Mensaje } from '../interfaces/mensaje.interface';
import { Viajero } from '../interfaces/viajero.interface';
import { AuthService } from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { merge } from 'jquery';

@Component({
  selector: 'app-mensages',
  templateUrl: './mensages.page.html',
  styleUrls: ['./mensages.page.scss'],
})
export class MensagesPage implements OnInit {
  user$: Observable<Viajero> = this.authSvc.user$;
  usuLogged: any;
  mensajesOG: Mensaje[] = [];
  mensajesFiltrados: Mensaje[] = [];
  private userEmisor;

  constructor(
    private authSvc: AuthService,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$.subscribe((usuario) => {
      this.usuLogged = usuario;
      this.recuperarMensajes();
    });
  }

  ngOnInit() {}

  async onAcept(mensaje: Mensaje) {
    try {
      const body = document.getElementsByTagName('body')[0];

      Swal.fire({
        title: '¿Estas seguro que quieres aceptar la cita?',
        text: 'Una vez aceptada no se puede cancelar',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar cita',
      }).then((result) => {
        if (result.isConfirmed) {
          //Buscamos el emisor del mensaje para despues poder añadirle el lugar a su array

          this.afs
            .doc(`usuarios/${mensaje.idEmisor}`)
            .valueChanges()
            .subscribe((user) => {
              this.userEmisor = user;
            });

          //Actualizamos la petición a aceptada
          const message: Mensaje = {
            idEmisor: mensaje.idEmisor,
            idReceptor: mensaje.idReceptor,
            idSitio: mensaje.idSitio,
            fecha: mensaje.fecha,
            texto: mensaje.texto,
            peticion: mensaje.peticion,
            aceptada: true,
            pendiente: false,
            uid: mensaje.uid,
          };
          const messageRef: AngularFirestoreDocument<Mensaje> = this.afs.doc(
            `mensajes/${mensaje.uid}`
          );

          messageRef.update(message).then(() => {
            //Mandamos un mensaje al viajero q la petición ha sido aceptada
            const uidAceptMessageViajero = uuidv4();
            const aceptMessageViajero: Mensaje = {
              idEmisor: 'PhysicallGuideness',
              idReceptor: mensaje.idEmisor,
              idSitio: mensaje.idSitio,
              fecha: new Date().toLocaleDateString(),
              texto: `El guía ${this.usuLogged.username} ha aceptado tu petición enviada el día: ${mensaje.fecha}`,
              peticion: false,
              uid: uidAceptMessageViajero,
            };
            const messageAceptRef: AngularFirestoreDocument<Mensaje> =
              this.afs.doc(`mensajes/${uidAceptMessageViajero}`);
            //Mostrar un sweetalert de aviso
            messageAceptRef
              .set(aceptMessageViajero, { merge: true })
              .then(() => {
                //Enviamos una notificación al guía

                const uidAceptMessageGuia = uuidv4();
                const aceptMessageGuia: Mensaje = {
                  idEmisor: 'PhysicallGuideness',
                  idReceptor: this.usuLogged.uid,
                  idSitio: mensaje.idSitio,
                  fecha: new Date().toLocaleDateString(),
                  texto: `Has aceptado la petición de ${this.userEmisor.username}`,
                  peticion: false,
                  uid: uidAceptMessageGuia,
                };
                const messageAceptRefGuia: AngularFirestoreDocument<Mensaje> =
                  this.afs.doc(`mensajes/${uidAceptMessageGuia}`);
                //Mostrar un sweetalert de aviso
                messageAceptRefGuia
                  .set(aceptMessageGuia, { merge: true })
                  .then(() => {
                    this.userEmisor.sitios.push(mensaje.idSitio);
                    this.afs
                      .doc(`usuarios/${mensaje.idEmisor}`)
                      .update({ sitios: this.userEmisor.sitios })
                      .then(() => {
                        const body = document.getElementsByTagName('body')[0];
                        Swal.fire({
                          icon: 'success',
                          text: 'Se ha aceptado la petición',
                        });
                        body.classList.remove('swal2-height-auto');
                      });
                  });
              });
          });
        }
      });
      body.classList.remove('swal2-height-auto');
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        text: 'Error al aceptar la cita, por favor vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }
  async onDismiss(mensaje: Mensaje) {
    try {
      const body = document.getElementsByTagName('body')[0];

      Swal.fire({
        title: '¿Estas seguro que quieres rechazar la cita?',
        text: 'Una vez rechazada no se puede cancelar',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Rechazar cita',
      }).then((result) => {
        if (result.isConfirmed) {
          //Actualizamos la petición a aceptada
          const message: Mensaje = {
            idEmisor: mensaje.idEmisor,
            idReceptor: mensaje.idReceptor,
            idSitio: mensaje.idSitio,
            fecha: mensaje.fecha,
            texto: mensaje.texto,
            peticion: mensaje.peticion,
            aceptada: false,
            pendiente: false,
            uid: mensaje.uid,
          };
          const messageRef: AngularFirestoreDocument<Mensaje> = this.afs.doc(
            `mensajes/${mensaje.uid}`
          );

          messageRef.update(message).then(() => {
            //Mandamos un mensaje al viajero q la petición ha sido rechazada
            const uidDismissMessageViajero = uuidv4();
            const dismissMessageViajero: Mensaje = {
              idEmisor: 'PhysicallGuideness',
              idReceptor: mensaje.idEmisor,
              idSitio: mensaje.idSitio,
              fecha: new Date().toLocaleDateString(),
              texto: `El guía ${this.usuLogged.username} ha rechazado tu petición enviada el día: ${mensaje.fecha}`,
              peticion: false,
              uid: uidDismissMessageViajero,
            };
            const messageDismissRef: AngularFirestoreDocument<Mensaje> =
              this.afs.doc(`mensajes/${uidDismissMessageViajero}`);
            //Mostrar un sweetalert de aviso
            messageDismissRef
              .set(dismissMessageViajero, { merge: true })
              .then(() => {
                //Enviamos una notificación al guía

                const uidDismissMessageGuia = uuidv4();
                const dismissMessageGuia: Mensaje = {
                  idEmisor: 'PhysicallGuideness',
                  idReceptor: this.usuLogged.uid,
                  idSitio: mensaje.idSitio,
                  fecha: new Date().toLocaleDateString(),
                  texto: `Has aceptado la petición de ${this.userEmisor.username}`,
                  peticion: false,
                  uid: uidDismissMessageGuia,
                };
                const messageDismissRefGuia: AngularFirestoreDocument<Mensaje> =
                  this.afs.doc(`mensajes/${uidDismissMessageGuia}`);
                //Mostrar un sweetalert de aviso
                messageDismissRefGuia
                  .set(dismissMessageGuia, { merge: true })
                  .then(() => {
                    const body = document.getElementsByTagName('body')[0];
                    Swal.fire({
                      icon: 'success',
                      text: 'Se ha rechazado la petición',
                    });
                    body.classList.remove('swal2-height-auto');
                  });
              });
          });
        }
      });
      body.classList.remove('swal2-height-auto');
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        text: 'Error al rechazar la cita, por favor vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }

  recuperarMensajes() {
    this.afs
      .collection<Mensaje>('mensajes')
      .valueChanges()
      .subscribe((res) => {
        this.mensajesOG = [];
        res.forEach((mens) => {
          if (
            mens.idEmisor == this.usuLogged.uid ||
            mens.idReceptor == this.usuLogged.uid
          ) {
            this.mensajesOG.push(mens);
          }
        });
        this.mensajesFiltrados = this.mensajesOG;
      });
  }

  getNotificaciones() {
    this.mensajesFiltrados = this.mensajesOG.filter((mens) =>
      mens.idEmisor.includes('PhysicallGuideness')
    );
  }

  getPeticiones() {
    this.mensajesFiltrados = this.mensajesOG.filter((mens) => mens.peticion);
  }

  onLogOut() {
    try {
      const body = document.getElementsByTagName('body')[0];

      Swal.fire({
        title: '¿Estas seguro?',
        text: 'Una vez cerrada sesión habrá que volver a iniciar sesión',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cerrar sesión',
      }).then((result) => {
        if (result.isConfirmed) {
          this.authSvc.logout();

          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'success',
            text: 'Se ha cerrado sesión correctamente',
          });
          body.classList.remove('swal2-height-auto');

          this.router.navigate(['login']);
        }
      });
      body.classList.remove('swal2-height-auto');
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Ha ocurrido un error al cerrar sesión',
        text: 'Por favor, vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }
}
