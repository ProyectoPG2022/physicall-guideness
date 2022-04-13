import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from 'firebase/compat/app';
import { switchMap } from 'rxjs/operators';
import { Usuario } from './intefaces/usuario.interface';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$:Observable<Usuario>;

  constructor(public auth:AngularFireAuth, private afs:AngularFirestore) { 
    this.user$ = this.auth.authState.pipe(switchMap((user)=>{
      if (user){
        return this.afs.doc<Usuario>(`usuarios/${user.uid}`).valueChanges();
      }
      return of(null);
    }));
  }
  /*usuario = this.auth.authState.pipe ( map (authState=>{
    if(authState){
      return authState;
    }else {
      return null;
    }
  }))*/

  //Método para resetear la contraseña del usuario
  async resetPassword(email:string):Promise<void>{
    try{
     return  this.auth.sendPasswordResetEmail(email);
    }catch(error){
      console.log(error);
    }
  }

  //Método para registro con google
  async googleLogin():Promise<Usuario>{
    try{
     const {user}= await this.auth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
     this.actualizarDatosUsuario(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método de registro con email y contraseña
  async register(email:string ,contrasena:string):Promise<Usuario>{
    try{
     const {user}= await this.auth.createUserWithEmailAndPassword(email,contrasena);
     await this.sendVerificationEmail();
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método para mandar email de verificación
  async sendVerificationEmail(){
    try{
      return (await this.auth.currentUser).sendEmailVerification();
    }catch(error){
      console.log(error);
    }
  }

  //Método de registro con email y contraseña 
  async login(email:string ,contrasena:string):Promise<Usuario>{
    try{
     const {user}= await this.auth.signInWithEmailAndPassword(email,contrasena);
     this.actualizarDatosUsuario(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método de cerrar sesión
  async logout():Promise<void>{
    try{
      this.auth.signOut();
    }catch(error){
      console.log(error);
    }
  }
  private actualizarDatosUsuario(usuario:Usuario){
    const refUsuario:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${usuario.uid}`);
    const datos:Usuario={
      uid:usuario.uid,
      displayName:usuario.displayName,
      email:usuario.email,
      /*biografia:usuario.biografia,
      contrasena:usuario.contrasena,
      foto:usuario.foto,
      username:usuario.username*/
    }
    return refUsuario.set(datos,{merge:true})
  }
}
