import type { CommunicationNode } from '../domain/communication-navigation';

export interface CommunicationNodeRepository {
  initializeAndLoad(
    initialNodes: readonly CommunicationNode[],
  ): Promise<readonly CommunicationNode[]>;
}
