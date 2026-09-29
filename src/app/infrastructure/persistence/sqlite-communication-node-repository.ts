import { CapacitorSQLite } from '@capacitor-community/sqlite';
import type {
  capSQLiteSet,
  capSQLiteValues,
  capSQLiteVersionUpgrade,
  CapacitorSQLitePlugin,
} from '@capacitor-community/sqlite';

import type { CommunicationNodeRepository } from '../../application/communication-node-repository';
import type {
  CommunicationNode,
  CommunicationNodeAction,
} from '../../domain/communication-navigation';
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
  color_token,
  is_fixed_home_option
FROM communication_nodes
ORDER BY parent_id IS NOT NULL, parent_id, position, label, id`;

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
    await this.registerMigrations();
    await this.sqlite.createConnection({
      database: this.databaseName,
      version: LATEST_DATABASE_VERSION,
      encrypted: false,
      mode: 'no-encryption',
      readonly: false,
    });

    let initializationError: unknown;
    try {
      await this.sqlite.open({ database: this.databaseName, readonly: false });
      await this.seedInitialTreeWhenEmpty(initialNodes);
      return await this.loadNodes();
    } catch (error: unknown) {
      initializationError = error;
      throw error;
    } finally {
      try {
        await this.sqlite.closeConnection({ database: this.databaseName, readonly: false });
      } catch (closeError: unknown) {
        if (initializationError === undefined) {
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
  color_token,
  is_fixed_home_option
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values: serializeNode(node),
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

function serializeNode(node: CommunicationNode): unknown[] {
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
