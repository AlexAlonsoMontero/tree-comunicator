import {
  CommunicationNavigationState,
  CommunicationNavigationView,
  CommunicationNode,
  createRootNavigationState,
  deriveCommunicationNavigationView,
  goToNextOptionsPage,
  resetNavigationToRoot,
} from '../domain/communication-navigation';

export type LocalRescueOptionAction = 'set-visible-phrase' | 'exit-rescue' | 'start-over';

export interface LocalRescueOption {
  readonly id: string;
  readonly label: string;
  readonly action: LocalRescueOptionAction;
  readonly visiblePhrase?: string;
}

export interface CommunicatorSnapshot {
  readonly navigation: CommunicationNavigationView;
  readonly currentPhrase: string;
  readonly isNoOptionFallbackAvailable: boolean;
  readonly isRescueModeActive: boolean;
  readonly localRescueOptions: readonly LocalRescueOption[];
}

const LOCAL_RESCUE_OPTIONS: readonly LocalRescueOption[] = Object.freeze([
  Object.freeze({
    id: 'needs-help',
    label: 'Necesito ayuda',
    action: 'set-visible-phrase' as const,
    visiblePhrase: 'Necesito ayuda',
  }),
  Object.freeze({
    id: 'cannot-explain',
    label: 'No sé explicarlo',
    action: 'set-visible-phrase' as const,
    visiblePhrase: 'No sé explicarlo',
  }),
  Object.freeze({ id: 'back', label: 'Volver', action: 'exit-rescue' as const }),
  Object.freeze({ id: 'start-over', label: 'Empezar de nuevo', action: 'start-over' as const }),
]);

interface RescueModeState {
  readonly visiblePhrase: string;
}

export class CommunicatorStateCoordinator {
  readonly #nodes: readonly CommunicationNode[];
  #state: CommunicationNavigationState;
  #rescueMode: RescueModeState | null = null;

  constructor(nodes: readonly CommunicationNode[]) {
    this.#nodes = Object.freeze(nodes.map((node) => Object.freeze({ ...node })));
    this.#state = createRootNavigationState();
  }

  get snapshot(): CommunicatorSnapshot {
    return this.#createSnapshot();
  }

  confirmNode(nodeId: string): CommunicatorSnapshot {
    if (this.#rescueMode !== null) {
      return this.#createSnapshot();
    }

    const currentView = this.#currentNavigationView();
    const selectedNode = currentView.visibleOptions.find((node) => node.id === nodeId);

    if (selectedNode === undefined) {
      return this.#createSnapshot(currentView.state);
    }

    const confirmedPath = [...currentView.state.confirmedPath, selectedNode.id];
    const childView = this.#navigationViewForParent(selectedNode.id);

    if (childView.visibleOptions.length === 0) {
      this.#state = {
        ...currentView.state,
        confirmedPath,
      };

      return this.#createSnapshot();
    }

