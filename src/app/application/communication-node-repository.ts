import type { CommunicationNode } from '../domain/communication-navigation';

export interface CommunicationNodeRepository {
  initializeAndLoad(
    initialNodes: readonly CommunicationNode[],
  ): Promise<readonly CommunicationNode[]>;

  saveNodes(nodes: readonly CommunicationNode[]): Promise<readonly CommunicationNode[]>;
}
