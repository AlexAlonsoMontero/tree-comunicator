import { Component, inject, InjectionToken, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular';

import {
  createCommunicatorStateCoordinator,
  CommunicatorSnapshot,
  LocalRescueOption,
} from '../../../application/communicator-state';
import { CommunicationNode } from '../../../domain/communication-navigation';
import { VoiceOutput } from '../../../application/voice-output';
import { CapacitorVoiceOutput } from '../../../infrastructure/voice/capacitor-voice-output';

interface CommunicationOptionView {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly ariaLabel: string;
  readonly colorClass: string;
}

export const VOICE_OUTPUT = new InjectionToken<VoiceOutput>('VOICE_OUTPUT');

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
    position: 1,
  }),
  createNode({
    id: 'want-something',
    parentId: null,
    label: 'Quiero algo',
    speechText: 'Quiero algo',
    position: 2,
  }),
  createNode({
    id: 'reject',
    parentId: null,
    label: 'No quiero',
    speechText: 'No quiero',
    phrasePart: 'No quiero',
    position: 3,
    canFinish: true,
  }),
  createNode({
    id: 'emotions',
    parentId: null,
    label: 'Emociones',
    speechText: 'Emociones',
    position: 4,
  }),
  createNode({
    id: 'people',
    parentId: null,
    label: 'Personas',
    speechText: 'Personas',
    position: 5,
  }),
  createNode({
    id: 'activities',
    parentId: null,
    label: 'Actividades',
    speechText: 'Actividades',
    position: 6,
  }),
  createNode({
    id: 'daily-conversation',
    parentId: null,
    label: 'Conversación',
    speechText: 'Conversación cotidiana',
    position: 7,
  }),
  createNode({
    id: 'hygiene',
    parentId: null,
    label: 'Baño e higiene',
    speechText: 'Baño e higiene',
    position: 8,
  }),
  createNode({
    id: 'help',
    parentId: null,
    label: 'Ayuda',
    speechText: 'Ayuda',
    position: 9,
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
    id: 'need-water',
    parentId: 'need-something',
    label: 'Agua',
    speechText: 'Necesito agua',
    phrasePart: 'Necesito agua',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'need-food',
    parentId: 'need-something',
    label: 'Comer',
    speechText: 'Necesito comer',
    phrasePart: 'Necesito comer',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'want-music',
    parentId: 'want-something',
    label: 'Música',
    speechText: 'Quiero música',
    phrasePart: 'Quiero música',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'want-outside',
    parentId: 'want-something',
    label: 'Salir',
    speechText: 'Quiero salir',
    phrasePart: 'Quiero salir',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'bathroom',
    parentId: 'hygiene',
    label: 'Ir al baño',
    speechText: 'Necesito ir al baño',
    phrasePart: 'Necesito ir al baño',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'wash-hands',
    parentId: 'hygiene',
    label: 'Lavarme las manos',
    speechText: 'Necesito lavarme las manos',
    phrasePart: 'Necesito lavarme las manos',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'help-move',
    parentId: 'help',
    label: 'Moverme',
    speechText: 'Necesito ayuda para moverme',
    phrasePart: 'Necesito ayuda para moverme',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'help-come',
    parentId: 'help',
    label: 'Ven aquí',
    speechText: 'Necesito que vengas',
    phrasePart: 'Necesito que vengas',
    position: 1,
    canFinish: true,
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
  createNode({
    id: 'happy',
    parentId: 'emotions',
    label: 'Contento',
    speechText: 'Me siento contento',
    phrasePart: 'Me siento contento',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'sad',
    parentId: 'emotions',
    label: 'Triste',
    speechText: 'Me siento triste',
    phrasePart: 'Me siento triste',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'mom',
    parentId: 'people',
    label: 'Mamá',
    speechText: 'Quiero ver a mamá',
    phrasePart: 'Quiero ver a mamá',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'caregiver',
    parentId: 'people',
    label: 'Cuidador',
    speechText: 'Quiero ver al cuidador',
    phrasePart: 'Quiero ver al cuidador',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'play',
    parentId: 'activities',
    label: 'Jugar',
    speechText: 'Quiero jugar',
    phrasePart: 'Quiero jugar',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'rest',
    parentId: 'activities',
    label: 'Descansar',
    speechText: 'Quiero descansar',
    phrasePart: 'Quiero descansar',
    position: 1,
    canFinish: true,
  }),
  createNode({
    id: 'hello',
    parentId: 'daily-conversation',
    label: 'Hola',
    speechText: 'Quiero decir hola',
    phrasePart: 'Quiero decir hola',
    position: 0,
    canFinish: true,
  }),
  createNode({
    id: 'thanks',
    parentId: 'daily-conversation',
    label: 'Gracias',
    speechText: 'Quiero decir gracias',
    phrasePart: 'Quiero decir gracias',
    position: 1,
    canFinish: true,
  }),
];

const OPTION_PRESENTATION = new Map<string, Pick<CommunicationOptionView, 'emoji' | 'colorClass'>>([
  ['feeling-unwell', { emoji: '🤒', colorClass: 'option--amber' }],
  ['need-something', { emoji: '🤲', colorClass: 'option--teal' }],
  ['want-something', { emoji: '🙋', colorClass: 'option--eggplant' }],
  ['reject', { emoji: '✋', colorClass: 'option--burgundy' }],
  ['emotions', { emoji: '😊', colorClass: 'option--teal' }],
  ['people', { emoji: '👥', colorClass: 'option--eggplant' }],
  ['activities', { emoji: '🎲', colorClass: 'option--burgundy' }],
  ['daily-conversation', { emoji: '💬', colorClass: 'option--teal' }],
  ['hygiene', { emoji: '🚿', colorClass: 'option--eggplant' }],
  ['help', { emoji: '🫶', colorClass: 'option--burgundy' }],
  ['pain', { emoji: '🤕', colorClass: 'option--amber' }],
  ['need-water', { emoji: '💧', colorClass: 'option--teal' }],
  ['need-food', { emoji: '🍽️', colorClass: 'option--eggplant' }],
  ['want-music', { emoji: '🎵', colorClass: 'option--eggplant' }],
  ['want-outside', { emoji: '🌳', colorClass: 'option--burgundy' }],
  ['bathroom', { emoji: '🚽', colorClass: 'option--eggplant' }],
  ['wash-hands', { emoji: '🧼', colorClass: 'option--teal' }],
  ['help-move', { emoji: '🧍', colorClass: 'option--burgundy' }],
  ['help-come', { emoji: '👋', colorClass: 'option--amber' }],
  ['dizzy', { emoji: '🌀', colorClass: 'option--teal' }],
  ['nausea', { emoji: '😟', colorClass: 'option--eggplant' }],
  ['belly', { emoji: '🫄', colorClass: 'option--amber' }],
  ['head', { emoji: '🙂', colorClass: 'option--burgundy' }],
  ['happy', { emoji: '😊', colorClass: 'option--teal' }],
  ['sad', { emoji: '😢', colorClass: 'option--eggplant' }],
  ['mom', { emoji: '👩', colorClass: 'option--amber' }],
  ['caregiver', { emoji: '🫶', colorClass: 'option--burgundy' }],
  ['play', { emoji: '🎲', colorClass: 'option--teal' }],
  ['rest', { emoji: '🛏️', colorClass: 'option--eggplant' }],
  ['hello', { emoji: '👋', colorClass: 'option--amber' }],
  ['thanks', { emoji: '🙏', colorClass: 'option--burgundy' }],
]);

const RESCUE_PRESENTATION = new Map<string, Pick<CommunicationOptionView, 'emoji' | 'colorClass'>>([
  ['needs-help', { emoji: '🫶', colorClass: 'option--burgundy communication-option--rescue' }],
  ['cannot-explain', { emoji: '💬', colorClass: 'option--eggplant communication-option--rescue' }],
  ['back', { emoji: '↩️', colorClass: 'option--teal communication-option--rescue' }],
  ['start-over', { emoji: '🏠', colorClass: 'option--amber communication-option--rescue' }],
]);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent],
  providers: [{ provide: VOICE_OUTPUT, useClass: CapacitorVoiceOutput }],
})
export class HomePage implements OnDestroy {
  readonly #communicator = createCommunicatorStateCoordinator(PRESENTATION_SEED_TREE);
  readonly #voice = inject(VOICE_OUTPUT);

