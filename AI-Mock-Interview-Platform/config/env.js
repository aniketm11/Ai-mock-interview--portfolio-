import 'dotenv/config';
import { z } from 'zod';

export default z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_ORIGIN: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(20),
  OPENAI_MODEL: z.enum(['gpt-4.1', 'gpt-5']).default('gpt-4.1'),
  JWT_SECRET: z.string().min(32),
  MARIADB_HOST: z.string().min(1),
  MARIADB_PORT: z.coerce.number().default(3306),
  MARIADB_DATABASE: z.string().min(1),
  MARIADB_USER: z.string().min(1),
  MARIADB_PASSWORD: z.string()
}).parse(process.env);
