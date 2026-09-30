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

  it('inserts and updates submitted nodes by stable id then reads back the full tree', async () => {
    const sqlite = createSQLiteClient({ count: 2, rows: INITIAL_TREE.map(rowFromNode) });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);
    const updated = createNode({
      ...INITIAL_TREE[1]!,
      label: 'Agua fría',
      speechText: 'Necesito agua fría',
      phrasePart: 'Necesito agua fría',
      position: 2,
      pictogramPath: 'pictograms/water-cold.svg',
      colorToken: 'need',
    });
    const inserted = createNode({
      id: 'new-snack',
      parentId: null,
      label: 'Comida',
      speechText: 'Quiero comida',
      phrasePart: 'Quiero comida',
      position: 3,
      canFinish: true,
      hasOptionalDetails: true,
      action: 'update-sms',
      pictogramPath: 'pictograms/snack.svg',
      colorToken: 'food',
    });

    await expect(repository.saveNodes([updated, inserted])).resolves.toEqual([
      INITIAL_TREE[0]!,
      inserted,
      updated,
    ]);

    const executeSet = sqlite.calls.find((call) => call.name === 'executeSet');
    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'beginTransaction',
      'executeSet',
      'commitTransaction',
      'query',
      'closeConnection',
    ]);
    expect(executeSet?.options).toMatchObject({
      database: DATABASE_NAME,
      transaction: false,
      set: [
        {
          statement: expect.stringContaining('ON CONFLICT(id) DO UPDATE SET'),
          values: expect.arrayContaining(['need-water', 'Agua fría', 'Necesito agua fría']),
        },
        {
          statement: expect.stringContaining('ON CONFLICT(id) DO UPDATE SET'),
          values: expect.arrayContaining(['new-snack', 'Comida', 'Quiero comida']),
        },
      ],
    });
  });

  it('retains omitted nodes and persists deactivation without issuing delete statements', async () => {
    const disabled = createNode({
      ...INITIAL_TREE[1]!,
      enabled: false,
    });
    const sqlite = createSQLiteClient({ count: 2, rows: INITIAL_TREE.map(rowFromNode) });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.saveNodes([disabled])).resolves.toEqual([INITIAL_TREE[0]!, disabled]);

    const executeSet = sqlite.calls.find((call) => call.name === 'executeSet');
    expect(executeSet?.options).toMatchObject({
      set: [
        {
          statement: expect.not.stringContaining('DELETE'),
          values: expect.arrayContaining([0]),
        },
      ],
    });
  });

  it('orders submitted parents before their new children', async () => {
    const sqlite = createSQLiteClient({ count: 0, rows: [] });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);
    const parent = createNode({
      id: 'new-parent',
      parentId: null,
      label: 'Padre',
      speechText: 'Padre',
      position: 1,
    });
    const child = createNode({
      id: 'new-child',
      parentId: 'new-parent',
      label: 'Hijo',
      speechText: 'Hijo',
      position: 1,
    });

    await repository.saveNodes([child, parent]);

    const executeSet = sqlite.calls.find((call) => call.name === 'executeSet');
    expect(executeSet?.options).toMatchObject({
      set: [
        { values: expect.arrayContaining(['new-parent']) },
        { values: expect.arrayContaining(['new-child']) },
      ],
    });
  });

  it('rejects duplicate ids and dependency cycles before opening a connection', async () => {
    const duplicateSqlite = createSQLiteClient({ count: 0, rows: [] });
    const duplicateRepository = new SQLiteCommunicationNodeRepository(duplicateSqlite);
    const node = createNode({
      id: 'same-id',
      parentId: null,
      label: 'Uno',
      speechText: 'Uno',
      position: 1,
    });

    await expect(duplicateRepository.saveNodes([node, { ...node, label: 'Dos' }])).rejects.toThrow(
      'Communication node batch contains duplicate id: same-id.',
    );
    expect(duplicateSqlite.calls).toEqual([]);

    const cycleSqlite = createSQLiteClient({ count: 0, rows: [] });
    const cycleRepository = new SQLiteCommunicationNodeRepository(cycleSqlite);
    await expect(
      cycleRepository.saveNodes([
        createNode({
          id: 'cycle-a',
          parentId: 'cycle-b',
          label: 'A',
          speechText: 'A',
          position: 1,
        }),
        createNode({
          id: 'cycle-b',
          parentId: 'cycle-a',
          label: 'B',
          speechText: 'B',
          position: 1,
        }),
      ]),
    ).rejects.toThrow('Communication node batch contains a dependency cycle at id: cycle-a.');
    expect(cycleSqlite.calls).toEqual([]);
  });

  it('does no writes for an empty batch and returns the current full tree', async () => {
    const sqlite = createSQLiteClient({ count: 2, rows: INITIAL_TREE.map(rowFromNode) });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.saveNodes([])).resolves.toEqual(INITIAL_TREE);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'query',
      'closeConnection',
    ]);
  });

  it('commits a successful save batch and rolls back a failed batch', async () => {
    const successSqlite = createSQLiteClient({ count: 0, rows: [] });
    const successRepository = new SQLiteCommunicationNodeRepository(successSqlite);

    await expect(successRepository.saveNodes([INITIAL_TREE[0]!])).resolves.toEqual([
      INITIAL_TREE[0]!,
    ]);

    expect(successSqlite.calls.map((call) => call.name)).toContain('commitTransaction');

    const writeFailure = new Error('upsert failed');
    const replacement = createNode({
      ...INITIAL_TREE[0]!,
      label: 'No persistido',
      speechText: 'No persistido',
    });
    const failureSqlite = createSQLiteClient({
      count: 2,
      rows: INITIAL_TREE.map(rowFromNode),
      executeSetError: writeFailure,
    });
    const failureRepository = new SQLiteCommunicationNodeRepository(failureSqlite);

    await expect(failureRepository.saveNodes([replacement])).rejects.toBe(writeFailure);
    await expect(failureRepository.saveNodes([])).resolves.toEqual(INITIAL_TREE);

    expect(failureSqlite.calls.map((call) => call.name).slice(0, 7)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'beginTransaction',
      'executeSet',
      'rollbackTransaction',
      'closeConnection',
    ]);
  });

  it('preserves the original save error when rollback and close also fail', async () => {
    const writeFailure = new Error('upsert failed');
    const sqlite = createSQLiteClient({
      count: 0,
      rows: [],
      executeSetError: writeFailure,
      rollbackTransactionError: new Error('rollback failed'),
      closeConnectionError: new Error('close failed'),
    });
    const repository = new SQLiteCommunicationNodeRepository(sqlite);

    await expect(repository.saveNodes([INITIAL_TREE[0]!])).rejects.toBe(writeFailure);

    expect(sqlite.calls.map((call) => call.name)).toEqual([
      'addUpgradeStatement',
      'createConnection',
      'open',
      'beginTransaction',
      'executeSet',
      'rollbackTransaction',
      'closeConnection',
    ]);
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
  readonly commitTransactionError?: Error;
  readonly rollbackTransactionError?: Error;
  readonly closeConnectionError?: Error;
}

function createSQLiteClient(options: SQLiteClientOptions): FakeSQLiteClient {
  const calls: RecordedCall[] = [];
  let rows = [...options.rows];
  let transactionSnapshot: readonly Record<string, unknown>[] | undefined;
  let pendingExecuteSetFailures = options.executeSetError === undefined ? 0 : 1;

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
        return { values: [{ node_count: rows.length === 0 ? options.count : rows.length }] };
      }

      return { values: orderRowsLikeLoadNodesSql(rows) };
    },
    async beginTransaction(transactionOptions) {
      calls.push({ name: 'beginTransaction', options: transactionOptions });
      transactionSnapshot = rows.map((row) => ({ ...row }));
      return { changes: { changes: 0 } };
    },
    async executeSet(setOptions) {
      calls.push({ name: 'executeSet', options: setOptions });
      for (const item of setOptions.set ?? []) {
        const values = item.values ?? [];
        rows = upsertRow(rows, rowFromSerializedNode(values));
      }
      if (pendingExecuteSetFailures > 0 && options.executeSetError !== undefined) {
        pendingExecuteSetFailures -= 1;
        throw options.executeSetError;
      }

      return { changes: { changes: setOptions.set?.length ?? 0 } };
    },
    async commitTransaction(transactionOptions) {
      calls.push({ name: 'commitTransaction', options: transactionOptions });
      if (options.commitTransactionError !== undefined) {
        throw options.commitTransactionError;
      }

      transactionSnapshot = undefined;
      return { changes: { changes: 0 } };
    },
    async rollbackTransaction(transactionOptions) {
      calls.push({ name: 'rollbackTransaction', options: transactionOptions });
      if (transactionSnapshot !== undefined) {
        rows = transactionSnapshot.map((row) => ({ ...row }));
      }
      transactionSnapshot = undefined;
      if (options.rollbackTransactionError !== undefined) {
        throw options.rollbackTransactionError;
      }

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

function rowFromNode(node: CommunicationNode): Record<string, unknown> {
  return {
    id: node.id,
    parent_id: node.parentId,
    label: node.label,
    speech_text: node.speechText,
    position: node.position,
    enabled: node.enabled ? 1 : 0,
    locked_position: node.lockedPosition ? 1 : 0,
    can_finish: node.canFinish ? 1 : 0,
    has_optional_details: node.hasOptionalDetails ? 1 : 0,
    action: node.action,
    phrase_part: node.phrasePart ?? null,
    pictogram_path: node.pictogramPath ?? null,
    color_token: node.colorToken ?? null,
    is_fixed_home_option:
      node.isFixedHomeOption === undefined ? null : node.isFixedHomeOption ? 1 : 0,
  };
}

function rowFromSerializedNode(values: readonly unknown[]): Record<string, unknown> {
  return {
    id: values[0],
    parent_id: values[1],
    label: values[2],
    speech_text: values[3],
    position: values[4],
    enabled: values[5],
    locked_position: values[6],
    can_finish: values[7],
    has_optional_details: values[8],
    action: values[9],
    phrase_part: values[10],
    pictogram_path: values[11],
    color_token: values[12],
    is_fixed_home_option: values[13],
  };
}

function upsertRow(
  currentRows: readonly Record<string, unknown>[],
  nextRow: Record<string, unknown>,
): Record<string, unknown>[] {
  const nextRows = currentRows.filter((row) => row['id'] !== nextRow['id']);
  nextRows.push(nextRow);
  return nextRows;
}

function orderRowsLikeLoadNodesSql(
  currentRows: readonly Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...currentRows].sort((left, right) => {
    const parentComparison =
      Number(left['parent_id'] !== null) - Number(right['parent_id'] !== null);
    if (parentComparison !== 0) return parentComparison;

    return (
      compareNullableText(left['parent_id'], right['parent_id']) ||
      compareNumbers(left['position'], right['position']) ||
      compareText(left['label'], right['label']) ||
      compareText(left['id'], right['id'])
    );
  });
}

function compareNullableText(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === null) return -1;
  if (right === null) return 1;

  return compareText(left, right);
}

function compareText(left: unknown, right: unknown): number {
  return String(left).localeCompare(String(right));
}

function compareNumbers(left: unknown, right: unknown): number {
  return Number(left) - Number(right);
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