  protected snapshot: CommunicatorSnapshot = this.#communicator.snapshot;
  protected focusedOptionId: string | null = null;
  protected confirmingOptionId: string | null = null;
  protected confirmationProgress = 0;
  readonly #longPressDuration = 800;
  #pressTimer: ReturnType<typeof setTimeout> | undefined;
  #progressTimer: ReturnType<typeof setInterval> | undefined;
  #pressStartedAt = 0;
  #pressedOptionId: string | null = null;
  #spokenFocusedPressOptionId: string | null = null;

  ngOnDestroy(): void {
    this.cancelPress();
  }

  protected get currentPhrase(): string {
    return this.snapshot.currentPhrase || INITIAL_PHRASE_FALLBACK;
  }

  protected get communicationOptions(): readonly CommunicationOptionView[] {
    if (this.snapshot.isRescueModeActive) {
      return this.snapshot.localRescueOptions.map((option) => this.#createRescueOptionView(option));
    }

    return this.snapshot.navigation.visibleOptions.slice(0, 4).map((node) => {
      const presentation = OPTION_PRESENTATION.get(node.id) ?? {
        emoji: '💬',
        colorClass: 'option--teal',
      };

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

  protected get canOpenNoOptionFallback(): boolean {
    return this.snapshot.isNoOptionFallbackAvailable;
  }

  protected get noOptionAriaLabel(): string {
    return this.hasMoreOptions
      ? 'Mostrar otras opciones de comunicación'
      : 'No encuentro mi opción; mostrar alternativas locales de rescate';
  }

  protected focusOption(optionId: string): void {
    this.cancelPress();
    this.focusedOptionId = optionId;
    const option = this.communicationOptions.find((candidate) => candidate.id === optionId);
    if (option !== undefined) void this.speak(option.label);
  }

  protected beginPress(optionId: string, event?: Event): void {
    if ((event instanceof KeyboardEvent && event.repeat) || this.#pressedOptionId === optionId) {
      return;
    }

    const shouldReadFocusedOption =
      this.#pressedOptionId !== null && this.#pressedOptionId !== optionId;

    this.cancelPress();
    this.focusedOptionId = optionId;
    if (shouldReadFocusedOption) {
      const option = this.communicationOptions.find((candidate) => candidate.id === optionId);
      if (option !== undefined) {
        this.#spokenFocusedPressOptionId = optionId;
        void this.speak(option.label);
      }
    }
    this.#pressedOptionId = optionId;
    this.#pressStartedAt = Date.now();
    this.confirmationProgress = 0;
    this.#progressTimer = setInterval(() => {
      this.confirmationProgress = Math.min(
        100,
        ((Date.now() - this.#pressStartedAt) / this.#longPressDuration) * 100,
      );
    }, 20);
    this.#pressTimer = setTimeout(() => this.confirmOption(optionId), this.#longPressDuration);
  }

  protected endPress(optionId: string): void {
    if (this.#pressedOptionId !== optionId) return;
    const wasShortPress = Date.now() - this.#pressStartedAt < this.#longPressDuration;
    const wasFocusAlreadySpoken = this.#spokenFocusedPressOptionId === optionId;
    this.cancelPress();
    if (wasShortPress && !wasFocusAlreadySpoken) {
      this.focusedOptionId = optionId;
      const option = this.communicationOptions.find((candidate) => candidate.id === optionId);
      if (option !== undefined) void this.speak(option.label);
    }
  }

  protected confirmOption(optionId: string): void {
    if (this.#pressedOptionId !== optionId) return;
    this.cancelPress();
    this.confirmingOptionId = optionId;
    const selectedLabel = this.communicationOptions.find(
      (candidate) => candidate.id === optionId,
    )?.label;
    this.snapshot = this.snapshot.isRescueModeActive
      ? this.#communicator.chooseLocalRescueOption(optionId)
      : this.#communicator.confirmNode(optionId);
    void this.speak(this.snapshot.currentPhrase || selectedLabel || 'Opción confirmada');
    setTimeout(() => {
      this.confirmingOptionId = null;
    }, 500);
  }

  protected repeatFocused(): void {
    const option = this.communicationOptions.find(
      (candidate) => candidate.id === this.focusedOptionId,
    );
    void this.speak(option?.label ?? this.currentPhrase);
  }

  protected cancelPress(): void {
    if (this.#pressTimer !== undefined) clearTimeout(this.#pressTimer);
    if (this.#progressTimer !== undefined) clearInterval(this.#progressTimer);
    this.#pressTimer = undefined;
    this.#progressTimer = undefined;
    this.#pressedOptionId = null;
    this.#spokenFocusedPressOptionId = null;
    this.confirmationProgress = 0;
  }

  private async speak(text: string): Promise<void> {
    try {
      await this.#voice.speak(text);
    } catch {
      /* Voice remains optional when Android lacks an offline Spanish voice. */
    }
  }

  protected goBack(): void {
    this.snapshot = this.#communicator.goBack();
  }

  protected startOver(): void {
    this.snapshot = this.#communicator.startOver();
  }

  protected showNextOptions(): void {
    if (this.hasMoreOptions) {
      this.snapshot = this.#communicator.nextPage();
      return;
    }

    if (this.canOpenNoOptionFallback) {
      this.snapshot = this.#communicator.openNoOptionFallback();
    }
  }

  #createRescueOptionView(option: LocalRescueOption): CommunicationOptionView {
    const presentation = RESCUE_PRESENTATION.get(option.id) ?? {
      emoji: '💬',
      colorClass: 'option--teal communication-option--rescue',
    };

    return {
      id: option.id,
      label: option.label,
      emoji: presentation.emoji,
      ariaLabel: `Rescate local: ${option.label}`,
      colorClass: presentation.colorClass,
    };
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
