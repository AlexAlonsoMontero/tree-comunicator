import { describe, expect, it } from 'vitest';

import type { CommunicationNode } from '../domain/communication-navigation';
import type { CommunicationNodeRepository } from './communication-node-repository';
import { loadCommunicationNodes } from './load-communication-nodes';

const INITIAL_TREE: readonly CommunicationNode[] = [
  createNode({ id: 'feeling-unwell', label: 'Me encuentro mal', position: 0 }),
];

const PERSISTED_TREE: readonly CommunicationNode[] = [
  createNode({ id: 'persisted', label: 'Persistido', position: 1 }),
];

describe('loadCommunicationNodes', () => {
  it('loads nodes from the repository after initialization', async () => {
    const repository: CommunicationNodeRepository = {
      initializeAndLoad: async (initialNodes) => {
        expect(initialNodes).toBe(INITIAL_TREE);
        return PERSISTED_TREE;
      },
    };

    await expect(loadCommunicationNodes(repository, INITIAL_TREE)).resolves.toEqual({
      nodes: PERSISTED_TREE,
      source: 'persistent',
    });
  });

  it('continues with an explicit in-memory fallback when repository initialization fails', async () => {
    const failure = new Error('sqlite unavailable');
    const repository: CommunicationNodeRepository = {
      initializeAndLoad: async () => {
        throw failure;
      },
    };

    await expect(loadCommunicationNodes(repository, INITIAL_TREE)).resolves.toEqual({
      nodes: INITIAL_TREE,
      source: 'in-memory-fallback',
      error: failure,
    });
  });
});

function createNode(
  node: Pick<CommunicationNode, 'id' | 'label' | 'position'> & Partial<CommunicationNode>,
): CommunicationNode {
  return {
    parentId: null,
    speechText: node.label,
    enabled: true,
    lockedPosition: false,
    canFinish: false,
    hasOptionalDetails: false,
    action: 'none',
    ...node,
  };
}
