import { CapacitorSQLite } from '@capacitor-community/sqlite';
import type {
  capSQLiteValues,
  capSQLiteVersionUpgrade,
  CapacitorSQLitePlugin,
} from '@capacitor-community/sqlite';

import type { CommunicationNodeRepository } from '../../application/communication-node-repository';
import type {
  CommunicationNode,
  CommunicationNodeAction,
} from '../../domain/communication-navigation';
import { DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID } from '../../domain/default-pictogram-emojis';
import { COMMUNICATION_NODE_ACTIONS, DATABASE_MIGRATIONS } from './migrations';

const DATABASE_NAME = 'tree-communicator';
const LATEST_DATABASE_VERSION = Math.max(
  ...DATABASE_MIGRATIONS.map((migration) => migration.version),
);
const LOAD_NODES_SQL = `SELECT
  id,
  parent_id,
  label,
  speech_text,
  position,
  enabled,
  locked_position,
  can_finish,
  has_optional_details,
  action,
  phrase_part,
  pictogram_path,
  pictogram_emoji,
  color_token,
  is_fixed_home_option
FROM communication_nodes
ORDER BY parent_id IS NOT NULL, parent_id, position, label, id`;

const UPSERT_NODE_SQL = `INSERT INTO communication_nodes (
  id,
  parent_id,
  label,
  speech_text,
  position,
  enabled,
  locked_position,
  can_finish,
  has_optional_details,
  action,
  phrase_part,
  pictogram_path,
  pictogram_emoji,
  color_token,
  is_fixed_home_option
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  parent_id = excluded.parent_id,
  label = excluded.label,
  speech_text = excluded.speech_text,
  position = excluded.position,
  enabled = excluded.enabled,
  locked_position = excluded.locked_position,
  can_finish = excluded.can_finish,
  has_optional_details = excluded.has_optional_details,
  action = excluded.action,
  phrase_part = excluded.phrase_part,
  pictogram_path = excluded.pictogram_path,
  pictogram_emoji = excluded.pictogram_emoji,
  color_token = excluded.color_token,
  is_fixed_home_option = excluded.is_fixed_home_option`;

type SQLiteClient = Pick<
  CapacitorSQLitePlugin,
  | 'addUpgradeStatement'
  | 'createConnection'
  | 'open'
  | 'query'
  | 'beginTransaction'
  | 'executeSet'
  | 'commitTransaction'
  | 'rollbackTransaction'
  | 'closeConnection'
>;

type DatabaseRow = Readonly<Record<string, unknown>>;

export class SQLiteCommunicationNodeRepository implements CommunicationNodeRepository {
  constructor(
    private readonly sqlite: SQLiteClient = CapacitorSQLite,
    private readonly databaseName = DATABASE_NAME,
  ) {}

  async initializeAndLoad(
    initialNodes: readonly CommunicationNode[],
  ): Promise<readonly CommunicationNode[]> {
    return await this.withOpenConnection(async () => {
      await this.seedInitialTreeWhenEmpty(initialNodes);
      return await this.loadNodes();
    });
  }

  async saveNodes(nodes: readonly CommunicationNode[]): Promise<readonly CommunicationNode[]> {
    const orderedNodes = orderNodesForBatchUpsert(nodes);

    return await this.withOpenConnection(async () => {
      if (orderedNodes.length > 0) {
        await this.saveNodesInTransaction(orderedNodes);
      }

      return await this.loadNodes();
    });
  }

  private async withOpenConnection<T>(work: () => Promise<T>): Promise<T> {
    await this.registerMigrations();
    await this.sqlite.createConnection({
      database: this.databaseName,
      version: LATEST_DATABASE_VERSION,
      encrypted: false,
      mode: 'no-encryption',
      readonly: false,
    });

    let operationError: unknown;
    try {
      await this.sqlite.open({ database: this.databaseName, readonly: false });
      const result = await work();

      return result;
    } catch (error: unknown) {
      operationError = error;
      throw error;
    } finally {
      try {
        await this.sqlite.closeConnection({ database: this.databaseName, readonly: false });
      } catch (closeError: unknown) {
        if (operationError === undefined) {
          throw closeError;
        }
      }
    }
  }

  private async registerMigrations(): Promise<void> {
    const upgrade = DATABASE_MIGRATIONS.map((migration): capSQLiteVersionUpgrade => ({
      toVersion: migration.version,
      statements: [...migration.statements],
    }));

    await this.sqlite.addUpgradeStatement({ database: this.databaseName, upgrade });
  }

