import 'reflect-metadata';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  url!: string;

  @Property()
  method!: string;

  @Property({ type: 'json', nullable: true })
  headers?: Record<string, string>;

  @Property({ type: 'text', nullable: true })
  body?: string;

  @Property({ type: 'text', nullable: true })
  response?: string;

  @Property({ nullable: true })
  status?: number;

  @Property()
  createdAt: Date = new Date();
}
