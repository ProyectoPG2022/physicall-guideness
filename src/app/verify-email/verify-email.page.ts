import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnDestroy {
  user$: Observable<any> = this.authSvc.afAuth.user;

  constructor(private authSvc: AuthService, private router: Router) {}

  async onSendEmail(): Promise<void> {
    try {
      await this.authSvc.sendVerificationEmail();
      this.router.navigate(['login']);
    } catch (error) {
      //console.log(error);
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Error al enviar email de verificación, por favor vuelva a intentarlo en otro momento :(',
      });
      //No borar, po lo que dios mas quiera
      //Chapuza que resuelve/quita la clase de altura del sweetalert pq no se veia
      body.classList.remove('swal2-height-auto');

      this.router.navigate(['login']);
    }
  }
  onGoHome() {
    this.authSvc.logout();
    this.router.navigate(['home']);
  }
  ngOnDestroy(): void {
    this.authSvc.logout();
  }
}
