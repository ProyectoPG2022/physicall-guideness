import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  Component,
  OnInit,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';
import { Comentario } from '../intefaces/comentario.interface';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.page.html',
  styleUrls: ['./public-profile.page.scss'],
})
export class PublicProfilePage implements OnInit, AfterViewChecked {
  userGuia$: Observable<any>;
  userLogged$: Observable<any> = this.authSvc.user$;

  private userLogged;
  public userProfile;
  public paragraph;
  public userPlaces;
  public userType;
  public userComents;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {}
  ngAfterViewChecked(): void {
    const element = document.getElementById('starsContainer');
    if (element) {
      this.fillStars();
    }
  }

  ngOnInit() {
    //Sacamos el guia de la bd
    const id = this.route.snapshot.params.id;
    this.userGuia$ = this.authSvc.getOne(id);

    //Le hacemos un subscribe para sacar sus datos a una variable
    this.userGuia$.subscribe((user) => {
      this.userProfile = user;
      this.userPlaces = user.sitios;
      this.userComents = user.coments;
    });
    //Le hacemos un subscribe para sacar sus datos a una variable
    this.userLogged$.subscribe((user) => (this.userLogged = user));
  }

  onComent() {
    const body = document.getElementsByTagName('body')[0];
    Swal.fire({
      title: '¿Que tal tu experiencia con el/la guía?',
      input: 'textarea',
      confirmButtonText: 'Comentar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value != '') {
          this.saveComent(result.value);
        } else {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: '!El campo del comentario no puede estar vacío!',
            text: 'Por favor, rellene el campo',
          });
          body.classList.remove('swal2-height-auto');
        }
      }
    });
    body.classList.remove('swal2-height-auto');
  }

  private saveComent(coment: string) {
    try {
      if (coment != '') {
        const com: Comentario = {
          date: new Date().toLocaleString(),
          message: coment,
          userUid: this.userLogged.uid,
          userUsername: this.userLogged.username,
        };

        this.userProfile.coments.push(com);

        this.afs
          .doc(`usuarios/${this.userProfile.uid}`)
          .update({ coments: this.userProfile.coments });
      }
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Por favor, vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }
  public fillStars(): void {
    if (this.userProfile.type == 'Guía') {
      const rating = this.userProfile.valoracionMedia;

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
