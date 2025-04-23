import { defineConfig } from '@mikro-orm/postgresql';
import { RequestHistory } from './src/db/entities/RequestHistory';

export default defineConfig({
  entities: [RequestHistory],
  dbName: 'rest_client_db',
  user: 'postgres', 
  password: '', 
  host: 'localhost',
  port: 5432,
  debug: process.env.NODE_ENV !== 'production',
});
