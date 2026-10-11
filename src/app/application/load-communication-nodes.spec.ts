import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => vi.useRealTimers());

  it('loads nodes from the repository after initialization', async () => {
    const repository: CommunicationNodeRepository = {
      initializeAndLoad: async (initialNodes) => {
        expect(initialNodes).toBe(INITIAL_TREE);
        return PERSISTED_TREE;
      },
      saveNodes: async () => PERSISTED_TREE,
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
      saveNodes: async () => INITIAL_TREE,
    };

    await expect(loadCommunicationNodes(repository, INITIAL_TREE)).resolves.toEqual({
      nodes: INITIAL_TREE,
      source: 'in-memory-fallback',
      error: failure,
    });
  });

  it('uses the initial tree after a bounded timeout when repository initialization never settles', async () => {
    vi.useFakeTimers();
    const repository: CommunicationNodeRepository = {
      initializeAndLoad: () => new Promise<readonly CommunicationNode[]>(() => {}),
      saveNodes: async () => INITIAL_TREE,
    };

    const result = loadCommunicationNodes(repository, INITIAL_TREE);
    await vi.advanceTimersByTimeAsync(5_000);

    const loaded = await result;
    expect(loaded.nodes).toBe(INITIAL_TREE);
    expect(loaded.source).toBe('in-memory-fallback');
    expect(loaded.error).toBeInstanceOf(Error);
    expect((loaded.error as Error).message).toBe(
      'Persistent communication tree load timed out after 5000 ms.',
    );
  });

  it('keeps the timeout fallback result when repository initialization rejects late', async () => {
    vi.useFakeTimers();
    const startup = deferred<readonly CommunicationNode[]>();
    const repository: CommunicationNodeRepository = {
      initializeAndLoad: () => startup.promise,
      saveNodes: async () => INITIAL_TREE,
    };

    const result = loadCommunicationNodes(repository, INITIAL_TREE);
    await vi.advanceTimersByTimeAsync(5_000);
    await expect(result).resolves.toMatchObject({
      nodes: INITIAL_TREE,
      source: 'in-memory-fallback',
    });

    startup.reject(new Error('sqlite returned late'));
    await Promise.resolve();
    await expect(result).resolves.toMatchObject({
      nodes: INITIAL_TREE,
      source: 'in-memory-fallback',
    });
  });
});

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason?: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((reason?: unknown) => void) | undefined;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  if (resolve === undefined || reject === undefined) {
    throw new Error('Deferred promise callbacks were not initialized.');
  }

  return { promise, resolve, reject };
}

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
