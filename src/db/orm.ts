import 'reflect-metadata';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../../mikro-orm.config';

let orm: MikroORM | null = null;

export async function getORM() {
  if (!orm) {
    orm = await MikroORM.init(config);
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
  }
  return orm;
}

export async function withORMContext<T>(fn: (orm: MikroORM) => Promise<T>) {
  const ormInstance = await getORM();
  return RequestContext.create(ormInstance.em, () => fn(ormInstance));
}
