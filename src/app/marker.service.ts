import { Injectable, Injector } from '@angular/core';

import * as JSZip from 'jszip/dist/jszip'
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet'

import { Ciudad } from './intefaces/ciudad.interface';
import { Marcador } from './intefaces/marcador.interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

import { PopupComponent } from './popup/popup.component';

export interface ZipFile {
  readonly name: string
  readonly dir: boolean
  readonly date: Date
  readonly data: any
}

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

  citiesSpain: string = '../assets/data/cities/spain.json'
  all_cities: string[]

  public marcadoresFirebase$: Observable<Marcador>

  $zipFiles: Observable<ZipFile[]>

  constructor(private httpClient: HttpClient, private firebaseDB: AngularFirestore, injector: Injector) {}

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
        if (Number(ciudad.population) > population) { // Solo agregamos al resultado de vuelta las ciudades con mayor población que el parámetro
          L.marker([Number(ciudad.lat), Number(ciudad.lng)], { icon: redLeafIcon }).addTo(cities)
        }
      });
    })
    return cities
  }
/**
    descripcion:string
    userid:string
    latitud?:string
    longitud?:string
    pais?:string
    ciudad?:string
*/
  async getMarkersFirebase() {
    var collection = this.firebaseDB.collection<Marcador>('marcadores')
    var grupo = L.layerGroup()
    collection.valueChanges().subscribe((res => {
      res.forEach((marcador) => {
        var pos = new L.LatLng(Number(marcador.latitud),Number(marcador.longitud)) // Guardamos la posición en una variable para reusabilidad
        var marker = L.marker(pos, {icon: greenLeafIcon}) // Creamos el marcador en esa posición, verde para usuarios

        marker.addTo(grupo).on({
          mouseover: function(e) {
            this.openPopup()
          }
        }).bindPopup((layer) => {
          const popupEl = document.createElement('popup-element') as any;
          popupEl.titulo = `${marcador.descripcion}`
          popupEl.guias = marcador.guias
          return popupEl
        })
      })
    }))
    return grupo
  }

  // TODO Función que devuelve los puntos cercanos en un radio pasado por parámetro

  ngOnfile(event: any): void {
    const fileList = event.target.files;
    const zipLoaded = new JSZip.default();
    this.$zipFiles = from(zipLoaded.loadAsync(fileList[0])).pipe(
      switchMap((zip: any): Observable<ZipFile[]> => {
        console.log("ngOnFile")
        return of(Object.keys(zip.files).map((key) => zip.files[key]))
      })
    )
  }

  ngOnUpload(data: any) {
    console.log("ngOnUpload")
  }
}
