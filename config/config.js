require('dotenv').config();

const MAX_POOL = Number(process.env.DB_POOL_MAX || 5);
const USE_SSL = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

const commonPostgresOptions = {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: MAX_POOL,
    min: 1,
    acquire: 60000,
    idle: 10000,
    evict: 1000
  },
  dialectOptions: {
    ssl: USE_SSL
      ? {
          require: true,
          rejectUnauthorized: false
        }
      : false,
    connectTimeout: 60000
  },
  retry: {
    max: 5,
    timeout: 3000
  }
};

module.exports = {
  development: process.env.DATABASE_URL
    ? {
        ...commonPostgresOptions,
        use_env_variable: 'DATABASE_URL'
      }
    : {
        ...commonPostgresOptions,
        username: process.env.DB_USER || 'pollutiondb_user',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pollutiondb',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432
      },
  test: process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite')
    ? {
        dialect: 'sqlite',
        storage: process.env.DATABASE_URL.replace('sqlite:', ''),
        logging: false
      }
    : {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
      },
  production: {
    ...commonPostgresOptions,
    use_env_variable: 'DATABASE_URL'
  }
};
