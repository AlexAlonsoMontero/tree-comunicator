import type { CommunicationNode } from '../domain/communication-navigation';
import type { CommunicationNodeRepository } from './communication-node-repository';

const REPOSITORY_LOAD_TIMEOUT_MS = 5_000;

export type CommunicationNodeLoadSource = 'persistent' | 'in-memory-fallback';

export interface LoadCommunicationNodesResult {
  readonly nodes: readonly CommunicationNode[];
  readonly source: CommunicationNodeLoadSource;
  readonly error?: unknown;
}

export async function loadCommunicationNodes(
  repository: CommunicationNodeRepository,
  initialNodes: readonly CommunicationNode[],
): Promise<LoadCommunicationNodesResult> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const repositoryLoad = repository.initializeAndLoad(initialNodes);
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Persistent communication tree load timed out after 5000 ms.'));
    }, REPOSITORY_LOAD_TIMEOUT_MS);
  });

  try {
    const nodes = await Promise.race([repositoryLoad, timeout]);
    return {
      nodes,
      source: 'persistent',
    };
  } catch (error: unknown) {
    return {
      nodes: initialNodes,
      source: 'in-memory-fallback',
      error,
    };
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
