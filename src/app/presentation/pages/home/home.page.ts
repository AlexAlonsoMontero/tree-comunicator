import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

import { createCommunicatorStateCoordinator, CommunicatorSnapshot } from '../../../application/communicator-state';
import { CommunicationNode } from '../../../domain/communication-navigation';

interface CommunicationOptionView {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly ariaLabel: string;
  readonly colorClass: string;
}

const INITIAL_PHRASE_FALLBACK = 'Elegí una opción';

const PRESENTATION_SEED_TREE: readonly CommunicationNode[] = [
  createNode({
    id: 'feeling-unwell',
    parentId: null,
    label: 'Me encuentro mal',
    speechText: 'Me encuentro mal',
    position: 0,
    isFixedHomeOption: true,
  }),
  createNode({
    id: 'need-something',
    parentId: null,
    label: 'Necesito algo',
    speechText: 'Necesito algo',
    phrasePart: 'Necesito',
    position: 1,
  }),
  createNode({
    id: 'hygiene',
    parentId: null,
    label: 'Baño e higiene',
    speechText: 'Baño e higiene',
    phrasePart: 'Necesito higiene',
    position: 2,
  }),
  createNode({
    id: 'help',
    parentId: null,
    label: 'Ayuda',
    speechText: 'Ayuda',
    phrasePart: 'Necesito ayuda',
    position: 3,
  }),
  createNode({
    id: 'hungry',
    parentId: null,
    label: 'Tengo hambre',
    speechText: 'Tengo hambre',
    phrasePart: 'Tengo hambre',
    position: 4,
  }),
  createNode({
    id: 'thirsty',
    parentId: null,
    label: 'Tengo sed',
    speechText: 'Tengo sed',
    phrasePart: 'Tengo sed',
    position: 5,
  }),
  createNode({
    id: 'pain',
    parentId: 'feeling-unwell',
    label: 'Me duele',
    speechText: 'Me duele',
    phrasePart: 'Me duele',
    position: 0,
  }),
  createNode({
    id: 'dizzy',
    parentId: 'feeling-unwell',
    label: 'Estoy mareado',
    speechText: 'Estoy mareado',
    phrasePart: 'Estoy mareado',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'nausea',
    parentId: 'feeling-unwell',
    label: 'Tengo náuseas',
    speechText: 'Tengo náuseas',
    phrasePart: 'Tengo náuseas',
    position: 2,
    canFinish: true,
  }),
  createNode({
    id: 'belly',
    parentId: 'pain',
    label: 'Barriga',
    speechText: 'Me duele la barriga',
    phrasePart: 'la barriga',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'head',
    parentId: 'pain',
    label: 'Cabeza',
    speechText: 'Me duele la cabeza',
    phrasePart: 'la cabeza',
    position: 1,
    canFinish: true,
  }),
];

const OPTION_PRESENTATION = new Map<string, Pick<CommunicationOptionView, 'emoji' | 'colorClass'>>([
  ['feeling-unwell', { emoji: '🤒', colorClass: 'option--amber' }],
  ['need-something', { emoji: '🤲', colorClass: 'option--teal' }],
  ['hygiene', { emoji: '🚿', colorClass: 'option--eggplant' }],
  ['help', { emoji: '🫶', colorClass: 'option--burgundy' }],
  ['hungry', { emoji: '🍽️', colorClass: 'option--teal' }],
  ['thirsty', { emoji: '💧', colorClass: 'option--eggplant' }],
  ['pain', { emoji: '🤕', colorClass: 'option--amber' }],
  ['dizzy', { emoji: '🌀', colorClass: 'option--teal' }],
  ['nausea', { emoji: '😟', colorClass: 'option--eggplant' }],
  ['belly', { emoji: '🫄', colorClass: 'option--amber' }],
  ['head', { emoji: '🙂', colorClass: 'option--burgundy' }],
]);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent],
})
export class HomePage {
  readonly #communicator = createCommunicatorStateCoordinator(PRESENTATION_SEED_TREE);

  protected snapshot: CommunicatorSnapshot = this.#communicator.snapshot;

  protected get currentPhrase(): string {
    return this.snapshot.currentPhrase || INITIAL_PHRASE_FALLBACK;
  }

  protected get communicationOptions(): readonly CommunicationOptionView[] {
    return this.snapshot.navigation.visibleOptions.slice(0, 4).map((node) => {
      const presentation = OPTION_PRESENTATION.get(node.id) ?? { emoji: '💬', colorClass: 'option--teal' };

      return {
        id: node.id,
        label: node.label,
        emoji: presentation.emoji,
        ariaLabel: `Comunicar: ${node.label}`,
        colorClass: presentation.colorClass,
      };
    });
  }

  protected get hasMoreOptions(): boolean {
    return this.snapshot.navigation.hasMoreOptions;
  }

  protected confirmOption(optionId: string): void {
    this.snapshot = this.#communicator.confirmNode(optionId);
  }

  protected goBack(): void {
    this.snapshot = this.#communicator.goBack();
  }

  protected startOver(): void {
    this.snapshot = this.#communicator.startOver();
  }

  protected showNextOptions(): void {
    if (!this.hasMoreOptions) {
      return;
    }

    this.snapshot = this.#communicator.nextPage();
  }
}

function createNode(
  node: Pick<CommunicationNode, 'id' | 'parentId' | 'label' | 'speechText' | 'position'> &
    Partial<CommunicationNode>,
): CommunicationNode {
  return {
    enabled: true,
    lockedPosition: false,
    canFinish: false,
    hasOptionalDetails: false,
    action: 'none',
    ...node,
  };
}