  private async seedInitialTreeWhenEmpty(
    initialNodes: readonly CommunicationNode[],
  ): Promise<void> {
    if ((await this.countNodes()) > 0 || initialNodes.length === 0) {
      return;
    }

    let transactionActive = false;
    try {
      await this.sqlite.beginTransaction({ database: this.databaseName, readonly: false });
      transactionActive = true;
      await this.sqlite.executeSet({
        database: this.databaseName,
        transaction: false,
        set: initialNodes.map((node) => ({
          statement: `INSERT INTO communication_nodes (
  id,
  parent_id,
  label,
  speech_text,
  position,
  enabled,
  locked_position,
  can_finish,
  has_optional_details,
  action,
  phrase_part,
  pictogram_path,
  pictogram_emoji,
  color_token,
  is_fixed_home_option
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values: serializeNode(node, { useDefaultEmojiForKnownNode: true }),
        })),
      });
      await this.sqlite.commitTransaction({ database: this.databaseName, readonly: false });
      transactionActive = false;
    } catch (error: unknown) {
      if (transactionActive) {
        try {
          await this.sqlite.rollbackTransaction({ database: this.databaseName, readonly: false });
        } catch {
          /* Preserve the original seed failure for the caller's fallback path. */
        }
      }
      throw error;
    }
  }

  private async saveNodesInTransaction(nodes: readonly CommunicationNode[]): Promise<void> {
    let transactionActive = false;
    try {
      await this.sqlite.beginTransaction({ database: this.databaseName, readonly: false });
      transactionActive = true;
      await this.sqlite.executeSet({
        database: this.databaseName,
        transaction: false,
        set: nodes.map((node) => ({
          statement: UPSERT_NODE_SQL,
          values: serializeNode(node, { useDefaultEmojiForKnownNode: false }),
        })),
      });
      await this.sqlite.commitTransaction({ database: this.databaseName, readonly: false });
      transactionActive = false;
    } catch (error: unknown) {
      if (transactionActive) {
        try {
          await this.sqlite.rollbackTransaction({ database: this.databaseName, readonly: false });
        } catch {
          /* Preserve the original batch write failure for callers. */
        }
      }
      throw error;
    }
  }

  private async countNodes(): Promise<number> {
    const result = await this.sqlite.query({
      database: this.databaseName,
      statement: 'SELECT COUNT(1) AS node_count FROM communication_nodes',
      values: [],
      readonly: false,
    });
    const firstRow = firstResultRow(result);
    const count = numberValue(firstRow, 'node_count');

    if (!Number.isInteger(count) || count < 0) {
      throw new Error('Invalid communication_nodes count returned by SQLite.');
    }

    return count;
  }

  private async loadNodes(): Promise<readonly CommunicationNode[]> {
    const result = await this.sqlite.query({
      database: this.databaseName,
      statement: LOAD_NODES_SQL,
      values: [],
      readonly: false,
    });

    return resultRows(result).map(mapRowToNode);
  }
}

function orderNodesForBatchUpsert(
  nodes: readonly CommunicationNode[],
): readonly CommunicationNode[] {
  const nodesById = new Map<string, CommunicationNode>();
  for (const node of nodes) {
    if (nodesById.has(node.id)) {
      throw new Error(`Communication node batch contains duplicate id: ${node.id}.`);
    }
    nodesById.set(node.id, node);
  }

  const orderedNodes: CommunicationNode[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: CommunicationNode): void => {
    if (visited.has(node.id)) {
      return;
    }

    if (visiting.has(node.id)) {
      throw new Error(`Communication node batch contains a dependency cycle at id: ${node.id}.`);
    }

    visiting.add(node.id);
    const batchParent = node.parentId === null ? undefined : nodesById.get(node.parentId);
    if (batchParent !== undefined) {
      visit(batchParent);
    }
    visiting.delete(node.id);
    visited.add(node.id);
    orderedNodes.push(node);
  };

  for (const node of nodes) {
    visit(node);
  }

  return orderedNodes;
}

function serializeNode(
  node: CommunicationNode,
  options: Readonly<{ useDefaultEmojiForKnownNode: boolean }>,
): unknown[] {
  return [
    node.id,
    node.parentId,
    node.label,
    node.speechText,
    node.position,
    booleanToInteger(node.enabled),
    booleanToInteger(node.lockedPosition),
    booleanToInteger(node.canFinish),
    booleanToInteger(node.hasOptionalDetails),
    node.action,
    node.phrasePart ?? null,
    node.pictogramPath ?? null,
    node.pictogramEmoji ??
      (options.useDefaultEmojiForKnownNode ? DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID[node.id] : null) ??
      null,
    node.colorToken ?? null,
    node.isFixedHomeOption === undefined ? null : booleanToInteger(node.isFixedHomeOption),
  ];
}

function mapRowToNode(row: DatabaseRow): CommunicationNode {
  return {
    id: nonEmptyString(row, 'id'),
    parentId: nullableString(row, 'parent_id'),
    label: nonEmptyString(row, 'label'),
    speechText: nonEmptyString(row, 'speech_text'),
    position: finiteNumber(row, 'position'),
    enabled: booleanValue(row, 'enabled'),
    lockedPosition: booleanValue(row, 'locked_position'),
    canFinish: booleanValue(row, 'can_finish'),
    hasOptionalDetails: booleanValue(row, 'has_optional_details'),
    action: actionValue(row, 'action'),
    ...optionalStringProperty('phrasePart', optionalString(row, 'phrase_part')),
    ...optionalStringProperty('pictogramPath', optionalString(row, 'pictogram_path')),
    ...optionalStringProperty('pictogramEmoji', optionalString(row, 'pictogram_emoji')),
    ...optionalStringProperty('colorToken', optionalString(row, 'color_token')),
    ...optionalBooleanProperty('isFixedHomeOption', optionalBoolean(row, 'is_fixed_home_option')),
  };
}

function resultRows(result: capSQLiteValues): readonly DatabaseRow[] {
  return (result.values ?? []).map((row) => {
    if (isDatabaseRow(row)) {
      return row;
    }

    throw new Error('SQLite returned an invalid communication node row.');
  });
}

function firstResultRow(result: capSQLiteValues): DatabaseRow {
  const firstRow = resultRows(result)[0];
  if (firstRow === undefined) {
    throw new Error('SQLite returned no rows for a required scalar query.');
  }

  return firstRow;
}

function isDatabaseRow(value: unknown): value is DatabaseRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(row: DatabaseRow, key: string): string {
  const value = row[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  throw new Error(`SQLite column ${key} must be a non-empty string.`);
}

function nullableString(row: DatabaseRow, key: string): string | null {
  const value = row[key];
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  throw new Error(`SQLite column ${key} must be null or a non-empty string.`);
}

function optionalString(row: DatabaseRow, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`SQLite column ${key} must be null or a string.`);
}

function finiteNumber(row: DatabaseRow, key: string): number {
  const value = row[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  throw new Error(`SQLite column ${key} must be a finite number.`);
}

function numberValue(row: DatabaseRow, key: string): number {
  const value = row[key];
  if (typeof value === 'number') {
    return value;
  }

  throw new Error(`SQLite column ${key} must be a number.`);
}

function booleanValue(row: DatabaseRow, key: string): boolean {
  const value = row[key];
  if (value === 0) return false;
  if (value === 1) return true;

  throw new Error(`SQLite column ${key} must be 0 or 1.`);
}

function optionalBoolean(row: DatabaseRow, key: string): boolean | undefined {
  const value = row[key];
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value === 0) return false;
  if (value === 1) return true;

  throw new Error(`SQLite column ${key} must be null, 0, or 1.`);
}

function actionValue(row: DatabaseRow, key: string): CommunicationNodeAction {
  const value = row[key];
  if (isCommunicationNodeAction(value)) {
    return value;
  }

  throw new Error(`SQLite column ${key} contains an unsupported communication action.`);
}

function isCommunicationNodeAction(value: unknown): value is CommunicationNodeAction {
  return (
    typeof value === 'string' &&
    COMMUNICATION_NODE_ACTIONS.includes(value as CommunicationNodeAction)
  );
}

function optionalStringProperty<Key extends string>(
  key: Key,
  value: string | undefined,
): Record<Key, string> | Record<string, never> {
  return value === undefined ? {} : ({ [key]: value } as Record<Key, string>);
}

function optionalBooleanProperty<Key extends string>(
  key: Key,
  value: boolean | undefined,
): Record<Key, boolean> | Record<string, never> {
  return value === undefined ? {} : ({ [key]: value } as Record<Key, boolean>);
}

function booleanToInteger(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

export type { SQLiteClient };
export { DATABASE_NAME, LATEST_DATABASE_VERSION };
