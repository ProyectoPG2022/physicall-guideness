import {
  AfterContentChecked,
  AfterViewChecked,
  Component,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Archivo } from '../interfaces/archivo.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit, AfterViewChecked {
  /*

A la hora de concertar la cita hay que sacar el id del viajero que la solicita y la del guia al que se le solicita,
meter en la array del viajero el marcador/sitio 

Sólo con estos datos ya que son los únicos visibles en la card de sitios visitados/asignados como guía
datos:Marcador={
  ciudad:"Ciudad",
  pais:"El que sea",
  descripcion:"asdsd"
}
el usuarioo la variable xD.sitios.push(datos)


*/

  user$$: Observable<any> = this.authSvc.afAuth.user;

  private image: Archivo;
  public currentImage = './assets/images/user.png';

  public userType;
  public userPlaces;
  public userUid;
  public paragraph;
  private newSliderValue;
  public userLogged;
  public userComents;

  constructor(private authSvc: AuthService, private router: Router) {}

  ngAfterViewChecked(): void {
    const element = document.getElementById('starsContainer');
    if (element) {
      this.fillStars();
    }
  }

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
      this.userLogged = user;
    });
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
      this.userPlaces = user.sitios;
      this.userComents =user.coments;

      const slider = document.getElementById('slider');
      if (slider) {
        slider.setAttribute('value', user.populationControl);
      }

      if (user.photo != '') {
        this.currentImage = user.photo;
      }
      this.profileForm.patchValue({
        username: user.username,
        email: user.email,
        biografia: user.biografia,
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
        input: 'select',
        inputOptions: {
          hola: "adios",
          hastaluego: "Buenastardes"
        }
        
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

  public fillStars(): void {
    if (this.userLogged.type == 'Guía') {
      const rating = this.userLogged.valoracionMedia;

      for (let j = 1; j <= rating; j++) {
        document.getElementById(j + 'star').style.color = 'orange';
      }

      if (!this.paragraph) {
        this.paragraph = document
          .getElementById('starsContainer')
          .appendChild(document.createElement('p'));
        this.paragraph.textContent = '' + rating;
      }
    }
  }
}
