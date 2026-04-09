export interface EntityDefinition {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  image: string;
  format: 'svg' | 'png' | 'gif';
  animated: boolean;
}

export interface EntityManifest {
  version: string;
  entities: EntityDefinition[];
}

export interface EmbeddedEntity {
  id: string;
  name: string;
  image: string;
  tags: string[];
}

export interface EntityConfig {
  registry: string;
  embedded: EmbeddedEntity[];
}
