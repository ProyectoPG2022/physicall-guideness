import { Injectable, Injector } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet'

import { Ciudad } from './intefaces/ciudad.interface';
import { Marcador } from './intefaces/marcador.interface';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Viajero } from './intefaces/viajero.interface';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid'

function crearIcono(str_urlIcon: string): any {
  return L.icon({
    iconUrl: str_urlIcon,
    shadowUrl: '../assets/data/marker_icons/shadow.png',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  })
}

var redLeafIcon = crearIcono('../assets/data/marker_icons/red.png')

var greenLeafIcon = crearIcono('../assets/data/marker_icons/green.png')

@Injectable()
export class MarkerService {

  user$: Observable<Viajero> = this.authSvc.afAuth.user;

  citiesSpain: string = '../assets/data/cities/spain.json'
  all_cities: string[]

  public marcadoresFirebase$: Observable<Marcador>

  constructor(
    private httpClient: HttpClient,
    private afs: AngularFirestore,
    injector: Injector,
    private authSvc: AuthService,
    private http: HttpClient) {

  }

  greenIcon = L.icon({
    iconUrl: '../assets/data/marker_icons/green.png',
    shadowUrl: '../assets/data/marker_icons/shadow.png',

    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  async getCitiesMarkersGTPopulation(population: number) {
    var cities = L.layerGroup()
    this.httpClient.get(this.citiesSpain).subscribe((res: Ciudad[]) => {
      res.forEach((ciudad) => {
        if (Number(ciudad.population) > population) {
          L.marker([Number(ciudad.lat), Number(ciudad.lng)], { icon: redLeafIcon }).addTo(cities)
        }
      });
    })
    return cities
  }

  async getMarkersFirebase(map: L.Map) {
    var collection = this.afs.collection<Marcador>('marcadores')
    var grupo = L.layerGroup()
    collection.valueChanges().subscribe((res => {
      res.forEach((marcador) => {
        var pos = new L.LatLng(Number(marcador.latitud), Number(marcador.longitud)) // Guardamos la posición en una variable para reusabilidad
        var marker = L.marker(pos, { icon: greenLeafIcon }) // Creamos el marcador en esa posición, verde para usuarios

        marker.addTo(grupo).on({
          mouseover: function (e) {
            var px = map.project(e.target._latlng); // Encuentra la posición del pixel dónde el popup está anclado al mapa
            px.y -= 5000; // Se mueve el eje Y una cantidad determinada para que el popup se centre en el mapa
            map.panTo(map.unproject(px), { animate: true }); // Mover el mapa al nuevo centro
            this.openPopup()
          }
        }).bindPopup(() => {
          const popupEl = document.createElement('popup-element') as any;
          popupEl.titulo = `${marcador.descripcion}`
          popupEl.guias = marcador.guias
          popupEl.marcador = marcador
          return popupEl
        })
      })
    }))
    return grupo
  }

  async putTmpMarker(coords: L.LatLng, map: L.Map) {
    var marker = L.marker(coords)
    marker.addTo(map).on({
      mouseover: function (e) {
        marker.removeFrom(map)
      }
    })
  }


  crearMarcador(latlng: L.LatLng, uidGuia: string) {
    const body = document.getElementsByTagName('body')[0];
    Swal.fire({
      icon: 'question',
      title: '¿Quiere crear un nuevo marcador esta posición?',
      showDenyButton: true,
      confirmButtonText: 'Aceptar',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const body = document.getElementsByTagName('body')[0];
        Swal.fire({
          title: 'Introduce un nombre para el nuevo marcador',
          input: 'text',
          inputPlaceholder: 'Nombre del sitio...',
          showDenyButton: true,
          confirmButtonText: 'Crear marcador',
          denyButtonText: 'Cancelar',
        }).then(async (res) => {
          if (res.isConfirmed) {

            var guias: string[] = []
            guias.push(uidGuia)

            this.http.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latlng.lat}&lon=${latlng.lng}&apiKey=d595e96962364b8aa09e1c5ef06d5286`)
              .subscribe(data => {

                var idGenerado = uuidv4()

                var marcador: Marcador = {
                  descripcion: res.value,
                  guias: guias,
                  latitud: latlng.lat.toString(),
                  longitud: latlng.lng.toString(),
                  pais: data['features'][0]['properties']['country'],
                  ciudad: data['features'][0]['properties']['city'],
                  uid: idGenerado,
                }
                this.afs.collection<Marcador>('marcadores')
                  .doc(idGenerado).set(marcador).then(() => {

                    const body = document.getElementsByTagName('body')[0];
                    Swal.fire('Creado correctamente!', '', 'success')
                    body.classList.remove('swal2-height-auto');
                  }).catch(() => {
                    const body = document.getElementsByTagName('body')[0];
                    Swal.fire('Ha ocurrido un error durante la creación del marcador', '', 'warning')
                    body.classList.remove('swal2-height-auto');
                  })

              }, error => {
                console.log(error)
              })

          } else if (res.isDenied) {
            const body = document.getElementsByTagName('body')[0];
            Swal.fire('Creación de marcador cancelada', '', 'info')
            body.classList.remove('swal2-height-auto');
          }
        })
        body.classList.remove('swal2-height-auto');
      }
    })
    body.classList.remove('swal2-height-auto');
  }
}
