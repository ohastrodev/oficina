import express from "express";
import cors from "cors"; // <-- ADICIONE ESTA LINHA
import routes from './routes.js';
import errorHandler from '../src/_middleware/error-handler.js';

// Importando configuração e estabelecimento da conexão com o banco de dados
import sequelize from './config/database-connection.js';

const app = express();

app.use(cors()); // <-- ADICIONE ESTA LINHA
app.use(express.json());
app.use(routes);
app.use(errorHandler); // Manipulador de erro global (error handler)

const PORT = process.env.PORT || 3333;
import path from 'path';
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});