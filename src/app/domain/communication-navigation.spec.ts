import {
  CommunicationNode,
  createRootNavigationState,
  deriveCommunicationNavigationView,
  enterChildLevel,
  goBackToPreviousContext,
  goToNextOptionsPage,
  resetNavigationToRoot,
} from './communication-navigation';

const rootOption = (
  id: string,
  label: string,
  position: number,
  extras: Partial<CommunicationNode> = {},
): CommunicationNode => node({ id, label, parentId: null, position, ...extras });

const childOption = (id: string, parentId: string, label: string, position: number): CommunicationNode =>
  node({ id, label, parentId, position });

const node = (overrides: Partial<CommunicationNode> & Pick<CommunicationNode, 'id' | 'label'>): CommunicationNode => ({
  id: overrides.id,
  parentId: overrides.parentId ?? null,
  label: overrides.label,
  speechText: overrides.speechText ?? overrides.label,
  position: overrides.position ?? 0,
  enabled: overrides.enabled ?? true,
  lockedPosition: overrides.lockedPosition ?? false,
  canFinish: overrides.canFinish ?? false,
  hasOptionalDetails: overrides.hasOptionalDetails ?? false,
  action: overrides.action ?? 'none',
  ...(overrides.phrasePart === undefined ? {} : { phrasePart: overrides.phrasePart }),
  ...(overrides.pictogramPath === undefined ? {} : { pictogramPath: overrides.pictogramPath }),
  ...(overrides.colorToken === undefined ? {} : { colorToken: overrides.colorToken }),
  ...(overrides.isFixedHomeOption === undefined ? {} : { isFixedHomeOption: overrides.isFixedHomeOption }),
});

describe('communication navigation domain rules', () => {
  it('RF-001/RF-009 exposes at most four content options and keeps paging controls out of the tree', () => {
    const view = deriveCommunicationNavigationView([
      rootOption('needs-help', 'Necesito ayuda', 0),
      rootOption('drink', 'Quiero beber', 1),
      rootOption('rest', 'Quiero descansar', 2),
      rootOption('pain', 'Me encuentro mal', 3, { isFixedHomeOption: true }),
      rootOption('bathroom', 'Baño', 4),
    ]);

    expect(view.visibleOptions).toHaveLength(4);
    expect(view.visibleOptions.map((option) => option.id)).toEqual(['pain', 'needs-help', 'drink', 'rest']);
    expect(view.hasMoreOptions).toBe(true);
    expect(view.showNoOptionFallback).toBe(false);
    expect(view.visibleOptions.some((option) => option.label === 'Otras opciones')).toBe(false);
    expect(view.visibleOptions.some((option) => option.label === 'No encuentro mi opción')).toBe(false);
  });

  it('RF-010b keeps the fixed home option first at root while preserving deterministic order for the rest', () => {
    const view = deriveCommunicationNavigationView([
      rootOption('drink', 'Quiero beber', 20),
      rootOption('food', 'Quiero comer', 10),
      rootOption('pain', 'Me encuentro mal', 99, { isFixedHomeOption: true }),
      rootOption('hello', 'Hola', 10),
    ]);

    expect(view.visibleOptions.map((option) => option.id)).toEqual(['pain', 'hello', 'food', 'drink']);
  });

  it('RF-010 derives next-page navigation from remaining siblings and then exposes local fallback', () => {
    const nodes = [
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }),
      rootOption('drink', 'Quiero beber', 1),
      rootOption('food', 'Quiero comer', 2),
      rootOption('rest', 'Descansar', 3),
      rootOption('bathroom', 'Baño', 4),
    ];

    const secondPageState = goToNextOptionsPage(nodes, createRootNavigationState());
    const secondPage = deriveCommunicationNavigationView(nodes, secondPageState);

    expect(secondPage.state.pageIndex).toBe(1);
    expect(secondPage.visibleOptions.map((option) => option.id)).toEqual(['bathroom']);
    expect(secondPage.hasMoreOptions).toBe(false);
    expect(secondPage.showNoOptionFallback).toBe(true);
    expect(goToNextOptionsPage(nodes, secondPageState)).toEqual(secondPage.state);
  });

  it('RF-010a/RF-015 exposes No encuentro mi opción when the current level has no further alternatives', () => {
    const view = deriveCommunicationNavigationView([rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true })]);

    expect(view.hasMoreOptions).toBe(false);
    expect(view.showNoOptionFallback).toBe(true);
  });

  it('enters a child level without treating optional UI controls as communication nodes', () => {
    const nodes = [
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }),
      childOption('where', 'pain', 'Dónde', 0),
      childOption('intensity', 'pain', 'Cuánto', 1),
    ];

    const childState = enterChildLevel(nodes, createRootNavigationState(), 'pain');
    const childView = deriveCommunicationNavigationView(nodes, childState);

    expect(childState.confirmedPath).toEqual(['pain']);
    expect(childView.visibleOptions.map((option) => option.id)).toEqual(['where', 'intensity']);
    expect(childView.visibleOptions).toHaveLength(2);
  });

  it('RF-006 restores the exact prior parent and page context when going back', () => {
    const nodes = [
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }),
      rootOption('drink', 'Quiero beber', 1),
      rootOption('food', 'Quiero comer', 2),
      rootOption('rest', 'Descansar', 3),
      rootOption('bathroom', 'Baño', 4),
      childOption('bathroom-now', 'bathroom', 'Ahora', 0),
    ];
    const secondPageState = goToNextOptionsPage(nodes, createRootNavigationState());
    const childState = enterChildLevel(nodes, secondPageState, 'bathroom');

    const restoredState = goBackToPreviousContext(nodes, childState);
    const restoredView = deriveCommunicationNavigationView(nodes, restoredState);

    expect(restoredState.parentId).toBeNull();
    expect(restoredState.pageIndex).toBe(1);
    expect(restoredState.confirmedPath).toEqual([]);
    expect(restoredView.visibleOptions.map((option) => option.id)).toEqual(['bathroom']);
  });

  it('RF-007 reset returns to root page zero and clears the confirmed path', () => {
    const state = enterChildLevel(
      [rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }), childOption('where', 'pain', 'Dónde', 0)],
      createRootNavigationState(),
      'pain',
    );

    expect(resetNavigationToRoot()).toEqual({ parentId: null, pageIndex: 0, confirmedPath: [], history: [] });
    expect(state.confirmedPath).toEqual(['pain']);
  });

  it('safely ignores malformed tree entries without framework dependencies', () => {
    const view = deriveCommunicationNavigationView([
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }),
      rootOption('', 'Sin identificador', 1),
      rootOption('blank-label', '   ', 2),
      rootOption('disabled', 'Desactivado', 3, { enabled: false }),
      childOption('orphan', 'missing-parent', 'Huérfano', 0),
      childOption('self-parent', 'self-parent', 'Ciclo propio', 0),
      rootOption('pain', 'Duplicado', 9),
    ]);

    expect(view.visibleOptions.map((option) => option.id)).toEqual(['pain']);
  });
});
