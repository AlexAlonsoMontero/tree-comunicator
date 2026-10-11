import { describe, expect, it } from 'vitest';

import { DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID } from '../../domain/default-pictogram-emojis';
import { COMMUNICATION_NODE_ACTIONS, DATABASE_MIGRATIONS } from './migrations';

describe('DATABASE_MIGRATIONS', () => {
  const initialMigration = DATABASE_MIGRATIONS[0];
  const emojiMigration = DATABASE_MIGRATIONS[1];

  it('exposes deterministic ordered migrations without altering the initial migration', () => {
    expect(DATABASE_MIGRATIONS).toHaveLength(2);
    expect(initialMigration).toEqual({
      version: 1,
      description: 'Create communication node schema',
      statements: expect.any(Array),
    });
    expect(initialMigration?.statements.map((statement) => firstSqlWords(statement))).toEqual([
      'CREATE TABLE',
      'CREATE INDEX',
      'CREATE INDEX',
      'CREATE INDEX',
    ]);
    expect(emojiMigration).toEqual({
      version: 2,
      description: 'Add emoji pictograms to communication nodes',
      statements: expect.any(Array),
    });
    expect(emojiMigration?.statements.map((statement) => firstSqlWords(statement))).toEqual([
      'ALTER TABLE',
      'UPDATE communication_nodes',
    ]);
  });

  it('creates communication_nodes with every current CommunicationNode field persisted', () => {
    const createTable = initialMigration?.statements[0] ?? '';

    expect(createTable).toContain('CREATE TABLE communication_nodes');
    expect(createTable).toContain('id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0)');
    expect(createTable).toContain('parent_id TEXT REFERENCES communication_nodes(id)');
    expect(createTable).toContain('label TEXT NOT NULL CHECK (length(trim(label)) > 0)');
    expect(createTable).toContain(
      'speech_text TEXT NOT NULL CHECK (length(trim(speech_text)) > 0)',
    );
    expect(createTable).toContain('position REAL NOT NULL CHECK (');
    expect(createTable).toContain("typeof(position) IN ('integer', 'real')");
    expect(createTable).toContain('position >= -1.7976931348623157e308');
    expect(createTable).toContain('position <= 1.7976931348623157e308');
    expect(createTable).toContain('enabled INTEGER NOT NULL CHECK (enabled IN (0, 1))');
    expect(createTable).toContain(
      'locked_position INTEGER NOT NULL CHECK (locked_position IN (0, 1))',
    );
    expect(createTable).toContain('can_finish INTEGER NOT NULL CHECK (can_finish IN (0, 1))');
    expect(createTable).toContain(
      'has_optional_details INTEGER NOT NULL CHECK (has_optional_details IN (0, 1))',
    );
    expect(createTable).toContain('phrase_part TEXT');
    expect(createTable).toContain('pictogram_path TEXT');
    expect(createTable).not.toContain('pictogram_emoji');
    expect(createTable).toContain('color_token TEXT');
    expect(createTable).toContain(
      'is_fixed_home_option INTEGER CHECK (is_fixed_home_option IN (0, 1))',
    );
  });

  it('keeps position aligned with the domain finite-number invariant', () => {
    const createTable = initialMigration?.statements[0] ?? '';
    const positionConstraint = extractColumnDefinition(createTable, 'position');

    expect(positionConstraint).toContain('REAL NOT NULL CHECK');
    expect(positionConstraint).toContain("typeof(position) IN ('integer', 'real')");
    expect(positionConstraint).toContain('position >= -1.7976931348623157e308');
    expect(positionConstraint).toContain('position <= 1.7976931348623157e308');
    expect(positionConstraint).not.toContain('CAST(position AS INTEGER)');
    expect(positionConstraint).not.toContain('9007199254740991');
  });

  it('documents finite position examples including fractions and the IEEE-754 boundary', () => {
    const allowedFinitePositions = [
      0,
      -0,
      0.25,
      -3.75,
      Number.MIN_VALUE,
      -Number.MIN_VALUE,
      Number.MAX_VALUE,
      -Number.MAX_VALUE,
    ];
    const rejectedNonFinitePositions = [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NaN,
    ];

    expect(allowedFinitePositions.every(Number.isFinite)).toBe(true);
    expect(rejectedNonFinitePositions.some(Number.isFinite)).toBe(false);
    expect(Number.MAX_VALUE).toBe(1.7976931348623157e308);
  });

  it('constrains action values to the current domain union', () => {
    const createTable = initialMigration?.statements[0] ?? '';
    const expectedActionList = COMMUNICATION_NODE_ACTIONS.map((action) => `'${action}'`).join(', ');

    expect(COMMUNICATION_NODE_ACTIONS).toEqual(['none', 'initial-sms', 'update-sms']);
    expect(createTable).toContain(`action TEXT NOT NULL CHECK (action IN (${expectedActionList}))`);
  });

  it('adds pictogram_emoji in v2 and backfills only known default node ids', () => {
    expect(emojiMigration?.statements[0]).toBe(
      'ALTER TABLE communication_nodes ADD COLUMN pictogram_emoji TEXT',
    );

    const backfillSql = emojiMigration?.statements[1] ?? '';
    expect(backfillSql).toContain('UPDATE communication_nodes');
    expect(backfillSql).toContain('SET pictogram_emoji = CASE id');
    expect(backfillSql).toContain('AND pictogram_emoji IS NULL');

    for (const [nodeId, emoji] of Object.entries(DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID)) {
      expect(backfillSql).toContain(`WHEN '${nodeId}' THEN '${emoji}'`);
      expect(backfillSql).toContain(`'${nodeId}'`);
    }

    expect(backfillSql).not.toContain('pictogram_path');
    expect(backfillSql).not.toContain('ELSE');
  });

  it('adds useful communication node indexes without future-entity tables', () => {
    expect(initialMigration?.statements.slice(1)).toEqual([
      `CREATE INDEX communication_nodes_parent_position_idx
ON communication_nodes (parent_id, position, label, id)`,
      `CREATE INDEX communication_nodes_action_idx
ON communication_nodes (action)`,
      `CREATE INDEX communication_nodes_enabled_idx
ON communication_nodes (enabled)`,
    ]);

    const migrationSql = DATABASE_MIGRATIONS.flatMap((migration) => migration.statements).join(
      '\n',
    );

    expect(migrationSql).not.toMatch(
      /CREATE TABLE\s+(settings|sms_contacts|statistics|history)\b/u,
    );
    expect(migrationSql).not.toContain('page_index');
    expect(migrationSql).not.toContain('confirmed_path');
    expect(migrationSql).not.toContain('visible_options');
  });
});

function firstSqlWords(statement: string): string {
  return statement.trim().split(/\s+/u).slice(0, 2).join(' ');
}

function extractColumnDefinition(createTableSql: string, columnName: string): string {
  const columnStart = createTableSql.indexOf(`  ${columnName} `);
  const nextColumnStart = createTableSql.slice(columnStart + 1).search(/\n  [a-z_]/u);
  const columnEnd =
    nextColumnStart === -1 ? createTableSql.length : columnStart + 1 + nextColumnStart;

  return createTableSql.slice(columnStart, columnEnd).trim();
}
