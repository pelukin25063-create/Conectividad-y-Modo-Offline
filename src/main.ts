import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

// enableProdMode(); // Descomentar si estás en producción

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(appRoutes),
    Storage  // ← IMPORTANTE: Agregar Storage aquí también
  ],
});


