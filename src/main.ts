import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { SQLiteCommunicationNodeRepository } from './app/infrastructure/persistence/sqlite-communication-node-repository';
import { COMMUNICATION_NODE_REPOSITORY } from './app/presentation/communication-node-repository.token';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: COMMUNICATION_NODE_REPOSITORY, useClass: SQLiteCommunicationNodeRepository },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
