import express from 'express';
import './db/mongoose.js';
import { lectorRouter } from './routes/lector.js';
import { libroRouter } from './routes/libro.js';

export const app = express();

app.use(express.json());
app.use(lectorRouter);
app.use(libroRouter);

// Manejador por defecto para rutas no encontradas
// En lugar de app.all('*', ...), usa un middleware de uso general al final:
app.use((req, res) => {
  res.status(404).send({
    error: 'Ruta no encontrada'
  });
});