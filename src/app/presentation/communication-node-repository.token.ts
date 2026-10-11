import { InjectionToken } from '@angular/core';

import type { CommunicationNodeRepository } from '../application/communication-node-repository';

export const COMMUNICATION_NODE_REPOSITORY = new InjectionToken<CommunicationNodeRepository>(
  'COMMUNICATION_NODE_REPOSITORY',
);
