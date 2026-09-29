import type { CommunicationNodeAction } from '../../domain/communication-navigation';

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
] as const satisfies readonly DatabaseMigration[];
