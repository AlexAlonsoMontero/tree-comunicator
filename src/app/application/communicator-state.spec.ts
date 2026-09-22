import { CommunicationNode } from '../domain/communication-navigation';
import { createCommunicatorStateCoordinator } from './communicator-state';

const rootOption = (
  id: string,
  label: string,
  position: number,
  extras: Partial<CommunicationNode> = {},
): CommunicationNode => node({ id, label, parentId: null, position, ...extras });

const childOption = (
  id: string,
  parentId: string,
  label: string,
  position: number,
  extras: Partial<CommunicationNode> = {},
): CommunicationNode => node({ id, label, parentId, position, ...extras });

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

const communicatorNodes = (): readonly CommunicationNode[] => [
  rootOption('pain', 'Me encuentro mal', 0, {
    isFixedHomeOption: true,
    phrasePart: 'Me duele',
  }),
  rootOption('drink', 'Quiero beber', 1, { phrasePart: 'Quiero beber' }),
  rootOption('food', 'Quiero comer', 2, { phrasePart: 'Quiero comer' }),
  rootOption('rest', 'Quiero descansar', 3, { phrasePart: 'Quiero descansar' }),
  rootOption('bathroom', 'Baño', 4, { phrasePart: 'Necesito ir al baño' }),
  rootOption('disabled', 'Desactivado', 5, { enabled: false, phrasePart: 'No debe aparecer' }),
  childOption('belly', 'pain', 'Barriga', 0, { phrasePart: 'la barriga', canFinish: true }),
  childOption('head', 'pain', 'Cabeza', 1, { phrasePart: 'la cabeza', canFinish: true }),
  childOption('blank-phrase', 'pain', 'No sé', 2, { phrasePart: '   ', canFinish: true }),
];

describe('communicator state coordinator', () => {
  it('RF-001/RF-009 exposes the initial deterministic navigation snapshot without a phrase', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    const snapshot = communicator.snapshot;

    expect(snapshot.navigation.visibleOptions.map((option) => option.id)).toEqual(['pain', 'drink', 'food', 'rest']);
    expect(snapshot.navigation.state).toEqual({ parentId: null, pageIndex: 0, confirmedPath: [], history: [] });
    expect(snapshot.currentPhrase).toBe('');
    expect(snapshot.isNoOptionFallbackAvailable).toBe(false);
  });

  it('RF-004/RF-012 confirms a visible parent node and enters its child level', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    const snapshot = communicator.confirmNode('pain');

    expect(snapshot.navigation.state.parentId).toBe('pain');
    expect(snapshot.navigation.state.confirmedPath).toEqual(['pain']);
    expect(snapshot.navigation.visibleOptions.map((option) => option.id)).toEqual(['belly', 'head', 'blank-phrase']);
    expect(snapshot.currentPhrase).toBe('Me duele');
  });

  it('RF-011/RF-012 composes the phrase from confirmed non-empty phrase parts in selection order', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    communicator.confirmNode('pain');
    const snapshot = communicator.confirmNode('belly');

    expect(snapshot.navigation.state.confirmedPath).toEqual(['pain', 'belly']);
    expect(snapshot.currentPhrase).toBe('Me duele la barriga');
  });

  it('RF-004/RF-010 safely ignores unknown, disabled, and non-visible node confirmations', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());
    const initialSnapshot = communicator.snapshot;

    expect(communicator.confirmNode('missing')).toEqual(initialSnapshot);
    expect(communicator.confirmNode('disabled')).toEqual(initialSnapshot);
    expect(communicator.confirmNode('bathroom')).toEqual(initialSnapshot);
  });

  it('RF-010 paginates visible root options and keeps fallback availability derived from the page', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    const snapshot = communicator.nextPage();

    expect(snapshot.navigation.state.pageIndex).toBe(1);
    expect(snapshot.navigation.visibleOptions.map((option) => option.id)).toEqual(['bathroom']);
    expect(snapshot.navigation.hasMoreOptions).toBe(false);
    expect(snapshot.isNoOptionFallbackAvailable).toBe(true);
  });

  it('RF-006 restores prior context and recomputes the phrase when going back', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    communicator.confirmNode('pain');
    communicator.confirmNode('belly');
    const snapshot = communicator.goBack();

    expect(snapshot.navigation.state.parentId).toBeNull();
    expect(snapshot.navigation.state.confirmedPath).toEqual([]);
    expect(snapshot.navigation.visibleOptions.map((option) => option.id)).toEqual(['pain', 'drink', 'food', 'rest']);
    expect(snapshot.currentPhrase).toBe('');
  });

  it('RF-007 clears all confirmed state and phrase when starting over', () => {
    const communicator = createCommunicatorStateCoordinator(communicatorNodes());

    communicator.confirmNode('pain');
    communicator.confirmNode('belly');
    const snapshot = communicator.startOver();

    expect(snapshot.navigation.state).toEqual({ parentId: null, pageIndex: 0, confirmedPath: [], history: [] });
    expect(snapshot.currentPhrase).toBe('');
  });

  it('RF-010a/RF-015 exposes local No encuentro mi opción availability on the final page', () => {
    const communicator = createCommunicatorStateCoordinator([
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true }),
    ]);

    const snapshot = communicator.snapshot;

    expect(snapshot.navigation.hasMoreOptions).toBe(false);
    expect(snapshot.navigation.showNoOptionFallback).toBe(true);
    expect(snapshot.isNoOptionFallbackAvailable).toBe(true);
  });

  it('RF-012 returns an empty phrase when confirmed nodes have no non-empty phrase parts', () => {
    const communicator = createCommunicatorStateCoordinator([
      rootOption('pain', 'Me encuentro mal', 0, { isFixedHomeOption: true, phrasePart: ' ' }),
      childOption('unknown', 'pain', 'No sé', 0, { phrasePart: '' }),
    ]);

    communicator.confirmNode('pain');
    const snapshot = communicator.confirmNode('unknown');

    expect(snapshot.currentPhrase).toBe('');
  });
});
