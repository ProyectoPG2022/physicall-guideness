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

/*
 {
    "city": "Madrid", 
    "lat": "40.4167", 
    "lng": "-3.7167", 
    "country": "Spain", 
    "iso2": "ES", 
    "admin_name": "Madrid", 
    "capital": "primary", 
    "population": "6026000", 
    "population_proper": "3266126"
  },
*/

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
  
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  async makeCapitalMarkers(map: L.Map) {
    this.httpClient.get(this.citiesSpain).subscribe((res: Ciudad[]) => {
      console.log("resultado: " + res)
      res.forEach(ciudad => {
        console.log("Ciudad: " + ciudad.city)
        console.log(ciudad)
        if(Number(ciudad.population) > 50000) { // Solo agregamos las ciudades con una población superior a 50.000
          L.marker([Number(ciudad.lat), Number(ciudad.lng)], {icon: this.greenIcon}).addTo(map) // Creamos el marcador y lo agregamos al mapa
        }
        
        //const marker = L.marker([Number(ciudad.lat),Number(ciudad.lng)])
        //marker.addTo(map)
      });
    });
  }

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

  cargarCiudades() {
    this.httpClient.get("assets/data/cities/${ciudad}") // Todo
  }
}
