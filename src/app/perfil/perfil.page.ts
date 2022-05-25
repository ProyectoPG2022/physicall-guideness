import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Usuario } from '../intefaces/usuario.interface';
import { Archivo } from '../intefaces/archivo.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user$$: Observable<any> = this.authSvc.afAuth.user;

  public image: Archivo;
  public currentImage =
    './assets/user.png'; /*'https://picsum.photos/id/113/150/150';*/
  private generalUser;
  public userType;
  public userPlaces;
  public userUid;

  constructor(private authSvc: AuthService, private router: Router) {}

  public profileForm = new FormGroup({
    username: new FormControl('', Validators.required),
    biografia: new FormControl('', Validators.required),
    email: new FormControl({ value: '', disabled: true }, Validators.required),
    photo: new FormControl('', Validators.required),
    uid: new FormControl('', Validators.required),
  });
  ngOnInit() {
    this.authSvc.user$.subscribe((user) => this.initFormValues(user));
  }

  onSaveUser(user: any): void {
    //console.log('usuario auth', user.uid);
    const body = document.getElementsByTagName('body')[0];

    Swal.fire({
      title: '¿Quieres guardar los cambios?',
      showDenyButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Guardar',
      denyButtonText: `No guardar`,
    }).then((result) => {
      if (result.isConfirmed) {
        if (user.photo == '') {
          user.photo = this.currentImage;
        }
        this.authSvc.preSaveUserProfile(user, this.image);
        //La foto se actualiza sola en unos segundos, pero quizás no, en caso de detectar que no se actualiza
        //descomentar la linea de abajo
        //window.location.reload();
        const body = document.getElementsByTagName('body')[0];
        Swal.fire('Datos guardados!', '', 'success');
        body.classList.remove('swal2-height-auto');
      } else if (result.isDenied) {
        const body = document.getElementsByTagName('body')[0];
        Swal.fire('Los cambios no se han guardado', '', 'info');
        body.classList.remove('swal2-height-auto');
      } else if (result.isDismissed) {
        this.authSvc.user$.subscribe((user) => this.initFormValues(user));
      }
    });
    body.classList.remove('swal2-height-auto');
  }
  private initFormValues(user: any): void {
    this.generalUser = user;
    this.userUid = user.uid;
    this.userType = user.type;
    if (user.type == 'Viajero') {
      this.userPlaces = user.sitios;
      console.log(this.userPlaces);
    } else {
      const rating = user.valoracionMedia;

      for (let i = 1; i <= rating; i++) {
        document.getElementById(i + 'star').style.color = 'orange';
      }
      let paragraph = document
        .getElementById('starsContainer')
        .appendChild(document.createElement('p'));
      paragraph.textContent = '' + rating;
    }

    if (user.photo != '') {
      this.currentImage = user.photo;
    }
    this.profileForm.patchValue({
      username: user.username,
      email: user.email,
      biografia: user.biografia,
      //photo: user.photo,
      uid: user.uid,
    });
  }
  handleImage($event): void {
    this.image = $event.target.files[0];
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
          this.router.navigate(['home']);
          this.authSvc.logout();

          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'success',
            text: 'Se ha cerrado sesión correctamente',
          });
          body.classList.remove('swal2-height-auto');
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
