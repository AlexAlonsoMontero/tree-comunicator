import { Component, inject } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform, IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly platform = inject(Platform);

  constructor() {
    void this.configureSystemBars();
  }

  private async configureSystemBars(): Promise<void> {
    await this.platform.ready();

    if (!this.platform.is('capacitor')) {
      return;
    }

    await StatusBar.show();
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1A1412' });
  }
}
