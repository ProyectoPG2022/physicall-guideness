import { Injectable } from '@angular/core';

import * as JSZip from 'jszip/dist/jszip'
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet'

export interface ZipFile {
  readonly name: string
  readonly dir: boolean
  readonly date: Date
  readonly data: any
}

export interface Ciudad {
  city: string,
  lat: string,
  lng: string,
  country: string,
  iso2: string,
  admin_name: string,
  capital: string,
  population: string,
  population_proper: string
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

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  citiesSpain: string = '../assets/data/cities/spain.json'
  all_cities: string[]

  $zipFiles: Observable<ZipFile[]>

  constructor(private httpClient: HttpClient) { }

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

    var marcadores : L.Marker[] = []

    this.httpClient.get(this.citiesSpain).subscribe((res: Ciudad[]) => {
      res.forEach((ciudad, index) => {
        if (Number(ciudad.population) > population) { // 
          var mark = L.marker([Number(ciudad.lat), Number(ciudad.lng)], { icon: redLeafIcon }) // Creamos el marcador y lo agregamos a la capa de ciudades
          marcadores[index] = mark
        }
      });
    });
    return marcadores
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
