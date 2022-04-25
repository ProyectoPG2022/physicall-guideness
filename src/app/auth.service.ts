import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from 'firebase/compat/app';
import { switchMap } from 'rxjs/operators';
import { Usuario } from './intefaces/usuario.interface';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { bindNodeCallback, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Viajero } from './intefaces/viajero.interface';
import { Guia } from './intefaces/guia.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  public user$:Observable<Usuario>;

  constructor(public afAuth:AngularFireAuth, private afs:AngularFirestore,private router:Router) { 
    this.user$ = this.afAuth.authState.pipe(switchMap((user)=>{
      if (user){
        return this.afs.doc<any>(`usuarios/${user.uid}`).valueChanges();
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
     return  this.afAuth.sendPasswordResetEmail(email);
    }catch(error){
      console.log(error);
    }
  }

  //Método para registro con google
  /*async loginGoogle():Promise<any>{
    try{
     const {user}= await this.afAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
     this.updateUserDataGoogle(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }*/

  //Método de registro con email y contraseña
  async register(email:string ,password:string, username:string,biografia:string,tipo:string,):Promise<any>{
    try{
     //Mete al usuario en firebase auth
     const {user}= await this.afAuth.createUserWithEmailAndPassword(email,password);
     const biografi=biografia;
     const type=tipo;
     
     this.saveUserData(user,username, biografi,type);
     await this.sendVerificationEmail();
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método para mandar email de verificación
  async sendVerificationEmail():Promise<void>{
    try{
      return (await this.afAuth.currentUser).sendEmailVerification();
    }catch(error){
      console.log(error);
    }
  }
  isEmailVerified(user:Usuario){
    if(user.emailVerified){
      return true;
    }else{
      return false;
    }
    //Con la asignación condicional no chuta y no se porque
    //return user.emailVerified = true ? true : false;
  }

  //Método de registro con email y contraseña 
  async login(email:string ,password:string):Promise<any>{
    try{
     const user= await this.afAuth.signInWithEmailAndPassword(email,password);
     this.updateUser(user);
     return user;
    }catch(error){
     throw error;
      /*console.log(error.message);
      switch(error.code){
        case 'auth/user-not-found':
          console.log('La has liado hermano');
      }*/
    }
  }

  //Método de cerrar sesión
  async logout():Promise<void>{
    try{
      await this.afAuth.signOut();
    }catch(error){
      console.log(error);
    }
  }
  private updateUser(user:any){
    const userRef:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${user.uid}`);
    const datos:Usuario={
      uid: user.uid,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      
      biografia: ''
    }
    return userRef.set(datos,{merge:true});
  }

  //Guarda el usuario en la base de datos
  /*private updateUserDataGoogle(user:any){
    const userRef:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${user.uid}`);
    const datos:Usuario={
      uid:user.uid,
      displayName:user.displayName,
      email:user.email,
      emailVerified: user.emailVerified,
      isFirstTime:user.isFirstTime,
      /*biografia:user.biografia,
      contrasena:user.contrasena,
      foto:user.foto,
      username:user.username*/
    /*}
    
    return userRef.set(datos,{merge:true});
  }*/

  //Guarda el usuario en la base de datos
  private saveUserData(user:any,nameuser:string, biografi:string,type:string){
    if(type=='Viajero'){
      const userRef:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${user.uid}`);
      const datos:Viajero={
        uid:user.uid,
        username:nameuser,
        email:user.email,
        emailVerified: user.emailVerified,
        
        biografia:biografi,
        sitios:[]
        //foto:user.foto,
      }
      return userRef.set(datos,{merge:true});
    }
    if(type=='Guía'){
      const userRef:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${user.uid}`);
      const datos:Guia={
        uid:user.uid,
        username:nameuser,
        email:user.email,
        emailVerified: user.emailVerified,
        biografia:biografi,
        valoracionMedia:0.0
        //foto:user.foto,
      }
      return userRef.set(datos,{merge:true});
    }
  }
  
}
