import dotenv from 'dotenv';
dotenv.config();

// Configuração do banco de dados no ambiente de teste
/*export const databaseConfig = {
  dialect: 'sqlite',
  storage: 'database.sqlite',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};

*/

/*
// Configuração do banco de dados no ambiente de desenvolvimento
export const databaseConfig = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'postgres',
  database: 'scv-backend-node-sequelize',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};
*/


// Configuração do banco de dados no ambiente de produção
export const databaseConfig = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};