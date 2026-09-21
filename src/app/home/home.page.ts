import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

interface CommunicationOption {
  readonly label: string;
  readonly emoji: string;
  readonly ariaLabel: string;
  readonly colorClass: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent],
})
export class HomePage {
  protected readonly currentPhrase = 'Elegí una opción';

  protected readonly communicationOptions: readonly CommunicationOption[] = [
    {
      label: 'Me encuentro mal',
      emoji: '🤒',
      ariaLabel: 'Comunicar: Me encuentro mal',
      colorClass: 'option--amber',
    },
    {
      label: 'Necesito algo',
      emoji: '🤲',
      ariaLabel: 'Comunicar: Necesito algo',
      colorClass: 'option--teal',
    },
    {
      label: 'Baño e higiene',
      emoji: '🚿',
      ariaLabel: 'Comunicar: Baño e higiene',
      colorClass: 'option--eggplant',
    },
    {
      label: 'Ayuda',
      emoji: '🫶',
      ariaLabel: 'Comunicar: Ayuda',
      colorClass: 'option--burgundy',
    },
  ];
}
