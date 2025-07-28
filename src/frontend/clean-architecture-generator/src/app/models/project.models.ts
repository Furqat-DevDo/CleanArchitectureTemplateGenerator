export interface ProjectMetadata {
  projectName: string;
  entities: EntityMetadata[];
  options: GenerationOptions;
}

export interface EntityMetadata {
  id: string;
  name: string;
  properties: PropertyMetadata[];
  commands: CommandMetadata[];
  queries: QueryMetadata[];
  position: Position;
  color?: string;
}

export interface PropertyMetadata {
  id: string;
  name: string;
  type: string;
  isKey: boolean;
  required: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  isUnique?: boolean;
}

export interface CommandMetadata {
  id: string;
  name: string;
  type: 'create' | 'update' | 'delete';
  resultType?: string;
}

export interface QueryMetadata {
  id: string;
  name: string;
  type: 'single' | 'list';
  resultType: string;
}

export interface GenerationOptions {
  useFluentValidation: boolean;
  useAutoMapper: boolean;
  useMediatR: boolean;
  database: string;
  authentication: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Relationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromProperty?: string;
  toProperty?: string;
}

export interface ValidationRule {
  id: string;
  entityId: string;
  propertyId: string;
  type: 'required' | 'maxLength' | 'minLength' | 'range' | 'email' | 'custom';
  value?: any;
  message?: string;
}

export interface FlowchartNode {
  id: string;
  type: 'entity' | 'relationship' | 'validation';
  data: any;
  position: Position;
  selected?: boolean;
}

export interface FlowchartConnection {
  id: string;
  source: string;
  target: string;
  type: string;
}

export const ENTITY_COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#607D8B'  // Blue Grey
];

export const PROPERTY_TYPES = [
  'string',
  'int',
  'long',
  'decimal',
  'double',
  'float',
  'bool',
  'DateTime',
  'Guid'
];
