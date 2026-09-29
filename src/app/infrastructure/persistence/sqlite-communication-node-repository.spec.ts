import { describe, expect, it } from 'vitest';

import type { CommunicationNode } from '../../domain/communication-navigation';
import {
  DATABASE_NAME,
  LATEST_DATABASE_VERSION,
  SQLiteCommunicationNodeRepository,
  type SQLiteClient,
} from './sqlite-communication-node-repository';

const INITIAL_TREE: readonly CommunicationNode[] = [
  createNode({
    id: 'feeling-unwell',
    parentId: null,
    label: 'Me encuentro mal',
    speechText: 'Me encuentro mal',
    position: 0,
    isFixedHomeOption: true,
  }),
  createNode({
    id: 'need-water',
    parentId: 'need-something',
    label: 'Agua',
    speechText: 'Necesito agua',
    phrasePart: 'Necesito agua',
    position: 0.5,
    canFinish: true,
  }),
];

describe('SQLiteCommunicationNodeRepository', () => {
  it('registers v1 upgrades before opening the latest database version', async () => {
    const sqlite = createSQLiteClient({ count: 1, rows: [] });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await repository.initializeAndLoad(INITIAL_TREE);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'query',
      'query',
      'closeConnection',
    ]);
    expect(sqlite.calls[0]?.options).toMatchObject({
      database: DATABASE_NAME,
      upgrade: [
        {
          toVersion: 1,
          statements: expect.arrayContaining([
            expect.stringContaining('CREATE TABLE communication_nodes'),
          ]),
        },
      ],
    });
    expect(sqlite.calls[1]?.options).toEqual({
      database: DATABASE_NAME,
      version: LATEST_DATABASE_VERSION,
      encrypted: false,
      mode: 'no-encryption',
      readonly: false,
    });
  });

  it('closes the connection after a successful open and load', async () => {
    const sqlite = createSQLiteClient({ count: 1, rows: [] });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).resolves.toEqual([]);

    expect(sqlite.calls.at(-1)).toEqual({
      name: 'closeConnection',
      options: { database: DATABASE_NAME, readonly: false },
    });
  });

  it('closes the created connection when opening rejects and preserves the open error', async () => {
    const openFailure = new Error('open failed');
    const closeFailure = new Error('close failed');
    const sqlite = createSQLiteClient({
      count: 1,
      rows: [],
      openError: openFailure,
      closeConnectionError: closeFailure,
    });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).rejects.toBe(openFailure);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'closeConnection',
    ]);
  });

  it('does not close a connection when connection creation rejects', async () => {
    const createFailure = new Error('create failed');
    const sqlite = createSQLiteClient({ count: 1, rows: [], createConnectionError: createFailure });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).rejects.toBe(createFailure);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
    ]);
  });

  it('seeds the supplied initial tree once when communication_nodes is empty', async () => {
    const sqlite = createSQLiteClient({ count: 0, rows: [] });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await repository.initializeAndLoad(INITIAL_TREE);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'query',
      'beginTransaction',
      'executeSet',
      'commitTransaction',
      'query',
      'closeConnection',
    ]);
    expect(sqlite.calls.find((call) => call.name === 'executeSet')?.options).toMatchObject({
      database: DATABASE_NAME,
      transaction: false,
      set: [
        {
          statement: expect.stringContaining('INSERT INTO communication_nodes'),
          values: [
            'feeling-unwell',
            null,
            'Me encuentro mal',
            'Me encuentro mal',
            0,
            1,
            0,
            0,
            0,
            'none',
            null,
            null,
            null,
            1,
          ],
        },
        {
          statement: expect.stringContaining('INSERT INTO communication_nodes'),
          values: [
            'need-water',
            'need-something',
            'Agua',
            'Necesito agua',
            0.5,
            1,
            0,
            1,
            0,
            'none',
            'Necesito agua',
            null,
            null,
            null,
          ],
        },
      ],
    });
  });

  it('does not overwrite existing database contents', async () => {
    const sqlite = createSQLiteClient({ count: 3, rows: [] });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await repository.initializeAndLoad(INITIAL_TREE);

    expect(sqlite.calls.map((call) => call.name)).not.toContain('executeSet');
    expect(sqlite.calls.map((call) => call.name)).not.toContain('beginTransaction');
  });

  it('rolls back and closes the connection when seeding fails', async () => {
    const seedFailure = new Error('insert failed');
    const sqlite = createSQLiteClient({ count: 0, rows: [], executeSetError: seedFailure });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).rejects.toBe(seedFailure);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'query',
      'beginTransaction',
      'executeSet',
      'rollbackTransaction',
      'closeConnection',
    ]);
  });

  it('loads snake_case SQLite rows as complete CommunicationNode objects', async () => {
    const sqlite = createSQLiteClient({
      count: 2,
      rows: [
        {
          id: 'feeling-unwell',
          parent_id: null,
          label: 'Me encuentro mal',
          speech_text: 'Me encuentro mal',
          position: 0,
          enabled: 1,
          locked_position: 1,
          can_finish: 0,
          has_optional_details: 1,
          action: 'initial-sms',
          phrase_part: null,
          pictogram_path: 'pictograms/feel.svg',
          color_token: 'alert',
          is_fixed_home_option: 1,
        },
        {
          id: 'need-water',
          parent_id: 'need-something',
          label: 'Agua',
          speech_text: 'Necesito agua',
          position: 1.25,
          enabled: 0,
          locked_position: 0,
          can_finish: 1,
          has_optional_details: 0,
          action: 'update-sms',
          phrase_part: 'Necesito agua',
          pictogram_path: null,
          color_token: null,
          is_fixed_home_option: null,
        },
      ],
    });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).resolves.toEqual([
      {
        id: 'feeling-unwell',
        parentId: null,
        label: 'Me encuentro mal',
        speechText: 'Me encuentro mal',
        position: 0,
        enabled: true,
        lockedPosition: true,
        canFinish: false,
        hasOptionalDetails: true,
        action: 'initial-sms',
        pictogramPath: 'pictograms/feel.svg',
        colorToken: 'alert',
        isFixedHomeOption: true,
      },
      {
        id: 'need-water',
        parentId: 'need-something',
        label: 'Agua',
        speechText: 'Necesito agua',
        position: 1.25,
        enabled: false,
        lockedPosition: false,
        canFinish: true,
        hasOptionalDetails: false,
        action: 'update-sms',
        phrasePart: 'Necesito agua',
      },
    ]);
  });

  it('rejects non-finite positions and unsupported action values while still closing', async () => {
    const sqlite = createSQLiteClient({
      count: 1,
      rows: [
        {
          id: 'bad-node',
          parent_id: null,
          label: 'Bad',
          speech_text: 'Bad',
          position: Number.POSITIVE_INFINITY,
          enabled: 1,
          locked_position: 0,
          can_finish: 0,
          has_optional_details: 0,
          action: 'external-call',
          phrase_part: null,
          pictogram_path: null,
          color_token: null,
          is_fixed_home_option: null,
        },
      ],
    });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.initializeAndLoad(INITIAL_TREE)).rejects.toThrow(
      'SQLite column position must be a finite number.',
    );
    expect(sqlite.calls.at(-1)).toEqual({
      name: 'closeConnection',
      options: { database: DATABASE_NAME, readonly: false },
    });
  });
});

