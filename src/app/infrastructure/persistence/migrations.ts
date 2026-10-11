import type { CommunicationNodeAction } from '../../domain/communication-navigation';
import { DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID } from '../../domain/default-pictogram-emojis';

export interface DatabaseMigration {
  readonly version: number;
  readonly description: string;
  readonly statements: readonly string[];
}

export const COMMUNICATION_NODE_ACTIONS = [
  'none',
  'initial-sms',
  'update-sms',
] as const satisfies readonly CommunicationNodeAction[];

const COMMUNICATION_NODE_ACTION_SQL_VALUES = COMMUNICATION_NODE_ACTIONS.map(
  (action) => `'${action}'`,
).join(', ');

const DEFAULT_PICTOGRAM_EMOJI_ENTRIES = Object.entries(DEFAULT_PICTOGRAM_EMOJIS_BY_NODE_ID);

const DEFAULT_PICTOGRAM_EMOJI_BACKFILL_SQL = `UPDATE communication_nodes
SET pictogram_emoji = CASE id
${DEFAULT_PICTOGRAM_EMOJI_ENTRIES.map(
  ([nodeId, emoji]) => `  WHEN ${sqlStringLiteral(nodeId)} THEN ${sqlStringLiteral(emoji)}`,
).join('\n')}
END
WHERE id IN (${DEFAULT_PICTOGRAM_EMOJI_ENTRIES.map(([nodeId]) => sqlStringLiteral(nodeId)).join(
  ', ',
)})
  AND pictogram_emoji IS NULL`;

export const DATABASE_MIGRATIONS = [
  {
    version: 1,
    description: 'Create communication node schema',
    statements: [
      `CREATE TABLE communication_nodes (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  parent_id TEXT REFERENCES communication_nodes(id),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  speech_text TEXT NOT NULL CHECK (length(trim(speech_text)) > 0),
  position REAL NOT NULL CHECK (
    typeof(position) IN ('integer', 'real')
    AND position >= -1.7976931348623157e308
    AND position <= 1.7976931348623157e308
  ),
  enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
  locked_position INTEGER NOT NULL CHECK (locked_position IN (0, 1)),
  can_finish INTEGER NOT NULL CHECK (can_finish IN (0, 1)),
  has_optional_details INTEGER NOT NULL CHECK (has_optional_details IN (0, 1)),
  action TEXT NOT NULL CHECK (action IN (${COMMUNICATION_NODE_ACTION_SQL_VALUES})),
  phrase_part TEXT,
  pictogram_path TEXT,
  color_token TEXT,
  is_fixed_home_option INTEGER CHECK (is_fixed_home_option IN (0, 1))
)`,
      `CREATE INDEX communication_nodes_parent_position_idx
ON communication_nodes (parent_id, position, label, id)`,
      `CREATE INDEX communication_nodes_action_idx
ON communication_nodes (action)`,
      `CREATE INDEX communication_nodes_enabled_idx
ON communication_nodes (enabled)`,
    ],
  },
  {
    version: 2,
    description: 'Add emoji pictograms to communication nodes',
    statements: [
      'ALTER TABLE communication_nodes ADD COLUMN pictogram_emoji TEXT',
      DEFAULT_PICTOGRAM_EMOJI_BACKFILL_SQL,
    ],
  },
] as const satisfies readonly DatabaseMigration[];

function sqlStringLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
