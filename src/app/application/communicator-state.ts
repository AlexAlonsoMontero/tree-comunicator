import {
  CommunicationNavigationState,
  CommunicationNavigationView,
  CommunicationNode,
  createRootNavigationState,
  deriveCommunicationNavigationView,
  goToNextOptionsPage,
  resetNavigationToRoot,
} from '../domain/communication-navigation';

export interface CommunicatorSnapshot {
  readonly navigation: CommunicationNavigationView;
  readonly currentPhrase: string;
  readonly isNoOptionFallbackAvailable: boolean;
}

export class CommunicatorStateCoordinator {
  readonly #nodes: readonly CommunicationNode[];
  #state: CommunicationNavigationState;

  constructor(nodes: readonly CommunicationNode[]) {
    this.#nodes = Object.freeze(nodes.map((node) => Object.freeze({ ...node })));
    this.#state = createRootNavigationState();
  }

  get snapshot(): CommunicatorSnapshot {
    return this.#createSnapshot();
  }

  confirmNode(nodeId: string): CommunicatorSnapshot {
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
        },
      ],
    };

    return this.#createSnapshot();
  }

  nextPage(): CommunicatorSnapshot {
    this.#state = goToNextOptionsPage(this.#nodes, this.#state);

    return this.#createSnapshot();
  }

  goBack(): CommunicatorSnapshot {
    const currentView = this.#currentNavigationView();
    const previousContext = currentView.state.history.at(-1);

    if (previousContext === undefined) {
      return this.#createSnapshot(currentView.state);
    }

    const history = currentView.state.history.slice(0, -1);
    this.#state = {
      parentId: previousContext.parentId,
      pageIndex: previousContext.pageIndex,
      confirmedPath: currentView.state.confirmedPath.slice(0, history.length),
      history,
    };

    return this.#createSnapshot();
  }

  startOver(): CommunicatorSnapshot {
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

  #createSnapshot(state: CommunicationNavigationState = this.#currentNavigationView().state): CommunicatorSnapshot {
    const navigation = deriveCommunicationNavigationView(this.#nodes, state);
    this.#state = navigation.state;

    return {
      navigation,
      currentPhrase: composeCurrentPhrase(this.#nodes, navigation.state.confirmedPath),
      isNoOptionFallbackAvailable: navigation.showNoOptionFallback,
    };
  }
}

export function createCommunicatorStateCoordinator(
  nodes: readonly CommunicationNode[],
): CommunicatorStateCoordinator {
  return new CommunicatorStateCoordinator(nodes);
}

function composeCurrentPhrase(nodes: readonly CommunicationNode[], confirmedPath: readonly string[]): string {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return confirmedPath
    .map((nodeId) => nodesById.get(nodeId)?.phrasePart?.trim() ?? '')
    .filter((phrasePart) => phrasePart.length > 0)
    .join(' ');
}
