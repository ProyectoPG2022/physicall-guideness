import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Usuario } from '../intefaces/usuario.interface';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user$$: Observable<any>=this.authSvc.afAuth.user;
  constructor(private authSvc: AuthService) {}

  public profileForm = new FormGroup({
    username: new FormControl('', Validators.required),
    biografia: new FormControl('', Validators.required),
    email: new FormControl({ value: '', disabled: true }, Validators.required),
    photo: new FormControl('', Validators.required),
    uid:new FormControl('',Validators.required)
  });
  ngOnInit() {
    this.authSvc.user$.subscribe((user) => this.initFormValues(user));
  }

  onSaveUser(user:Usuario):void{
    console.log('usuario auth', user.uid)
    this.authSvc.saveUserProfile(user);
  }
  private initFormValues(user: Usuario): void {
    this.profileForm.patchValue({
      username: user.username,
      email: user.email,
      biografia: user.biografia,
      photo: user.photo,
      uid:user.uid
    });
  }
  onLogOut(){
    this.authSvc.logout();
  }
}
