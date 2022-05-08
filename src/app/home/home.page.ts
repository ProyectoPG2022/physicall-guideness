import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public items: any; //Lista donde buscará el buscador

  public lista = [{ id: 1, nombre: "Murcia" },
  { id: 2, nombre: "Compostela" },
  { id: 3, nombre: "Sevilla" },
  { id: 4, nombre: "Bilbao" },
  { id: 5, nombre: "León" },
  { id: 6, nombre: "Valladolid" }
  ]

  constructor(public alertCtrl: AlertController) { }

  ngOnInit() {
    this.geolocalizador()
  }

  options = {
    enablehighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
  async success(pos) {
    var crd = pos.coords

    console.log('Tu posición actual es: ')
    console.log('Latitude: ' + crd.latitude)
    console.log('Longitude: ' + crd.longitude)
    console.log('Más o menos ' + crd.accuracy + ' meters.')

    const latitude = crd.latitude
    const longitude = crd.longitude

    var requestOptions = {
      method: 'GET',
    }
    console.log("Resultado del fetch:")
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=d595e96962364b8aa09e1c5ef06d5286`, requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error))
  }

  error(err) {
    console.warn('Error(' + err.code + '): ' + err.message)
  }

  geolocalizador() {
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options)
    } else {
      alert("El navegador no soporta la geolocalización.")
    }
  }

  initializeItems() {
    this.items = this.lista;
  }

  async viewList(id) {
    let vlista = this.lista.filter(function (e, i) { return e.id == id })[0]

    let alert = await this.alertCtrl.create({
      header: vlista.nombre,
      buttons: ['OK']
    })
    await alert.present()
  }

  getItems(ev: any) {
    this.initializeItems(); // Refrescar la colección por si ha habido cambios
    let val = ev.target.value; // Obtenemos el valor del searchbar
    //Comprobamos que la cadena no es vacía
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1)
      })

    }
  }
}
