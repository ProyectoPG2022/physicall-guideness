import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  constructor(private authSvc: AuthService, private router: Router) {}

  ngOnInit() {}
  async onRegister(email, password, username, biografia, tipo, passwordCheck) {
    try {
      if (username.value == '') {
        const error = { code: 'auth/invalid-username' };
        throw error;
      }
      if (password.value != passwordCheck.value) {
        const error = { code: 'auth/password-doesnt-match' };
        throw error;
      }
      const user = await this.authSvc.register(
        email.value,
        password.value,
        username.value,
        biografia.value,
        tipo.value
      );
      if (user) {
        const isVerified = await this.authSvc.isEmailVerified(user);
        //const isFirstTime=this.authSvc.isFirstTime(user);
        this.redirectUser(isVerified);
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/weak-password': {
          let password = document.getElementById('pass');
          //Revisar
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'La contraseña debe tener 6 carácteres como mínimo',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve/quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/invalid-email': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El correo no es correcto o no está bien formateado',
            footer: 'Ejemplo de formato: correo@algo.com',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/internal-error': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/invalid-username': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Por favor, elige un nombre de usuario',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/password-doesnt-match': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Las contraseñas no coinciden',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/email-already-in-use': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El email proporcionado está en uso por otra cuenta',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        default: {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Por favor vuelva a intentarlo en otro momento :(',
          });
          body.classList.remove('swal2-height-auto');
          break;
        }
      }
    }
  }
  private redirectUser(isVerified: boolean): void {
    if (isVerified) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }
}
