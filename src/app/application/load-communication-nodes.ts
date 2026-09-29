import type { CommunicationNode } from '../domain/communication-navigation';
import type { CommunicationNodeRepository } from './communication-node-repository';

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
  try {
    return {
      nodes: await repository.initializeAndLoad(initialNodes),
      source: 'persistent',
    };
  } catch (error: unknown) {
    return {
      nodes: initialNodes,
      source: 'in-memory-fallback',
      error,
    };
  }
}