    this.#state = {
      parentId: selectedNode.id,
      pageIndex: 0,
      confirmedPath,
      history: [
        ...currentView.state.history,
        {
          parentId: currentView.state.parentId,
          pageIndex: currentView.state.pageIndex,
          confirmedPath:
            selectedNode.canFinish && selectedNode.hasOptionalDetails
              ? confirmedPath
              : currentView.state.confirmedPath,
        },
      ],
    };

    return this.#createSnapshot();
  }

  nextPage(): CommunicatorSnapshot {
    if (this.#rescueMode !== null) {
      return this.#createSnapshot();
    }

    this.#state = goToNextOptionsPage(this.#nodes, this.#state);

    return this.#createSnapshot();
  }

  openNoOptionFallback(): CommunicatorSnapshot {
    const currentView = this.#currentNavigationView();

    if (this.#rescueMode !== null || !currentView.showNoOptionFallback) {
      return this.#createSnapshot(currentView.state);
    }

    this.#rescueMode = { visiblePhrase: '' };

    return this.#createSnapshot(currentView.state);
  }

  chooseLocalRescueOption(optionId: string): CommunicatorSnapshot {
    if (this.#rescueMode === null) {
      return this.#createSnapshot();
    }

    const option = LOCAL_RESCUE_OPTIONS.find((candidate) => candidate.id === optionId);

    if (option === undefined) {
      return this.#createSnapshot();
    }

    switch (option.action) {
      case 'set-visible-phrase':
        this.#rescueMode = { visiblePhrase: option.visiblePhrase ?? '' };
        break;
      case 'exit-rescue':
        this.#rescueMode = null;
        break;
      case 'start-over':
        this.#rescueMode = null;
        this.#state = resetNavigationToRoot();
        break;
    }

    return this.#createSnapshot();
  }

  goBack(): CommunicatorSnapshot {
    if (this.#rescueMode !== null) {
      this.#rescueMode = null;

      return this.#createSnapshot();
    }

    const currentView = this.#currentNavigationView();

    if (currentView.state.pageIndex > 0) {
      this.#state = {
        ...currentView.state,
        pageIndex: currentView.state.pageIndex - 1,
      };

      return this.#createSnapshot();
    }

    const leafBackState = this.#stateAfterRemovingCurrentLevelLeaf(currentView);

    if (leafBackState !== null) {
      this.#state = leafBackState;

      return this.#createSnapshot();
    }

    const previousContext = currentView.state.history.at(-1);

    if (previousContext === undefined) {
      return this.#createSnapshot(currentView.state);
    }

    this.#state = {
      parentId: previousContext.parentId,
      pageIndex: previousContext.pageIndex,
      confirmedPath: previousContext.confirmedPath,
      history: currentView.state.history.slice(0, -1),
    };

    return this.#createSnapshot();
  }

  startOver(): CommunicatorSnapshot {
    this.#rescueMode = null;
    this.#state = resetNavigationToRoot();

    return this.#createSnapshot();
  }

  #currentNavigationView(): CommunicationNavigationView {
    return deriveCommunicationNavigationView(this.#nodes, this.#state);
  }

  #navigationViewForParent(parentId: string): CommunicationNavigationView {
    return deriveCommunicationNavigationView(this.#nodes, {
      parentId,
      pageIndex: 0,
      confirmedPath: [],
      history: [],
    });
  }

  #stateAfterRemovingCurrentLevelLeaf(
    currentView: CommunicationNavigationView,
  ): CommunicationNavigationState | null {
    const lastConfirmedNodeId = currentView.state.confirmedPath.at(-1);

    if (lastConfirmedNodeId === undefined || lastConfirmedNodeId === currentView.state.parentId) {
      return null;
    }

    const lastConfirmedNode = this.#nodes.find((node) => node.id === lastConfirmedNodeId);

    if (lastConfirmedNode?.parentId !== currentView.state.parentId) {
      return null;
    }

    return {
      ...currentView.state,
      confirmedPath: currentView.state.confirmedPath.slice(0, -1),
    };
  }

  #createSnapshot(
    state: CommunicationNavigationState = this.#currentNavigationView().state,
  ): CommunicatorSnapshot {
    const navigation = deriveCommunicationNavigationView(this.#nodes, state);
    this.#state = navigation.state;
    const isRescueModeActive = this.#rescueMode !== null;

    return {
      navigation,
      currentPhrase: isRescueModeActive
        ? (this.#rescueMode?.visiblePhrase ?? '')
        : composeCurrentPhrase(this.#nodes, navigation.state.confirmedPath),
      isNoOptionFallbackAvailable: navigation.showNoOptionFallback,
      isRescueModeActive,
      localRescueOptions: isRescueModeActive ? LOCAL_RESCUE_OPTIONS : [],
    };
  }
}

export function createCommunicatorStateCoordinator(
  nodes: readonly CommunicationNode[],
): CommunicatorStateCoordinator {
  return new CommunicatorStateCoordinator(nodes);
}

function composeCurrentPhrase(
  nodes: readonly CommunicationNode[],
  confirmedPath: readonly string[],
): string {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return confirmedPath
    .map((nodeId) => nodesById.get(nodeId)?.phrasePart?.trim() ?? '')
    .filter((phrasePart) => phrasePart.length > 0)
    .join(' ');
}
