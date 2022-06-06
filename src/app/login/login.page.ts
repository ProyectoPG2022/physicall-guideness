import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private authSvc: AuthService,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {}
  async onLogin(email, password) {
    try {
      const user = await this.authSvc.login(email.value, password.value);

      if (user) {
        const isVerified = await this.authSvc.isEmailVerified(user);
        this.redirectUser(isVerified);
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El usuario no existe',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/wrong-password': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Contraseña incorrecta',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/invalid-email': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El correo no es correcto, no está bien formateado o no existe',
            footer: 'Ejemplo de formato: correo@algo.com',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/internal-error': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Por favor, intentelo de nuevo',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
        default: {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Error al iniciar sesión, por favor vuelva a intentarlo en otro momento :(',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
      }
    }
  }

  /*async onLoginGoogle(){
    try{
      const user = await this.authSvc.loginGoogle();
      if(user){
        const isVerified=this.authSvc.isEmailVerified(user);
        this.redirectUser(isVerified);
        //Todo: Chekemail
      }
    }catch(error){
      console.log(error);
    };
  }*/
  private redirectUser(isVerified: boolean) {
    if (isVerified) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }
}
