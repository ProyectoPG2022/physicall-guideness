import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Usuario } from '../intefaces/usuario.interface';
import { Archivo } from '../intefaces/archivo.interface';
import Swal from 'sweetalert2';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Guia } from '../intefaces/guia.interface';
import { filter, windowTime } from 'rxjs/operators';
import { loadavg } from 'os';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user$$: Observable<any> = this.authSvc.afAuth.user;

  public image: Archivo;
  public currentImage = './assets/images/user.png';

  public userType;
  public userPlaces;
  public userUid;
  public paragraph;
  private newSliderValue;
  public userLogged;

  constructor(private authSvc: AuthService, private router: Router) {}

  public profileForm = new FormGroup({
    username: new FormControl('', Validators.required),
    biografia: new FormControl('', Validators.required),
    email: new FormControl({ value: '', disabled: true }, Validators.required),
    photo: new FormControl('', Validators.required),
    uid: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.authSvc.user$.subscribe((user) => {
      this.initFormValues(user);
    });
  }

  private fillStars(/*user: any*/): void {
    const rating = this.userLogged.valoracionMedia;
    for (let i = 1; i <= rating; i++) {
      document.getElementById(i + 'star').style.color = 'orange';
    }

    if (!this.paragraph) {
      this.paragraph = document
        .getElementById('starsContainer')
        .appendChild(document.createElement('p'));
      this.paragraph.textContent = '' + rating;
    }
  }
  public updateValue($event) {
    this.newSliderValue = $event.target.value;
  }

  onSaveUser(user: any): void {
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

        user.populationControl = this.newSliderValue;

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

  private async initFormValues(user: any) {
    if (user) {
      this.userUid = user.uid;
      this.userType = user.type;
      this.userLogged = user;

      const slider = document.getElementById('slider');
      slider.setAttribute('value', user.populationControl);

      if (user.type == 'Viajero') {
        this.userPlaces = user.sitios;
        //console.log(this.userPlaces);
      } else if (user.type == 'Guía') {
        this.userPlaces = user.sitios;
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
