import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  ProjectMetadata, 
  EntityMetadata, 
  PropertyMetadata, 
  CommandMetadata, 
  QueryMetadata,
  Relationship,
  ValidationRule,
  ENTITY_COLORS,
  Position
} from '../models/project.models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ProjectStateService {
  private projectSubject = new BehaviorSubject<ProjectMetadata>(this.createEmptyProject());
  private selectedEntitySubject = new BehaviorSubject<EntityMetadata | null>(null);
  private relationshipsSubject = new BehaviorSubject<Relationship[]>([]);
  private validationRulesSubject = new BehaviorSubject<ValidationRule[]>([]);

  public project$ = this.projectSubject.asObservable();
  public selectedEntity$ = this.selectedEntitySubject.asObservable();
  public relationships$ = this.relationshipsSubject.asObservable();
  public validationRules$ = this.validationRulesSubject.asObservable();

  constructor() {}

  // Project Management
  createEmptyProject(): ProjectMetadata {
    return {
      projectName: 'NewProject',
      entities: [],
      options: {
        useFluentValidation: true,
        useAutoMapper: true,
        useMediatR: true,
        database: 'EntityFramework',
        authentication: 'JWT'
      }
    };
  }

  updateProject(project: ProjectMetadata): void {
    this.projectSubject.next(project);
  }

  updateProjectName(name: string): void {
    const project = this.projectSubject.value;
    project.projectName = name;
    this.projectSubject.next(project);
  }

  // Entity Management
  addEntity(name: string, position: Position): EntityMetadata {
    const project = this.projectSubject.value;
    const colorIndex = project.entities.length % ENTITY_COLORS.length;
    
    const entity: EntityMetadata = {
      id: uuidv4(),
      name,
      properties: [
        {
          id: uuidv4(),
          name: 'Id',
          type: 'Guid',
          isKey: true,
          required: false
        }
      ],
      commands: [
        { id: uuidv4(), name: `Create${name}`, type: 'create' },
        { id: uuidv4(), name: `Update${name}`, type: 'update' },
        { id: uuidv4(), name: `Delete${name}`, type: 'delete' }
      ],
      queries: [
        { id: uuidv4(), name: `Get${name}s`, type: 'list', resultType: `List<${name}Dto>` },
        { id: uuidv4(), name: `Get${name}ById`, type: 'single', resultType: `${name}Dto` }
      ],
      position,
      color: ENTITY_COLORS[colorIndex]
    };

    project.entities.push(entity);
    this.projectSubject.next(project);
    return entity;
  }

  updateEntity(entityId: string, updates: Partial<EntityMetadata>): void {
    const project = this.projectSubject.value;
    const entityIndex = project.entities.findIndex(e => e.id === entityId);
    
    if (entityIndex !== -1) {
      project.entities[entityIndex] = { ...project.entities[entityIndex], ...updates };
      this.projectSubject.next(project);
    }
  }

  deleteEntity(entityId: string): void {
    const project = this.projectSubject.value;
    project.entities = project.entities.filter(e => e.id !== entityId);
    this.projectSubject.next(project);

    // Clean up relationships
    const relationships = this.relationshipsSubject.value;
    this.relationshipsSubject.next(
      relationships.filter(r => r.fromEntityId !== entityId && r.toEntityId !== entityId)
    );

    // Clean up validation rules
    const validationRules = this.validationRulesSubject.value;
    this.validationRulesSubject.next(
      validationRules.filter(v => v.entityId !== entityId)
    );
  }

  selectEntity(entity: EntityMetadata | null): void {
    this.selectedEntitySubject.next(entity);
  }

  // Property Management
  addProperty(entityId: string, property: Omit<PropertyMetadata, 'id'>): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      const newProperty: PropertyMetadata = {
        ...property,
        id: uuidv4()
      };
      entity.properties.push(newProperty);
      this.projectSubject.next(project);
    }
  }

  updateProperty(entityId: string, propertyId: string, updates: Partial<PropertyMetadata>): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      const propertyIndex = entity.properties.findIndex(p => p.id === propertyId);
      if (propertyIndex !== -1) {
        entity.properties[propertyIndex] = { ...entity.properties[propertyIndex], ...updates };
        this.projectSubject.next(project);
      }
    }
  }

  deleteProperty(entityId: string, propertyId: string): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      entity.properties = entity.properties.filter(p => p.id !== propertyId);
      this.projectSubject.next(project);
    }
  }

  // Command Management
  addCommand(entityId: string, command: Omit<CommandMetadata, 'id'>): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      const newCommand: CommandMetadata = {
        ...command,
        id: uuidv4()
      };
      entity.commands.push(newCommand);
      this.projectSubject.next(project);
    }
  }

  deleteCommand(entityId: string, commandId: string): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      entity.commands = entity.commands.filter(c => c.id !== commandId);
      this.projectSubject.next(project);
    }
  }

  // Query Management
  addQuery(entityId: string, query: Omit<QueryMetadata, 'id'>): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      const newQuery: QueryMetadata = {
        ...query,
        id: uuidv4()
      };
      entity.queries.push(newQuery);
      this.projectSubject.next(project);
    }
  }

  deleteQuery(entityId: string, queryId: string): void {
    const project = this.projectSubject.value;
    const entity = project.entities.find(e => e.id === entityId);
    
    if (entity) {
      entity.queries = entity.queries.filter(q => q.id !== queryId);
      this.projectSubject.next(project);
    }
  }

  // Relationship Management
  addRelationship(relationship: Omit<Relationship, 'id'>): void {
    const relationships = this.relationshipsSubject.value;
    const newRelationship: Relationship = {
      ...relationship,
      id: uuidv4()
    };
    relationships.push(newRelationship);
    this.relationshipsSubject.next(relationships);
  }

  deleteRelationship(relationshipId: string): void {
    const relationships = this.relationshipsSubject.value;
    this.relationshipsSubject.next(relationships.filter(r => r.id !== relationshipId));
  }

  // Validation Rules Management
  addValidationRule(rule: Omit<ValidationRule, 'id'>): void {
    const rules = this.validationRulesSubject.value;
    const newRule: ValidationRule = {
      ...rule,
      id: uuidv4()
    };
    rules.push(newRule);
    this.validationRulesSubject.next(rules);
  }

  deleteValidationRule(ruleId: string): void {
    const rules = this.validationRulesSubject.value;
    this.validationRulesSubject.next(rules.filter(r => r.id !== ruleId));
  }

  // Utility Methods
  getProject(): ProjectMetadata {
    return this.projectSubject.value;
  }

  getSelectedEntity(): EntityMetadata | null {
    return this.selectedEntitySubject.value;
  }

  getRelationships(): Relationship[] {
    return this.relationshipsSubject.value;
  }

  getValidationRules(): ValidationRule[] {
    return this.validationRulesSubject.value;
  }
}
