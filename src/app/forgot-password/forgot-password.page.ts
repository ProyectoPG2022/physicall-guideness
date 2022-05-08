import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  constructor(private authSvc: AuthService, private router: Router) {}

  ngOnInit() {}
  async onResetPassword(email, emailCheck) {
    try {
      if (email.value == '' || emailCheck.value == '') {
        const error = { code: 'auth/email-fields-empty' };
        throw error;
      }
      if (email.value != emailCheck.value) {
        const error = { code: 'auth/email-doesnt-match' };
        throw error;
      }
      await this.authSvc.resetPassword(email.value);
      //Reiniciamos el formulario
      const correo = document.getElementsByTagName('form')[0];
      correo.reset();
      this.router.navigate(['/login']);
    } catch (error) {
      //console.log(error);
      //Reiniciamos el formulario
      const correo = document.getElementsByTagName('form')[0];
      correo.reset();
      switch (error.code) {
        case 'auth/user-not-found': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El usuario no existe',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/email-doesnt-match': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Los correos electronicos no coincden',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
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
        case 'auth/email-fields-empty': {
          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El correo y su comprobación son requeridos',
          });
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
      }
    }
  }
  async onGoHome() {
    await this.router.navigate(['home']);
  }
}
