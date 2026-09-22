export type CommunicationNodeAction = 'none' | 'initial-sms' | 'update-sms';

export interface CommunicationNode {
  readonly id: string;
  readonly parentId: string | null;
  readonly label: string;
  readonly speechText: string;
  readonly position: number;
  readonly enabled: boolean;
  readonly lockedPosition: boolean;
  readonly canFinish: boolean;
  readonly hasOptionalDetails: boolean;
  readonly action: CommunicationNodeAction;
  readonly phrasePart?: string;
  readonly pictogramPath?: string;
  readonly colorToken?: string;
  readonly isFixedHomeOption?: boolean;
}

export interface CommunicationNavigationState {
  readonly parentId: string | null;
  readonly pageIndex: number;
  readonly confirmedPath: readonly string[];
  readonly history: readonly NavigationHistoryEntry[];
}

export interface CommunicationNavigationView {
  readonly state: CommunicationNavigationState;
  readonly visibleOptions: readonly CommunicationNode[];
  readonly hasMoreOptions: boolean;
  readonly showNoOptionFallback: boolean;
}

interface NavigationHistoryEntry {
  readonly parentId: string | null;
  readonly pageIndex: number;
}

interface NavigationModel {
  readonly byId: ReadonlyMap<string, CommunicationNode>;
  readonly childrenByParent: ReadonlyMap<string, readonly CommunicationNode[]>;
}

const ROOT_KEY = '__root__';
const OPTIONS_PER_PAGE = 4;

export function createRootNavigationState(): CommunicationNavigationState {
  return {
    parentId: null,
    pageIndex: 0,
    confirmedPath: [],
    history: [],
  };
}

export function deriveCommunicationNavigationView(
  nodes: readonly CommunicationNode[],
  state: CommunicationNavigationState = createRootNavigationState(),
): CommunicationNavigationView {
  const model = buildNavigationModel(nodes);
  const siblings = getChildren(model, state.parentId);
  const pageIndex = clampPageIndex(state.pageIndex, siblings.length);
  const pageStart = pageIndex * OPTIONS_PER_PAGE;
  const visibleOptions = siblings.slice(pageStart, pageStart + OPTIONS_PER_PAGE);
  const hasMoreOptions = pageStart + OPTIONS_PER_PAGE < siblings.length;

  return {
    state: {
      parentId: state.parentId,
      pageIndex,
      confirmedPath: sanitizeConfirmedPath(state.confirmedPath, model.byId),
      history: sanitizeHistory(state.history, model.byId),
    },
    visibleOptions,
    hasMoreOptions,
    showNoOptionFallback: !hasMoreOptions,
  };
}

export function enterChildLevel(
  nodes: readonly CommunicationNode[],
  state: CommunicationNavigationState,
  selectedNodeId: string,
): CommunicationNavigationState {
  const model = buildNavigationModel(nodes);
  const selectedNode = model.byId.get(selectedNodeId);
  const children = getChildren(model, selectedNodeId);

  if (selectedNode === undefined || children.length === 0) {
    return deriveCommunicationNavigationView(nodes, state).state;
  }

  return {
    parentId: selectedNodeId,
    pageIndex: 0,
    confirmedPath: [...sanitizeConfirmedPath(state.confirmedPath, model.byId), selectedNodeId],
    history: [
      ...sanitizeHistory(state.history, model.byId),
      {
        parentId: state.parentId,
        pageIndex: deriveCommunicationNavigationView(nodes, state).state.pageIndex,
      },
    ],
  };
}

export function goToNextOptionsPage(
  nodes: readonly CommunicationNode[],
  state: CommunicationNavigationState,
): CommunicationNavigationState {
  const currentView = deriveCommunicationNavigationView(nodes, state);

  if (!currentView.hasMoreOptions) {
    return currentView.state;
  }

  return {
    ...currentView.state,
    pageIndex: currentView.state.pageIndex + 1,
  };
}

export function goBackToPreviousContext(
  nodes: readonly CommunicationNode[],
  state: CommunicationNavigationState,
): CommunicationNavigationState {
  const model = buildNavigationModel(nodes);
  const history = sanitizeHistory(state.history, model.byId);
  const previousContext = history.at(-1);

  if (previousContext === undefined) {
    return deriveCommunicationNavigationView(nodes, state).state;
  }

  return {
    parentId: previousContext.parentId,
    pageIndex: previousContext.pageIndex,
    confirmedPath: sanitizeConfirmedPath(state.confirmedPath, model.byId).slice(0, -1),
    history: history.slice(0, -1),
  };
}

export function resetNavigationToRoot(): CommunicationNavigationState {
  return createRootNavigationState();
}

function buildNavigationModel(nodes: readonly CommunicationNode[]): NavigationModel {
  const byId = new Map<string, CommunicationNode>();

  for (const node of nodes) {
    if (isWellFormedNode(node) && !byId.has(node.id)) {
      byId.set(node.id, node);
    }
  }

  const childrenByParent = new Map<string, CommunicationNode[]>();

  for (const node of byId.values()) {
    if (!hasValidParent(node, byId)) {
      continue;
    }

    const key = keyForParent(node.parentId);
    const siblings = childrenByParent.get(key) ?? [];
    siblings.push(node);
    childrenByParent.set(key, siblings);
  }

  for (const [parentKey, children] of childrenByParent.entries()) {
    childrenByParent.set(parentKey, sortNodesForParent(children, parentKey));
  }

  return {
    byId,
    childrenByParent,
  };
}

function isWellFormedNode(node: CommunicationNode): boolean {
  return (
    node.enabled &&
    node.id.trim().length > 0 &&
    node.label.trim().length > 0 &&
    node.speechText.trim().length > 0 &&
    Number.isFinite(node.position) &&
    node.parentId !== node.id
  );
}

function hasValidParent(
  node: CommunicationNode,
  byId: ReadonlyMap<string, CommunicationNode>,
): boolean {
  return node.parentId === null || byId.has(node.parentId);
}

function getChildren(model: NavigationModel, parentId: string | null): readonly CommunicationNode[] {
  return model.childrenByParent.get(keyForParent(parentId)) ?? [];
}

function keyForParent(parentId: string | null): string {
  return parentId ?? ROOT_KEY;
}

function sortNodesForParent(nodes: readonly CommunicationNode[], parentKey: string): CommunicationNode[] {
  return [...nodes].sort((left, right) => {
    if (parentKey === ROOT_KEY) {
      const fixedHomeOrder = Number(Boolean(right.isFixedHomeOption)) - Number(Boolean(left.isFixedHomeOption));

      if (fixedHomeOrder !== 0) {
        return fixedHomeOrder;
      }
    }

    return left.position - right.position || left.label.localeCompare(right.label) || left.id.localeCompare(right.id);
  });
}

function clampPageIndex(pageIndex: number, siblingsCount: number): number {
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || siblingsCount === 0) {
    return 0;
  }

  return Math.min(pageIndex, Math.ceil(siblingsCount / OPTIONS_PER_PAGE) - 1);
}

function sanitizeConfirmedPath(
  confirmedPath: readonly string[],
  byId: ReadonlyMap<string, CommunicationNode>,
): readonly string[] {
  return confirmedPath.filter((nodeId) => byId.has(nodeId));
}

function sanitizeHistory(
  history: readonly NavigationHistoryEntry[],
  byId: ReadonlyMap<string, CommunicationNode>,
): readonly NavigationHistoryEntry[] {
  return history.filter((entry) => entry.parentId === null || byId.has(entry.parentId));
}
