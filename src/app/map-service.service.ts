import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapServiceService {

  constructor(private http: HttpClient) { }

  // Obtener el lugar a partir de las coordenadas
  private async getPlaceByCoords( latitude: number, longitude: number) {
    var requestOptions = {
      method: 'GET',
    }
    let city:string
    return new Promise(resolve => {
      this.http.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=d595e96962364b8aa09e1c5ef06d5286`)
        .subscribe(data => {
          resolve(data)
        }, error => {
          console.log(error)
        })
    })
  }

  async getCityByCoords(latitude:number, longitude:number) {
    let city:string
    await this.getPlaceByCoords(latitude, longitude).then((result)=> {
      city = result['features'][0]['properties']['city']
    })
    return city
  }

}
