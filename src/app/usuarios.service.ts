import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from './intefaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private readonly firebaseDB: AngularFirestore) {
  }

  public getUser(uuid:string) {
    const userRef: AngularFirestoreDocument<Usuario> = this.firebaseDB.doc(
      `usuarios/${uuid}`
    );
    return userRef.valueChanges()
  }

}