interface RecordedCall {
  readonly name: string;
  readonly options: unknown;
}

interface FakeSQLiteClient extends SQLiteClient {
  readonly calls: RecordedCall[];
}

interface SQLiteClientOptions {
  readonly count: number;
  readonly rows: readonly Record<string, unknown>[];
  readonly createConnectionError?: Error;
  readonly openError?: Error;
  readonly executeSetError?: Error;
  readonly closeConnectionError?: Error;
}

function createSQLiteClient(options: SQLiteClientOptions): FakeSQLiteClient {
  const calls: RecordedCall[] = [];

  return {
    calls,
    async addUpgradeStatement(upgradeOptions) {
      calls.push({ name: 'addUpgradeStatement', options: upgradeOptions });
    },
    async createConnection(connectionOptions) {
      calls.push({ name: 'createConnection', options: connectionOptions });
      if (options.createConnectionError !== undefined) {
        throw options.createConnectionError;
      }
    },
    async open(openOptions) {
      calls.push({ name: 'open', options: openOptions });
      if (options.openError !== undefined) {
        throw options.openError;
      }
    },
    async query(queryOptions) {
      calls.push({ name: 'query', options: queryOptions });
      const statement = queryOptions.statement ?? '';
      if (statement.includes('COUNT(1)')) {
        return { values: [{ node_count: options.count }] };
      }

      return { values: [...options.rows] };
    },
    async beginTransaction(transactionOptions) {
      calls.push({ name: 'beginTransaction', options: transactionOptions });
      return { changes: { changes: 0 } };
    },
    async executeSet(setOptions) {
      calls.push({ name: 'executeSet', options: setOptions });
      if (options.executeSetError !== undefined) {
        throw options.executeSetError;
      }

      return { changes: { changes: setOptions.set?.length ?? 0 } };
    },
    async commitTransaction(transactionOptions) {
      calls.push({ name: 'commitTransaction', options: transactionOptions });
      return { changes: { changes: 0 } };
    },
    async rollbackTransaction(transactionOptions) {
      calls.push({ name: 'rollbackTransaction', options: transactionOptions });
      return { changes: { changes: 0 } };
    },
    async closeConnection(closeOptions) {
      calls.push({ name: 'closeConnection', options: closeOptions });
      if (options.closeConnectionError !== undefined) {
        throw options.closeConnectionError;
      }
    },
  };
}

function createNode(
  node: Pick<CommunicationNode, 'id' | 'parentId' | 'label' | 'speechText' | 'position'> &
    Partial<CommunicationNode>,
): CommunicationNode {
  return {
    enabled: true,
    lockedPosition: false,
    canFinish: false,
    hasOptionalDetails: false,
    action: 'none',
    ...node,
  };
}
