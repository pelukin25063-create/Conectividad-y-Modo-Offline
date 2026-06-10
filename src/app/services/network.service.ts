// Importaciones necesarias
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'  // El servicio está disponible en toda la app
})
export class NetworkService {
  // BehaviorSubject: almacena el estado y notifica cambios a quien lo escuche
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatus.asObservable();
  
  // Almacenamiento local para datos pendientes
  private pendingLogs: any[] = [];
  private storageReady = false;

  constructor(private storage: Storage) {
    this.initStorage();           // 1. Inicializa almacenamiento
    this.checkInitialStatus();    // 2. Verifica estado actual
    this.initializeNetworkListeners(); // 3. Escucha cambios futuros
  }

  // Inicializa Ionic Storage (IndexedDB o SQLite)
  async initStorage() {
    await this.storage.create();
    this.storageReady = true;
    await this.loadPendingLogs();
  }

  // Carga logs guardados durante sesiones offline anteriores
  private async loadPendingLogs() {
    const saved = await this.storage.get('offline-logs');
    if (saved) {
      this.pendingLogs = saved;
      console.log('📦 Logs pendientes:', this.pendingLogs.length);
    }
  }

  // Verifica el estado UNA SOLA VEZ al iniciar la app
  private async checkInitialStatus() {
    const status = await Network.getStatus();
    this.onlineStatus.next(status.connected);
    console.log('📡 Estado inicial:', status.connected ? 'Online' : 'Offline');
  }

  // Escucha CAMBIOS de red en TIEMPO REAL
  private initializeNetworkListeners() {
    Network.addListener('networkStatusChange', (status) => {
      const wasOnline = this.onlineStatus.value;
      this.onlineStatus.next(status.connected);
      
      // LÓGICA CLAVE: Si VOLVIMOS a estar online, sincronizar datos pendientes
      if (!wasOnline && status.connected) {
        console.log('🎉 Conexión recuperada! Sincronizando...');
        this.syncPendingLogs();
      }
    });
  }

  // GETTER para obtener el estado actual (útil en lógica condicional)
  getCurrentStatus(): boolean {
    return this.onlineStatus.value;
  }

  // LÓGICA CONDICIONAL ONLINE/OFFLINE
  async saveNetworkLog(message: string) {
    const logEntry = {
      message: message,
      date: new Date().toISOString(),
      synced: false
    };

    if (this.onlineStatus.value) {
      // 🔵 MODO ONLINE: Enviar al servidor inmediatamente
      console.log('🌐 Online - Enviando al servidor:', logEntry);
      await this.postToServer(logEntry);
    } else {
      // 🟠 MODO OFFLINE: Guardar localmente para después
      console.log('💾 Offline - Guardando localmente:', logEntry);
      this.pendingLogs.push(logEntry);
      if (this.storageReady) {
        await this.storage.set('offline-logs', this.pendingLogs);
      }
    }
  }

  // Sincroniza todos los datos pendientes al recuperar conexión
  private async syncPendingLogs() {
    if (this.pendingLogs.length === 0) return;
    
    console.log(`📡 Sincronizando ${this.pendingLogs.length} logs...`);
    for (const log of this.pendingLogs) {
      await this.postToServer(log);
    }
    // Limpiar la cola local después de sincronizar
    this.pendingLogs = [];
    if (this.storageReady) {
      await this.storage.remove('offline-logs');
    }
    console.log('✅ Sincronización completada');
  }

  // Simulación de envío a servidor (reemplazar con HTTP real)
  private async postToServer(data: any): Promise<boolean> {
    console.log('  → Enviando:', data);
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
