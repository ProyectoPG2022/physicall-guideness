import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Usuario } from '../intefaces/usuario.interface';
import { Archivo } from '../intefaces/archivo.interface';
import Swal from 'sweetalert2';
import { AngularDelegate } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user$$: Observable<any> = this.authSvc.afAuth.user;

  public image: Archivo;
  public currentImage = 'https://picsum.photos/id/113/150/150';

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

  onSaveUser(user: Usuario): void {
    console.log('usuario auth', user.uid);
    this.authSvc.preSaveUserProfile(user, this.image);
  }
  private initFormValues(user: Usuario): void {
    if (user.photo != "") {
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
    this.router.navigate(['home']);
    this.authSvc.logout();
    const body = document.getElementsByTagName('body')[0];
    Swal.fire({
      icon: 'success',
      title: 'Se ha cerrado sesión correctamente',
    });
    body.classList.remove('swal2-height-auto');
  }
}
