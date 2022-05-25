import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class IonLoaderService {
  constructor(public loadingController: LoadingController) {}

  simpleLoader(message: any) {
    this.loadingController
      .create({
        message: message,
      })
      .then((response) => {
        response.present();
      });
  }

  dismissLoader() {
    this.loadingController
      .dismiss()
      .then((response) => {
        console.log('Loader closed!', response);
      })
      .catch((err) => {
        console.log('Error occured : ', err);
      });
  }

  autoLoader() {
    this.loadingController
      .create({
        message: 'Loader hides after 4 seconds',
        duration: 4000,
      })
      .then((response) => {
        response.present();
        response.onDidDismiss().then((response) => {
          console.log('Loader dismissed', response);
        });
      });
  }

  autoLoaderLogout() {
    this.loadingController
      .create({
        message: 'Please wait .. User Logout',
        duration: 2000,
      })
      .then((response) => {
        response.present();
        response.onDidDismiss().then((response) => {
          window.location.replace('/login');
          console.log('Loader dismissed', response);
        });
      });
  }

  customLoader() {
    this.loadingController
      .create({
        message: 'Loader with custom style',
        duration: 4000,
        cssClass: 'loader-css-class',
        backdropDismiss: true,
      })
      .then((res) => {
        res.present();
      });
  }
}
