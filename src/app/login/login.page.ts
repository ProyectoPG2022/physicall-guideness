import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private authSvc:AuthService, private router:Router) { }

  ngOnInit() {
  }
  async onLogin(email,password){
    try{
      const user= await this.authSvc.login(email.value,password.value);
      if(user){
        //Todo: Chekemail
        const isVerified = this.authSvc.isEmailVerified(user);
        //Comprobamos que es la primera vez que inicia sesión
       // const isFirstTime = this.authSvc.isFirstTime(user);
        this.redirectUser(isVerified);
      }
    }catch(error){
      switch(error.code){
        case 'auth/user-not-found':{
          const body=document.getElementsByTagName("body")[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'El usuario no existe',
          })
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
          break;
        }
        case 'auth/wrong-password':{
          let password=document.getElementById('pass');
          password.textContent='';
          const body=document.getElementsByTagName("body")[0];
          Swal.fire({
            icon: 'error',
            title: 'Algo ha ido mal :(',
            text: 'Contraseña incorrecta',
          })
          //No borar, po lo que dios mas quiera
          //Chapuza que resuelve/quita la clase de altura del sweetalert pq no se veia
          body.classList.remove('swal2-height-auto');
         break;
        }
        case 'auth/invalid-email':

          break;

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
  private redirectUser(isVerified:boolean):void{
    if(isVerified){
      this.router.navigate(['home']);
    }else{
      this.router.navigate(['verify-email']);
    }
  }
}
