import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Mensaje } from '../interfaces/mensaje.interface';
import { Viajero } from '../interfaces/viajero.interface';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mensages',
  templateUrl: './mensages.page.html',
  styleUrls: ['./mensages.page.scss'],
})
export class MensagesPage implements OnInit {

  user$: Observable<Viajero> = this.authSvc.user$;
  usuLogged: any;
  mensajesOG: Mensaje[] = []
  mensajesFiltrados: Mensaje[] = []


  constructor(
    private authSvc: AuthService,
    private afs: AngularFirestore,
    private router: Router) {
    this.user$.subscribe((usuario) => {
      this.usuLogged = usuario
      this.recuperarMensajes()
    })
  }

  ngOnInit() {

  }

  recuperarMensajes() {
    this.afs.collection<Mensaje>('mensajes').valueChanges().subscribe((res) => {
      this.mensajesOG = []
      res.forEach((mens) => {
        if (mens.idEmisor == this.usuLogged.uid || mens.idReceptor == this.usuLogged.uid) {
          this.mensajesOG.push(mens)
        }
      })
      this.mensajesFiltrados = this.mensajesOG
    })
  }

  getNotificaciones() {
    this.mensajesFiltrados = this.mensajesOG.filter(mens => mens.idEmisor.includes('PhysicallGuideness'))
  }

  getPeticiones() {
    this.mensajesFiltrados = this.mensajesOG.filter(mens => mens.peticion)
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
