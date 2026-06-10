import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NetworkService } from '../services/network.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  constructor(public networkService: NetworkService) {}

  // Método para guardar eventos (probando offline)
  guardarEvento() {
    const mensaje = `Evento creado a las ${new Date().toLocaleTimeString()}`;
    this.networkService.saveNetworkLog(mensaje);
    console.log('Botón presionado:', mensaje);
  }
}
