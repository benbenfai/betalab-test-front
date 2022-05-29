import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    public toastController: ToastController,
  ) { }

  async presentToast(message: string, position: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position
    });
    toast.present();
  }

}
